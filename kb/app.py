# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import uvicorn
import os
import logging

# MongoDB
from pymongo import MongoClient

# embeddings and FAISS
import numpy as np
try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None

import faiss

# Transformers local LLM placeholder
from transformers import AutoTokenizer, AutoModelForCausalLM, TextGenerationPipeline, pipeline

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="Custom MCP Server - Dell XPS KB")

# ---------- CONFIG ----------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "dell_kb")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "dell_forum")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
LLM_MODEL_NAME = os.getenv("LLM_MODEL", "gpt2")  # placeholder; swap to your local qwen/deepseek model
TOP_K = 5
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 -> 384; change if you use a different embedder
# ---------------------------

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
col = db[COLLECTION_NAME]

# ---------- Embedding manager ----------
class EmbeddingIndex:
    def __init__(self, model_name=EMBEDDING_MODEL_NAME):
        if SentenceTransformer is None:
            raise RuntimeError("sentence-transformers not installed. pip install sentence-transformers")
        self.model = SentenceTransformer(model_name)
        self.index = None
        self.ids = []

    def build_index(self, texts: List[str], ids: List[Any]):
        vectors = np.asarray(self.model.encode(texts, show_progress_bar=True, normalize_embeddings=True)).astype("float32")
        d = vectors.shape[1]
        self.index = faiss.IndexFlatIP(d)  # cosine via normalized vectors => inner product
        self.index.add(vectors)
        self.ids = ids
        logging.info(f"Built FAISS index with {len(ids)} vectors (dim={d}).")

    def query(self, text: str, k=TOP_K):
        v = np.asarray(self.model.encode([text], normalize_embeddings=True)).astype("float32")
        if self.index is None:
            return []
        D, I = self.index.search(v, k)
        results = []
        for idx, score in zip(I[0], D[0]):
            if idx < 0 or idx >= len(self.ids):
                continue
            results.append({"id": self.ids[idx], "score": float(score)})
        return results

# ---------- LLM Interface ----------
class LocalLLM:
    """
    Simple wrapper around a transformers text-generation model.
    Swap model_name to qwen/deepseek local weights (if available locally).
    For large models (13B) you'll need GPU and optimized runtime (vLLM, text-generation-inference, etc).
    """
    def __init__(self, model_name=LLM_MODEL_NAME, device="cpu"):
        logging.info(f"Loading LLM model: {model_name} on {device}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        self.pipe = TextGenerationPipeline(model=self.model, tokenizer=self.tokenizer, device=0 if device=="cuda" else -1)

    def generate(self, prompt: str, max_new_tokens=256, temperature=0.2):
        out = self.pipe(prompt, max_new_tokens=max_new_tokens, do_sample=True, temperature=temperature)
        return out[0]["generated_text"]

# ---------- Startup: build index ----------
emb_index = None
llm = None

@app.on_event("startup")
def startup():
    global emb_index, llm
    # Load docs from MongoDB
    docs_cursor = col.find({}, {"title":1, "question":1, "answer":1})
    texts = []
    ids = []
    for d in docs_cursor:
        text = ""
        if d.get("title"):
            text += d["title"] + "\n"
        if d.get("question"):
            text += "Q: " + d["question"] + "\n"
        if d.get("answer"):
            text += "A: " + d["answer"] + "\n"
        texts.append(text)
        ids.append(d["_id"])
    if not texts:
        logging.warning("No docs found in MongoDB collection. Index will be empty.")
    else:
        emb_index = EmbeddingIndex()
        emb_index.build_index(texts, ids)

    # Load LLM (can be heavy; swap or delay load as required)
    try:
        llm = LocalLLM()
    except Exception as e:
        logging.error("Error loading LLM: %s. You can set LLM_MODEL to a small local model for testing.", e)
        llm = None

# ---------- Request/Response models ----------
class Ticket(BaseModel):
    ticket_id: str
    customer_name: str | None = None
    device_model: str | None = None
    description: str

class MCPResponse(BaseModel):
    ticket_id: str
    troubleshooting: str
    steps_to_fix: str
    client_script: str
    resolution_summary: str
    used_docs: List[Dict[str, Any]]
    generated_at: str

# ---------- Prompt building ----------
BASE_INIT = """You are an expert Dell hardware support assistant. Use the CONTEXT and the USER_TICKET below.
CONTEXT:
{context}

USER_TICKET:
{ticket}

Provide the requested output directly, be concise and action-oriented.
"""

TEMPLATES = {
    "troubleshooting": "Based on the CONTEXT, list likely causes for the problem, each as a short bullet (1-2 lines), with a one-line suggested test to confirm.",
    "steps_to_fix": "Provide step-by-step instructions (numbered) to fix the issue. Include commands, menus, and approximate time to complete each step if applicable.",
    "client_script": "Write a short client-facing script (2-6 lines) the support agent can use. Use placeholders: {customer_name}, {device_model}. State next steps and ETA.",
    "resolution_summary": "Give a short resolution summary (2-4 sentences) suitable for logging into the ticket and tags/keywords for KB."
}

def build_prompt(context_text: str, ticket_text: str, template_key: str):
    init = BASE_INIT.format(context=context_text, ticket=ticket_text)
    return init + "\n" + TEMPLATES[template_key]

# ---------- Utility: fetch docs from MongoDB by ids ----------
def fetch_docs_by_ids(id_list):
    res = []
    for _id in id_list:
        doc = col.find_one({"_id": _id}, {"title":1, "question":1, "answer":1})
        if doc:
            res.append({
                "id": str(doc["_id"]),
                "title": doc.get("title"),
                "question": doc.get("question"),
                "answer": doc.get("answer")
            })
    return res

# ---------- Endpoint ----------
@app.post("/mcp/process-ticket", response_model=MCPResponse)
def process_ticket(ticket: Ticket):
    global emb_index, llm
    if not ticket.description:
        raise HTTPException(status_code=400, detail="Ticket description empty")

    # 1) Retrieve relevant docs
    if emb_index:
        results = emb_index.query(ticket.description, k=TOP_K)
        ids = [r["id"] for r in results]
    else:
        # fallback: text search in mongo
        cursor = col.find({"$text": {"$search": ticket.description}}, {"score":{"$meta":"textScore"}}).sort([("score", {"$meta":"textScore"})]).limit(TOP_K)
        ids = [c["_id"] for c in cursor]

    used = fetch_docs_by_ids(ids)
    context_text = "\n\n".join([f"Title: {d['title']}\nQ:{d['question']}\nA:{d['answer']}" for d in used]) if used else "No context available."

    # 2) Generate 4 outputs
    outputs = {}
    for key in TEMPLATES.keys():
        prompt = build_prompt(context_text, ticket.description, key)
        if llm:
            generated = llm.generate(prompt, max_new_tokens=256, temperature=0.2)
            # remove repeating prefix if any
            if generated.startswith(prompt):
                generated = generated[len(prompt):].strip()
        else:
            # fallback: simple heuristic summarizer
            generated = f"[LLM not available] Please install or configure an LLM. Would have run template: {key}"
        outputs[key] = generated

    resp = MCPResponse(
        ticket_id=ticket.ticket_id,
        troubleshooting=outputs["troubleshooting"],
        steps_to_fix=outputs["steps_to_fix"],
        client_script=outputs["client_script"],
        resolution_summary=outputs["resolution_summary"],
        used_docs=used,
        generated_at=datetime.utcnow().isoformat() + "Z"
    )

    # OPTIONAL: send to SuperOps webhook (example)
    # send_to_superops(ticket, resp)  # implement if needed

    return resp

# OPTIONAL: implement a function to post results to SuperOps ticketing system
def send_to_superops(ticket: Ticket, response: MCPResponse):
    # Example: POST to an incoming webhook or API. Use requests and proper auth.
    # requests.post(SUPEROPS_ENDPOINT, json={...}, headers={"Authorization": "Bearer ..."})
    pass

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

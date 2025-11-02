# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import uvicorn
from tools import search_questions_tool, get_answers_tool, datetime_tool, summarize_thread_tool, get_details_tool
from llm_manager import LLMManager
from db import search_questions, get_answers

app = FastAPI(title="Custom MCP Server - Prototype")

# init LLM manager (select backend via env var LLM_BACKEND)
llm = LLMManager()
llm.init()

# ---- Request/response models ----
class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5

class AnswersRequest(BaseModel):
    question_id: str

class TicketRequest(BaseModel):
    ticket_text: str
    top_k: Optional[int] = 3

# ---- Tool endpoints (these are callable by model or other clients) ----
@app.post("/tool/search_questions")
def tool_search(req: SearchRequest):
    results = search_questions_tool(req.query, limit=req.limit)
    return {"tool": "search_questions", "query": req.query, "results": results}

@app.post("/tool/get_answers")
def tool_get_answers(req: AnswersRequest):
    results = get_answers_tool(req.question_id)
    return {"tool": "get_answers", "question_id": req.question_id, "answers": results}

@app.get("/tool/datetime")
def tool_datetime():
    return {"tool": "datetime", "result": datetime_tool()}

# ---- High level endpoint: process a ticket end-to-end ----
@app.post("/process_ticket")
def process_ticket(req: TicketRequest):
    """
    1) Search KB for relevant questions
    2) Get answers for top hits
    3) Build prompt with init + KB excerpts
    4) Call LLM.generate and return structured 4-part response
    """
    kb_hits = search_questions_tool(req.ticket_text, limit=req.top_k)
    if not kb_hits:
        # still call LLM with an empty KB
        kb_text = "No KB results."
    else:
        kb_text = ""
        for q in kb_hits:
            kb_text += f"QUESTION: {q['title']}\n{q['description']}\nURL: {q.get('url')}\n\n"
            # fetch top 3 answers for each
            answers = get_answers_tool(q['question_id'])
            for a in answers[:3]:
                kb_text += f"- {a['author']}: {a['content']}\n"
            kb_text += "\n---\n\n"

    # Build the model prompt
    prompt = f"""
System: {llm.system_prompt}

Ticket: {req.ticket_text}

Knowledge base excerpts:
{kb_text}

Using the KB above, produce 4 labeled sections:

1) Troubleshooting Suggestions (bullet list)
2) Steps to Fix (numbered steps)
3) Client Communication Script (short message to send to client)
4) Resolution Summary (1-2 lines)

Be concise and precise.
"""

    generated = llm.generate(prompt, max_tokens=512)
    # naive parse: return raw generated text and also split into sections if possible
    return {"ticket": req.ticket_text, "kb_hits": [h["title"] for h in kb_hits], "generated_text": generated}

@app.post("/tool/summarize_thread/{question_id}")
def tool_summarize_thread(question_id: str):
    summary = summarize_thread_tool(question_id, llm.generate)
    return {"question_id": question_id, "summary": summary}

class TagRequest(BaseModel):
    tags: List[str]


from tools import get_details_tool

@app.post("/tool/get_details")
def tool_get_details(req: TagRequest):
    results = get_details_tool(req.tags)
    if not results:
        raise HTTPException(status_code=404, detail=f"No questions found for tags: {req.tags}")
    return {"tool": "get_details", "results": results}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)

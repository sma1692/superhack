# tools.py
from typing import Dict, List
from datetime import datetime
from db import search_questions, get_answers, get_question_by_id

def search_questions_tool(query: str, limit: int = 5) -> List[Dict]:
    """
    Returns trimmed question objects for the model to consume.
    """
    results = search_questions(query, limit)
    cleaned = []
    for q in results:
        cleaned.append({
            "question_id": q.get("question_id"),
            "title": q.get("title"),
            "description": q.get("description"),
            "url": q.get("url"),
            "posted_date": q.get("posted_date"),
            "author": q.get("author"),
            "view_count": q.get("view_count")
        })
    return cleaned

def get_answers_tool(question_id: str) -> List[Dict]:
    answers = get_answers(question_id)
    cleaned = []
    for a in answers:
        cleaned.append({
            "answer_id": a.get("answer_id"),
            "author": a.get("author"),
            "content": a.get("content"),
            "posted_date": a.get("posted_date"),
            "is_accepted": a.get("is_accepted", False),
            "like_count": a.get("like_count", 0)
        })
    return cleaned

def datetime_tool() -> Dict:
    """Simple tooling chain: return current server datetime info."""
    now = datetime.utcnow()
    return {
        "utc_iso": now.isoformat() + "Z",
        "human_readable": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "timestamp": now.timestamp()
    }

def summarize_thread_tool(question_id: str, llm_generate_fn) -> str:
    """
    Simple summarizer that fetches Q + A and asks LLM to summarize.
    llm_generate_fn: fn(prompt:str)->str
    """
    q = get_question_by_id(question_id)
    answers = get_answers_tool(question_id)
    prompt = f"Summarize the following thread into a short summary.\n\nQuestion:\n{q.get('title')}\n{q.get('description')}\n\nAnswers:\n"
    for a in answers:
        prompt += f"- {a['author']}: {a['content']}\n"
    prompt += "\nSummary:"
    summary = llm_generate_fn(prompt)
    return summary


def get_details_tool(tags: List[str]):
    """
    Search questions whose title or description contains
    ANY of the provided tags (case-insensitive).
    Returns list of {question, answers}.
    """
    from db import db  # reuse existing connection

    # Build OR regex filter for all tags
    regex_conditions = []
    for tag in tags:
        regex_conditions.append({"title": {"$regex": tag, "$options": "i"}})
        regex_conditions.append({"description": {"$regex": tag, "$options": "i"}})

    questions = list(db.questions.find({"$or": regex_conditions}))

    results = []
    for q in questions:
        qid = q.get("question_id")
        answers = get_answers(qid)
        results.append({
            "question": {
                "question_id": qid,
                "title": q.get("title"),
                "description": q.get("description"),
                "url": q.get("url"),
                "author": q.get("author"),
                "posted_date": q.get("posted_date"),
                "view_count": q.get("view_count"),
            },
            "answers": [
                {
                    "answer_id": a.get("answer_id"),
                    "author": a.get("author"),
                    "content": a.get("content"),
                    "posted_date": a.get("posted_date"),
                    "is_accepted": a.get("is_accepted", False),
                    "like_count": a.get("like_count", 0)
                } for a in answers
            ]
        })
    return results

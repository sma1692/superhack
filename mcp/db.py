# db.py
import os
from pymongo import MongoClient
from typing import List, Dict

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "dell_forum")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Ensure text index exists
def ensure_indexes():
    try:
        db.questions.create_index([("title", "text"), ("description", "text")])
    except Exception:
        pass

ensure_indexes()

def search_questions(query: str, limit: int = 5) -> List[Dict]:
    """Text search in questions collection."""
    cursor = db.questions.find({"$text": {"$search": query}}).limit(limit)
    return list(cursor)

def get_answers(question_id: str) -> List[Dict]:
    """Get answers by question_id"""
    cursor = db.answers.find({"question_id": question_id}).sort("is_accepted", -1)
    return list(cursor)

def get_question_by_id(question_id: str):
    return db.questions.find_one({"question_id": question_id})

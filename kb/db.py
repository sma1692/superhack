from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "dell_forum")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]


def search_questions(query: str, limit=5):
    """
    Search questions collection for a keyword.
    """
    # Make sure MongoDB text index is created
    db.questions.create_index([("title", "text"), ("description", "text")])
    results = db.questions.find({"$text": {"$search": query}}).limit(limit)
    return list(results)


def get_answers(question_id: str):
    """
    Fetch all answers for a given question_id.
    """
    results = db.answers.find({"question_id": question_id})
    return list(results)







# import requests

# ticket_text = "My Dell XPS 13 cannot connect to Wi-Fi."

# # 1. Search KB
# search = requests.post("http://localhost:8080/tool/search_questions", json={"query": ticket_text}).json()

# # 2. Fetch answers
# qid = search["results"][0]["question_id"]
# answers = requests.post("http://localhost:8080/tool/get_answers", json={"question_id": qid}).json()

# # 3. Pass everything to the model (vLLM or OpenAI-style)
# prompt = f"""
# You are a Support Resolution Assistant.
# Ticket: {ticket_text}

# Knowledge base info:
# Question: {search['results'][0]['title']}
# Answers: {[a['content'] for a in answers['answers']]}

# Generate:
# 1. Troubleshooting Suggestions
# 2. Steps to Fix
# 3. Client Communication Script
# 4. Resolution Summary
# """

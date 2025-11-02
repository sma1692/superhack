from flask import Flask, request, jsonify
from db import search_questions, get_answers

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({"message": "MCP Server running"})


@app.route("/tool/search_questions", methods=["POST"])
def tool_search_questions():
    data = request.get_json()
    query = data.get("query")
    if not query:
        return jsonify({"error": "Missing 'query' parameter"}), 400

    results = search_questions(query)
    return jsonify({
        "tool": "search_questions",
        "query": query,
        "results": [
            {
                "question_id": q["question_id"],
                "title": q["title"],
                "description": q["description"],
                "url": q["url"]
            }
            for q in results
        ]
    })


@app.route("/tool/get_answers", methods=["POST"])
def tool_get_answers():
    data = request.get_json()
    qid = data.get("question_id")
    if not qid:
        return jsonify({"error": "Missing 'question_id' parameter"}), 400

    results = get_answers(qid)
    return jsonify({
        "tool": "get_answers",
        "question_id": qid,
        "answers": [
            {
                "author": a["author"],
                "content": a["content"],
                "posted_date": a["posted_date"],
                "is_accepted": a["is_accepted"]
            }
            for a in results
        ]
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)

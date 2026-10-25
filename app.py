#!/usr/bin/env python3
"""
Flask Web Application for Bubble Pop!
Serves the modern AI Computer Vision web game and provides high score APIs.
"""

import os
import json
from flask import Flask, send_from_directory, jsonify, request

app = Flask(__name__, static_folder=".", static_url_path="")

SCORES_FILE = os.path.join(os.path.dirname(__file__), "scores.json")

def load_scores():
    if os.path.exists(SCORES_FILE):
        try:
            with open(SCORES_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {"arcade": 0, "survival": 0, "zen": 0, "leaderboard": []}

def save_scores(scores):
    try:
        with open(SCORES_FILE, "w") as f:
            json.dump(scores, f, indent=2)
    except Exception as e:
        print(f"Error saving scores: {e}")

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)

@app.route("/api/scores", methods=["GET"])
def get_scores():
    return jsonify(load_scores())

@app.route("/api/scores", methods=["POST"])
def post_score():
    data = request.get_json(silent=True) or {}
    mode = data.get("mode", "arcade")
    score = int(data.get("score", 0))
    player = data.get("player", "Player 1")

    scores = load_scores()
    if score > scores.get(mode, 0):
        scores[mode] = score

    scores.setdefault("leaderboard", []).append({
        "player": player,
        "score": score,
        "mode": mode
    })
    # Keep top 20
    scores["leaderboard"].sort(key=lambda x: x["score"], reverse=True)
    scores["leaderboard"] = scores["leaderboard"][:20]

    save_scores(scores)
    return jsonify({"success": True, "scores": scores})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"\n✨ Bubble Pop Server running at http://localhost:{port}")
    print(f"👉 Open http://localhost:{port} in your browser to play with WebCam or Mouse!\n")
    app.run(host="0.0.0.0", port=port, debug=True)

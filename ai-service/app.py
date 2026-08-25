# ============================================================
# MAIN FLASK APPLICATION — AI Microservice Entry Point
# File: app.py
#
# WHAT THIS FILE DOES:
#   This is the "server" for our AI/ML features.
#   It creates 3 API endpoints (URLs) that the Node.js
#   backend can call to get AI-powered results.
#
#   Endpoint 1: POST /ai/sentiment  → Sentiment analysis
#   Endpoint 2: POST /ai/fraud      → Fake review detection
#   Endpoint 3: POST /ai/match-jobs → Job matching
#
# HOW FLASK WORKS:
#   Flask is a lightweight Python web framework.
#   @app.route() decorators tell Flask: "when this URL is
#   called, run this function and return the result as JSON".
# ============================================================

from flask import Flask, request, jsonify  # Flask = web framework, request = incoming data, jsonify = convert dict to JSON
from flask_cors import CORS                # CORS = allow requests from other origins (React frontend, Node backend)

# Import our 3 AI modules
from sentiment_analyzer import analyze_sentiment
from fraud_detector import detect_fraud
from job_matcher import match_jobs

# ---- Create the Flask App ----
app = Flask(__name__)  # __name__ tells Flask where this file lives

# ---- Enable CORS ----
# Without this, browsers would block requests from localhost:5173 to localhost:5002
CORS(app)


# ==============================================================
# HEALTH CHECK ENDPOINT
# URL: GET http://localhost:5002/
# PURPOSE: Lets you verify the AI service is running correctly
# ==============================================================
@app.route('/', methods=['GET'])
def health_check():
    # Just returns a simple OK message — useful for debugging
    return jsonify({
        "status": "ok",
        "service": "Freelancer Trust Score — AI Microservice",
        "features": ["sentiment-analysis", "fraud-detection", "job-matching"]
    })


# ==============================================================
# ENDPOINT 1: SENTIMENT ANALYSIS
# URL: POST http://localhost:5002/ai/sentiment
#
# Expects JSON body: { "comment": "Great work, very professional!" }
# Returns: { "label": "Positive", "score": 0.83, ... }
# ==============================================================
@app.route('/ai/sentiment', methods=['POST'])
def sentiment_endpoint():
    # request.get_json() reads the JSON body sent by Node.js
    data = request.get_json()

    # Validate: make sure "comment" field was provided
    if not data or 'comment' not in data:
        # Return HTTP 400 (Bad Request) with an error message
        return jsonify({"error": "Missing 'comment' field in request body"}), 400

    comment = data['comment']  # extract the review text

    # Call our sentiment analyzer function (from sentiment_analyzer.py)
    result = analyze_sentiment(comment)

    # jsonify() converts the Python dict to a proper JSON HTTP response
    return jsonify(result)


# ==============================================================
# ENDPOINT 2: FRAUD DETECTION
# URL: POST http://localhost:5002/ai/fraud
#
# Expects JSON body:
# {
#   "rating": 5,
#   "hour_posted": 3,
#   "author_review_count": 0,
#   "days_since_joined": 1
# }
# Returns: { "is_suspicious": true, "risk_level": "High Risk", ... }
# ==============================================================
@app.route('/ai/fraud', methods=['POST'])
def fraud_endpoint():
    data = request.get_json()

    # Validate: need at least one field to work with
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Call our Isolation Forest fraud detector (from fraud_detector.py)
    result = detect_fraud(data)

    return jsonify(result)


# ==============================================================
# ENDPOINT 3: JOB MATCHING
# URL: POST http://localhost:5002/ai/match-jobs
#
# Expects JSON body:
# {
#   "skills": ["React", "Node.js", "MongoDB"],
#   "jobs": [
#     { "id": "1", "title": "React Dev", "description": "...", "skills": ["React"] },
#     { "id": "2", "title": "Python Dev", "description": "...", "skills": ["Python"] }
#   ]
# }
# Returns: jobs array sorted by match_score (highest first)
# ==============================================================
@app.route('/ai/match-jobs', methods=['POST'])
def match_jobs_endpoint():
    data = request.get_json()

    # Validate required fields
    if not data or 'skills' not in data or 'jobs' not in data:
        return jsonify({"error": "Missing 'skills' or 'jobs' in request body"}), 400

    freelancer_skills = data['skills']  # list of skill strings
    jobs = data['jobs']                 # list of job objects

    # Edge case: if only 1 job is provided, TF-IDF can't compute IDF properly
    # So we just return it with a default score
    if len(jobs) == 1:
        jobs[0]['match_score']   = 1.0
        jobs[0]['match_percent'] = 100.0
        jobs[0]['match_label']   = "Only Match"
        return jsonify(jobs)

    # Call our TF-IDF job matcher (from job_matcher.py)
    ranked_jobs = match_jobs(freelancer_skills, jobs)

    return jsonify(ranked_jobs)


# ==============================================================
# START THE FLASK SERVER
# Runs on http://localhost:5002
# debug=True means: auto-restart when code changes (dev only)
# ==============================================================
if __name__ == '__main__':
    print("[AI Service] Starting on http://localhost:5002")
    print("   Feature 1: Sentiment Analysis  -> POST /ai/sentiment")
    print("   Feature 2: Fraud Detection     -> POST /ai/fraud")
    print("   Feature 3: Job Matching        -> POST /ai/match-jobs")
    app.run(host='0.0.0.0', port=5002, debug=True)

# ============================================================
# FEATURE 2: FRAUD / FAKE REVIEW DETECTOR
# File: fraud_detector.py
#
# WHAT IT DOES:
#   Looks at the "pattern" of a review (not the words, but the
#   metadata — like when it was posted, what rating was given,
#   how many reviews the author has made) and decides if it
#   looks suspicious (possibly fake).
#
# HOW IT WORKS:
#   We use Isolation Forest — an unsupervised machine learning
#   algorithm. It works like this:
#
#   Imagine you have 1000 normal reviews and 5 fake ones.
#   Normal reviews follow a pattern (e.g., given over days, varied
#   ratings, reviewer has history). Fake reviews are "isolated" —
#   they stand out. Isolation Forest randomly draws lines
#   (splits) through the data. Data points that get isolated
#   quickly with few splits = ANOMALIES (suspicious).
#
# NO TRAINING DATA NEEDED — it learns "normal" from the 
# reviews we give it and flags anything that deviates.
# ============================================================

import numpy as np
from sklearn.ensemble import IsolationForest

# ---- Isolation Forest Model Configuration ----
# contamination = estimated % of data that is fake/anomalous
# 0.1 means we expect ~10% of reviews might be suspicious
# random_state = ensures same results every run (reproducibility)
model = IsolationForest(contamination=0.1, random_state=42)

# ---- Reference Dataset (Normal Review Patterns) ----
# Each row = one review's features:
# [rating, hour_posted(0-23), author_review_count, days_since_joined]
#
# This simulates "normal" behavior:
# - Ratings vary (not always 5)
# - Posted at normal hours (not 3am)
# - Authors have multiple reviews (not just 1)
# - Authors have been around for a while (not brand new)
NORMAL_PATTERNS = np.array([
    [5, 14, 10, 180],   # 5-star, 2pm, 10 reviews, joined 6mo ago
    [4, 10, 5,  90],    # 4-star, 10am, 5 reviews, joined 3mo ago
    [3, 16, 8,  200],   # 3-star, 4pm, 8 reviews
    [4, 9,  12, 365],   # 4-star, 9am, 12 reviews, joined 1yr ago
    [5, 11, 20, 500],   # 5-star, 11am, 20 reviews, joined 1.5yr
    [2, 15, 6,  120],   # 2-star (bad review — legit)
    [4, 13, 9,  250],
    [3, 17, 15, 400],
    [5, 10, 7,  150],
    [4, 16, 11, 300],
    [1, 14, 3,  60],    # 1-star negative review — still legit
    [5, 12, 18, 450],
    [3, 8,  4,  70],
    [4, 18, 22, 600],
    [5, 14, 30, 730],   # very experienced reviewer
])

# ---- Train the model on normal patterns ----
# fit() = "learn what normal looks like"
# After this, the model can spot outliers
model.fit(NORMAL_PATTERNS)


def detect_fraud(review_data: dict) -> dict:
    """
    Analyzes review metadata to detect if it looks fake/suspicious.

    Parameters:
        review_data (dict):
            - rating            : int (1-5)
            - hour_posted       : int (0-23), hour of day review was submitted
            - author_review_count: int, how many reviews this user has written
            - days_since_joined : int, how many days ago the author joined

    Returns:
        dict with keys:
            - is_suspicious : bool (True = possibly fake)
            - risk_level    : "High Risk", "Medium Risk", or "Low Risk"
            - anomaly_score : float (more negative = more suspicious)
            - reason        : human-readable explanation
    """

    # --- STEP 1: Extract features from incoming review ---
    rating             = review_data.get('rating', 5)
    hour_posted        = review_data.get('hour_posted', 12)
    author_review_count = review_data.get('author_review_count', 1)
    days_since_joined  = review_data.get('days_since_joined', 1)

    # --- STEP 2: Pack into a numpy array (model expects this format) ---
    # Shape must be (1, 4) — one sample, 4 features
    features = np.array([[rating, hour_posted, author_review_count, days_since_joined]])

    # --- STEP 3: Get model prediction ---
    # predict() returns:
    #   +1  = NORMAL (not suspicious)
    #   -1  = ANOMALY (suspicious / possibly fake)
    prediction = model.predict(features)[0]

    # --- STEP 4: Get anomaly score ---
    # decision_function() gives a score:
    #   More negative = more anomalous (more suspicious)
    #   Near 0 or positive = normal
    anomaly_score = round(model.decision_function(features)[0], 4)

    # --- STEP 5: Determine if suspicious ---
    # Cast numpy bool_ to Python native bool (JSON-safe)
    ml_flagged = bool(prediction == -1)

    # --- STEP 6: Rule-based red flag checks ---
    # These run INDEPENDENTLY of the ML model — second layer of detection.
    reasons = []
    if author_review_count <= 1:
        reasons.append("Account has never reviewed before")
    if days_since_joined <= 3:
        reasons.append("Account created very recently")
    if rating == 5 and author_review_count <= 1:
        reasons.append("Perfect rating from a new account")
    if hour_posted >= 2 and hour_posted <= 5:
        reasons.append("Review submitted at an unusual hour (2-5am)")

    reason = "; ".join(reasons) if reasons else "No specific red flags detected"
    rule_flag_count = len(reasons)

    # --- STEP 7: Hybrid Decision (ML + Rules combined) ---
    # We flag as suspicious if ANY of:
    #   a) ML model flagged it (prediction == -1)
    #   b) 2 or more rule-based red flags triggered
    #   c) Anomaly score is below -0.05 (near anomaly boundary)
    # This hybrid approach is stronger than either method alone.
    is_suspicious = bool(
        ml_flagged or
        rule_flag_count >= 2 or
        anomaly_score < -0.05
    )

    # --- STEP 8: Assign risk level (rule count takes priority) ---
    if rule_flag_count >= 3 or anomaly_score < -0.1:
        risk_level = "High Risk"
    elif rule_flag_count >= 2 or anomaly_score < 0:
        risk_level = "Medium Risk"
    else:
        risk_level = "Low Risk"

    if not is_suspicious:
        risk_level = "Low Risk"

    return {
        "is_suspicious": is_suspicious,
        "risk_level": risk_level,
        "anomaly_score": anomaly_score,
        "reason": reason,
        "ml_flagged": ml_flagged,
        "rule_flags": rule_flag_count
    }

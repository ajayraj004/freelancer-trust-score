# ============================================================
# FEATURE 1: SENTIMENT ANALYZER
# File: sentiment_analyzer.py
# 
# WHAT IT DOES:
#   Reads a review comment (text) and decides whether it is
#   Positive, Neutral, or Negative using NLP.
#   It also outputs a numeric score from -1.0 (very negative)
#   to +1.0 (very positive).
#
# HOW IT WORKS:
#   We use VADER (Valence Aware Dictionary and sEntiment Reasoner)
#   — a pre-built NLP library that understands informal English,
#   emojis, punctuation like "!!!", and capitalization like "GREAT".
#   No training is needed — VADER has a built-in dictionary of
#   ~7500 words with pre-assigned sentiment scores.
# ============================================================

# vaderSentiment is an NLP library made for short social-media style text
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Create ONE analyzer object — reused for every request
# (Creating it once is faster than creating it per call)
analyzer = SentimentIntensityAnalyzer()


def analyze_sentiment(text: str) -> dict:
    """
    Takes a review comment string and returns sentiment analysis.

    Parameters:
        text (str): The review comment written by the client.

    Returns:
        dict with keys:
            - label       : "Positive", "Neutral", or "Negative"
            - score       : float between -1.0 and +1.0
            - confidence  : float (0 to 1) how sure the model is
            - breakdown   : raw scores for positive/neutral/negative/compound
    """

    # --- STEP 1: Run VADER on the text ---
    # polarity_scores() returns a dictionary like:
    # { 'neg': 0.1, 'neu': 0.5, 'pos': 0.4, 'compound': 0.65 }
    # 'compound' is the overall score from -1 (worst) to +1 (best)
    scores = analyzer.polarity_scores(text)

    # --- STEP 2: Extract the compound (overall) score ---
    compound = scores['compound']

    # --- STEP 3: Classify into human-readable label ---
    # VADER's recommended thresholds:
    #   compound >= 0.05  → Positive
    #   compound <= -0.05 → Negative
    #   everything else   → Neutral
    if compound >= 0.05:
        label = "Positive"
    elif compound <= -0.05:
        label = "Negative"
    else:
        label = "Neutral"

    # --- STEP 4: Calculate confidence ---
    # abs(compound) gives us how strongly the model feels
    # 1.0 = 100% sure, 0.0 = completely uncertain
    confidence = round(abs(compound), 3)

    # --- STEP 5: Return everything as a clean dictionary ---
    return {
        "label": label,               # e.g. "Positive"
        "score": round(compound, 3),  # e.g. 0.72
        "confidence": confidence,     # e.g. 0.72
        "breakdown": {                # raw VADER scores
            "positive": scores['pos'],
            "neutral": scores['neu'],
            "negative": scores['neg'],
            "compound": compound
        }
    }

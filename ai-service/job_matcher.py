# ============================================================
# FEATURE 3: SMART JOB–FREELANCER MATCHER
# File: job_matcher.py
#
# WHAT IT DOES:
#   Given a freelancer's list of skills and a list of available
#   jobs, it ranks the jobs from MOST relevant to LEAST relevant
#   for that specific freelancer.
#
# HOW IT WORKS (Simple Explanation):
#   Imagine skills and job descriptions as bags of words.
#   We convert them into vectors (lists of numbers).
#   Then we measure the "angle" between vectors.
#   A smaller angle = more similar = better match.
#   This is called Cosine Similarity.
#
# TECHNIQUE: TF-IDF + Cosine Similarity
#   TF-IDF (Term Frequency - Inverse Document Frequency):
#     - TF  = how often a word appears in THIS document
#     - IDF = penalizes common words (like "the", "and")
#     - Result: rare, meaningful words get higher weight
#
#   Cosine Similarity:
#     - Measures angle between two vectors
#     - 1.0 = perfect match, 0.0 = no match at all
# ============================================================

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def match_jobs(freelancer_skills: list, jobs: list) -> list:
    """
    Ranks jobs by how well they match a freelancer's skills.

    Parameters:
        freelancer_skills (list of str):
            e.g. ["React", "Node.js", "MongoDB", "Python"]
        
        jobs (list of dict):
            Each job has: { "id", "title", "description", "skills", "budget" }

    Returns:
        list of jobs sorted by match_score (highest first),
        with an added "match_score" and "match_percent" field.
    """

    # If no jobs provided, return empty list
    if not jobs:
        return []

    # --- STEP 1: Build the "freelancer document" ---
    # Join all the freelancer's skills into one string
    # e.g. ["React", "Node.js"] → "React Node.js"
    # We also repeat skills twice to give them more weight vs job description
    freelancer_doc = " ".join(freelancer_skills).lower()

    # --- STEP 2: Build a "job document" for each job ---
    # Combine job title + description + skills into one text block
    # More text = better TF-IDF representation
    job_docs = []
    for job in jobs:
        skills_text = " ".join(job.get("skills", []))   # job's required skills
        title_text  = job.get("title", "")               # job title
        desc_text   = job.get("description", "")         # job description
        # Combine all job info. Skills appear twice to boost their weight.
        combined = f"{skills_text} {skills_text} {title_text} {desc_text}".lower()
        job_docs.append(combined)

    # --- STEP 3: Create TF-IDF Vectorizer ---
    # TfidfVectorizer converts raw text into a matrix of numbers
    # Each column = a unique word, each row = a document
    # The value = TF-IDF score of that word in that document
    vectorizer = TfidfVectorizer(
        stop_words='english',  # ignore common words like "the", "and", "is"
        ngram_range=(1, 2)     # consider both single words AND word pairs
                               # e.g. "machine learning" counted as one unit
    )

    # --- STEP 4: Fit and transform all documents ---
    # "Fit" = learn the vocabulary from ALL documents
    # "Transform" = convert each document into a vector
    # all_docs[0]     = freelancer's skills document
    # all_docs[1...]  = each job document
    all_docs = [freelancer_doc] + job_docs
    tfidf_matrix = vectorizer.fit_transform(all_docs)

    # --- STEP 5: Extract vectors ---
    # freelancer_vec = the TF-IDF vector for the freelancer (row 0)
    # job_vecs       = TF-IDF vectors for all jobs (rows 1 onwards)
    freelancer_vec = tfidf_matrix[0]     # shape: (1, vocabulary_size)
    job_vecs       = tfidf_matrix[1:]    # shape: (n_jobs, vocabulary_size)

    # --- STEP 6: Compute Cosine Similarity ---
    # cosine_similarity compares freelancer_vec against EVERY job_vec
    # Returns an array of similarity scores, one per job
    # Each score is between 0.0 (no match) and 1.0 (perfect match)
    similarities = cosine_similarity(freelancer_vec, job_vecs)[0]
    # similarities is now a 1D array like [0.85, 0.12, 0.63, ...]

    # --- STEP 7: Attach scores to each job and sort ---
    scored_jobs = []
    for i, job in enumerate(jobs):
        score = float(similarities[i])   # convert numpy float to Python float
        scored_job = dict(job)           # copy job dict so we don't modify original
        scored_job["match_score"]   = round(score, 4)              # raw score 0-1
        scored_job["match_percent"] = round(score * 100, 1)        # human-readable %
        
        # Categorize the match quality
        if score >= 0.6:
            scored_job["match_label"] = "Excellent Match"
        elif score >= 0.35:
            scored_job["match_label"] = "Good Match"
        elif score >= 0.1:
            scored_job["match_label"] = "Partial Match"
        else:
            scored_job["match_label"] = "Low Match"

        scored_jobs.append(scored_job)

    # Sort by match_score descending (best match first)
    scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)

    return scored_jobs

# 🛡️ Freelancer Trust Score System — MERN + AI/ML

A modern, full-stack freelancing marketplace that introduces **Autonomous Artificial Intelligence** into reputation verification, review sentiment processing, fake review detection, and skill-based job matching.

---

## 🏗️ System Architecture

The project follows a **hybrid microservices architecture** where heavy machine learning computation is offloaded from the MERN stack to a dedicated Python microservice via HTTP APIs:

```
┌─────────────────────────────────────────────────────────┐
│                    React 19 Frontend                    │
│                 http://localhost:5173                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP (Axios)
┌────────────────────▼────────────────────────────────────┐
│              Node.js 24 + Express 5 API                 │
│                 http://localhost:5001                   │
└────────────┬─────────────────────────┬──────────────────┘
             │ Mongoose ODM            │ HTTP (Node http module)
             ▼                         ▼
┌──────────────────────┐   ┌──────────────────────────────┐
│  MongoDB Database    │   │  Python Flask AI Microservice│
│  freelancer_trust    │   │       http://localhost:5002   │
│                      │   │                              │
│  Collections:        │   │  - VADER NLP Sentiment       │
│  - users             │   │  - Isolation Forest Fraud    │
│  - freelancers       │   │  - TF-IDF Job Matcher        │
│  - reviews           │   │                              │
│  - jobs              │   │  Libraries:                  │
│  - interviews        │   │  scikit-learn, vaderSentiment│
└──────────────────────┘   └──────────────────────────────┘
```

---

## 🧠 AI/ML Features Summary

### 1️⃣ Feature 1: VADER NLP Review Sentiment Analysis (`/ai/sentiment`)
- **Algorithm:** VADER (Valence Aware Dictionary and sEntiment Reasoner) Lexicon-Based NLP.
- **Problem Solved:** Traditional 5-star ratings can lie (e.g. 1-star given with positive text like *"very good work done on time"*). VADER reads the actual text sentiment score (-1.0 to +1.0) independently of star ratings.
- **Trust Adjustment:** If text sentiment is positive but star rating is $\le 2$, the system compensates the freelancer's behavior score for an unfair rating.

### 2️⃣ Feature 2: Fake Review & Fraud Detection (`/ai/fraud`)
- **Algorithm:** Isolation Forest (Unsupervised Anomaly Detection) + Behavioral Heuristics.
- **Problem Solved:** Detects fake review rings and bot activity by analyzing metadata patterns: account age, total review history, submission hour, and rating extremity.
- **Risk Indicator:** Flags suspicious reviews with `High Risk`, `Medium Risk`, or `Low Risk` and applies trust penalties to fraudulent accounts.

### 3️⃣ Feature 3: Smart Job Matching via TF-IDF & Cosine Similarity (`/ai/match-jobs`)
- **Algorithm:** TF-IDF (Term Frequency–Inverse Document Frequency) Vectorization + Cosine Similarity.
- **Problem Solved:** Automatically ranks open jobs for freelancers based on skill vector overlap.
- **Ranking Engine:** Calculates mathematical angle between freelancer skills and job description vectors, returning exact match percentages (e.g. `87.5% Good Match` vs `0.0% Low Match`).

---

## 🧮 Trust Score Weighted Formula

The core reputation score ($0 - 100$) is computed using a weighted composite formula:

$$\text{Trust Score} = \left(\frac{\text{Rating}}{5} \times 40\right) + \min\left(\frac{\text{WorkCount}}{50} \times 20, 20\right) + \left(\frac{\text{BehaviorScore}}{100} \times 30\right) + \min\left(\frac{\text{ReviewCount}}{50} \times 10, 10\right)$$

- **Work Quality (40%)**: Derived from average star rating.
- **Platform Reliability (20%)**: Based on volume of completed jobs.
- **Behavioral Scan (30%)**: Tracks submission speed, milestone adherence, and cancellation history.
- **Volume of Proof (10%)**: Number of verified client reviews.

---

## 🛠️ Project Directory Structure

```bash
freelancer-trust-score/
├── ai-service/                # Python Flask AI Microservice
│   ├── app.py                 # Flask server (Port 5002)
│   ├── sentiment_analyzer.py  # VADER NLP Sentiment model
│   ├── fraud_detector.py      # Isolation Forest Anomaly model
│   ├── job_matcher.py         # TF-IDF & Cosine Similarity model
│   ├── test_ai.py             # Live AI feature test suite
│   └── requirements.txt       # Python dependencies
│
├── server/                    # Node.js + Express Backend
│   ├── models/                # Mongoose Schemas (User, Freelancer, Review, Job, Interview)
│   ├── routes/                # API Routes (auth, freelancer, reviews, jobs, interviews)
│   ├── index.js               # Express Server & MongoDB Connection (Port 5001)
│   └── seed.js                # Database initial populator
│
└── client/                    # React 19 + Vite Frontend
    ├── src/
    │   ├── components/        # TrustGauge, FreelancerCard, Navbar
    │   ├── pages/             # Home, Dashboard, Profile, Register, Login
    │   └── utils/             # Axios API client
    ├── index.css              # Custom styling & utilities
    └── vite.config.js         # Vite configuration (Port 5173)
```

---

## ⚡ Quick Setup & Running Locally

### 1. Install Dependencies (One-time)

```bash
# 1. Python AI Service
cd ai-service
pip install -r requirements.txt

# 2. Node Backend
cd ../server
npm install

# 3. React Frontend
cd ../client
npm install
```

---

### 2. Start the 3 Microservices

Open **3 separate terminal windows** (or VS Code split terminals):

```bash
# Terminal 1: Python AI Service (Port 5002)
cd ai-service
python app.py

# Terminal 2: Node.js Backend & MongoDB (Port 5001)
cd server
node index.js

# Terminal 3: React Frontend (Port 5173)
cd client
npm run dev
```

Open [`http://localhost:5173`](http://localhost:5173) in your browser!

---

## 🔑 Presentation Demo Credentials

| Role | Email | Password | Features to Test |
|---|---|---|---|
| **Client** | `client@demo.com` | `demo123` | Post jobs, post reviews on freelancers, test sentiment & fraud detection |
| **Freelancer** | `freelancer@demo.com` | `demo123` | View trust gauge, view AI job recommendations ranked by TF-IDF |

---

## 📝 License
This project is licensed under the MIT License — feel free to use and adapt for academic and personal projects.

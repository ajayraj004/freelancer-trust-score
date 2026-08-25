// ============================================================
// REVIEWS ROUTE — with In-Memory Fallback + AI Integration
// File: server/routes/reviews.js
//
// Works with MongoDB when connected.
// Falls back to in-memory store when MongoDB is offline.
// AI features (sentiment + fraud) always work — they call Flask.
// ============================================================

const express    = require('express');
const router     = express.Router();
const http       = require('http');

// Get shared in-memory data from freelancer route
const freelancerRoute = require('./freelancer');
const IN_MEMORY_REVIEWS  = freelancerRoute.IN_MEMORY_REVIEWS;
const DEMO_FREELANCERS   = freelancerRoute.DEMO_FREELANCERS;

// ---- Helper: Call Flask AI Microservice ----
function callAI(path, body) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(body);
    const options  = {
      hostname: 'localhost', port: 5002, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve(null); } });
    });
    req.on('error', () => resolve(null));  // AI offline = graceful null
    req.write(postData);
    req.end();
  });
}

// ---- Try to load Mongoose models (works only if DB connected) ----
let Review, Freelancer, mongoose;
try {
  Review     = require('../models/Review');
  Freelancer = require('../models/Freelancer');
  mongoose   = require('mongoose');
} catch(e) {}

function isDBConnected() {
  try { return mongoose && mongoose.connection.readyState === 1; } catch(e) { return false; }
}


// ============================================================
// POST /api/reviews — Submit a Review (with AI Analysis)
// ============================================================
router.post('/', async (req, res) => {
  const { authorId, freelancerId, rating, comment, category, author_review_count, days_since_joined } = req.body;

  try {
    // ---- STEP 1: AI Feature 1 — Sentiment Analysis ----
    const sentimentResult = await callAI('/ai/sentiment', { comment });

    // ---- STEP 2: AI Feature 2 — Fraud Detection ----
    const hourPosted  = new Date().getHours();
    const fraudResult = await callAI('/ai/fraud', {
      rating,
      hour_posted:         hourPosted,
      author_review_count: author_review_count || 1,
      days_since_joined:   days_since_joined   || 30
    });

    // ---- STEP 3: Build the review object ----
    const newReview = {
      _id:          'review-' + Date.now(),
      authorId:     { _id: authorId, name: req.body.authorName || 'You', avatar: req.body.authorAvatar || 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=50' },
      freelancerId,
      rating:       Number(rating),
      comment,
      category:     category || 'Reliability',
      createdAt:    new Date(),
      // AI Feature 1 result
      sentiment: sentimentResult ? {
        label:      sentimentResult.label,
        score:      sentimentResult.score,
        confidence: sentimentResult.confidence
      } : null,
      // AI Feature 2 result
      fraud: fraudResult ? {
        is_suspicious: fraudResult.is_suspicious,
        risk_level:    fraudResult.risk_level,
        reason:        fraudResult.reason
      } : null
    };

    // ---- STEP 4: Save review (MongoDB or in-memory) ----
    if (isDBConnected()) {
      // MongoDB path
      const dbReview = new Review({
        authorId, freelancerId,
        rating: Number(rating), comment, category,
        sentiment: newReview.sentiment,
        fraud:     newReview.fraud
      });
      await dbReview.save();

      const dbFreelancer = await Freelancer.findById(freelancerId);
      if (dbFreelancer) {
        const total = (dbFreelancer.avgRating * dbFreelancer.reviewsCount) + Number(rating);
        dbFreelancer.reviewsCount += 1;
        dbFreelancer.avgRating = total / dbFreelancer.reviewsCount;
        if (fraudResult?.is_suspicious) {
          dbFreelancer.behaviorScore = Math.max(0, dbFreelancer.behaviorScore - (fraudResult.risk_level === 'High Risk' ? 10 : 4));
        }
        if (sentimentResult?.label === 'Negative' && Number(rating) >= 4) {
          dbFreelancer.behaviorScore = Math.max(0, dbFreelancer.behaviorScore - 2);
        }
        await dbFreelancer.save();
      }
      return res.status(201).json(dbReview);
    }

    // ---- In-Memory path (no MongoDB) ----
    // Push review into the shared in-memory array
    IN_MEMORY_REVIEWS.push(newReview);

    // Update the in-memory freelancer's trust score
    const fIdx = DEMO_FREELANCERS.findIndex(f => f._id === freelancerId);
    if (fIdx !== -1) {
      const f   = DEMO_FREELANCERS[fIdx];
      const total = (f.avgRating * f.reviewsCount) + Number(rating);
      f.reviewsCount += 1;
      f.avgRating = parseFloat((total / f.reviewsCount).toFixed(2));

      // AI Adjustment: fraud penalty
      if (fraudResult?.is_suspicious) {
        f.behaviorScore = Math.max(0, f.behaviorScore - (fraudResult.risk_level === 'High Risk' ? 10 : 4));
      }
      // AI Adjustment: sentiment vs rating mismatch
      if (sentimentResult?.label === 'Negative' && Number(rating) >= 4) {
        f.behaviorScore = Math.max(0, f.behaviorScore - 2);
      }
      if (sentimentResult?.label === 'Positive' && Number(rating) <= 2) {
        f.behaviorScore = Math.min(100, f.behaviorScore + 1);
      }

      // Recalculate trust score using the weighted formula
      const ratingFactor   = (f.avgRating / 5) * 40;
      const workFactor     = Math.min((f.pastWorkCount / 50) * 20, 20);
      const behaviorFactor = (f.behaviorScore / 100) * 30;
      const reviewFactor   = Math.min((f.reviewsCount / 50) * 10, 10);
      f.trustScore = Math.round(ratingFactor + workFactor + behaviorFactor + reviewFactor);
    }

    // Return the new review WITH AI analysis so the frontend can show it immediately
    res.status(201).json(newReview);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ============================================================
// GET /api/reviews/freelancer/:id — Get all reviews for a freelancer
// ============================================================
router.get('/freelancer/:id', async (req, res) => {
  if (isDBConnected()) {
    try {
      const reviews = await Review.find({ freelancerId: req.params.id })
        .populate('authorId', 'name avatar')
        .sort({ createdAt: -1 });
      return res.json(reviews);
    } catch(e) {}
  }
  // In-memory fallback: filter reviews for this freelancer
  const filtered = IN_MEMORY_REVIEWS
    .filter(r => r.freelancerId === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(filtered);
});

module.exports = router;

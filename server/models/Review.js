// ============================================================
// UPDATED REVIEW MODEL — with AI Analysis Fields
// File: server/models/Review.js
//
// CHANGES FROM ORIGINAL:
//   Added two new optional fields:
//   - sentiment: stores result from Sentiment Analyzer (Feature 1)
//   - fraud:     stores result from Fraud Detector (Feature 2)
//
//   These fields are optional (not required) so the app still
//   works even if the AI service is offline.
// ============================================================

const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  // ---- Original Fields (unchanged) ----
  authorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  rating:       { type: Number, required: true, min: 1, max: 5 },
  comment:      { type: String, required: true },
  category:     { type: String, enum: ['Reliability', 'Quality', 'Communication', 'Speed'], default: 'Reliability' },
  createdAt:    { type: Date, default: Date.now },

  // ---- AI Feature 1: Sentiment Analysis Result ----
  // Stored after calling Flask /ai/sentiment
  // Example: { label: "Positive", score: 0.72, confidence: 0.72 }
  sentiment: {
    label:      { type: String, enum: ['Positive', 'Neutral', 'Negative'], default: null },
    score:      { type: Number, default: null },  // -1.0 to +1.0
    confidence: { type: Number, default: null }   // 0 to 1
  },

  // ---- AI Feature 2: Fraud Detection Result ----
  // Stored after calling Flask /ai/fraud
  // Example: { is_suspicious: true, risk_level: "High Risk", reason: "..." }
  fraud: {
    is_suspicious: { type: Boolean, default: false },
    risk_level:    { type: String, enum: ['High Risk', 'Medium Risk', 'Low Risk'], default: 'Low Risk' },
    reason:        { type: String, default: '' }
  }
});

module.exports = mongoose.model('Review', ReviewSchema);

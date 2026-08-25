// ============================================================
// FREELANCER ROUTE — with In-Memory Fallback
// File: server/routes/freelancer.js
//
// Works with MongoDB when connected.
// Falls back to in-memory demo data when MongoDB is offline.
// ============================================================

const express    = require('express');
const router     = express.Router();

// ---- IN-MEMORY DEMO FREELANCERS (fallback when no DB) ----
const DEMO_FREELANCERS = [
  {
    _id: 'demo-fprofile-1',
    userId: { _id: 'demo-freelancer-1', name: 'Sarah Johnson', role: 'freelancer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
    title: 'Full-Stack Software Engineer',
    bio: 'Expert React & Node.js developer with 5 years of experience building scalable web applications.',
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'CSS'],
    trustScore: 87, avgRating: 4.6, reviewsCount: 3, behaviorScore: 92,
    pastWorkCount: 18, totalEarnings: 12500, location: 'Mumbai, India', availability: true
  },
  {
    _id: 'demo-fprofile-2',
    userId: { _id: 'demo-freelancer-2', name: 'Rahul Sharma', role: 'freelancer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
    title: 'Full-Stack Developer & Python Engineer',
    bio: 'Full-stack Python developer specializing in Django, FastAPI and ML integrations.',
    skills: ['Python', 'Django', 'FastAPI', 'Machine Learning', 'PostgreSQL'],
    trustScore: 79, avgRating: 4.2, reviewsCount: 8, behaviorScore: 85,
    pastWorkCount: 25, totalEarnings: 18200, location: 'Bangalore, India', availability: true
  },
  {
    _id: 'demo-fprofile-3',
    userId: { _id: 'demo-freelancer-3', name: 'Priya Mehta', role: 'freelancer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' },
    title: 'UI/UX Design Specialist',
    bio: 'UI/UX designer with expertise in Figma, motion design and React implementations.',
    skills: ['Figma', 'UI/UX', 'React', 'CSS', 'Motion Design'],
    trustScore: 94, avgRating: 4.9, reviewsCount: 14, behaviorScore: 98,
    pastWorkCount: 35, totalEarnings: 28000, location: 'Delhi, India', availability: true
  }
];

// In-memory reviews store (shared across requests)
let IN_MEMORY_REVIEWS = [
  {
    _id: 'review-demo-1',
    authorId: { _id: 'demo-client-1', name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop' },
    freelancerId: 'demo-fprofile-1',
    rating: 5,
    comment: 'Absolutely amazing work! Delivered on time and exceeded all expectations.',
    category: 'Quality',
    createdAt: new Date(Date.now() - 86400000 * 3),
    sentiment: { label: 'Positive', score: 0.87, confidence: 0.87 },
    fraud: { is_suspicious: false, risk_level: 'Low Risk', reason: 'No specific red flags detected' }
  },
  {
    _id: 'review-demo-2',
    authorId: { _id: 'demo-client-2', name: 'Neha Gupta', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop' },
    freelancerId: 'demo-fprofile-1',
    rating: 4,
    comment: 'Good work overall. Communication could be slightly better.',
    category: 'Communication',
    createdAt: new Date(Date.now() - 86400000 * 7),
    sentiment: { label: 'Positive', score: 0.34, confidence: 0.34 },
    fraud: { is_suspicious: false, risk_level: 'Low Risk', reason: 'No specific red flags detected' }
  },
  {
    _id: 'review-demo-3',
    authorId: { _id: 'demo-client-3', name: 'New Account', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop' },
    freelancerId: 'demo-fprofile-1',
    rating: 5,
    comment: 'Okay work, nothing special really.',
    category: 'Reliability',
    createdAt: new Date(),
    sentiment: { label: 'Negative', score: -0.09, confidence: 0.09 },
    fraud: { is_suspicious: true, risk_level: 'High Risk', reason: 'Account has never reviewed before; Account created very recently; Perfect rating from a new account' }
  }
];

// ---- Helper: Try MongoDB first, fall back to in-memory ----
let Freelancer, mongoose;
try {
  Freelancer = require('../models/Freelancer');
  mongoose   = require('mongoose');
} catch(e) {}

function isDBConnected() {
  try { return mongoose && mongoose.connection.readyState === 1; } catch(e) { return false; }
}


// ============================================================
// GET /api/freelancers — All freelancers ranked by trust score
// ============================================================
router.get('/', async (req, res) => {
  if (isDBConnected()) {
    try {
      const freelancers = await Freelancer.find().populate('userId', 'name role avatar').sort({ trustScore: -1 });
      return res.json(freelancers);
    } catch(e) {}
  }
  // Fallback: return in-memory demo list
  res.json([...DEMO_FREELANCERS].sort((a, b) => b.trustScore - a.trustScore));
});


// ============================================================
// GET /api/freelancers/search — Search/filter freelancers
// ============================================================
router.get('/search', async (req, res) => {
  const { query, minScore, skill } = req.query;
  if (isDBConnected()) {
    try {
      let filter = {};
      if (minScore) filter.trustScore = { $gte: Number(minScore) };
      if (skill) filter.skills = { $in: [skill] };
      let freelancers = await Freelancer.find(filter).populate('userId', 'name role avatar');
      if (query) {
        freelancers = freelancers.filter(f =>
          f.userId.name.toLowerCase().includes(query.toLowerCase()) ||
          f.bio.toLowerCase().includes(query.toLowerCase())
        );
      }
      return res.json(freelancers);
    } catch(e) {}
  }
  // Fallback
  let results = [...DEMO_FREELANCERS];
  if (query) results = results.filter(f => f.userId.name.toLowerCase().includes(query.toLowerCase()) || f.bio.toLowerCase().includes(query.toLowerCase()));
  if (minScore) results = results.filter(f => f.trustScore >= Number(minScore));
  if (skill) results = results.filter(f => f.skills.includes(skill));
  res.json(results);
});


// ============================================================
// GET /api/freelancers/user/:userId — Freelancer by userId
// ============================================================
router.get('/user/:userId', async (req, res) => {
  if (isDBConnected()) {
    try {
      const f = await Freelancer.findOne({ userId: req.params.userId }).populate('userId', 'name email role avatar');
      if (f) return res.json(f);
    } catch(e) {}
  }
  // Fallback: find in demo data
  const f = DEMO_FREELANCERS.find(f => f.userId._id === req.params.userId);
  if (!f) return res.status(404).json({ message: 'Freelancer profile not found' });
  res.json(f);
});


// ============================================================
// GET /api/freelancers/:id — Single freelancer by profile ID
// ============================================================
router.get('/:id', async (req, res) => {
  if (isDBConnected()) {
    try {
      const f = await Freelancer.findById(req.params.id).populate('userId', 'name email role avatar');
      if (f) return res.json(f);
    } catch(e) {}
  }
  // Fallback
  const f = DEMO_FREELANCERS.find(f => f._id === req.params.id);
  if (!f) {
    // Return the first demo profile if id not found (handles mock review demo flow)
    return res.json(DEMO_FREELANCERS[0]);
  }
  res.json(f);
});


// ============================================================
// PUT /api/freelancers/:id — Update freelancer
// ============================================================
router.put('/:id', async (req, res) => {
  if (isDBConnected()) {
    try {
      const f = await Freelancer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      await f.save();
      return res.json(f);
    } catch(e) {}
  }
  // Fallback: update in-memory
  const idx = DEMO_FREELANCERS.findIndex(f => f._id === req.params.id);
  if (idx !== -1) { DEMO_FREELANCERS[idx] = { ...DEMO_FREELANCERS[idx], ...req.body }; }
  res.json(DEMO_FREELANCERS[idx] || DEMO_FREELANCERS[0]);
});

// Export reviews store so reviews.js can access it
module.exports = router;
module.exports.IN_MEMORY_REVIEWS = IN_MEMORY_REVIEWS;
module.exports.DEMO_FREELANCERS   = DEMO_FREELANCERS;

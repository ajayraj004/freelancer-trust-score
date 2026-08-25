const express = require('express');
const router = express.Router();
const Freelancer = require('../models/Freelancer');
const User = require('../models/User');

// Get all freelancers (ranked by trustScore)
router.get('/', async (req, res) => {
  try {
    const freelancers = await Freelancer.find()
      .populate('userId', 'name role avatar')
      .sort({ trustScore: -1 });
    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Search and Filter freelancers
router.get('/search', async (req, res) => {
  const { query, minScore, skill } = req.query;
  try {
    let filter = {};
    if (minScore) filter.trustScore = { $gte: minScore };
    if (skill) filter.skills = { $in: [skill] };

    let freelancers = await Freelancer.find(filter)
      .populate('userId', 'name role avatar');

    if (query) {
      freelancers = freelancers.filter(f => 
        f.userId.name.toLowerCase().includes(query.toLowerCase()) || 
        f.bio.toLowerCase().includes(query.toLowerCase())
      );
    }
    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get freelancer details by id
router.get('/:id', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).populate('userId', 'name email role avatar');
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });
    res.json(freelancer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get freelancer details by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ userId: req.params.userId }).populate('userId', 'name email role avatar');
    if (!freelancer) return res.status(404).json({ message: 'Freelancer profile not found' });
    res.json(freelancer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update freelancer profile/stats
router.put('/:id', async (req, res) => {
  try {
    const freelancer = await Freelancer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // This will trigger the pre('save') hook to recalculate trustScore
    await freelancer.save();
    res.json(freelancer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

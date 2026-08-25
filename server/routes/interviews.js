const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');

// Schedule an interview
router.post('/', async (req, res) => {
  const { clientId, freelancerId, date, note } = req.body;
  try {
    const newInterview = new Interview({ clientId, freelancerId, date, note });
    await newInterview.save();
    res.status(201).json(newInterview);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all interviews for a user (either client or freelancer)
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const interviews = await Interview.find({ 
      $or: [{ clientId: userId }, { freelancerId: userId }] 
    })
    .populate('clientId', 'name avatar')
    .populate('freelancerId', 'name avatar')
    .sort({ date: 1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

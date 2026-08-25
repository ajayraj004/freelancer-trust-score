const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Create a job
router.post('/', async (req, res) => {
  const { authorId, title, description, budget, skills } = req.body;
  try {
    const newJob = new Job({ authorId, title, description, budget, skills });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate('authorId', 'name avatar').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

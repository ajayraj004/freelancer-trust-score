const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

let Interview;
try { Interview = require('../models/Interview'); } catch(e) {}
function isDBConnected() { return mongoose.connection.readyState === 1; }

const IN_MEMORY_INTERVIEWS = [
  {
    _id: 'int-1',
    clientId: { _id: 'demo-client-1', name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop' },
    freelancerId: { _id: 'demo-freelancer-1', name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop' },
    date: new Date(Date.now() + 86400000 * 2),
    note: 'Initial technical assessment for MERN project',
    status: 'scheduled'
  }
];

// Schedule an interview
router.post('/', async (req, res) => {
  const { clientId, freelancerId, date, note } = req.body;
  if (isDBConnected()) {
    try {
      const newInterview = new Interview({ clientId, freelancerId, date, note });
      await newInterview.save();
      return res.status(201).json(newInterview);
    } catch (err) {}
  }
  const newInt = {
    _id: 'int-' + Date.now(),
    clientId: { _id: clientId, name: 'You' },
    freelancerId: { _id: freelancerId, name: 'Freelancer' },
    date: date ? new Date(date) : new Date(Date.now() + 86400000 * 2),
    note: note || '',
    status: 'scheduled'
  };
  IN_MEMORY_INTERVIEWS.push(newInt);
  res.status(201).json(newInt);
});

// Get all interviews for a user (either client or freelancer)
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  if (isDBConnected()) {
    try {
      const interviews = await Interview.find({ 
        $or: [{ clientId: userId }, { freelancerId: userId }] 
      })
      .populate('clientId', 'name avatar')
      .populate('freelancerId', 'name avatar')
      .sort({ date: 1 });
      return res.json(interviews);
    } catch (err) {}
  }
  res.json(IN_MEMORY_INTERVIEWS);
});

module.exports = router;

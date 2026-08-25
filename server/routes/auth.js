const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_for_trust_score';

function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

// Helper to parse skills input string or array into array of clean strings
function parseSkillsInput(skills) {
  if (Array.isArray(skills)) return skills.map(s => String(s).trim()).filter(Boolean);
  if (typeof skills === 'string') return skills.split(',').map(s => s.trim()).filter(Boolean);
  return ['React', 'Node.js', 'MongoDB']; // Default skills if empty
}

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role, skills } = req.body;
  try {
    const parsedSkills = parseSkillsInput(skills);

    if (isDBConnected()) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const newUser = new User({ name, email, password, role });
      await newUser.save();

      let freelancerProfileId = null;
      if (role === 'freelancer') {
        const newFreelancer = new Freelancer({
          userId: newUser._id,
          skills: parsedSkills,
          bio: `Experienced software developer specialized in ${parsedSkills.join(', ')}.`,
          behaviorScore: 100
        });
        await newFreelancer.save();
        freelancerProfileId = newFreelancer._id;
      }

      const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });
      return res.status(201).json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          freelancerId: freelancerProfileId
        }
      });
    }

    // In-memory fallback
    const { USERS, FREELANCER_PROFILES, DEMO_FREELANCERS } = require('./freelancer');
    const exists = USERS.find(u => u.email === email);
    if (exists) return res.status(400).json({ message: 'User already exists with this email' });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: 'user-' + Date.now(),
      name, email, passwordHash,
      role: role || 'freelancer',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=150`,
      freelancerId: null
    };

    if (newUser.role === 'freelancer') {
      const newProfile = {
        _id: 'fp-' + Date.now(),
        userId: { _id: newUser.id, name: newUser.name, role: 'freelancer', avatar: newUser.avatar },
        bio: `Professional freelancer specialized in ${parsedSkills.join(', ')}.`,
        skills: parsedSkills,
        trustScore: 75, avgRating: 4.5, reviewsCount: 1,
        behaviorScore: 100, pastWorkCount: 5, totalEarnings: 1500, location: 'Global', availability: true
      };
      FREELANCER_PROFILES.push(newProfile);
      DEMO_FREELANCERS.unshift(newProfile);
      newUser.freelancerId = newProfile._id;
    }
    USERS.push(newUser);

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar, freelancerId: newUser.freelancerId } });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (isDBConnected()) {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      let freelancerProfileId = null;
      if (user.role === 'freelancer') {
        const f = await Freelancer.findOne({ userId: user._id });
        if (f) freelancerProfileId = f._id;
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          freelancerId: freelancerProfileId
        }
      });
    }

    // In-memory fallback
    const { USERS } = require('./freelancer');
    const user = USERS.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'No account found with this email' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        freelancerId: user.freelancerId || null
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile
router.put('/user/:id', async (req, res) => {
  try {
    if (isDBConnected()) {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
    }
    const { USERS } = require('./freelancer');
    const idx = USERS.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });
    USERS[idx] = { ...USERS[idx], ...req.body };
    const u = USERS[idx];
    res.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

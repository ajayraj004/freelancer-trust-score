const express = require('express');
const router  = express.Router();
const http    = require('http');

// In-memory demo jobs
let IN_MEMORY_JOBS = [
  { _id: 'job-1', authorId: { _id: 'demo-client-1', name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop' }, title: 'React Frontend Developer Needed', description: 'Build modern UI components using React, JavaScript and CSS. Must have experience with REST APIs and responsive design.', budget: 1500, skills: ['React', 'JavaScript', 'CSS'], createdAt: new Date(Date.now() - 86400000 * 1) },
  { _id: 'job-2', authorId: { _id: 'demo-client-1', name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop' }, title: 'MERN Stack Developer for E-Commerce', description: 'Full stack development using MongoDB Express React Node.js for an e-commerce platform. Experience with payment integration required.', budget: 2500, skills: ['React', 'Node.js', 'MongoDB', 'Express'], createdAt: new Date(Date.now() - 86400000 * 2) },
  { _id: 'job-3', authorId: { _id: 'demo-client-2', name: 'Sneha Patel', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop' }, title: 'Python Data Science Project', description: 'Analyze datasets and build predictive ML models using Python pandas sklearn TensorFlow. Statistical knowledge required.', budget: 2000, skills: ['Python', 'Machine Learning', 'Pandas', 'TensorFlow'], createdAt: new Date(Date.now() - 86400000 * 3) },
  { _id: 'job-4', authorId: { _id: 'demo-client-2', name: 'Sneha Patel', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop' }, title: 'Backend Node.js API Engineer', description: 'REST API development with Node.js Express and MongoDB database. Authentication, caching and performance optimization needed.', budget: 1800, skills: ['Node.js', 'Express', 'MongoDB', 'REST API'], createdAt: new Date(Date.now() - 86400000 * 4) },
  { _id: 'job-5', authorId: { _id: 'demo-client-1', name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop' }, title: 'UI/UX Designer for SaaS Product', description: 'Design beautiful interfaces in Figma for a SaaS product. Motion design and React implementation skills a plus.', budget: 1200, skills: ['Figma', 'UI/UX', 'CSS', 'Motion Design'], createdAt: new Date(Date.now() - 86400000 * 5) }
];

// AI helper
function callAI(path, body) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(body);
    const options  = { hostname: 'localhost', port: 5002, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.write(postData);
    req.end();
  });
}

let Job, mongoose;
try { Job = require('../models/Job'); mongoose = require('mongoose'); } catch(e) {}
function isDBConnected() { try { return mongoose && mongoose.connection.readyState === 1; } catch(e) { return false; } }

// POST /api/jobs — Create job
router.post('/', async (req, res) => {
  const { authorId, title, description, budget, skills } = req.body;
  if (isDBConnected()) {
    try { const j = new Job({ authorId, title, description, budget, skills }); await j.save(); return res.status(201).json(j); } catch(e) {}
  }
  const newJob = { _id: 'job-' + Date.now(), authorId: { _id: authorId, name: 'You' }, title, description, budget: Number(budget), skills: skills || [], createdAt: new Date() };
  IN_MEMORY_JOBS.unshift(newJob);
  res.status(201).json(newJob);
});

// GET /api/jobs — Get all jobs
router.get('/', async (req, res) => {
  if (isDBConnected()) {
    try { const jobs = await Job.find().populate('authorId', 'name avatar').sort({ createdAt: -1 }); return res.json(jobs); } catch(e) {}
  }
  res.json(IN_MEMORY_JOBS);
});

// POST /api/jobs/match — AI Job Matching
router.post('/match', async (req, res) => {
  const { skills } = req.body;
  if (!skills || skills.length === 0) return res.status(400).json({ message: 'Provide at least one skill' });

  let allJobs = IN_MEMORY_JOBS;
  if (isDBConnected()) {
    try {
      const dbJobs = await Job.find().populate('authorId', 'name avatar').sort({ createdAt: -1 });
      if (dbJobs && dbJobs.length > 0) {
        allJobs = dbJobs.map(j => j.toObject());
      }
    } catch(e) {}
  }

  const jobsForAI = allJobs.map(j => ({
    id: String(j._id),
    title: j.title,
    description: j.description,
    skills: j.skills,
    budget: j.budget
  }));

  const matched = await callAI('/ai/match-jobs', { skills, jobs: jobsForAI });
  if (!matched) return res.json(allJobs);

  const jobMap = {};
  allJobs.forEach(j => { jobMap[String(j._id)] = j; });
  const result = matched.map(aj => {
    const originalJob = jobMap[String(aj.id)] || {};
    return {
      ...originalJob,
      _id: originalJob._id || aj.id,
      title: aj.title || originalJob.title,
      description: aj.description || originalJob.description,
      skills: aj.skills || originalJob.skills || [],
      budget: aj.budget || originalJob.budget || 0,
      match_score: aj.match_score,
      match_percent: aj.match_percent,
      match_label: aj.match_label
    };
  });
  res.json(result);
});

module.exports = router;
module.exports.IN_MEMORY_JOBS = IN_MEMORY_JOBS;

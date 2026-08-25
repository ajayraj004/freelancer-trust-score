const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5001;
let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelancer_trust';

// Helper to seed database if empty
async function autoSeedDatabase() {
  const User = require('./models/User');
  const Freelancer = require('./models/Freelancer');
  const Review = require('./models/Review');
  const Job = require('./models/Job');
  const bcrypt = require('bcryptjs');

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('MongoDB database is empty. Auto-seeding initial presentation data...');

    const passHash = await bcrypt.hash('demo123', 10);

    // 1. Seed Users
    const u1 = await User.create({
      name: 'Sarah Johnson',
      email: 'freelancer@demo.com',
      password: 'demo123',
      role: 'freelancer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
    });

    const u2 = await User.create({
      name: 'Alex Morgan',
      email: 'client@demo.com',
      password: 'demo123',
      role: 'client',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
    });

    const u3 = await User.create({
      name: 'Michael R.',
      email: 'michael@example.com',
      password: 'password123',
      role: 'freelancer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
    });

    const u4 = await User.create({
      name: 'Emily B.',
      email: 'emily@example.com',
      password: 'password123',
      role: 'freelancer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    });

    // 2. Seed Freelancer Profiles
    const f1 = await Freelancer.create({
      userId: u1._id,
      title: 'Full-Stack Software Engineer',
      bio: 'Expert React & Node.js developer with 5 years of experience building scalable web applications.',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'CSS'],
      pastWorkCount: 45,
      avgRating: 4.9,
      reviewsCount: 3,
      behaviorScore: 98,
      totalEarnings: 25000,
      location: 'San Francisco, CA'
    });

    const f2 = await Freelancer.create({
      userId: u3._id,
      title: 'Cloud & Node.js Developer',
      bio: 'Full Stack Developer specializing in Node.js, React and AWS architectures.',
      skills: ['Node.js', 'MongoDB', 'React', 'AWS'],
      pastWorkCount: 30,
      avgRating: 4.7,
      reviewsCount: 28,
      behaviorScore: 92,
      totalEarnings: 18000,
      location: 'New York, NY'
    });

    const f3 = await Freelancer.create({
      userId: u4._id,
      title: 'Senior Data Scientist & ML Engineer',
      bio: 'Senior Data Scientist and Machine Learning Engineer specializing in Python & NLP.',
      skills: ['Python', 'TensorFlow', 'SQL', 'Tableau', 'NLP'],
      pastWorkCount: 22,
      avgRating: 5.0,
      reviewsCount: 22,
      behaviorScore: 100,
      totalEarnings: 32000,
      location: 'London, UK'
    });

    // 3. Seed Reviews with AI results
    await Review.create({
      authorId: u2._id,
      freelancerId: f1._id,
      rating: 5,
      comment: 'Exceptional work, delivered within 2 days! Highly recommended.',
      category: 'Quality',
      sentiment: { label: 'Positive', score: 0.85, confidence: 0.85 },
      fraud: { is_suspicious: false, risk_level: 'Low Risk', reason: 'No specific red flags detected' }
    });

    await Review.create({
      authorId: u2._id,
      freelancerId: f1._id,
      rating: 4,
      comment: 'Great communicator and beautiful designs.',
      category: 'Communication',
      sentiment: { label: 'Positive', score: 0.72, confidence: 0.72 },
      fraud: { is_suspicious: false, risk_level: 'Low Risk', reason: 'No specific red flags detected' }
    });

    await Review.create({
      authorId: u2._id,
      freelancerId: f1._id,
      rating: 1,
      comment: 'very good work done everything was being done on time',
      category: 'Reliability',
      sentiment: { label: 'Positive', score: 0.75, confidence: 0.75 },
      fraud: { is_suspicious: true, risk_level: 'Medium Risk', reason: 'Account has never reviewed before' }
    });

    // 4. Seed Jobs
    await Job.create({
      authorId: u2._id,
      title: 'MERN Stack Developer for E-Commerce',
      description: 'Full stack development using MongoDB Express React Node.js for an e-commerce platform.',
      budget: 2500,
      skills: ['React', 'Node.js', 'MongoDB', 'Express']
    });

    await Job.create({
      authorId: u2._id,
      title: 'React Frontend Developer Needed',
      description: 'Build modern UI components using React, JavaScript and TailwindCSS.',
      budget: 1500,
      skills: ['React', 'JavaScript', 'CSS']
    });

    await Job.create({
      authorId: u2._id,
      title: 'Python Data Science Project',
      description: 'Analyze datasets and build predictive ML models using Python pandas sklearn.',
      budget: 2000,
      skills: ['Python', 'Machine Learning', 'Pandas']
    });

    console.log('MongoDB auto-seeding completed successfully!');
  }
}

// Connect to MongoDB
async function startDatabase() {
  try {
    // Try standard MongoDB connection
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to local/atlas MongoDB successfully!');
  } catch (err) {
    console.warn('Local/Atlas MongoDB connection failed. Launching Embedded MongoDB Server (MongoMemoryServer)...');
    try {
      const mongod = await MongoMemoryServer.create({
        instance: { dbName: 'freelancer_trust' }
      });
      mongoUri = mongod.getUri();
      console.log(`Embedded MongoDB Server started at: ${mongoUri}`);
      await mongoose.connect(mongoUri);
      console.log('Connected to Embedded MongoDB Server successfully!');
    } catch (memErr) {
      console.error('Failed to start Embedded MongoDB:', memErr.message);
    }
  }

  if (mongoose.connection.readyState === 1) {
    await autoSeedDatabase().catch(e => console.error('Auto seed error:', e));
  }
}

startDatabase();

// Basic Route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Freelancer Trust Score MERN + AI/ML API is running',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected 🟢' : 'Disconnected 🔴',
    databaseUri: mongoUri
  });
});

// Import Routes
const authRoutes = require('./routes/auth');
const freelancerRoutes = require('./routes/freelancer');
const reviewRoutes = require('./routes/reviews');
const jobRoutes = require('./routes/jobs');
const interviewRoutes = require('./routes/interviews');

app.use('/api/auth', authRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interviews', interviewRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

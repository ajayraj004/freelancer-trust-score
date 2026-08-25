const mongoose = require('mongoose');
const User = require('./models/User');
const Freelancer = require('./models/Freelancer');
const Review = require('./models/Review');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freelancer_trust';

const freelancersData = [
  {
    name: 'Sarah J.',
    email: 'sarah@example.com',
    bio: 'Expert UI/UX Designer with over 7 years of experience in creating digital products that users love.',
    skills: ['Figma', 'React', 'Adobe XD', 'Sketch'],
    pastWorkCount: 45,
    avgRating: 4.9,
    reviewsCount: 42,
    behaviorScore: 98,
    totalEarnings: 25000,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
  },
  {
    name: 'Michael R.',
    email: 'michael@example.com',
    bio: 'Full Stack Developer specializing in Node.js and React. Passionate about scalable and robust architectures.',
    skills: ['Node.js', 'MongoDB', 'React', 'AWS'],
    pastWorkCount: 30,
    avgRating: 4.7,
    reviewsCount: 28,
    behaviorScore: 92,
    totalEarnings: 18000,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
  },
  {
    name: 'Emily B.',
    email: 'emily@example.com',
    bio: 'Senior Data Scientist and Machine Learning Engineer. I help businesses turn data into actionable insights.',
    skills: ['Python', 'TensorFlow', 'SQL', 'Tableau'],
    pastWorkCount: 22,
    avgRating: 5.0,
    reviewsCount: 22,
    behaviorScore: 100,
    totalEarnings: 32000,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
  },
  {
    name: 'David K.',
    email: 'david@example.com',
    bio: 'Graphic Designer and Illustrator. I bring brands to life with unique and impactful visual storytelling.',
    skills: ['Illustrator', 'Photoshop', 'InDesign', 'After Effects'],
    pastWorkCount: 15,
    avgRating: 4.5,
    reviewsCount: 14,
    behaviorScore: 85,
    totalEarnings: 9000,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    await User.deleteMany({});
    await Freelancer.deleteMany({});
    await Review.deleteMany({});

    for (const f of freelancersData) {
      const newUser = new User({
        name: f.name,
        email: f.email,
        password: 'password123',
        avatar: f.avatar,
        role: 'freelancer'
      });
      await newUser.save();

      const newFreelancer = new Freelancer({
        userId: newUser._id,
        bio: f.bio,
        skills: f.skills,
        pastWorkCount: f.pastWorkCount,
        avgRating: f.avgRating,
        reviewsCount: f.reviewsCount,
        behaviorScore: f.behaviorScore,
        totalEarnings: f.totalEarnings
      });
      // The pre-save hook will calculate the trustScore automatically
      await newFreelancer.save();
    }

    console.log('Database seeded successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

seedDB();

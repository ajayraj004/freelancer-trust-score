const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freelancer_trust';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB successfully connected to Atlas cluster'))
  .catch(err => {
    console.error('CRITICAL: MongoDB Atlas connection failed.');
    console.error('Reason: Your IP address is likely not whitelisted in Atlas.');
    console.error('Please go to Atlas -> Network Access -> Add IP Address -> Allow Access from Anywhere.');
  });

// Basic Route
app.get('/', (req, res) => {
  res.send('Freelancer Trust Score API is running');
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

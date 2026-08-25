const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Freelancer = require('../models/Freelancer');

// Add a review for a freelancer
router.post('/', async (req, res) => {
  const { authorId, freelancerId, rating, comment, category } = req.body;
  try {
    const newReview = new Review({ authorId, freelancerId, rating, comment, category });
    await newReview.save();

    // Update freelancer's avgRating and reviewsCount
    const freelancer = await Freelancer.findById(freelancerId);
    if (freelancer) {
      const totalRating = (freelancer.avgRating * freelancer.reviewsCount) + rating;
      freelancer.reviewsCount += 1;
      freelancer.avgRating = totalRating / freelancer.reviewsCount;
      // This will trigger the pre('save') hook to recalculate trustScore
      await freelancer.save();
    }
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all reviews for a freelancer
router.get('/freelancer/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ freelancerId: req.params.id })
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const FreelancerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  resumeUrl: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },
  pastWorkCount: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  behaviorScore: { type: Number, default: 100 }, // 0 to 100
  trustScore: { type: Number, default: 0 }, // 0 to 100 (Calculated)
  totalEarnings: { type: Number, default: 0 },
  location: { type: String, default: 'Global' },
  languages: [{ type: String, default: ['English'] }],
  availability: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
});

FreelancerSchema.pre('save', function() {
  const ratingFactor = (this.avgRating / 5) * 40;
  const workFactor = Math.min((this.pastWorkCount / 50) * 20, 20);
  const behaviorFactor = (this.behaviorScore / 100) * 30;
  const reviewFactor = Math.min((this.reviewsCount / 50) * 10, 10);
  
  this.trustScore = Math.round(ratingFactor + workFactor + behaviorFactor + reviewFactor);
  this.lastUpdated = Date.now();
});

module.exports = mongoose.model('Freelancer', FreelancerSchema);

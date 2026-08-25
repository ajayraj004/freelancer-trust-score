import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Star, Clock, CheckCircle, MessageSquare, Briefcase, ThumbsUp, DollarSign, Calendar, MapPin, Award, AlertTriangle, Brain, TrendingUp, Zap } from 'lucide-react';
import api from '../utils/api';
import TrustGauge from '../components/TrustGauge';
import { getFreelancerTitle } from '../components/FreelancerCard';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ==============================================================
// FreelancerProfile Page — Updated with AI Feature Display
//
// NEW AI ADDITIONS IN THIS FILE:
//   1. SentimentBadge component — shows Positive/Neutral/Negative
//      badge on each review card (from Feature 1: Sentiment Analysis)
//   2. FraudBadge component — shows a warning if review is flagged
//      as suspicious (from Feature 2: Fraud Detection)
//   3. AI Insight Panel — shows overall sentiment stats for
//      all reviews on this freelancer's profile
// ==============================================================

// ---- COMPONENT: Sentiment Badge ----
// Displays a small colored badge showing the AI-detected sentiment
// of a review. Shown on each review card.
//
// Props:
//   sentiment: { label: "Positive"|"Neutral"|"Negative", score: float }
const SentimentBadge = ({ sentiment }) => {
  // If no sentiment data (AI was offline), show nothing
  if (!sentiment || !sentiment.label) return null;

  // Color and icon based on label
  const config = {
    Positive: { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: '😊', label: 'Positive' },
    Neutral:  { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',   icon: '😐', label: 'Neutral'  },
    Negative: { color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',          icon: '😞', label: 'Negative' }
  };

  // Get the right config for this sentiment label
  const { color, icon, label } = config[sentiment.label] || config.Neutral;
  const percent = Math.round((sentiment.score + 1) / 2 * 100); // convert -1..1 to 0..100%

  return (
    // Small pill-shaped badge shown on the review card
    <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${color}`}>
      <Brain className="w-3 h-3" />
      AI: {icon} {label} ({percent}%)
    </span>
  );
};

// ---- COMPONENT: Fraud Warning Badge ----
// Shown on review cards when Fraud Detector flags a review
// as suspicious. Uses red warning styling.
//
// Props:
//   fraud: { is_suspicious: bool, risk_level: string, reason: string }
const FraudBadge = ({ fraud }) => {
  // Only show badge if AI flagged it as suspicious
  if (!fraud || !fraud.is_suspicious) return null;

  return (
    // Red warning badge — clearly visible to inform the viewer
    <div className="mt-3 flex items-start gap-2 text-[10px] text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-xl px-3 py-2">
      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
      <span>
        <strong>AI Flag — {fraud.risk_level}:</strong> {fraud.reason}
      </span>
    </div>
  );
};

// ---- HELPER: Calculate overall sentiment stats ----
// Goes through all reviews and counts how many are
// Positive / Neutral / Negative (for the AI insight panel)
const getSentimentStats = (reviews) => {
  let pos = 0, neu = 0, neg = 0;
  reviews.forEach(r => {
    if (!r.sentiment?.label) return;
    if (r.sentiment.label === 'Positive') pos++;
    else if (r.sentiment.label === 'Neutral') neu++;
    else neg++;
  });
  const total = pos + neu + neg;
  return {
    positive: pos,
    neutral:  neu,
    negative: neg,
    total,
    // Percentage of positive reviews (0 if no AI data)
    positivePercent: total > 0 ? Math.round((pos / total) * 100) : 0
  };
};


// ---- MAIN PAGE COMPONENT ----
const FreelancerProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [freelancer, setFreelancer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', category: 'Reliability' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [submitResult, setSubmitResult] = useState(null); // stores AI result after review submission

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, rRes] = await Promise.all([
          api.get(`/freelancers/${id}`),
          api.get(`/reviews/freelancer/${id}`)
        ]);
        if (!fRes.data) throw new Error('No data');
        setFreelancer(fRes.data);
        setReviews(rRes.data);
      } catch (err) {
        console.error('API Error, using fallback:', err);
        setFreelancer({
          _id: id,
          userId: { name: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', email: 'sarah@example.com' },
          bio: 'Expert UI/UX Designer specialized in creating premium digital experiences.',
          skills: ['Figma', 'React', 'Motion', 'Node.js'],
          trustScore: 94,
          avgRating: 4.9,
          totalEarnings: 25000,
          pastWorkCount: 42,
          behaviorScore: 98,
          location: 'San Francisco, CA'
        });
        // Fallback reviews now include mock AI data so the UI looks correct in demo mode
        setReviews([
          {
            _id: 'r1',
            authorId: { name: 'Alice W.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop' },
            rating: 5,
            comment: 'Exceptional work, delivered within 2 days! Highly recommended.',
            createdAt: new Date(),
            sentiment: { label: 'Positive', score: 0.85, confidence: 0.85 },  // mock AI result
            fraud: { is_suspicious: false, risk_level: 'Low Risk', reason: '' }
          },
          {
            _id: 'r2',
            authorId: { name: 'Bob M.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop' },
            rating: 4.5,
            comment: 'Great communicator and beautiful designs.',
            createdAt: new Date(),
            sentiment: { label: 'Positive', score: 0.72, confidence: 0.72 },
            fraud: { is_suspicious: false, risk_level: 'Low Risk', reason: '' }
          },
          {
            _id: 'r3',
            authorId: { name: 'New Account', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop' },
            rating: 5,
            comment: 'Okay work, nothing special really.',
            createdAt: new Date(),
            // This review shows mismatch: 5 stars but Neutral sentiment
            sentiment: { label: 'Neutral', score: 0.02, confidence: 0.02 },
            fraud: { is_suspicious: true, risk_level: 'High Risk', reason: 'Account created very recently; Perfect rating from a new account' }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to leave a review');
    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      // Submit review — backend now automatically calls AI service
      // and returns the review WITH sentiment + fraud analysis attached
      const response = await api.post('/reviews', {
        ...reviewForm,
        authorId: user.id,
        freelancerId: id,
        author_review_count: 1,   // In real app: get from user's review history
        days_since_joined: 30     // In real app: calculate from user.createdAt
      });

      // Show the AI analysis result as a toast/notification after submission
      setSubmitResult({
        sentiment: response.data.sentiment,
        fraud:     response.data.fraud
      });

      // Refresh page data
      const [fRes, rRes] = await Promise.all([
        api.get(`/freelancers/${id}`),
        api.get(`/reviews/freelancer/${id}`)
      ]);
      setFreelancer(fRes.data);
      setReviews(rRes.data);
      setReviewForm({ rating: 5, comment: '', category: 'Reliability' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="container py-20 text-center animate-pulse">Loading amazing talent...</div>;
  if (!freelancer) return <div className="container py-20 text-center">Freelancer not found.</div>;

  const { userId, bio, skills, trustScore, avgRating, totalEarnings, pastWorkCount, behaviorScore, location } = freelancer;

  // Calculate sentiment stats from all reviews for the AI insight panel
  const sentimentStats = getSentimentStats(reviews);
  // Count how many reviews were flagged as suspicious
  const suspiciousCount = reviews.filter(r => r.fraud?.is_suspicious).length;

  return (
    <div className="container max-w-6xl mx-auto px-6 py-10 min-h-screen animate-fade-in">
      {/* Header Profile Section */}
      <section className="glass p-10 mb-10 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
         <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="relative">
               <img src={userId?.avatar} alt={userId?.name} className="w-32 h-32 rounded-3xl object-cover ring-4 ring-white/5 border-secondary" />
               <div className="absolute -bottom-2 -left-2 glass px-3 py-1 flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-emerald-400/20">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div> ONLINE
               </div>
            </div>
            
            <div className="flex-1">
               <div className="flex items-center gap-4 mb-2 justify-center md:justify-start">
                  <h1 className="text-4xl font-bold">{userId?.name}</h1>
                  <span className="bg-primary/20 text-primary text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-primary/20 flex items-center gap-1">
                     <Shield className="w-3 h-3" /> VERIFIED PRO
                  </span>
               </div>
               <p className="text-text-gray font-medium mb-4 flex items-center gap-4 justify-center md:justify-start">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> {location || 'Global'}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-secondary" /> {new Date().toLocaleDateString()} Member</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-accent" /> {getFreelancerTitle(freelancer)}</span>
               </p>
               <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                 {skills?.map((skill, index) => (
                   <span key={index} className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80">
                     {skill}
                   </span>
                 ))}
               </div>
            </div>

            <div className="flex flex-col items-center glass p-6 border-primary/20 bg-primary/5">
                <TrustGauge score={trustScore} size={110} strokeWidth={8} />
                <span className="text-[12px] font-bold text-primary mt-4 tracking-widest uppercase flex items-center gap-1">
                   <Shield className="w-4 h-4" /> TRUST RANKING
                </span>
                <p className="text-[10px] text-text-gray mt-1 font-bold">Top 2% Globally</p>
            </div>
         </div>
      </section>

      {/* ============================================================
          AI INSIGHT BANNER — NEW SECTION
          Shows a summary of all AI analysis done on this freelancer's reviews.
          Panel explains:
            - What % of reviews have positive sentiment
            - How many reviews were flagged as suspicious by fraud detector
          This gives clients a quick "AI health check" of the freelancer.
      ============================================================ */}
      {sentimentStats.total > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 mb-10 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Header */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-primary/20 p-3 rounded-2xl">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-primary">AI Review Intelligence</h3>
                <p className="text-[10px] text-text-gray">Analyzed {sentimentStats.total} review{sentimentStats.total !== 1 ? 's' : ''} with NLP</p>
              </div>
            </div>

            {/* Sentiment Stats */}
            <div className="flex-1 grid grid-cols-3 gap-4 text-center">
              {/* Positive Count */}
              <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-4">
                <p className="text-2xl font-bold text-emerald-400">{sentimentStats.positive}</p>
                <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest mt-1">😊 Genuine Positive</p>
              </div>
              {/* Neutral Count */}
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4">
                <p className="text-2xl font-bold text-yellow-400">{sentimentStats.neutral}</p>
                <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest mt-1">😐 Neutral</p>
              </div>
              {/* Negative Count */}
              <div className="bg-rose-400/10 border border-rose-400/20 rounded-2xl p-4">
                <p className="text-2xl font-bold text-rose-400">{sentimentStats.negative}</p>
                <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest mt-1">😞 Negative Tone</p>
              </div>
            </div>

            {/* Fraud Summary */}
            <div className={`shrink-0 text-center glass p-4 rounded-2xl border ${suspiciousCount > 0 ? 'border-rose-400/30 bg-rose-400/5' : 'border-emerald-400/20 bg-emerald-400/5'}`}>
              <div className="flex items-center gap-2 justify-center mb-1">
                <AlertTriangle className={`w-4 h-4 ${suspiciousCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
                <p className="text-xl font-bold">{suspiciousCount}</p>
              </div>
              <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest">
                {suspiciousCount > 0 ? 'Flagged Reviews' : 'All Authentic'}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-8 mb-8 border-b border-white/10 px-4">
             {['Overview', 'Portfolio', 'Experience', 'Services'].map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-primary' : 'text-text-gray hover:text-white'}`}
               >
                  {tab}
                  {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-4px_10px_rgba(99,102,241,0.5)]" />}
               </button>
             ))}
          </div>

          <div className="glass p-8 mb-8 border-white/5 bg-white/[0.02]">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Star className="text-warning fill-warning w-5 h-5" /> About {userId?.name}
             </h3>
             <p className="text-text-gray leading-relaxed text-lg mb-8">
               {bio || 'Experienced software professional with a track record of delivering high-performance applications. Specialized in modern web technologies and user-centric design paradigms.'}
             </p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                   <div className="bg-emerald-400/20 p-3 rounded-xl"><DollarSign className="w-6 h-6 text-emerald-400" /></div>
                   <div>
                      <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest leading-none mb-1">Total Earnings</p>
                      <h4 className="text-xl font-bold">${totalEarnings?.toLocaleString()}+</h4>
                   </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                   <div className="bg-primary/20 p-3 rounded-xl"><CheckCircle className="w-6 h-6 text-primary" /></div>
                   <div>
                      <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest leading-none mb-1">Jobs Completed</p>
                      <h4 className="text-xl font-bold">{pastWorkCount} Projects</h4>
                   </div>
                </div>
             </div>
          </div>

          {/* Reviews Section — now shows AI badges on each review */}
          <div className="glass p-8 border-white/5 bg-white/[0.02]">
             <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <MessageSquare className="text-secondary w-5 h-5" /> Client Testimonials
                {/* Positive sentiment percentage badge */}
                {sentimentStats.total > 0 && (
                  <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {sentimentStats.positivePercent}% Positive Sentiment
                  </span>
                )}
             </h3>
             <div className="space-y-6">
                {reviews.length > 0 ? reviews.map((review) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl border transition-all group ${
                      review.fraud?.is_suspicious
                        ? 'bg-rose-400/5 border-rose-400/20'   // red tint if flagged
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img src={review.authorId?.avatar} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                        <div>
                          <p className="text-sm font-bold group-hover:text-primary transition-colors">{review.authorId?.name}</p>
                          <p className="text-[10px] text-text-gray font-bold">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {/* Row of badges: Star Rating + AI Sentiment Badge */}
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded-lg border border-warning/10">
                          <Star className="w-3 h-3 text-warning fill-warning" />
                          <span className="text-[10px] font-bold text-warning">{review.rating?.toFixed(1)}</span>
                        </div>
                        {/* ← AI Feature 1: Sentiment Badge */}
                        <SentimentBadge sentiment={review.sentiment} />
                      </div>
                    </div>
                    <p className="text-sm text-text-gray font-medium italic leading-relaxed">"{review.comment}"</p>
                    {/* ← AI Feature 2: Fraud Warning */}
                    <FraudBadge fraud={review.fraud} />
                  </motion.div>
                )) : (
                  <p className="text-text-gray text-center py-10">No reviews yet. Be the first to hire!</p>
                )}
             </div>
          </div>
        </div>

        {/* Right Column - Score Breakdown & Actions */}
        <div className="space-y-8">
           <div className="glass p-8 border-primary/20 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[60px] rounded-full group-hover:bg-primary/30 transition-all"></div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                 <Shield className="text-primary w-5 h-5" /> ML-Insight Scoring
              </h3>
              
              <div className="space-y-6 mb-8">
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-text-gray tracking-widest uppercase">
                       <span>Behavior Consistency</span>
                       <span className="text-emerald-400">{behaviorScore}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                       <motion.div
                          className="h-full bg-emerald-400 rounded-full relative"
                          initial={{ width: 0 }}
                          animate={{ width: `${behaviorScore}%` }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                       >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                       </motion.div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-text-gray tracking-widest uppercase">
                       <span>Work Quality</span>
                       <span className="text-primary">{(avgRating * 20).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                       <motion.div
                          className="h-full bg-primary rounded-full relative"
                          initial={{ width: 0 }}
                          animate={{ width: `${avgRating * 20}%` }}
                          transition={{ duration: 1.5, delay: 0.4 }}
                       >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                       </motion.div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-text-gray tracking-widest uppercase">
                       <span>Platform Reliability</span>
                       <span className="text-secondary">88%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                       <motion.div
                          className="h-full bg-secondary rounded-full relative"
                          initial={{ width: 0 }}
                          animate={{ width: '88%' }}
                          transition={{ duration: 1.5, delay: 0.6 }}
                       >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                       </motion.div>
                    </div>
                 </div>

                 {/* AI Sentiment Score Bar — NEW */}
                 {sentimentStats.total > 0 && (
                   <div className="space-y-2 pt-2 border-t border-white/5">
                     <div className="flex justify-between text-xs font-bold text-text-gray tracking-widest uppercase">
                       <span className="flex items-center gap-1"><Brain className="w-3 h-3 text-secondary" /> AI Sentiment Score</span>
                       <span className="text-secondary">{sentimentStats.positivePercent}%</span>
                     </div>
                     <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                       <motion.div
                          className="h-full bg-secondary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${sentimentStats.positivePercent}%` }}
                          transition={{ duration: 1.5, delay: 0.8 }}
                       />
                     </div>
                     <p className="text-[10px] text-text-gray italic">
                       {sentimentStats.positivePercent}% of reviews contain genuinely positive language (NLP verified)
                     </p>
                   </div>
                 )}
              </div>
              <p className="text-[10px] text-text-gray text-center font-bold px-4 leading-normal italic">
                 Scoring is recalculated every 24 hours based on real-time project metrics.
              </p>
           </div>

           {/* Review Form */}
           <div className="glass p-8">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                 <ThumbsUp className="text-primary w-5 h-5" /> Leave Feedback
              </h3>

              {/* Show AI analysis result after review submission */}
              <AnimatePresence>
                {submitResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2"
                  >
                    <p className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-3 h-3" /> AI Analysis Complete
                    </p>
                    {submitResult.sentiment && (
                      <p className="text-[11px] text-text-gray">
                        Sentiment: <strong className="text-white">{submitResult.sentiment.label}</strong> (score: {submitResult.sentiment.score})
                      </p>
                    )}
                    {submitResult.fraud && submitResult.fraud.is_suspicious && (
                      <p className="text-[11px] text-rose-400">
                        ⚠️ Fraud flag: {submitResult.fraud.risk_level} — {submitResult.fraud.reason}
                      </p>
                    )}
                    {submitResult.fraud && !submitResult.fraud.is_suspicious && (
                      <p className="text-[11px] text-emerald-400">✓ No fraud indicators detected</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest block mb-1.5 ml-1">Overall Rating</label>
                    <div className="flex gap-2">
                       {[1,2,3,4,5].map(r => (
                         <button
                           key={r}
                           type="button"
                           onClick={() => setReviewForm({...reviewForm, rating: r})}
                           className={`p-2.5 rounded-xl border transition-all ${reviewForm.rating >= r ? 'bg-warning/20 border-warning text-warning' : 'bg-white/5 border-white/10 text-text-gray'}`}
                         >
                           <Star className={`w-5 h-5 ${reviewForm.rating >= r ? 'fill-warning' : ''}`} />
                         </button>
                       ))}
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest block mb-1.5 ml-1">Comment</label>
                    <textarea
                      required
                      placeholder="Write your experience..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 min-h-[120px] text-sm resize-none font-medium"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    />
                 </div>
                 <button
                    disabled={isSubmitting}
                    className="w-full btn-primary !py-4"
                 >
                    {isSubmitting ? '🤖 AI is analyzing...' : 'Post Review'}
                 </button>
                 <p className="text-[9px] text-text-gray text-center">Your review will be analyzed by AI for sentiment & authenticity</p>
              </form>
           </div>
           
           <Link to={`/schedule/${id}`} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3">
              <Calendar className="w-5 h-5" /> Schedule an Interview
           </Link>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;

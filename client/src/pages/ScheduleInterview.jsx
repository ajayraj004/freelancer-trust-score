import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, MessageSquare, CheckCircle, Video, User, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScheduleInterview = () => {
  const { user } = useContext(AuthContext);
  const { freelancerId } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [formData, setFormData] = useState({ date: '', time: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const res = await api.get(`/freelancers/${freelancerId}`);
        setFreelancer(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (freelancerId) fetchFreelancer();
  }, [freelancerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to schedule an interview');
    setLoading(true);
    try {
      const interviewDate = new Date(`${formData.date}T${formData.time}`);
      await api.post('/interviews', {
        clientId: user.id,
        freelancerId: freelancer.userId._id,
        date: interviewDate,
        note: formData.note
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="container py-20 text-center font-bold text-text-gray">Please login.</div>;
  if (!freelancer) return <div className="container py-20 text-center animate-pulse font-bold text-text-gray">Loading profile...</div>;

  return (
    <div className="container max-w-4xl mx-auto px-6 py-12 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Profile Card */}
        <div className="glass p-8 border-white/5 bg-white/[0.02]">
           <div className="flex items-center gap-4 mb-6">
              <img src={freelancer.userId.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                 <h2 className="text-xl font-bold">{freelancer.userId.name}</h2>
                 <p className="text-xs text-primary font-bold uppercase tracking-widest leading-none mt-1 flex items-center gap-1.5"><Star className="w-3 h-3 fill-primary" /> TOP RATED</p>
              </div>
           </div>
           <p className="text-sm text-text-gray font-medium leading-relaxed mb-6 italic">"{freelancer.bio}"</p>
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold text-white/60">
                 <Video className="w-4 h-4 text-emerald-400" /> Remote Interview Ready
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-white/60">
                 <Clock className="w-4 h-4 text-secondary" /> Usual Response: Under 2h
              </div>
           </div>
        </div>

        {/* Schedule Form */}
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit} 
              className="glass p-10 space-y-6 border-primary/20 relative"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Calendar className="text-primary w-6 h-6" /> Pick your slot</h2>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1">Select Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1">Select Time</label>
                    <input 
                      type="time" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-2"><MessageSquare className="w-3 h-3 text-secondary" /> Optional Note</label>
                 <textarea 
                   className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-secondary/40 font-medium transition-all min-h-[100px] resize-none"
                   placeholder="Briefly state why you're scheduling this meeting."
                   value={formData.note}
                   onChange={(e) => setFormData({...formData, note: e.target.value})}
                 />
              </div>

              <button 
                 disabled={loading}
                 className="btn-primary w-full shadow-none !py-4 font-bold text-lg"
              >
                 {loading ? 'Scheduling...' : 'Reserve Session'}
              </button>
            </motion.form>
          ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass p-20 text-center"
            >
               <div className="inline-flex p-5 bg-emerald-400/20 rounded-full mb-6"><CheckCircle className="w-12 h-12 text-emerald-400" /></div>
               <h2 className="text-3xl font-bold mb-4">Session Booked!</h2>
               <p className="text-text-gray font-medium">Invitation sent. Check your dashboard for details.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScheduleInterview;

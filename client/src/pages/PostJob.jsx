import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Briefcase, DollarSign, List, FileText, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PostJob = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', budget: '', skills: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to post a job');
    setLoading(true);
    try {
      await api.post('/jobs', {
        ...formData,
        authorId: user.id,
        skills: formData.skills.split(',').map(s => s.trim())
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="container py-20 text-center text-text-gray font-bold">Please login to access this page.</div>;

  return (
    <div className="container max-w-3xl mx-auto px-6 py-12 min-h-screen">
      <div className="text-center mb-12">
         <h1 className="text-4xl font-bold mb-4">Post a Project</h1>
         <p className="text-text-gray font-medium">Connect with the top-ranked talent on our platform.</p>
      </div>

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit} 
            className="glass p-10 space-y-8 border-white/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all opacity-40"></div>
            
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-2"><Briefcase className="w-3 h-3 text-primary" /> Project Title</label>
               <input 
                 type="text" 
                 required
                 className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
                 placeholder="e.g. Build a Web3 Dashboard"
                 value={formData.title}
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-2"><FileText className="w-3 h-3 text-secondary" /> Project Description</label>
               <textarea 
                 required
                 className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-1 focus:ring-secondary/40 font-medium transition-all min-h-[160px] resize-none"
                 placeholder="Describe your requirements and expectations..."
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-2"><DollarSign className="w-3 h-3 text-emerald-400" /> Budget (USD)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/40 font-bold transition-all"
                    placeholder="e.g. 1500"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-2"><List className="w-3 h-3 text-warning" /> Required Skills</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-1 focus:ring-warning/40 font-medium transition-all"
                    placeholder="React, Node.js, Tailwind..."
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  />
               </div>
            </div>

            <button 
               disabled={loading}
               className="btn-primary w-full !py-5 text-xl font-bold tracking-tight shadow-none group"
            >
               {loading ? 'Posting Project...' : 'Publish Job'} <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </motion.form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-20 text-center"
          >
             <div className="inline-flex p-6 bg-emerald-400/20 rounded-full mb-8"><CheckCircle className="w-16 h-16 text-emerald-400" /></div>
             <h2 className="text-4xl font-bold mb-4">Job Published!</h2>
             <p className="text-text-gray font-medium">Your project is now live on the marketplace. Redirecting...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostJob;

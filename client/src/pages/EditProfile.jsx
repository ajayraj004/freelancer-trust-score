import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Briefcase, Link as LinkIcon, FileText, Save, ArrowLeft, Camera, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const EditProfile = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [freelancer, setFreelancer] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    bio: '',
    skills: '',
    resumeUrl: '',
    portfolioUrl: '',
    location: '',
    availability: true
  });

  useEffect(() => {
    if (!user) return navigate('/login');
    
    const fetchData = async () => {
      try {
        setFormData(prev => ({ 
          ...prev, 
          name: user.name, 
          avatar: user.avatar 
        }));

        if (user.role === 'freelancer') {
          const res = await api.get(`/freelancers/user/${user.id}`);
          setFreelancer(res.data);
          setFormData(prev => ({
            ...prev,
            bio: res.data.bio || '',
            skills: res.data.skills?.join(', ') || '',
            resumeUrl: res.data.resumeUrl || '',
            portfolioUrl: res.data.portfolioUrl || '',
            location: res.data.location || '',
            availability: res.data.availability
          }));
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update User fields (pseudo-endpoint or combined)
      // For now, let's assume we can update User through a new endpoint I'll add
      await api.put(`/auth/user/${user.id}`, { name: formData.name, avatar: formData.avatar });
      
      // Update Freelancer fields if role is freelancer
      if (user.role === 'freelancer' && freelancer) {
        await api.put(`/freelancers/${freelancer._id}`, {
          bio: formData.bio,
          skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
          resumeUrl: formData.resumeUrl,
          portfolioUrl: formData.portfolioUrl,
          location: formData.location,
          availability: formData.availability
        });
      }

      // Update local context
      const updatedUser = { ...user, name: formData.name, avatar: formData.avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Re-trigger context update (using login as set-user)
      login(updatedUser, localStorage.getItem('token'));
      
      alert('Profile updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-20 text-center animate-pulse font-bold text-text-gray">Loading profile...</div>;

  return (
    <div className="container max-w-4xl mx-auto px-6 py-12 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 border-white/5 relative overflow-hidden"
      >
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-text-gray hover:text-white transition-colors mb-8 font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-10">
           <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="text-primary w-8 h-8" /> Customize Your Identity
           </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-8 p-6 bg-white/5 rounded-3xl border border-white/5">
             <div className="relative group">
                <img 
                  src={formData.avatar || 'https://via.placeholder.com/150'} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" 
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                   <Camera className="text-white w-6 h-6" />
                </div>
             </div>
             <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1">Profile Photo URL</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
                  value={formData.avatar}
                  onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                  placeholder="Paste image link here"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-2"><User className="w-3 h-3" /> Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-2"><Mail className="w-3 h-3" /> Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. New York, Remote"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
             </div>
          </div>

          {user.role === 'freelancer' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-2"><FileText className="w-3 h-3 text-primary" /> Professional Bio</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all min-h-[120px]"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Briefly describe your expertise and value..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-2"><Briefcase className="w-3 h-3 text-secondary" /> Skills (Comma separated)</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white focus:outline-none focus:ring-1 focus:ring-secondary/40 font-medium transition-all"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="React, Figma, Python..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-2"><LinkIcon className="w-3 h-3" /> Portfolio URL</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-2"><FileText className="w-3 h-3" /> Resume PDF URL</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
                    value={formData.resumeUrl}
                    onChange={(e) => setFormData({...formData, resumeUrl: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-4">
             <button 
               type="button"
               onClick={() => navigate('/dashboard')}
               className="px-6 py-3.5 rounded-xl text-sm font-bold text-text-gray hover:text-white transition-colors"
             >
                Cancel
             </button>
             <button 
               disabled={saving}
               type="submit"
               className="btn-primary !px-10 !py-3.5 !shadow-none flex items-center gap-2 font-bold"
             >
                {saving ? 'Syncing...' : <><Save className="w-4 h-4" /> Save Changes</>}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfile;

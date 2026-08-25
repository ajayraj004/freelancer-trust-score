import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { User, Mail, Lock, UserCheck, Shield } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'client' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-h-[90vh] flex items-center justify-center py-12">
      <div className="glass w-full max-w-lg p-10 border-white/5 relative overflow-hidden group">
         <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/20 blur-[80px] rounded-full group-hover:bg-secondary/30 transition-all opacity-40"></div>
         <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Join the Future of Work</h1>
            <p className="text-text-gray font-medium">Verified by AI. Powered by Trust.</p>
         </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <button 
               type="button"
               onClick={() => setFormData({...formData, role: 'client'})}
               className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all group ${formData.role === 'client' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-text-gray hover:border-white/20'}`}
             >
                <User className="w-6 h-6" /> <span className="text-[10px] font-bold uppercase">Client</span>
             </button>
             <button 
               type="button"
               onClick={() => setFormData({...formData, role: 'freelancer'})}
               className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all group ${formData.role === 'freelancer' ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-white/5 border-white/5 text-text-gray hover:border-white/20'}`}
             >
                <UserCheck className="w-6 h-6" /> <span className="text-[10px] font-bold uppercase">Freelancer</span>
             </button>
          </div>

          <div className="space-y-1.5 px-1">
             <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest flex items-center gap-1.5"><User className="w-3 h-3" /> Full Name</label>
             <input 
               type="text" 
               required
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
               placeholder="John Doe"
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
             />
          </div>

          <div className="space-y-1.5 px-1">
             <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email Address</label>
             <input 
               type="email" 
               required
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
               placeholder="john@example.com"
               value={formData.email}
               onChange={(e) => setFormData({...formData, email: e.target.value})}
             />
          </div>

          <div className="space-y-1.5 px-1">
             <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest flex items-center gap-1.5"><Lock className="w-3 h-3" /> Create Password</label>
             <input 
               type="password" 
               required
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
               placeholder="••••••••"
               value={formData.password}
               onChange={(e) => setFormData({...formData, password: e.target.value})}
             />
          </div>

          <button 
            disabled={loading}
            className="w-full btn-primary !py-4 font-bold text-lg shadow-none group"
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-gray font-medium">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-bold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

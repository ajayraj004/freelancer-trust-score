import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (!err.response) {
        alert('Server unreachable! Backend must stay running on port 5000.');
      } else {
        alert(err.response?.data?.message || 'Login failed! Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-h-[80vh] flex items-center justify-center py-12">
      <div className="glass w-full max-w-md p-10 border-white/5 relative overflow-hidden group">
         <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all opacity-40"></div>
         <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-2xl mb-6 shadow-xl border border-primary/20">
               <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-text-gray font-medium">Continue your trust-based journey</p>
         </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-gray uppercase tracking-widest ml-1 flex items-center gap-1.5"><Lock className="w-3 h-3" /> Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            className="w-full btn-primary !py-4 font-bold text-lg flex items-center justify-center gap-2 group shadow-none hover:shadow-primary/20"
          >
            {loading ? 'Logging in...' : 'Sign In'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-gray font-medium">
          Don't have an account? <Link to="/register" className="text-primary hover:underline font-bold">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

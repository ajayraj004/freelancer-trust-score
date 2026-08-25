import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Zap, TrendingUp, Filter, Users, Globe, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import FreelancerCard from '../components/FreelancerCard';
import { motion } from 'framer-motion';

const Home = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const res = await api.get('/freelancers');
        if (res.data && res.data.length > 0) {
          setFreelancers(res.data);
        } else {
          // Fallback if DB is empty
          throw new Error('Empty database');
        }
      } catch (err) {
        console.error('API Error, using fallback:', err);
        setFreelancers([
          {
            _id: '1',
            userId: { name: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', role: 'freelancer' },
            bio: 'Expert UI/UX Designer specialized in creating premium digital experiences.',
            skills: ['Figma', 'React', 'Motion'],
            trustScore: 94,
            avgRating: 4.9,
            totalEarnings: 25000,
            pastWorkCount: 42
          },
          {
            _id: '2',
            userId: { name: 'Michael R.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', role: 'freelancer' },
            bio: 'Lead Developer focusing on high-performance cloud architectures.',
            skills: ['Node.js', 'AWS', 'Kubernetes'],
            trustScore: 88,
            avgRating: 4.7,
            totalEarnings: 18000,
            pastWorkCount: 30
          },
          {
            _id: '3',
            userId: { name: 'Emily B.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', role: 'freelancer' },
            bio: 'Data Scientist and AI enthusiast passionate about predictive modeling.',
            skills: ['Python', 'TensorFlow', 'Pytorch'],
            trustScore: 98,
            avgRating: 5.0,
            totalEarnings: 32000,
            pastWorkCount: 22
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  const filteredFreelancers = freelancers.filter(f => 
    f.userId.name.toLowerCase().includes(search.toLowerCase()) || 
    f.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container max-w-7xl mx-auto px-6 py-10 overflow-hidden min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section className="mb-24 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full -z-10"></div>
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">Trust is the New Currency</span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
            Hire with <span className="text-primary">Confidence</span> using AI.
          </h1>
          <p className="max-w-2xl mx-auto text-text-gray text-lg mb-10 leading-relaxed font-medium">
            The first decentralized freelancing marketplace where reputations are verified by machine learning behavior analysis and real work data.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto relative group">
          <input 
            type="text" 
            placeholder="Search freelancers by skill or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-14 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-medium text-lg placeholder:text-white/20"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 w-6 h-6 group-focus-within:text-primary transition-colors" />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary !py-2.5 !px-6 text-sm">
            Search
          </button>
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-text-gray/80 font-medium">
           <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> SECURE ESCROW</span>
           <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-primary" /> TRUST SCORING</span>
           <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-secondary" /> INSTANT PAYOUTS</span>
        </div>
      </section>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 animate-fade" style={{animationDelay: '0.2s'}}>
         <div className="glass p-6 text-center border-white/5">
            <h3 className="text-3xl font-bold mb-1 gradient-text">4.2k+</h3>
            <p className="text-xs text-text-gray font-bold tracking-widest">USERS</p>
         </div>
         <div className="glass p-6 text-center border-white/5">
            <h3 className="text-3xl font-bold mb-1 gradient-text">98%</h3>
            <p className="text-xs text-text-gray font-bold tracking-widest">SUCCESS RATE</p>
         </div>
         <div className="glass p-6 text-center border-white/5">
            <h3 className="text-3xl font-bold mb-1 gradient-text">24/7</h3>
            <p className="text-xs text-text-gray font-bold tracking-widest">SUPPORT</p>
         </div>
         <div className="glass p-6 text-center border-white/5">
            <h3 className="text-3xl font-bold mb-1 gradient-text">ML</h3>
            <p className="text-xs text-text-gray font-bold tracking-widest">RANKING</p>
         </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
           <Users className="text-primary w-6 h-6" /> Top Ranked Freelancers
        </h2>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 text-sm font-semibold bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <Filter className="w-4 h-4" /> Filter
           </button>
           <button className="flex items-center gap-2 text-sm font-semibold bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <Globe className="w-4 h-4" /> Global
           </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="glass h-[300px] animate-pulse bg-white/5 border-white/10 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.map((freelancer) => (
            <FreelancerCard key={freelancer._id} freelancer={freelancer} />
          ))}
        </div>
      )}
      
      {/* CTA section */}
      <section className="mt-20 glass p-12 overflow-hidden relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-secondary/10 blur-[140px] rounded-full -z-10"></div>
         <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="max-w-lg text-center md:text-left">
               <h2 className="text-4xl font-bold mb-4">Start your journey today</h2>
               <p className="text-text-gray font-medium">Connect with top-tier talent and take your project to the next level with our AI-driven marketplace.</p>
            </div>
            <div className="flex gap-4">
               <Link to="/post-job" className="btn-primary !py-4 !px-10 text-lg">Post a Job <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;

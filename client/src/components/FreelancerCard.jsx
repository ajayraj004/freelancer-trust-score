import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Star, Briefcase, Award, ArrowUpRight, DollarSign } from 'lucide-react';
import TrustGauge from './TrustGauge';

const FreelancerCard = ({ freelancer }) => {
  const { userId, bio, skills, trustScore, avgRating, totalEarnings, pastWorkCount } = freelancer;
  
  return (
    <div className="glass group overflow-hidden hover:border-primary/30 transition-all duration-300 relative flex flex-col p-6 animate-fade">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={userId?.avatar || 'https://via.placeholder.com/150'} alt={userId?.name} className="w-16 h-16 rounded-2xl object-cover bg-white/5 border border-white/10" />
            <div className="absolute -bottom-1 -right-1 bg-emerald-400 w-4 h-4 rounded-full border-4 border-darker shadow-lg"></div>
          </div>
          <div>
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{userId?.name}</h3>
            <p className="text-xs text-text-gray font-medium flex items-center gap-1 leading-normal">
               <Briefcase className="w-3 h-3 text-primary" /> Full-Stack Developer
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <TrustGauge score={trustScore} size={50} strokeWidth={4} />
          <span className="text-[10px] font-bold text-primary mt-1 tracking-widest uppercase">TRUST</span>
        </div>
      </div>

      <p className="text-sm text-text-gray line-clamp-2 mb-4 leading-relaxed font-medium">
        {bio || 'Experienced freelancer specializing in delivering high-quality digital solutions for global clients.'}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {skills?.slice(0, 3).map((skill, index) => (
          <span key={index} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-white/60 group-hover:border-primary/20 group-hover:text-white transition-all">
            {skill}
          </span>
        ))}
        {skills?.length > 3 && <span className="text-[10px] font-bold text-white/40 pt-1">+{skills.length - 3}</span>}
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
         <div className="flex flex-col">
            <span className="text-[10px] text-text-gray font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
               <Star className="w-3 h-3 text-warning fill-warning" /> Rating
            </span>
            <span className="text-sm font-bold">{avgRating.toFixed(1)} <span className="text-text-gray font-medium">/ 5.0</span></span>
         </div>
         <div className="flex flex-col text-right">
            <span className="text-[10px] text-text-gray font-bold uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">
               <DollarSign className="w-3 h-3 text-emerald-400" /> Earnings
            </span>
            <span className="text-sm font-bold text-emerald-400">${totalEarnings?.toLocaleString()}+</span>
         </div>
      </div>

      <Link to={`/profile/${freelancer._id}`} className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-sm group-hover:bg-primary transition-all duration-300">
        View Full Profile <ArrowUpRight className="w-4 h-4 ml-2" />
      </Link>
    </div>
  );
};

export default FreelancerCard;

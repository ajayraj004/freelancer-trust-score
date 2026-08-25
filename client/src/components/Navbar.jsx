import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, User, LogOut, Menu } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-4 pt-4 mb-20 pointer-events-none">
      <div className="max-w-7xl mx-auto glass p-3 border-white/5 backdrop-blur-xl pointer-events-auto flex items-center justify-between shadow-2xl shadow-primary/5">
        <Link to="/" className="flex items-center gap-2 group ml-2 px-1">
          <div className="bg-primary/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
            <Shield className="text-primary w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Trust<span className="text-primary">Score</span></span>
        </Link>

        {/* Global Navigation - Better Spacing */}
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-text-gray/80 ml-6">
          <Link to="/" className="hover:text-white transition-colors py-2">Marketplace</Link>
          <Link to="/metrics" className="hover:text-white transition-colors py-2">How it works</Link>
          {user && <Link to="/dashboard" className="hover:text-white transition-colors py-2">Dashboard</Link>}
        </div>

        {/* User Account Section */}
        {user ? (
          <div className="flex items-center gap-4 pr-1">
            {user.role === 'client' && (
              <Link to="/post-job" className="btn-primary !py-2.5 !px-6 !text-xs !shadow-none hover:!shadow-primary/20 hidden sm:block">
                Post Job
              </Link>
            )}
            <div className="flex items-center gap-3">
              <Link to={`/dashboard`} className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all group">
                <img src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop'} alt="" className="w-7 h-7 rounded-full border border-white/10" />
                <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="p-2.5 text-text-gray hover:text-accent bg-white/5 rounded-full border border-white/10 hover:border-accent/40 transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6 mr-1">
            <Link to="/login" className="text-sm font-bold text-text-gray hover:text-white transition-colors">Login</Link>
            <Link to="/post-job" className="btn-primary !py-2.5 !px-6 !text-xs !shadow-none hover:!shadow-primary/20">
              Post Job
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

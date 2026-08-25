import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import TrustGauge from '../components/TrustGauge';
import { 
  TrendingUp, TrendingDown, Users, Briefcase, 
  DollarSign, Star, Calendar, MessageSquare, 
  Bell, Settings, LayoutDashboard, FileText, 
  Search, ShieldAlert, Award, Clock, Plus, ArrowRight, User as UserIcon, Brain, Zap
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Link, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);   // AI Feature 3: matched jobs for freelancer
  const [matchLoading, setMatchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          if (user.role === 'freelancer') {
            const freeRes = await api.get(`/freelancers/user/${user.id}`);
            setFreelancer(freeRes.data);

            // ---- AI Feature 3: Job Matching ----
            // After fetching the freelancer's profile, we call the new
            // /api/jobs/match endpoint with the freelancer's skills.
            // The backend sends those skills to Flask which runs TF-IDF
            // and returns all jobs sorted by cosine similarity score.
            if (freeRes.data?.skills?.length > 0) {
              setMatchLoading(true);
              try {
                const matchRes = await api.post('/jobs/match', {
                  skills: freeRes.data.skills
                });
                setMatchedJobs(matchRes.data || []);
              } catch (e) {
                console.warn('AI job matching unavailable:', e);
              } finally {
                setMatchLoading(false);
              }
            }
          }
          
          const interRes = await api.get(`/interviews/user/${user.id}`);
          setInterviews(interRes.data);

          if (user.role === 'client') {
            const jobRes = await api.get('/jobs');
            setJobs(jobRes.data.filter(j => j.authorId?._id === user.id));
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (!user) return <div className="container py-20 text-center font-bold text-text-gray">Please log in to access your dashboard.</div>;

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: user.role === 'freelancer' ? 'Trust Score' : 'Hiring Activity',
        data: user.role === 'freelancer' ? [78, 82, 80, 85, 88, freelancer?.trustScore || 0] : [2, 5, 3, 8, 12, jobs.length],
        fill: true,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#6366f1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: { min: 0, max: user.role === 'freelancer' ? 100 : Math.max(20, jobs.length + 5), grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display : false }, ticks: { color: '#94a3b8' } }
    },
    plugins: { legend: { display: false } }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass p-6 border-white/5 bg-white/[0.01]">
                   <div className="flex items-center justify-between mb-2">
                      <div className="bg-primary/20 p-2 rounded-lg text-primary"><DollarSign className="w-5 h-5" /></div>
                      {/* Only show growth for non-zero accounts */}
                      {(user.role === 'client' ? 4250 : freelancer?.totalEarnings) > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">+12% <TrendingUp className="w-3 h-3" /></span>
                      )}
                   </div>
                   <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest mb-1">{user.role === 'client' ? 'Total Spent' : 'Total Earnings'}</p>
                   <h3 className="text-2xl font-bold">${user.role === 'client' ? '4,250' : (freelancer?.totalEarnings || 0).toLocaleString()}</h3>
                </div>
                <div className="glass p-6 border-white/5 bg-white/[0.01]">
                   <div className="flex items-center justify-between mb-2">
                      <div className="bg-secondary/20 p-2 rounded-lg text-secondary"><Briefcase className="w-5 h-5" /></div>
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">+{(user.role === 'client' ? jobs.length : freelancer?.pastWorkCount) > 0 ? 2 : 0} <TrendingUp className="w-3 h-3" /></span>
                   </div>
                   <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest mb-1">{user.role === 'client' ? 'Open Jobs' : 'Active Tasks'}</p>
                   <h3 className="text-2xl font-bold">{user.role === 'client' ? jobs.length : (freelancer?.pastWorkCount || 0)}</h3>
                </div>
                <div className="glass p-6 border-white/5 bg-white/[0.01]">
                   <div className="flex items-center justify-between mb-2">
                      <div className="bg-warning/20 p-2 rounded-lg text-warning"><Star className="w-5 h-5" /></div>
                      <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">{(freelancer?.avgRating || 0) > 0 ? '-4%' : 'N/A'} <TrendingDown className="w-3 h-3" /></span>
                   </div>
                   <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest mb-1">Avg Rating</p>
                   <h3 className="text-2xl font-bold">{(freelancer?.avgRating || 0).toFixed(2)}</h3>
                </div>
                <div className="glass p-6 border-white/5 bg-white/[0.01]">
                   <div className="flex items-center justify-between mb-2">
                      <div className="bg-accent/20 p-2 rounded-lg text-accent"><Users className="w-5 h-5" /></div>
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">+85 <TrendingUp className="w-3 h-3" /></span>
                   </div>
                   <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest mb-1">{user.role === 'client' ? 'Talent Viewed' : 'Profile Views'}</p>
                   <h3 className="text-2xl font-bold">{user.role === 'client' ? '1,204' : (freelancer?.behaviorScore * 12 || 0).toLocaleString()}</h3>
                </div>
            </div>

            {user.role === 'client' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass p-8 border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold flex items-center gap-3"><FileText className="text-primary w-5 h-5" /> My Recent Job Postings</h3>
                        <Link to="/post-job" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">Create Job <Plus className="w-3 h-3" /></Link>
                    </div>
                    <div className="space-y-4">
                        {jobs.length > 0 ? jobs.map(job => (
                          <div key={job._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                            <div>
                              <h4 className="text-sm font-bold">{job.title}</h4>
                              <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest mt-1">${job.budget} • {job.skills.slice(0,2).join(', ')}</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full uppercase">Active</span>
                          </div>
                        )) : (
                          <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl">
                            <p className="text-sm text-text-gray font-medium mb-4">No jobs posted yet.</p>
                            <Link to="/post-job" className="btn-primary !py-2 !px-4 !text-xs !shadow-none inline-flex">Post Your First Job</Link>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="glass p-8 border-white/5 bg-primary/5">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3"><ShieldAlert className="text-primary w-5 h-5" /> AI Marketplace Insight</h3>
                    <p className="text-sm text-white/80 font-medium leading-relaxed mb-6">Based on your recent activity, we recommend looking for <strong>React Specialists</strong> with a trust score above <strong>92</strong>.</p>
                    <Link to="/" className="w-full flex items-center justify-between p-4 bg-primary text-white rounded-2xl font-bold text-sm group hover:scale-[1.02] transition-all">
                        Browse Top Talent <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass p-8 border-white/5 bg-white/[0.02]">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-3"><ShieldAlert className="text-primary w-5 h-5" /> Reputation Intelligence</h3>
                    <div className="flex items-center justify-around">
                        <div className="flex flex-col items-center text-center">
                          <TrustGauge score={freelancer?.trustScore || 0} size={150} strokeWidth={12} />
                          <p className="text-[10px] text-text-gray mt-4 font-bold uppercase tracking-widest mb-1">CURRENT TRUST RANK</p>
                          <h4 className="text-xl font-bold gradient-text">{(freelancer?.trustScore || 0) > 80 ? 'PIONEER LEVEL' : (freelancer?.trustScore || 0) > 40 ? 'VERIFIED' : 'NEWBIE'}</h4>
                        </div>
                        <div className="space-y-6 flex-1 max-w-[200px] ml-10">
                          <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest"><span>Behavioral Scan</span><span className="text-white">{freelancer?.behaviorScore || 100}%</span></div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{width: `${freelancer?.behaviorScore || 100}%`}}></div></div>
                          </div>
                          <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest"><span>Submission Speed</span><span className="text-white">88%</span></div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width: '88%'}}></div></div>
                          </div>
                        </div>
                    </div>
                  </div>

                  <div className="glass p-8 border-white/5 bg-white/[0.02]">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-3"><Award className="text-secondary w-5 h-5" /> Trust Score History</h3>
                    <div className="h-[220px]">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                  </div>
                </div>

                {/* ============================================================
                    AI FEATURE 3: SMART JOB MATCHING SECTION
                    Displayed on the freelancer's dashboard.
                    Shows all available jobs sorted by how well they match
                    the freelancer's skills (using TF-IDF + Cosine Similarity).
                    Each job card shows:
                      - match_percent (e.g. 87%)
                      - match_label  (e.g. "Excellent Match")
                      - Budget and required skills
                ============================================================ */}
                <div className="glass p-8 border-secondary/20 bg-secondary/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-3">
                      <Brain className="text-secondary w-5 h-5" />
                      AI Job Recommendations
                      <span className="text-[10px] font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-1 rounded-full uppercase tracking-widest">Powered by TF-IDF</span>
                    </h3>
                    {matchLoading && (
                      <span className="text-[10px] text-text-gray animate-pulse flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Analyzing...
                      </span>
                    )}
                  </div>

                  {/* Show skills being matched */}
                  {freelancer?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="text-[10px] text-text-gray font-bold uppercase tracking-widest self-center">Matching for:</span>
                      {freelancer.skills.map((s, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-1 bg-secondary/10 border border-secondary/20 text-secondary rounded-full">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    {matchedJobs.length > 0 ? matchedJobs.slice(0, 5).map((job, i) => {
                      // Color coding based on match quality
                      const matchColors = {
                        'Excellent Match': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
                        'Good Match':      'text-primary bg-primary/10 border-primary/20',
                        'Partial Match':   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
                        'Low Match':       'text-text-gray bg-white/5 border-white/10'
                      };
                      const colorClass = matchColors[job.match_label] || matchColors['Low Match'];

                      return (
                        <div key={job._id || i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-secondary/20 transition-all group">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              {/* Rank number */}
                              <span className="text-[10px] font-bold text-text-gray">#{i + 1}</span>
                              <h4 className="text-sm font-bold group-hover:text-secondary transition-colors">{job.title}</h4>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-[10px] font-bold text-text-gray">${job.budget}</span>
                              {job.skills?.slice(0, 3).map((sk, si) => (
                                <span key={si} className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/60">{sk}</span>
                              ))}
                            </div>
                          </div>
                          {/* AI Match Score Badge */}
                          <div className={`flex flex-col items-center shrink-0 ml-4 px-3 py-2 rounded-xl border ${colorClass}`}>
                            <span className="text-lg font-bold">{job.match_percent}%</span>
                            <span className="text-[8px] font-bold uppercase tracking-widest">{job.match_label}</span>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-3xl">
                        <Brain className="w-10 h-10 mx-auto mb-3 text-secondary/30" />
                        <p className="text-sm text-text-gray">
                          {matchLoading ? 'AI is finding your best job matches...' : 'No job matches found. Post jobs to see recommendations.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="glass p-8 border-white/5 bg-white/[0.02]">
                <h3 className="text-lg font-bold mb-6">Upcoming Interviews & Meetings</h3>
                <div className="space-y-4">
                  {interviews.length > 0 ? interviews.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary"><Calendar className="w-5 h-5" /></div>
                          <div>
                              <h4 className="text-sm font-bold">Meeting with {user.role === 'freelancer' ? item.clientId?.name || 'Client' : item.freelancerId?.name || 'Freelancer'}</h4>
                              <p className="text-[10px] text-text-gray font-bold tracking-tight uppercase leading-none mt-1">
                                {new Date(item.date).toLocaleString()}
                              </p>
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full">
                          {item.status}
                        </div>
                    </div>
                  )) : (
                    <div className="text-center py-6 opacity-40 italic">
                       <Calendar className="w-8 h-8 mx-auto mb-2" />
                       <p className="text-sm font-medium">No interviews scheduled yet.</p>
                    </div>
                  )}
                </div>
            </div>
          </>
        );
      case 'Proposals':
      case 'Job Postings':
      case 'Active Jobs':
      case 'Current Projects':
      case 'Messages':
      case 'Financials':
      case 'Reviews':
      case 'Settings':
        return (
          <div className="glass p-20 text-center border-dashed border-2 border-white/5">
             <LayoutDashboard className="w-16 h-16 mx-auto mb-6 text-primary/40 animate-pulse" />
             <h2 className="text-2xl font-bold mb-2">{activeTab} Page</h2>
             <p className="text-text-gray font-medium mb-8">This module is currently being verified by the AI Trust system.</p>
             <button onClick={() => setActiveTab('Overview')} className="btn-primary !shadow-none !px-8">Return Home</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8 min-h-screen">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 space-y-2">
         <div className="glass p-6 mb-8 border-white/5 bg-white/[0.02] text-center">
            <div className="relative inline-block mb-4">
               <img src={user.avatar || 'https://via.placeholder.com/150'} alt="" className="w-20 h-20 mx-auto rounded-3xl border border-white/10 object-cover shadow-lg" />
               <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-[#0a0a0f] flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
               </div>
            </div>
            <h3 className="font-bold text-lg tracking-tight mb-1">{user.name}</h3>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-6">{user.role}</p>
            <Link to="/edit-profile" className="w-full btn-primary !py-2.5 !px-4 text-[10px] uppercase font-bold !shadow-none hover:!shadow-primary/20 flex items-center justify-center gap-2">
               <UserIcon className="w-3 h-3" /> Edit Profile
            </Link>
         </div>

         {[
           { icon: LayoutDashboard, label: 'Overview' },
           { icon: FileText, label: user.role === 'freelancer' ? 'Proposals' : 'Job Postings' },
           { icon: Briefcase, label: user.role === 'freelancer' ? 'Active Jobs' : 'Current Projects' },
           { icon: MessageSquare, label: 'Messages' },
           { icon: DollarSign, label: 'Financials' },
           { icon: Star, label: 'Reviews' },
           { icon: Settings, label: 'Settings' }
         ].map(item => (
           <button 
             key={item.label} 
             onClick={() => setActiveTab(item.label)}
             className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold tracking-tight transition-all ${activeTab === item.label ? 'bg-primary/10 text-primary border border-primary/10' : 'text-text-gray hover:text-white hover:bg-white/5'}`}
           >
              <item.icon className={`w-5 h-5 ${activeTab === item.label ? 'text-primary' : 'text-text-gray'}`} /> {item.label}
           </button>
         ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-10">
         <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
               {activeTab === 'Overview' ? (user.role === 'client' ? 'Client Command Center' : 'Freelancer Dashboard') : activeTab}
            </h1>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-text-gray tracking-tight">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
         </div>

         {renderTabContent()}
      </main>
    </div>
  );
};

export default Dashboard;

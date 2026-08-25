import React from 'react';
import { Search, Shield, Zap, Award, CheckCircle, Users, BarChart3, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Discover Talent",
      description: "Browse through hundreds of verified freelancers ranked by our proprietary ML Trust Score system.",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      icon: Shield,
      title: "AI Analysis",
      description: "Our system analyzes behavioral patterns, past work quality, and reliability to ensure you hire the best.",
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      icon: Zap,
      title: "Instant Secure Hire",
      description: "Once you found the match, initiate a secure project with escrow protection and smart milestones.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      icon: Award,
      title: "Verify & Earn",
      description: "Upon project completion, leave reviews that feed back into the freelancer's Trust Score for future clients.",
      color: "text-warning",
      bg: "bg-warning/10"
    }
  ];

  return (
    <div className="container max-w-7xl mx-auto px-6 py-10 min-h-screen">
      <section className="text-center mb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full -z-10"></div>
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">Transparency First</span>
          <h1 className="text-5xl font-bold mb-6">The Future of <span className="text-primary">Trusted</span> Work</h1>
          <p className="max-w-2xl mx-auto text-text-gray font-medium leading-relaxed">
            We use advanced machine learning algorithms to verify reputation and standardize trust in the global gig economy.
          </p>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass p-8 border-white/5 bg-white/[0.02] flex flex-col items-center text-center group hover:border-primary/30 transition-all hover:-translate-y-2"
          >
            <div className={`${step.bg} p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
               <step.icon className={`w-8 h-8 ${step.color}`} />
            </div>
            <h3 className="text-xl font-bold mb-4">{step.title}</h3>
            <p className="text-sm text-text-gray font-medium leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>

      <section className="glass p-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-full h-full bg-primary/5 -z-10"></div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
               <h2 className="text-3xl font-bold mb-6">Our Trust Metric Explained</h2>
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="bg-emerald-400/20 p-2 h-fit rounded-lg"><CheckCircle className="text-emerald-400 w-5 h-5" /></div>
                     <div>
                        <h4 className="font-bold mb-1">Behavioral Consistency</h4>
                        <p className="text-sm text-text-gray">Tracks milestones and submission speeds to ensure reliability.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="bg-primary/20 p-2 h-fit rounded-lg"><CheckCircle className="text-primary w-5 h-5" /></div>
                     <div>
                        <h4 className="font-bold mb-1">Work Quality Index</h4>
                        <p className="text-sm text-text-gray">Peer-reviewed quality checks integrated with client satisfaction ratings.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="bg-secondary/20 p-2 h-fit rounded-lg"><CheckCircle className="text-secondary w-5 h-5" /></div>
                     <div>
                        <h4 className="font-bold mb-1">Escrow Release History</h4>
                        <p className="text-sm text-text-gray">Financial health and payment release history on previous projects.</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex justify-center flex-wrap gap-4">
               {[
                 { icon: Globe, label: "Global Reach", val: "150+ Countries" },
                 { icon: Users, label: "Active Nodes", val: "45k+ Users" },
                 { icon: BarChart3, label: "ML Optimized", val: "Version 2.4" }
               ].map((item, i) => (
                 <div key={i} className="glass p-8 w-full md:w-56 text-center border-white/10">
                    <item.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-1">{item.val}</h3>
                    <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest">{item.label}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

export default HowItWorks;

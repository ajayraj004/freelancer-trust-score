import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import FreelancerProfile from './pages/FreelancerProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import HowItWorks from './pages/HowItWorks';
import PostJob from './pages/PostJob';
import ScheduleInterview from './pages/ScheduleInterview';
import EditProfile from './pages/EditProfile';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-darker selection:bg-primary/30">
          <Navbar />
          <div className="pt-24 md:pt-28">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile/:id" element={<FreelancerProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/metrics" element={<HowItWorks />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/schedule/:freelancerId" element={<ScheduleInterview />} />
              <Route path="/edit-profile" element={<EditProfile />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

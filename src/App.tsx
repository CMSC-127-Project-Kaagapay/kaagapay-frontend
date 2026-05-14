/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
import Home from './pages/Home';
import Volunteer from './pages/Volunteer';
import VolunteerApplication from './pages/VolunteerApplication';
import Report from './pages/Report';
import Admin from './pages/Admin';
import Login from './pages/Login';
import SetPassword from './pages/SetPassword';
import VolunteerDashboard from './pages/VolunteerDashboard';
import VolunteerProfile from './pages/VolunteerProfile';
import TrackCase from './pages/TrackCase';
import { supabase } from './lib/supabase';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/set-password';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // PASSWORD_RECOVERY is triggered for both password resets and invite links
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/set-password', { replace: true });
      }
      
      // Fallback: If they somehow got signed in via an invite link but it fired as SIGNED_IN
      // We can also check the URL hash for type=invite or type=recovery
      if (event === 'SIGNED_IN') {
        const hash = window.location.hash;
        if (hash.includes('type=invite') || hash.includes('type=recovery')) {
          navigate('/set-password', { replace: true });
        }
      }
    });

    // Also check on mount just in case
    const hash = window.location.hash;
    if (hash.includes('type=invite') || hash.includes('type=recovery')) {
       navigate('/set-password', { replace: true });
    }

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/volunteer/apply" element={<VolunteerApplication />} />
          <Route path="/report" element={<Report />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/tickets/:ticketStatus" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
          <Route path="/volunteer/profile" element={<VolunteerProfile />} />
          <Route path="/track" element={<TrackCase />} />
          <Route path="/set-password" element={<SetPassword />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

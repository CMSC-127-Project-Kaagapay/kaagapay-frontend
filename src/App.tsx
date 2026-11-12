/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
import Home from './pages/Home';
import Volunteer from './pages/Volunteer';
import VolunteerApplication from './pages/VolunteerApplication';
import Report from './pages/Report';
import Admin from './pages/Admin';
import RequireAdmin from './components/RequireAdmin';
import Login from './pages/Login';
import SetPassword from './pages/SetPassword';
import VolunteerDashboard from './pages/VolunteerDashboard';
import VolunteerProfile from './pages/VolunteerProfile';
import TrackCase from './pages/TrackCase';
import Updates from './pages/Updates';
import { supabase } from './lib/supabase';

const StudioPage = lazy(() => import('./pages/StudioPage'));

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/set-password';
  const isStudioPage = location.pathname === '/studio' || location.pathname.startsWith('/studio/');
  const hideChrome = isAuthPage || isStudioPage;

  useEffect(() => {
    if (!supabase) return;

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
      {!hideChrome && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/updates" element={<Updates />} />
          <Route
            path="/studio/*"
            element={
              <Suspense
                fallback={
                  <div className="h-screen w-screen flex items-center justify-center bg-surface text-primary font-headline font-bold">
                    Loading Sanity Studio...
                  </div>
                }
              >
                <StudioPage />
              </Suspense>
            }
          />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/volunteer/apply" element={<VolunteerApplication />} />
          <Route path="/report" element={<Report />} />
          {/* Admin pages: signed-out people go to /login, signed-in non-admins go home. The API blocks them too. */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/tickets/:ticketStatus" element={<Admin />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
          <Route path="/volunteer/profile" element={<VolunteerProfile />} />
          <Route path="/track" element={<TrackCase />} />
          <Route path="/set-password" element={<SetPassword />} />
        </Routes>
      </main>
      {!hideChrome && <Footer />}
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

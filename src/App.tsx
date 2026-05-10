/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Navbar, Footer } from "./components/Layout";
import Home from "./pages/Home";
import Volunteer from "./pages/Volunteer";
import VolunteerApplication from "./pages/VolunteerApplication";
import Report from "./pages/Report";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import SetPassword from "./pages/SetPassword";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import VolunteerProfile from "./pages/VolunteerProfile";
import TrackCase from "./pages/TrackCase";
import { supabase } from "./lib/supabase";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return setStatus("denied");

      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("id", session.user.id)
        .single();

      setStatus(data && !error ? "admin" : "denied");
    };
    check();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Checking credentials…</p>
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/set-password";

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // PASSWORD_RECOVERY is triggered for both password resets and invite links
      if (event === "PASSWORD_RECOVERY") {
        navigate("/set-password", { replace: true });
      }

      // Fallback: If they somehow got signed in via an invite link but it fired as SIGNED_IN
      // We can also check the URL hash for type=invite or type=recovery
      if (event === "SIGNED_IN") {
        const hash = window.location.hash;
        if (hash.includes("type=invite") || hash.includes("type=recovery")) {
          navigate("/set-password", { replace: true });
        }
      }
    });

    // Also check on mount just in case
    const hash = window.location.hash;
    if (hash.includes("type=invite") || hash.includes("type=recovery")) {
      navigate("/set-password", { replace: true });
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
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
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

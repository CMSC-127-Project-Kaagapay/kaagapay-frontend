/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
import Home from './pages/Home';
import Volunteer from './pages/Volunteer';
import Report from './pages/Report';
import Admin from './pages/Admin';
import Login from './pages/Login';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoginPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/report" element={<Report />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
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


import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, UserCircle, Menu, X, LogOut } from 'lucide-react';
import { cn } from "@/src/lib/utils";
import logo from "../assets/pk_logo.png";
import { supabase } from "../lib/supabase";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    checkUser();
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Volunteer", path: "/volunteer" },
    { name: "Report", path: "/report" },
    { name: "Track", path: "/track" },
    { name: "Dashboard", path: "/volunteer/dashboard" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/10">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
            <span className="text-xl font-extrabold text-primary tracking-tighter font-headline">Project Kaagapay</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-headline tracking-tight text-sm font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "transition-colors hover:text-primary",
                  location.pathname === link.path ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md">
              Crisis Hotline
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/volunteer/profile" className="hidden md:flex text-on-surface-variant hover:bg-surface-container-low p-2 rounded-lg transition-all">
                  <UserCircle size={24} />
                </Link>
                <button onClick={handleLogout} className="hidden md:flex text-error hover:bg-error/10 p-2 rounded-lg transition-all">
                  <LogOut size={24} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex text-on-surface-variant hover:bg-surface-container-low p-2 rounded-lg transition-all">
                <UserCircle size={24} />
              </Link>
            )}
            <button className="md:hidden p-2 rounded-lg text-on-surface-variant" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-nav border-t border-outline-variant/10 px-6 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold py-3 px-2 rounded-lg hover:bg-surface-container-low">
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant/10 py-16">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-on-surface-variant">
          <div className="space-y-4">
            <div className="text-lg font-extrabold text-primary font-headline tracking-tighter">Project Kaagapay</div>
            <p className="text-sm leading-relaxed">Promoting a safe university environment for all.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-primary uppercase tracking-widest text-xs">Contact</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li className="flex items-center gap-2"><Phone size={14} className="text-primary" /> Crisis Hotline: (082) 293-0000</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-outline-variant/10 text-center text-xs text-on-surface-variant/60">
          <p>© 2024 UP Mindanao Project Kaagapay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, UserCircle, Menu, X, LogOut, Mail, Globe } from 'lucide-react';
import { cn } from "@/src/lib/utils";
import logo from "../assets/pk_logo.png";
import { supabase } from "../lib/supabase";
import { getAdminMe, getVolunteerProfile } from "../lib/api";

type UserRole = 'admin' | 'volunteer' | null;

/**
 * Who is this person? Only the backend knows who is an admin (the `admins` table), so the Admin
 * Dashboard link is shown only when GET /admin/me says so. Account metadata can be edited by the
 * user, so it is never trusted for admin access. A failed check shows no admin link.
 */
async function resolveUserRole(user: any, token: string | undefined): Promise<UserRole> {
  if (!user) return null;

  const appMetadata = user?.app_metadata ?? {};
  const userMetadata = user?.user_metadata ?? {};
  const role = String(appMetadata.role ?? userMetadata.role ?? '').toLowerCase();
  if (role === 'volunteer') return 'volunteer';

  if (token) {
    try {
      await getAdminMe(token);
      return 'admin';
    } catch {
      // not an admin (403) or the check failed: fall through, no admin link
    }
  }

  try {
    await getVolunteerProfile(user.id);
    return 'volunteer';
  } catch {
    return null;
  }
}

// --- Navbar Component ---
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function applySessionUser(sessionUser: any, token?: string) {
      if (!isMounted) return;
      setUser(sessionUser ?? null);
      setUserRole(null);

      if (sessionUser) {
        const role = await resolveUserRole(sessionUser, token);
        if (isMounted) setUserRole(role);
      }
    }

    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySessionUser(session?.user ?? null, session?.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySessionUser(session?.user ?? null, session?.access_token);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate('/login');
  };

  // Staff (admins and volunteers) have their own dashboard, so the public "Volunteer" (apply) and
  // "Report" links are hidden for them. The pages stay public; only the links change.
  const isStaff = userRole === 'admin' || userRole === 'volunteer';
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Updates", path: "/updates" },
    { name: "Volunteer", path: "/volunteer" },
    { name: "Report", path: "/report" },
    { name: "Track", path: "/track" },
    ...(userRole === 'admin' ? [{ name: "Admin Dashboard", path: "/admin" }] : []),
    ...(userRole === 'volunteer' ? [{ name: "Dashboard", path: "/volunteer/dashboard" }] : []),
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/10 h-20">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-full">
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
          <a
            href="https://findahelpline.com/countries/ph"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Crisis Hotline (opens Find a Helpline in a new tab)"
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            Crisis Hotline
          </a>
          {user ? (
            <div className="flex items-center gap-2">
              {userRole !== 'admin' && (
                <Link to="/volunteer/profile" aria-label="My profile" title="My profile" className="hidden md:flex text-on-surface-variant hover:bg-surface-container-low p-2 rounded-lg transition-all">
                  <UserCircle size={24} />
                </Link>
              )}
              <button onClick={handleLogout} aria-label="Log out" title="Log out" className="hidden md:flex text-error hover:bg-error/10 p-2 rounded-lg transition-all">
                <LogOut size={24} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex items-center text-sm font-semibold font-headline text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg transition-all">
              Log in
            </Link>
          )}
          <button
            className="md:hidden p-2 rounded-lg text-on-surface-variant"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
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
          {user ? (
            <button
              type="button"
              onClick={() => { setIsMenuOpen(false); handleLogout(); }}
              className="text-left text-sm font-semibold py-3 px-2 rounded-lg text-error hover:bg-error/10"
            >
              Log out
            </button>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold py-3 px-2 rounded-lg text-primary hover:bg-surface-container-low">
              Log in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

// --- Footer Component ---
export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/10 py-16">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-on-surface-variant">
        <div className="space-y-4">
          <div className="text-lg font-extrabold text-primary font-headline tracking-tighter">Project Kaagapay</div>
          <p className="text-sm leading-relaxed">Promoting a safe university environment for all.</p>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-primary uppercase tracking-widest text-xs">Contact</h4>
          <ul className="space-y-2 text-sm font-medium flex flex-col gap-1">
            <li className="flex items-center gap-2"><Phone size={14} className="text-primary shrink-0" /> Crisis Hotline: (082) 293-0000</li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-primary shrink-0" />
              <a href="mailto:proj.kaagapay@gmail.com" className="hover:underline break-all">proj.kaagapay@gmail.com</a>
            </li>
            <li className="flex items-center gap-2">
              <Globe size={14} className="text-primary shrink-0" />
              <a href="https://facebook.com/proj.kaagapay" target="_blank" rel="noopener noreferrer" className="hover:underline break-all">facebook.com/proj.kaagapay</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-outline-variant/10 text-center text-xs text-on-surface-variant/60">
        <p>© 2025 UP Mindanao Project Kaagapay. All rights reserved.</p>
      </div>
    </footer>
  );
}

// --- Default Layout Wrapper (Optional but good to have) ---
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}

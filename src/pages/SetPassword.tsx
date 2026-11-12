import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type LinkType = 'recovery' | 'invite';
const LINK_PROBLEM = 'This link has expired or was already used. Request a new one from the login page.';

export default function SetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  // Emails link here with ?token_hash=...&type=...; the token is only used when the person presses
  // Continue, so mail scanners that merely open the link do not use it up.
  const [pendingLink, setPendingLink] = useState<{ tokenHash: string; type: LinkType } | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const tokenHash = query.get('token_hash');
    const type = query.get('type');
    if (tokenHash && (type === 'recovery' || type === 'invite')) {
      setPendingLink({ tokenHash, type });
      setCheckingSession(false);
      return;
    }

    // Supabase's own verify link reports a bad token in the hash.
    if (window.location.hash.includes('error_code=') || window.location.hash.includes('error=')) {
      setLinkError(LINK_PROBLEM);
      setCheckingSession(false);
      return;
    }

    // Supabase automatically parses the hash in the URL and sets the session
    // if the user arrived via an invite link.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Not logged in via invite link, redirect to login
        navigate('/login', { replace: true });
      } else {
        setCheckingSession(false);
      }
    });
  }, [navigate]);

  const handleContinue = async () => {
    if (!pendingLink) return;
    setVerifying(true);
    setLinkError(null);
    const { error } = await supabase.auth.verifyOtp({ token_hash: pendingLink.tokenHash, type: pendingLink.type });
    setVerifying(false);
    if (error) {
      setLinkError(LINK_PROBLEM);
      return;
    }
    // Signed in now: drop the token from the address bar and show the password form.
    window.history.replaceState(null, '', '/set-password');
    setPendingLink(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/volunteer/dashboard');
      }, 2000);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-surface-container-low">
      <div className="w-full max-w-md bg-surface-container-lowest p-10 rounded-[3rem] editorial-shadow border border-outline-variant/10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-extrabold font-headline text-primary mb-2 tracking-tight text-center">Set Your Password</h1>
          <p className="text-on-surface-variant font-medium text-center text-sm">
            Welcome! Please set a password for your account to continue.
          </p>
        </div>

        {pendingLink || linkError ? (
          <div className="space-y-6">
            {linkError && (
              <div role="alert" className="p-4 bg-error-container text-on-error-container rounded-xl flex items-start gap-3 text-sm font-medium">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p>{linkError}</p>
              </div>
            )}
            {pendingLink && !linkError && (
              <p className="text-sm text-on-surface-variant text-center">Press Continue to choose your password.</p>
            )}
            {pendingLink && !linkError ? (
              <button
                type="button"
                onClick={handleContinue}
                disabled={verifying}
                className="w-full bg-primary text-on-primary font-headline font-extrabold py-4 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70"
              >
                {verifying ? <Loader2 className="animate-spin" size={24} /> : 'Continue'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full bg-primary text-on-primary font-headline font-extrabold py-4 rounded-2xl shadow-xl hover:opacity-90 transition-all text-lg"
              >
                Go to login
              </button>
            )}
          </div>
        ) : success ? (
           <div className="p-6 bg-primary/10 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
              <CheckCircle2 className="text-primary" size={48} />
              <p className="text-primary font-bold">Password set successfully!</p>
              <p className="text-sm text-on-surface-variant">Redirecting to your dashboard...</p>
           </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-start gap-3 text-sm font-medium">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                <input 
                  className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium disabled:opacity-50" 
                  placeholder="••••••••" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                <input 
                  className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium disabled:opacity-50" 
                  placeholder="••••••••" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-on-primary font-headline font-extrabold py-4 mt-8 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'Save Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

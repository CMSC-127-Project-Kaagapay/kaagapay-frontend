import React, { useState } from 'react';
import { Shield, Lock, Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      navigate('/volunteer/dashboard');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedEmail = email.trim();

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/set-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setResetSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-surface-container-low">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-surface-container-lowest rounded-[3rem] overflow-hidden editorial-shadow border border-outline-variant/10">
        {/* Left Side - Visual */}
        <div className="hidden lg:block relative overflow-hidden">
          <div className="absolute inset-0 aura-gradient opacity-90 mix-blend-multiply"></div>
          <img 
            alt="UP Mindanao Campus" 
            className="w-full h-full object-cover" 
            src="https://picsum.photos/seed/login-bg/800/1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-16 text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/30">
              <Shield size={32} />
            </div>
            <h2 className="text-4xl font-extrabold font-headline mb-4 tracking-tight">Administrative Access</h2>
            <p className="text-white/80 text-lg font-medium leading-relaxed">Secure portal for OASH coordinators, staff, and certified student responders.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-12 lg:p-20 flex flex-col justify-center relative">
          <button 
            onClick={() => navigate('/')}
            className="absolute top-8 right-8 p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-full transition-all"
            title="Go Back"
          >
            <X size={24} />
          </button>

          <div className="mb-12">
            <h1 className="text-3xl font-extrabold font-headline text-primary mb-2 tracking-tight">
              {isResetting ? 'Reset Password' : 'Staff & Admin Login'}
            </h1>
            <p className="text-on-surface-variant font-medium">
              {isResetting 
                ? 'Enter your email to receive a secure reset link.' 
                : 'Please sign in with your email account.'}
            </p>
          </div>

          {resetSent ? (
            <div className="space-y-6 text-center lg:text-left">
              <div className="p-8 bg-primary/10 rounded-[2rem] flex flex-col items-center lg:items-start gap-4">
                <CheckCircle2 className="text-primary" size={48} />
                <h3 className="text-xl font-bold font-headline text-primary">Reset Link Sent</h3>
                <p className="text-on-surface-variant font-medium">
                  We've sent a password reset link to <span className="text-on-surface font-bold">{email}</span>. Please check your inbox.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsResetting(false);
                  setResetSent(false);
                }}
                className="flex items-center justify-center lg:justify-start gap-2 text-primary font-bold hover:underline"
              >
                <ArrowLeft size={16} /> Back to Login
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={isResetting ? handleResetPassword : handleLogin}>
              {error && (
                <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-start justify-between gap-3 text-sm font-medium">
                  <div className="flex gap-3">
                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                    <p>{error}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setError(null)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                  <input 
                    className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium disabled:opacity-50" 
                    placeholder="name@example.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {!isResetting && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setIsResetting(true)}
                      className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline disabled:opacity-50"
                    >
                      Forgot Password?
                    </button>
                  </div>
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
              )}

              <div className="pt-4 space-y-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-on-primary font-headline font-extrabold py-5 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:active:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : (isResetting ? 'Send Reset Link' : 'Sign In')}
                </button>
                
                {isResetting && (
                  <button 
                    type="button"
                    onClick={() => setIsResetting(false)}
                    className="w-full py-4 text-on-surface-variant font-bold text-sm hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={14} /> Back to Login
                  </button>
                )}
              </div>
            </form>
          )}

          <p className="mt-12 text-center text-xs text-on-surface-variant font-medium">
            Don't have access? <button className="text-primary font-bold hover:underline">Contact OASH Support</button>
          </p>
        </div>
      </div>
    </div>
  );
}

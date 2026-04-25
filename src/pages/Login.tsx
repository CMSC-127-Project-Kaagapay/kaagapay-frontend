import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
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
        <div className="p-12 lg:p-20 flex flex-col justify-center">
          <div className="mb-12">
            <h1 className="text-3xl font-extrabold font-headline text-primary mb-2 tracking-tight">Staff & Admin Login</h1>
            <p className="text-on-surface-variant font-medium">Please sign in with your UP Mail account.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">UP Mail or Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                <input 
                  className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium" 
                  placeholder="name@up.edu.ph" 
                  type="email" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Password</label>
                <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Forgot Password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                <input 
                  className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium" 
                  placeholder="••••••••" 
                  type="password" 
                />
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button className="w-full bg-primary text-on-primary font-headline font-extrabold py-5 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
                Sign In
              </button>
              
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">or continue with</span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>

              <button className="w-full bg-white border-2 border-outline-variant/30 text-on-surface font-bold py-4 rounded-2xl hover:bg-surface-container-low transition-all flex items-center justify-center gap-3">
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Sign in with UP Mail (Google)
              </button>
            </div>
          </form>

          <p className="mt-12 text-center text-xs text-on-surface-variant font-medium">
            Don't have access? <button className="text-primary font-bold hover:underline">Contact OASH Support</button>
          </p>
        </div>
      </div>
    </div>
  );
}

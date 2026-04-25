import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowRight, Handshake, Users, Award, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Volunteer() {
  return (
    <div className="space-y-24 pb-24 pt-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 aura-gradient opacity-5 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-[0.2em]">
              The Kaagapay Program
            </span>
            <h1 className="font-headline text-5xl lg:text-7xl font-extrabold text-primary leading-tight tracking-tighter">
              Compassion in <br/>Institutional Service.
            </h1>
            <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed font-medium">
              The Kaagapay program is our network of dedicated students and staff trained to provide peer support and advocate for a safe, harassment-free campus environment.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-10 py-5 bg-primary text-on-primary rounded-2xl font-extrabold text-lg shadow-2xl hover:opacity-90 transition-all active:scale-95">
                Join the Team
              </button>
              <button className="px-10 py-5 bg-surface-container-highest text-primary rounded-2xl font-extrabold text-lg hover:bg-surface-container-high transition-all">
                Learn More
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative ring-8 ring-white/50">
              <img 
                alt="Collaborative meeting" 
                className="w-full h-full object-cover" 
                src="https://picsum.photos/seed/volunteer-hero/800/1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-2xl max-w-xs hidden md:block border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-3">
                <Award className="text-secondary" fill="currentColor" size={24} />
                <span className="font-headline font-extrabold text-on-surface">Certified Peers</span>
              </div>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed">Every volunteer undergoes intensive psychosocial training and OASH protocol certification.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recruitment Bento Grid */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="font-headline text-4xl font-extrabold text-primary mb-4 tracking-tight">Why Volunteer?</h2>
            <div className="w-20 h-2 bg-secondary rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-surface-container-lowest rounded-[3rem] p-12 flex flex-col justify-between editorial-shadow border border-outline-variant/10 group hover:border-secondary/30 transition-all">
              <div>
                <div className="w-16 h-16 bg-surface-container text-secondary rounded-2xl flex items-center justify-center mb-8">
                  <Shield size={32} />
                </div>
                <h3 className="font-headline text-3xl font-extrabold mb-6 text-on-surface">Empathetic Advocacy</h3>
                <p className="text-on-surface-variant text-lg leading-relaxed max-w-xl font-medium">
                  Become a first-responder for students in need. You'll learn the vital skills of active listening, trauma-informed response, and the formal reporting processes of UP Mindanao.
                </p>
              </div>
              <div className="mt-10 flex gap-3">
                <span className="px-4 py-2 bg-surface-container rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant">Training Provided</span>
                <span className="px-4 py-2 bg-surface-container rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant">Certification</span>
              </div>
            </div>
            
            <div className="bg-primary text-on-primary rounded-[3rem] p-12 flex flex-col justify-center relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <h3 className="font-headline text-2xl font-bold mb-4">The Impact</h3>
                <div className="text-6xl font-black mb-4 tracking-tighter">150+</div>
                <p className="text-surface-container font-bold text-lg">Cases supported since 2021</p>
              </div>
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="bg-secondary text-on-primary rounded-[3rem] p-12 flex flex-col justify-between shadow-xl">
              <Users size={48} className="opacity-40" />
              <div>
                <h3 className="font-headline text-3xl font-extrabold mb-4">Community Hub</h3>
                <p className="text-lg opacity-90 leading-relaxed font-medium">Join a family of advocates committed to social justice and academic safety across the entire campus.</p>
              </div>
            </div>
            
            <div className="md:col-span-2 bg-surface-container-lowest rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-12 editorial-shadow border border-outline-variant/10">
              <div className="hidden lg:block w-40 h-40 rounded-full overflow-hidden flex-shrink-0 ring-8 ring-surface-container">
                <img 
                  alt="Group discussion" 
                  className="w-full h-full object-cover" 
                  src="https://picsum.photos/seed/join-team/400/400"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-headline text-3xl font-extrabold mb-4 text-on-surface">How to Join</h3>
                <p className="text-on-surface-variant text-lg mb-8 font-medium">Open call for applications happens every August. Requirements: Enrollment in UP Mindanao, clean disciplinary record, and a passion for student welfare.</p>
                <button className="text-primary font-black inline-flex items-center gap-2 hover:gap-4 transition-all text-lg uppercase tracking-widest">
                  View Application Process <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Roster */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="font-headline text-4xl font-extrabold text-primary mb-4 tracking-tight">Active Kaagapay Responders</h2>
            <p className="text-on-surface-variant max-w-md text-lg font-medium">Our current team of volunteers representing various colleges and departments.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All Colleges', 'CHSS', 'CSM', 'SOM'].map((c, i) => (
              <button 
                key={c}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-extrabold transition-all",
                  i === 0 ? "bg-secondary text-on-primary shadow-lg" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { name: 'Mateo Sebastian', role: 'Lead Peer Advocate', college: 'College of Humanities and Social Sciences', img: 'https://i.pravatar.cc/400?u=mateo' },
            { name: 'Elena Rodriguez', role: 'Response Coordinator', college: 'School of Management', img: 'https://i.pravatar.cc/400?u=elena' },
            { name: 'Dr. Ricardo Pangilinan', role: 'Staff Consultant', college: 'College of Science and Mathematics', img: 'https://i.pravatar.cc/400?u=ricardo' },
            { name: 'Sarah Jane Lim', role: 'Student Liaison', college: 'College of Humanities and Social Sciences', img: 'https://i.pravatar.cc/400?u=sarah' },
          ].map((v, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="aspect-square rounded-[2.5rem] overflow-hidden mb-8 relative shadow-xl">
                <img 
                  alt={v.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" 
                  src={v.img}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2.5rem]"></div>
              </div>
              <h4 className="font-headline text-2xl font-extrabold text-on-surface mb-1">{v.name}</h4>
              <p className="text-sm text-secondary font-black uppercase tracking-widest mb-2">{v.role}</p>
              <p className="text-xs text-on-surface-variant font-bold leading-relaxed">{v.college}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="aura-gradient rounded-[4rem] p-16 lg:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-headline text-4xl lg:text-6xl font-extrabold text-white mb-8 tracking-tight">Ready to make a difference?</h2>
            <p className="text-surface-container text-xl mb-12 font-medium leading-relaxed">Join the next cohort of Kaagapay volunteers. Applications for the Fall Semester are now open for all bonafide UP Mindanao students.</p>
            <button className="bg-white text-primary px-12 py-6 rounded-2xl font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all ring-8 ring-white/20">
              Apply to Join the Team
            </button>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-secondary/20 rounded-full -ml-32 -mb-32 blur-[100px]"></div>
        </div>
      </section>
    </div>
  );
}

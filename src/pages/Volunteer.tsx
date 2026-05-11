import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ArrowRight, Users, Award, AlertTriangle, Heart, CheckCircle, Scale, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getAllVolunteers, VolunteerPublicRecord } from '@/src/lib/api';

export default function Volunteer() {
  const [volunteers, setVolunteers] = useState<VolunteerPublicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchVolunteers() {
      try {
        const data = await getAllVolunteers();
        setVolunteers(data || []);
      } catch (err: any) {
        console.error('Unexpected error fetching volunteers:', err);
        setError(err.message || 'An unexpected error occurred while loading volunteers.');
      } finally {
        setLoading(false);
      }
    }

    fetchVolunteers();
  }, []);

  return (
    <div className="space-y-24 pb-24 pt-20">
      <div>
        {/* Hero Section */}
        <section className="relative pt-24 pb-12 overflow-hidden">
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
              Compassion in <br />Institutional Service.
            </h1>
            <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed font-medium">
              The Kaagapay program is our network of dedicated students and staff trained to provide peer support and advocate for a safe, harassment-free campus environment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/volunteer/apply" className="px-10 py-5 bg-primary text-on-primary rounded-2xl font-extrabold text-lg shadow-2xl hover:opacity-90 transition-all active:scale-95 inline-block">
                Join the Team
              </Link>
              <button 
                onClick={() => document.getElementById('why-volunteer')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-surface-container-highest text-primary rounded-2xl font-extrabold text-lg hover:bg-surface-container-high transition-all"
              >
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

        {/* Core Principles */}
        <section className="pb-24 pt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-extrabold text-primary mb-4 tracking-tight">Our Core Principles</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg font-medium">The foundation of Project Kaagapay's approach to peer support and trauma-informed care.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container-lowest p-10 rounded-[3rem] editorial-shadow border-t-8 border-t-primary">
              <Heart className="text-primary mb-6" size={40} />
              <h3 className="font-headline text-2xl font-bold mb-4">VALIDATION</h3>
              <p className="text-on-surface-variant leading-relaxed font-medium">Institutional responses should affirm the survivor's feelings and account for their trauma.</p>
            </div>
            <div className="bg-surface-container-lowest p-10 rounded-[3rem] editorial-shadow border-t-8 border-t-secondary">
              <Scale className="text-secondary mb-6" size={40} />
              <h3 className="font-headline text-2xl font-bold mb-4">EMPOWERMENT</h3>
              <p className="text-on-surface-variant leading-relaxed font-medium">Survivors should feel capable of participating in the justice process and making decisions about their lives.</p>
            </div>
            <div className="bg-surface-container-lowest p-10 rounded-[3rem] editorial-shadow border-t-8 border-t-tertiary">
              <CheckCircle className="text-tertiary mb-6" size={40} />
              <h3 className="font-headline text-2xl font-bold mb-4">RECOGNITION</h3>
              <p className="text-on-surface-variant leading-relaxed font-medium">Validate the survivor's experience and story to foster trust and healing.</p>
            </div>
          </div>
        </div>
        </section>
      </div>

      {/* Recruitment Bento Grid */}
      <section id="why-volunteer" className="py-24 bg-surface-container-low">
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
                <div className="text-5xl font-black mb-4 tracking-tighter">Pioneer</div>
                <p className="text-surface-container font-bold text-lg">Be part of the founding 2025 cohort of peer responders.</p>
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
                <button onClick={() => setIsModalOpen(true)} className="text-primary font-black inline-flex items-center gap-2 hover:gap-4 transition-all text-lg uppercase tracking-widest">
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
          {loading ? (
            <div className="col-span-full text-center py-16">
              <div className="inline-block w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-on-surface-variant font-medium">Loading volunteers...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-16">
              <AlertTriangle size={48} className="mx-auto text-error mb-4" />
              <p className="text-on-surface font-bold mb-2">Failed to load volunteers</p>
              <p className="text-on-surface-variant font-medium text-sm max-w-md mx-auto">{error}</p>
            </div>
          ) : volunteers.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Users size={48} className="mx-auto text-on-surface-variant/40 mb-4" />
              <p className="text-on-surface-variant font-medium">No active volunteers found.</p>
            </div>
          ) : (
            volunteers.map((v) => {
              const fullName = `${v.first_name} ${v.last_name}`;
              const displayName = v.public_alias || fullName;
              const avatarSrc = v.profile_image_url || `https://img.icons8.com/?size=100&id=NPW07SMh7Aco&format=png&color=000000`;

              return (
                <motion.div
                  key={v.id}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <div className="aspect-square rounded-[2.5rem] overflow-hidden mb-8 relative shadow-xl">
                    <img
                      alt={fullName}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                      src={avatarSrc}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2.5rem]"></div>
                  </div>
                  <h4 className="font-headline text-2xl font-extrabold text-on-surface mb-1">{displayName}</h4>
                  <p className="text-sm text-secondary font-black uppercase tracking-widest mb-2">{v.status}</p>
                  <p className="text-xs text-on-surface-variant font-bold leading-relaxed">{v.external_handle}</p>
                  {v.incentive_points > 0 && (
                    <p className="text-xs text-primary font-bold mt-1">⭐ {v.incentive_points} pts</p>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="aura-gradient rounded-[4rem] p-16 lg:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-headline text-4xl lg:text-6xl font-extrabold text-white mb-8 tracking-tight">Ready to make a difference?</h2>
            <p className="text-surface-container text-xl mb-12 font-medium leading-relaxed">Join the next cohort of Kaagapay volunteers. Applications for the Fall Semester are now open for all bonafide UP Mindanao students.</p>
            <Link to="/volunteer/apply" className="bg-white text-primary px-12 py-6 rounded-2xl font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all ring-8 ring-white/20 inline-block">
              Apply to Join the Team
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-secondary/20 rounded-full -ml-32 -mb-32 blur-[100px]"></div>
        </div>
      </section>

      {/* Application Process Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface rounded-[2rem] shadow-2xl overflow-hidden z-10 border border-outline-variant/20"
            >
              <div className="p-8 sm:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-headline text-3xl font-extrabold text-primary mb-2">Application Process</h3>
                    <p className="text-on-surface-variant font-medium text-lg">Your journey to becoming a Kaagapay Responder.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-surface-container rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-xl text-on-surface mb-2">Submit Application Form</h4>
                      <p className="text-on-surface-variant">Fill out the basic information, college details, and a short essay on why you want to join the Kaagapay network.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-xl text-on-surface mb-2">Initial Screening & Interview</h4>
                      <p className="text-on-surface-variant">Selected applicants will be invited for a brief interview with the OASH officers to assess readiness and alignment with our core principles.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-tertiary text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-xl text-on-surface mb-2">Psychosocial & Protocol Training</h4>
                      <p className="text-on-surface-variant">A mandatory 2-day workshop covering trauma-informed care, active listening, and UP Mindanao's official reporting protocols.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row gap-4 justify-end">
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-on-surface-variant hover:text-primary transition-colors">
                    Close
                  </button>
                  <Link to="/volunteer/apply" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all text-center">
                    Start Application Now
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

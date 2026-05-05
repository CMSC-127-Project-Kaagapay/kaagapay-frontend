import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Megaphone, FileCheck, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

interface ApplicationForm {
  full_name: string;
  student_id: string;
  email: string;
  mobile: string;
  interest: string;
  motivation: string;
  agreed_to_terms: boolean;
}

const initialForm: ApplicationForm = {
  full_name: '',
  student_id: '',
  email: '',
  mobile: '',
  interest: '',
  motivation: '',
  agreed_to_terms: false,
};

const interestOptions = ['Advocacy', 'Creative Content', 'Secretariat', 'Outreach'];

export default function VolunteerApplication() {
  const [form, setForm] = useState<ApplicationForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }

  function handleInterestSelect(interest: string) {
    setForm(prev => ({ ...prev, interest }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.full_name || !form.student_id || !form.email || !form.interest || !form.motivation) {
      setError('Please fill out all required fields.');
      return;
    }
    if (!form.agreed_to_terms) {
      setError('You must agree to the terms before submitting.');
      return;
    }

    setSubmitting(true);

    if (!supabase) {
      setError('Supabase is not configured. Please set up your .env file.');
      setSubmitting(false);
      return;
    }

    const { error: supabaseError } = await supabase
      .from('volunteer_applications')
      .insert([
        {
          full_name: form.full_name,
          student_id: form.student_id,
          email: form.email,
          mobile: form.mobile,
          interest: form.interest,
          motivation: form.motivation,
        },
      ]);

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      setError('Something went wrong. Please try again later.');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  function handleDiscard() {
    setForm(initialForm);
    setError(null);
    setSubmitted(false);
  }

  return (
    <div className="pb-24 pt-20">
      {/* Hero Section — Editorial Header */}
      <header className="max-w-7xl mx-auto px-6 mb-16 md:mb-24 flex flex-col md:flex-row gap-12 items-end pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
            Join the Movement
          </span>
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface tracking-tight leading-tight mb-8">
            Shape a safer campus, <span className="text-primary italic">one step</span> at a time.
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed font-medium">
            The Office against Sexual Harassment (OASH) is looking for dedicated students and staff to help foster a culture of respect, safety, and empowerment within UP Mindanao.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, rotate: 6, scale: 0.95 }}
          animate={{ opacity: 1, rotate: 3, scale: 1 }}
          whileHover={{ rotate: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/3 aspect-square rounded-[2rem] overflow-hidden shadow-2xl flex-shrink-0"
        >
          <img
            className="w-full h-full object-cover"
            alt="Diverse group of university students"
            src="https://picsum.photos/seed/volunteer-apply/600/600"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </header>

      {/* Bento Grid: Info + Form */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column — Information Cards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Volunteer Pillars */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-high p-8 rounded-[2rem] flex flex-col gap-6"
          >
            <h2 className="font-headline text-2xl font-bold text-on-surface">Volunteer Pillars</h2>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm">
                  <Shield className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Peer Advocacy</h3>
                  <p className="text-sm text-on-surface-variant leading-snug">Be the first point of contact and support for fellow students.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm">
                  <Megaphone className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Awareness Campaigns</h3>
                  <p className="text-sm text-on-surface-variant leading-snug">Organize workshops and digital media to spread vital information.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm">
                  <FileCheck className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Policy Review</h3>
                  <p className="text-sm text-on-surface-variant leading-snug">Help us modernize and improve campus safety protocols.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Training Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="aura-gradient p-8 rounded-[2rem] text-white"
          >
            <ShieldCheck size={36} className="mb-4 opacity-90" />
            <h3 className="font-headline text-xl font-bold mb-2">Training Provided</h3>
            <p className="opacity-90 text-sm font-medium leading-relaxed">
              No prior experience is necessary. All volunteers receive comprehensive psychological first-aid and policy training.
            </p>
          </motion.div>
        </div>

        {/* Right Column — Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-8 bg-surface-container-lowest p-8 md:p-12 rounded-[2rem] editorial-shadow"
        >
          {submitted ? (
            /* Success State */
            <div className="flex flex-col items-center justify-center text-center py-16 gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <CheckCircle size={72} className="text-primary" />
              </motion.div>
              <h2 className="font-headline text-3xl font-bold text-on-surface">Application Submitted!</h2>
              <p className="text-on-surface-variant font-medium max-w-md">
                Thank you for your interest in volunteering with OASH. We'll review your application and get in touch via your UP email.
              </p>
              <button
                onClick={handleDiscard}
                className="mt-4 px-8 py-3 bg-surface-container text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-high transition-colors"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <h2 className="font-headline text-3xl font-bold mb-2 text-on-surface">Application Form</h2>
                <p className="text-on-surface-variant font-medium">Please fill out the details below and we'll be in touch.</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-error/10 border border-error/20 text-error px-5 py-3 rounded-xl text-sm font-bold"
                >
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-on-surface-variant px-1">
                    Full Name <span className="text-error">*</span>
                  </label>
                  <input
                    name="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Juan Dela Cruz"
                    className="bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant outline-none"
                  />
                </div>

                {/* Student ID */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-on-surface-variant px-1">
                    Student / Employee ID <span className="text-error">*</span>
                  </label>
                  <input
                    name="student_id"
                    type="text"
                    value={form.student_id}
                    onChange={handleChange}
                    placeholder="202X-XXXXX"
                    className="bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant outline-none"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-on-surface-variant px-1">
                    UP Email Address <span className="text-error">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="username@up.edu.ph"
                    className="bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant outline-none"
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-on-surface-variant px-1">
                    Mobile Number
                  </label>
                  <input
                    name="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="+63 9XX XXX XXXX"
                    className="bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant outline-none"
                  />
                </div>
              </div>

              {/* Primary Area of Interest */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-widest uppercase text-on-surface-variant px-1">
                  Primary Area of Interest <span className="text-error">*</span>
                </label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {interestOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleInterestSelect(option)}
                      className={`px-6 py-3 rounded-full border transition-all font-medium text-sm ${
                        form.interest === option
                          ? 'bg-secondary-container text-on-secondary-container font-bold border-secondary/30 shadow-sm'
                          : 'bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motivation */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-widest uppercase text-on-surface-variant px-1">
                  Why do you want to volunteer? <span className="text-error">*</span>
                </label>
                <textarea
                  name="motivation"
                  value={form.motivation}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Share your motivation and any relevant experiences..."
                  className="bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant outline-none resize-none"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-4 p-4 bg-surface-container-low/50 rounded-xl">
                <input
                  name="agreed_to_terms"
                  type="checkbox"
                  checked={form.agreed_to_terms}
                  onChange={handleChange}
                  className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-on-surface-variant font-medium leading-relaxed">
                  I understand that volunteering for OASH requires maintaining strict confidentiality and attending mandatory orientation.
                </span>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="px-8 py-4 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-12 py-4 aura-gradient text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

import React from "react";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Shield,
  Send,
  Calendar,
  MapPin,
  FileText,
  CheckCircle,
  Info,
  Phone,
  ArrowRight,
  Users,
  UserCircle,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function Report() {
  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Header Section */}
        <div className="lg:col-span-12 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold mb-4"
          >
            <Shield size={14} fill="currentColor" />
            SECURE & ENCRYPTED
          </motion.div>
          <h1 className="text-5xl font-extrabold font-headline text-primary tracking-tight mb-4">
            Report an Incident
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed pl-8 border-l-4 border-primary/20">
            Your safety and privacy are our absolute priorities. This form is a
            confidential space to document your experience and request the
            support you need.
          </p>
        </div>

        {/* Main Form Section */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-surface-container-lowest rounded-3xl p-8 editorial-shadow border border-outline-variant/10">
            <h2 className="text-2xl font-bold font-headline mb-8 text-on-surface flex items-center gap-3">
              <FileText className="text-secondary" />
              Incident Documentation
            </h2>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Demographic */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Demographic
                  </label>
                  <div className="relative">
                    <Users
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                      size={18}
                    />
                    <input
                      className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                      placeholder="e.g. Youth, Adult, Senior"
                      type="text"
                    />
                  </div>
                </div>

                {/* Involved Party */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Involved Party
                  </label>
                  <div className="relative">
                    <UserCircle
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                      size={18}
                    />
                    <input
                      className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                      placeholder="e.g. Student, Faculty, Staff"
                      type="text"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Date & Time
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                      size={18}
                    />
                    <input
                      className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                      type="datetime-local"
                    />
                  </div>
                </div>

                {/* Locality */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Locality
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                      size={18}
                    />
                    <input
                      className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                      placeholder="e.g. Inside UP Campus, Outside"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full bg-primary text-on-primary font-headline font-extrabold py-5 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
                  <Send size={20} />
                  Securely Submit Report
                </button>
                <p className="text-center text-[10px] text-on-surface-variant mt-6 font-bold uppercase tracking-widest opacity-60">
                  Submission is timestamped and encrypted using TLS 1.3
                  standards.
                </p>
              </div>
            </form>
          </section>

          {/* Emergency Contact */}
          <div className="bg-surface-container rounded-3xl p-8 editorial-shadow border border-outline-variant/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black font-headline mb-2 text-on-surface">
                Need Immediate Help?
              </h3>
              <p className="text-sm mb-8 text-on-surface-variant leading-relaxed">
                If you are currently in danger or require immediate medical
                attention, please call our 24/7 emergency response team.
              </p>
              <div className="space-y-4">
                <a
                  href="tel:0822930000"
                  className="flex items-center justify-between bg-surface hover:bg-surface-container-low border-outline-variant/30 hover:border-primary/30 p-5 rounded-2xl transition-all group"
                >
                  <span className="font-bold text-on-surface text-sm">
                    UP Mindanao Security
                  </span>
                  <span className="font-mono text-primary font-bold text-sm group-hover:text-white transition-colors">
                    (082) 293-0000
                  </span>
                </a>
                {/* <button className="w-full bg-surface text-on-surface font-extrabold py-4 rounded-2xl hover:bg-surface-container-highest transition-all border-outline-variant/20 text-sm">
                  Live Chat Support
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Side Support Section */}
        <div className="lg:col-span-5 space-y-8">
          {/* Volunteer Accompaniment */}
          <section className="bg-surface-container-lowest rounded-3xl p-8 editorial-shadow border border-outline-variant/10">
            <h2 className="text-2xl font-bold font-headline mb-2 text-on-surface flex items-center gap-3">
              <Users className="text-secondary" />
              Request Accompaniment
            </h2>
            <p className="text-sm text-on-surface-variant mb-8">
              Select a certified student volunteer to accompany you during the
              reporting process, or request any available volunteer.
            </p>

            {/* "Any Available" quick option */}
            <button className="w-full mb-6 flex items-center justify-between gap-4 p-4 rounded-2xl border-2 border-dashed border-secondary/30 bg-secondary-container/30 hover:bg-secondary-container hover:border-secondary/60 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center shrink-0 border-2 border-secondary/20">
                  <Users size={24} className="text-secondary" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-on-surface group-hover:text-secondary transition-colors">
                    Any Available Volunteer
                  </h4>
                  <p className="text-xs text-on-surface-variant font-medium">
                    We'll match you with the next available volunteer
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container shrink-0">
                RECOMMENDED
              </span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-outline-variant/30" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                or choose specific
              </span>
              <div className="h-px flex-1 bg-outline-variant/30" />
            </div>

            <div className="space-y-4">
              {[
                {
                  name: "Maria Santos",
                  info: "College of Science & Mathematics • 4th Year",
                  status: "AVAILABLE",
                  img: "https://i.pravatar.cc/150?u=maria",
                },
                {
                  name: "James Reyes",
                  info: "College of Humanities & Social Science • 3rd Year",
                  status: "BUSY",
                  img: "https://i.pravatar.cc/150?u=james",
                  busy: true,
                },
              ].map((v, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-4 p-4 bg-surface rounded-2xl border border-outline-variant/20 hover:border-secondary/40 hover:shadow-md transition-all cursor-pointer group",
                    v.busy && "opacity-50 pointer-events-none",
                  )}
                >
                  <img
                    alt={v.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-outline-variant/30"
                    src={v.img}
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-grow">
                    <h4 className="font-bold text-on-surface group-hover:text-secondary transition-colors">
                      {v.name}
                    </h4>
                    <p className="text-xs text-on-surface-variant font-medium">
                      {v.info}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        v.busy
                          ? "bg-surface-container text-on-surface-variant"
                          : "bg-secondary-container text-on-secondary-container",
                      )}
                    >
                      {v.status}
                    </span>
                    {!v.busy && (
                      <CheckCircle size={16} className="text-secondary" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 text-sm font-bold text-on-surface-variant border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-all">
              View All Volunteers
            </button>

            <p className="text-center text-[10px] text-on-surface-variant mt-4 font-bold uppercase tracking-widest opacity-60">
              All volunteers are trained and certified by OASH
            </p>
          </section>

          {/* Real-time Feedback */}
          <section className="bg-surface-container border border-outline-variant/40 text-on-surface rounded-3xl p-8 relative overflow-hidden editorial-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Shield size={120} />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <h3 className="font-headline font-bold text-on-surface-variant tracking-widest text-xs uppercase">
                Real-time Feedback
              </h3>
            </div>
            <ul className="space-y-6 relative z-10">
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-surface-container-high rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle size={20} className="text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-on-surface">
                    Encrypted Connection
                  </p>
                  <p className="text-on-surface-variant">
                    Your data is being transmitted securely.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-surface-container-high rounded-xl flex items-center justify-center shrink-0">
                  <Info size={20} className="text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-on-surface">
                    OASH Personnel Online
                  </p>
                  <p className="text-on-surface-variant">
                    2 coordinators active to receive reports.
                  </p>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

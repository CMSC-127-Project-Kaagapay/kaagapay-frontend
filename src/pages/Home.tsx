import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Shield,
  ArrowRight,
  Handshake,
  BookOpen,
  MessageSquare,
  CheckCircle,
  Info,
  Users,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import communityPhoto from "../assets/community_support.jpg";
import upminBackground from "../assets/UP-Mindanao.png";

interface HelpItem {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  path?: string;
  highlight?: boolean;
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 bg-primary">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 bg-primary">
          <img
            alt="UP Mindanao Campus"
            className="w-full h-full object-cover opacity-90"
            src={upminBackground}
            referrerPolicy="no-referrer"
          />
          {/* Solid primary on the left fading into the image on the right, keeping it vibrant */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent"></div>
          {/* A subtle secondary color overlay for depth without darkening */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/60 via-secondary/20 to-transparent mix-blend-overlay"></div>
        </div>

        {/* Content Layer (Left-aligned) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex justify-start">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 },
              },
            }}
            className="w-full lg:w-[60%] flex flex-col items-start text-left space-y-6"
          >
            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-extrabold font-headline text-white leading-[1.1] tracking-tight drop-shadow-2xl"
            >
              Safe Spaces, <br />
              <span className="text-[#f9d8ff]">Solidarity,</span> & Support.
            </motion.h1>
            
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-lg md:text-2xl text-white max-w-lg leading-relaxed font-bold mt-4 drop-shadow-lg"
            >
              We are dedicated to fostering a university environment defined by respect and free from sexual harassment. Here, every voice is heard, and every student is protected.
            </motion.p>

            <motion.div 
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-wrap justify-start gap-4 pt-6"
            >
              <button
                onClick={() => navigate("/report")}
                className="px-8 py-4 bg-white text-primary font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-surface-container transition-all active:scale-95 flex items-center gap-2"
              >
                <Shield size={20} />
                File a Report
              </button>
              <button
                onClick={() => document.getElementById('commitment')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-transparent border-2 border-white/60 text-white font-bold rounded-full hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Learn About Kaagapay
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Commitment Section */}
      <section id="commitment" className="max-w-7xl mx-auto px-8">
        <div className="mb-16">
          <h2 className="text-4xl font-extrabold font-headline text-secondary mb-4">
            Driving Cultural Shift
          </h2>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            We don't just enforce rules—we actively reshape the campus narrative by cultivating empathy, awareness, and accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 bg-surface-container-lowest p-12 rounded-[3rem] editorial-shadow border border-outline-variant/10 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-surface-container text-primary rounded-3xl flex items-center justify-center mb-8">
                <Handshake size={32} />
              </div>
              <h3 className="text-4xl font-bold font-headline text-secondary mb-6">
                What is Kaagapay?
              </h3>
              <p className="text-on-surface-variant text-xl leading-relaxed max-w-2xl">
                Launched on January 28, 2025 by Gabriela Youth UP Mindanao, Project Kaagapay aims to be a network of young women and young students, to create a peer facilitating and psychosocial support system for victim-survivors of SH/SA in campus.
              </p>
            </div>
            <div className="flex items-center gap-12 mt-12">
              <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-primary">
                  Growing
                </span>
                <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Support Network
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-primary">
                  100%
                </span>
                <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Confidentiality
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-8">
            <div className="aura-gradient text-on-primary p-10 rounded-[3rem] flex flex-col justify-between min-h-70 shadow-lg">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
              <div>
                <h4 className="text-2xl font-bold font-headline mb-2">
                  Direct Assistance
                </h4>
                <p className="text-white/80 text-sm mb-4">
                  Reach out to us through our official channels.
                </p>
                <div className="space-y-2">
                  <a href="mailto:proj.kaagapay@gmail.com" className="text-sm font-bold text-white break-all flex items-center gap-2 hover:underline">
                    Email: proj.kaagapay@gmail.com
                  </a>
                  <a href="https://facebook.com/proj.kaagapay" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white break-all flex items-center gap-2 hover:underline">
                    Facebook: Project Kaagapay
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-secondary text-on-primary p-10 rounded-[3rem] flex flex-col justify-between min-h-70 shadow-lg">
              <h4 className="text-2xl font-bold font-headline">
                Advocacy Workshops
              </h4>
              <p className="text-white/80 text-base">
                Monthly training sessions on gender sensitivity and bystander
                intervention.
              </p>
              <button className="inline-flex items-center gap-2 text-surface-container font-bold text-sm hover:translate-x-2 transition-all">
                Upcoming Schedules <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-surface-container-low py-24">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <h2 className="text-4xl md:text-6xl font-extrabold font-headline text-secondary tracking-tight">
              How can we help <br />
              each other today?
            </h2>
            <div className="space-y-6">
              {[
                {
                  icon: Users,
                  title: "Join as a Volunteer",
                  desc: "Become a Kaagapay responder and support your peers.",
                  color: "primary",
                  path: "/volunteer",
                  highlight: false
                },
                {
                  icon: Shield,
                  title: "Report an Incident",
                  desc: "Safe, secure, and confidential reporting channel.",
                  color: "secondary",
                  path: "/report",
                },
                {
                  icon: BookOpen,
                  title: "Policy Handbook",
                  desc: "Read the full University Code of Conduct.",
                  color: "tertiary",
                  path: "https://upmin.edu.ph/students/student-handbook/",
                  highlight: false
                },
              ].map((item: HelpItem, idx) => (
                <motion.div
                  key={idx}
                  onClick={() => {
                    if (!item.path) return;
                    if (item.path.startsWith('http')) {
                      window.open(item.path, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(item.path);
                    }
                  }}
                  whileHover={{ y: -4 }}
                  className={cn(
                    "group flex items-center p-8 bg-surface-container-lowest rounded-3xl cursor-pointer transition-all editorial-shadow",
                    item.highlight
                      ? "border-2 border-primary/20 hover:border-primary"
                      : "border border-transparent hover:border-outline-variant/30",
                  )}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                      item.highlight
                        ? "bg-primary text-white"
                        : "bg-surface-container text-primary group-hover:bg-primary group-hover:text-white",
                    )}
                  >
                    <item.icon size={24} />
                  </div>
                  <div className="ml-6 flex-1">
                    <h5 className="font-bold text-xl text-secondary">
                      {item.title}
                    </h5>
                    <p className="text-on-surface-variant text-sm">
                      {item.desc}
                    </p>
                  </div>
                  <ArrowRight
                    className="text-outline group-hover:text-primary transition-colors"
                    size={20}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[4rem] overflow-hidden shadow-2xl ring-8 ring-white/50">
              <img
                alt="Community Support"
                className="w-full aspect-square object-cover"
                src={communityPhoto}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-surface-container-lowest p-8 rounded-3xl shadow-2xl border-l-8 border-primary max-w-sm">
              <p className="italic text-secondary text-base font-medium">
                "Our vision is a university where boundaries are sacred and solidarity is the norm."
              </p>
              <p className="mt-4 font-bold text-primary text-xs uppercase tracking-widest">
                — Gabriela Youth UPMin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-5xl mx-auto px-8">
        <div className="aura-gradient rounded-[4rem] p-16 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-white mb-6">
              Stay Informed, Stay Safe.
            </h2>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto font-medium">
              Subscribe to our newsletter for the latest awareness campaigns and
              safety updates from the Project Kaagapay team.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/60 rounded-full px-8 py-5 focus:ring-2 focus:ring-white outline-none transition-all backdrop-blur-md"
                placeholder="Enter your UP email"
                type="email"
              />
              <button className="bg-white text-primary font-bold px-10 py-5 rounded-full hover:scale-105 hover:shadow-lg transition-all active:scale-95">
                Subscribe
              </button>
            </form>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        </div>
      </section>
    </div>
  );
}

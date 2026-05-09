import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  X,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { submitReport, ReportForm } from "@/src/lib/api";
import { supabase } from "@/src/lib/supabase";

const initialForm: ReportForm = {
  demographic: "",
  involved_party: "",
  locality: "",
  routing_type: "random",
  selected_volunteer_id: null,
};

export default function Report() {
  const [form, setForm] = useState<ReportForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseResult, setCaseResult] = useState<{
    public_case_id: string;
    status: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  interface VolunteerPublicRecord {
    id: string;
    first_name: string;
    last_name: string;
    status: string;
    profile_image_key: string | null;
  }

  function getProfileImageUrl(key: string | null): string {
    if (!key || !supabase) {
      return `https://img.icons8.com/?size=100&id=NPW07SMh7Aco&format=png&color=000000`;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(key);
    return data.publicUrl;
  }

  const [volunteers, setVolunteers] = useState<VolunteerPublicRecord[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState(true);
  const [volunteersError, setVolunteersError] = useState<string | null>(null);
  const [showAllVolunteers, setShowAllVolunteers] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<
    string | null | undefined
  >(undefined);
  // undefined = nothing picked yet, null = "any available", string = specific volunteer id

  useEffect(() => {
    async function fetchVolunteers() {
      if (!supabase) {
        setVolunteersError("Supabase client is not configured.");
        setVolunteersLoading(false);
        return;
      }
      try {
        const { data, error: fetchError } = await supabase
          .from("volunteers")
          .select("id, first_name, last_name, status, profile_image_key")
          .eq("status", "active")
          .order("first_name", { ascending: true });

        if (fetchError) throw new Error(fetchError.message);
        setVolunteers(data || []);
      } catch (err: any) {
        setVolunteersError(err.message);
      } finally {
        setVolunteersLoading(false);
      }
    }
    fetchVolunteers();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.demographic || !form.involved_party || !form.locality) {
      setError("Please fill in all fields before submitting.");
      return;
    }

    if (selectedVolunteerId === undefined) {
      setError(
        "Please select a volunteer accompaniment option before submitting.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await submitReport({
        ...form,
        routing_type: selectedVolunteerId === null ? "random" : "specific",
        selected_volunteer_id: selectedVolunteerId ?? null,
      });
      setCaseResult({
        public_case_id: result.public_case_id,
        status: result.status,
      });
      setForm(initialForm);
      setSelectedVolunteerId(undefined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy() {
    if (!caseResult) return;
    navigator.clipboard.writeText(caseResult.public_case_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCloseModal() {
    setCaseResult(null);
  }

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      {/* Status Modal: Show Report ID */}
      <AnimatePresence>
        {caseResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-surface-container-lowest rounded-3xl p-10 max-w-md w-full editorial-shadow relative"
            >
              {/* Close */}
              <button
                onClick={handleCloseModal}
                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant"
              >
                <X size={18} />
              </button>

              {/* Icon */}
              <div className="flex flex-col items-center text-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center"
                >
                  <CheckCircle size={40} className="text-secondary" />
                </motion.div>

                <div>
                  <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-2">
                    Report Submitted
                  </h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Your report has been securely received. Please save your
                    Case ID — you'll need it to track your report's progress.
                  </p>
                </div>

                {/* Case ID */}
                <div className="w-full bg-surface-container-low rounded-2xl p-5 flex flex-col gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Your Case ID
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-lg font-extrabold text-primary tracking-wide break-all">
                      {caseResult.public_case_id}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 p-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant"
                      title="Copy Case ID"
                    >
                      {copied ? (
                        <Check size={16} className="text-secondary" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  Status: {caseResult.status.replace("_", " ")}
                </div>

                <button
                  onClick={handleCloseModal}
                  className="w-full py-4 bg-primary text-on-primary font-extrabold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

            <form className="space-y-8" onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-error/10 border border-error/20 text-error px-5 py-3 rounded-xl text-sm font-bold"
                >
                  {error}
                </motion.div>
              )}
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
                      name="demographic"
                      value={form.demographic}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium outline-none"
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
                      name="involved_party"
                      value={form.involved_party}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium outline-none"
                      placeholder="e.g. Student, Faculty, Staff"
                      type="text"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                {/* <div className="space-y-2">
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
                </div> */}

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
                      name="locality"
                      value={form.locality}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium outline-none"
                      placeholder="e.g. Inside UP Campus, Outside"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary font-headline font-extrabold py-5 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={20} /> Securely Submit Report
                    </>
                  )}
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
              </div>
            </div>
          </div>
        </div>

        {/* Side Support Section */}
        <div className="lg:col-span-5 space-y-8">
          {/* Volunteer Accompaniment */}
          <section
            className={cn(
              "bg-surface-container-lowest rounded-3xl p-8 editorial-shadow border transition-all",
              error && selectedVolunteerId === undefined
                ? "border-error/40"
                : "border-outline-variant/10",
            )}
          >
            <h2 className="text-2xl font-bold font-headline mb-2 text-on-surface flex items-center gap-3">
              <Users className="text-secondary" />
              Request Accompaniment
            </h2>
            <p className="text-sm text-on-surface-variant mb-2">
              Select a certified student volunteer to accompany you during the
              reporting process, or request any available volunteer.
            </p>

            {/* Required indicator */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-error mb-6">
              * Required — please select an option
            </p>

            {/* "Any Available" quick option */}
            <button
              type="button"
              onClick={() => setSelectedVolunteerId(null)}
              className={cn(
                "w-full mb-6 flex items-center justify-between gap-4 p-4 rounded-2xl border-2 border-dashed transition-all group",
                selectedVolunteerId === null
                  ? "border-secondary bg-secondary-container"
                  : "border-secondary/30 bg-secondary-container/30 hover:bg-secondary-container hover:border-secondary/60",
              )}
            >
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
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                  RECOMMENDED
                </span>
                {selectedVolunteerId === null && (
                  <CheckCircle size={18} className="text-secondary" />
                )}
              </div>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-outline-variant/30" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                or choose specific
              </span>
              <div className="h-px flex-1 bg-outline-variant/30" />
            </div>

            {volunteersLoading ? (
              <div className="flex items-center justify-center py-8 gap-3">
                <Loader2 size={20} className="animate-spin text-secondary" />
                <span className="text-sm text-on-surface-variant font-medium">
                  Loading volunteers...
                </span>
              </div>
            ) : volunteersError ? (
              <div className="py-6 text-center">
                <p className="text-sm text-error font-medium">
                  {volunteersError}
                </p>
              </div>
            ) : volunteers.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-on-surface-variant font-medium">
                  No active volunteers available at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(showAllVolunteers ? volunteers : volunteers.slice(0, 3)).map(
                  (v) => {
                    const isAvailable = v.status.toLowerCase() === "active";
                    const isSelected = selectedVolunteerId === v.id;
                    const fullName = `${v.first_name} ${v.last_name}`;
                    return (
                      <div
                        key={v.id}
                        onClick={() =>
                          isAvailable &&
                          setSelectedVolunteerId(isSelected ? undefined : v.id)
                        }
                        className={cn(
                          "flex items-center gap-4 p-4 bg-surface rounded-2xl border transition-all group",
                          isAvailable
                            ? "cursor-pointer hover:border-secondary/40 hover:shadow-md"
                            : "opacity-50 pointer-events-none border-outline-variant/20",
                          isSelected
                            ? "border-secondary/60 bg-secondary-container/10"
                            : "border-outline-variant/20",
                        )}
                      >
                        <img
                          alt={fullName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-outline-variant/30 shrink-0"
                          src={getProfileImageUrl(v.profile_image_key)}
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-grow">
                          <h4 className="font-bold text-on-surface group-hover:text-secondary transition-colors">
                            {fullName}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              isAvailable
                                ? "bg-secondary-container text-on-secondary-container"
                                : "bg-surface-container text-on-surface-variant",
                            )}
                          >
                            {v.status.toUpperCase()}
                          </span>
                          {isSelected && (
                            <CheckCircle size={16} className="text-secondary" />
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}

            {!volunteersLoading &&
              !volunteersError &&
              volunteers.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllVolunteers((prev) => !prev)}
                  className="w-full mt-6 py-3 text-sm font-bold text-on-surface-variant border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-all"
                >
                  {showAllVolunteers
                    ? "Show Less"
                    : `View All Volunteers (${volunteers.length})`}
                </button>
              )}

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

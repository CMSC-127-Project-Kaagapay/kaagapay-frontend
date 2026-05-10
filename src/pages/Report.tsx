import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { getVolunteers, createIncidentReport, VolunteerResponseDto } from "@/src/lib/api";

export default function Report() {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState<VolunteerResponseDto[]>([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseResult, setCaseResult] = useState<{
    public_case_id: string;
    status: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [incidentType, setIncidentType] = useState("");
  const [locality, setLocality] = useState("");
  const [involvedParty, setInvolvedParty] = useState("");
  const [routingType, setRoutingType] = useState<'specific' | 'random'>('random');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchVolunteers() {
      try {
        const data = await getVolunteers();
        setVolunteers(data);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      } finally {
        setLoadingVolunteers(false);
      }
    }
    fetchVolunteers();
  }, []);

  function handleCopy() {
    if (!caseResult) return;
    navigator.clipboard.writeText(caseResult.public_case_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCloseModal() {
    setCaseResult(null);
    if (caseResult) {
      navigate(`/track?token=${caseResult.public_case_id}`);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentType || !locality || !involvedParty) {
      setError("Please fill in all required fields.");
      return;
    }

    if (routingType === 'specific' && !selectedVolunteerId) {
      setError("Please select a volunteer or choose 'Any Available'.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await createIncidentReport({
        demographic: incidentType,
        locality: locality,
        involved_party: involvedParty,
        routing_type: routingType,
        selected_volunteer_id: selectedVolunteerId,
      });

      setCaseResult({
        public_case_id: response.public_case_id,
        status: response.status,
      });
    } catch (error: any) {
      console.error("Error submitting report:", error);
      setError(error.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
              <button
                onClick={handleCloseModal}
                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant"
              >
                <X size={18} />
              </button>

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

        <div className="lg:col-span-7 space-y-8">
          <section className="bg-surface-container-lowest rounded-3xl p-8 editorial-shadow border border-outline-variant/10">
            <h2 className="text-2xl font-bold font-headline mb-8 text-on-surface flex items-center gap-3">
              <FileText className="text-secondary" />
              Incident Documentation
            </h2>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Nature of Incident *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Harassment",
                    "Discrimination",
                    "Stalking",
                    "Physical Harm",
                    "Other",
                  ].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setIncidentType(type)}
                      className={cn(
                        "px-4 py-3 rounded-xl border transition-all text-left flex items-center justify-between group",
                        incidentType === type
                          ? "bg-primary text-on-primary border-primary shadow-lg"
                          : "border-outline-variant/30 bg-surface text-sm font-semibold hover:bg-secondary-container hover:text-on-secondary-container"
                      )}
                    >
                      {type}
                      {incidentType === type ? (
                        <CheckCircle size={14} />
                      ) : (
                        <ArrowRight
                          size={14}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </button>
                  ))}
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Involved Parties *
                  </label>
                  <div className="relative">
                    <Users
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                      size={18}
                    />
                    <input
                      className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium outline-none"
                      placeholder="e.g. Student, Staff, Unknown"
                      type="text"
                      value={involvedParty}
                      onChange={(e) => setInvolvedParty(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Location / Locality *
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                      size={18}
                    />
                    <input
                      className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary transition-all text-sm font-medium outline-none"
                      placeholder="e.g. Inside UP Campus, Outside"
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary font-headline font-extrabold py-5 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={20} /> Securely Submit Report
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-on-surface-variant mt-6 font-bold uppercase tracking-widest opacity-60">
                  Submission is anonymous by default unless you choose to reveal later.
                </p>
              </div>
            </form>
          </section>

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

        <div className="lg:col-span-5 space-y-8">
          <section
            className={cn(
              "bg-surface-container-lowest rounded-3xl p-8 editorial-shadow border transition-all",
              error && routingType === 'specific' && !selectedVolunteerId
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-error mb-6">
              * Required — please select an option
            </p>

            <button 
              type="button"
              onClick={() => {
                setRoutingType('random');
                setSelectedVolunteerId(undefined);
              }}
              className={cn(
                "w-full mb-6 flex items-center justify-between gap-4 p-4 rounded-2xl border-2 transition-all group",
                routingType === 'random'
                  ? "border-secondary bg-secondary-container/20 shadow-md"
                  : "border-dashed border-secondary/30 bg-secondary-container/10 hover:bg-secondary-container/20"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center shrink-0 border-2 border-secondary/20">
                  <Users size={24} className="text-secondary" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-on-surface">
                    Any Available Volunteer
                  </h4>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Fastest response time
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                  RECOMMENDED
                </span>
                {routingType === 'random' && (
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

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {loadingVolunteers ? (
                <div className="py-8 text-center">
                  <Loader2 className="animate-spin mx-auto text-secondary" />
                  <p className="text-xs font-bold uppercase tracking-widest mt-2 opacity-60">Loading Volunteers...</p>
                </div>
              ) : volunteers.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-on-surface-variant font-medium">
                    No active volunteers available at this time.
                  </p>
                </div>
              ) : (
                volunteers.map((v) => {
                  const isAvailable = v.status.toLowerCase() === "active" || v.status.toLowerCase() === "online";
                  const isSelected = selectedVolunteerId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        if (isAvailable) {
                          setRoutingType('specific');
                          setSelectedVolunteerId(v.id);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-4 p-4 bg-surface rounded-2xl border transition-all cursor-pointer group",
                        !isAvailable && "opacity-50 pointer-events-none grayscale",
                        isSelected
                          ? "border-secondary bg-secondary-container/10 shadow-md"
                          : "border-outline-variant/20 hover:border-secondary/40"
                      )}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-outline-variant/30 shrink-0">
                        {v.profile_image_url ? (
                          <img src={v.profile_image_url} alt={v.public_alias} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                            <Users size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-on-surface group-hover:text-secondary transition-colors">
                          {v.public_alias || `${v.first_name} ${v.last_name}`}
                        </h4>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                          Certified Volunteer
                        </p>
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
                })
              )}
            </div>

            <p className="text-center text-[10px] text-on-surface-variant mt-4 font-bold uppercase tracking-widest opacity-60">
              All volunteers are trained and certified by OASH
            </p>
          </section>

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

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Search,
  Clock,
  CheckCircle,
  MessageCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { getSpecificIncident, getVolunteerProfile, IncidentTicketResponseDto } from "@/src/lib/api";

export default function TrackCase() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";
  
  const [caseId, setCaseId] = useState(tokenFromUrl);
  const [ticket, setTicket] = useState<IncidentTicketResponseDto | null>(null);
  const [volunteerName, setVolunteerName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTicket = async (id: string) => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const data = await getSpecificIncident(id);
      setTicket(data);
      
      // If a volunteer is assigned, fetch their name/alias separately
      if (data.assigned_volunteer_id) {
        try {
          const vol = await getVolunteerProfile(data.assigned_volunteer_id);
          setVolunteerName(vol.public_alias || `${vol.first_name} ${vol.last_name}`);
        } catch (volErr) {
          console.error("Could not fetch volunteer profile:", volErr);
          setVolunteerName("A volunteer");
        }
      }
    } catch (err) {
      console.error("Error tracking case:", err);
      setError("Case ID not found. Please double-check your token.");
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      fetchTicket(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTicket(caseId);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(caseId);
    alert("Case ID copied to clipboard!");
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4"
        >
          <Shield size={14} fill="currentColor" />
          Secure Tracking Portal
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">
          Track Your Report
        </h1>
        <p className="text-on-surface-variant max-w-xl mx-auto font-medium">
          Enter your unique Case ID (KGPY-XXXX-XXXX) to check the status of your request and connect with your assigned volunteer.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={24} />
          <input
            type="text"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            placeholder="Enter Case ID (e.g., KGPY-1234-5678)"
            className="w-full bg-surface-container rounded-[2rem] pl-16 pr-32 py-6 text-xl font-bold border-2 border-transparent focus:border-primary focus:bg-surface outline-none transition-all shadow-xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-black hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Track"}
          </button>
        </div>
      </form>

      {/* Result Section */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-sm font-bold uppercase tracking-widest opacity-60">Retrieving Secure Data...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-error-container text-on-error-container p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-4 editorial-shadow"
            >
              <AlertCircle size={48} />
              <h3 className="text-xl font-bold font-headline">{error}</h3>
              <p className="text-sm opacity-80">If you just submitted your report, please wait a few seconds and try again.</p>
            </motion.div>
          ) : ticket ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Status Header */}
              <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-12 editorial-shadow border border-outline-variant/10 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="space-y-2 text-center md:text-left">
                   <div className="flex items-center justify-center md:justify-start gap-4">
                     <h2 className="text-3xl font-black font-headline">{ticket.public_case_id}</h2>
                     <button onClick={copyToClipboard} className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant">
                       <Copy size={16} />
                     </button>
                   </div>
                   <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Incident Tracking Token</p>
                </div>
                
                <div className="flex items-center gap-4 bg-surface rounded-3xl p-6 border border-outline-variant/20 shadow-inner">
                  <StatusIcon status={ticket.status} />
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant">Current Status</p>
                    <p className={cn("text-2xl font-black font-headline capitalize", getStatusColor(ticket.status))}>
                      {ticket.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Volunteer Details (Only if claimed) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface-container rounded-[2.5rem] p-8 space-y-6">
                  <h3 className="font-headline font-bold text-xl flex items-center gap-3">
                    <CheckCircle className="text-success" />
                    Case Timeline
                  </h3>
                  <div className="space-y-6 relative pl-4">
                     <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-outline-variant/20" />
                     <TimelineItem 
                        label="Report Submitted" 
                        time={new Date(ticket.created_at).toLocaleString()} 
                        done 
                     />
                     <TimelineItem 
                        label="Volunteer Assigned" 
                        time={ticket.assigned_volunteer_id ? "Success" : "Pending..."} 
                        done={!!ticket.assigned_volunteer_id} 
                     />
                     <TimelineItem 
                        label="Status: In Progress" 
                        time={ticket.status === 'in_progress' ? "Active" : "---"} 
                        done={ticket.status === 'in_progress' || ticket.status === 'resolved'} 
                     />
                  </div>
                </div>

                <div className={cn(
                  "rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center transition-all min-h-[300px]",
                  ticket.status === 'claimed' || ticket.status === 'in_progress'
                    ? "bg-primary text-on-primary shadow-2xl" 
                    : "bg-surface-container-high"
                )}>
                  {ticket.status === 'pending' || ticket.status === 'requested' ? (
                    <>
                      <Clock size={64} className="mb-6 animate-pulse opacity-40 text-primary" />
                      <h3 className="font-headline font-black text-2xl md:text-3xl mb-4">
                        Your case is still waiting a responding Volunteer
                      </h3>
                      <p className="text-sm font-medium opacity-70 max-w-sm">
                        A certified student volunteer will claim your request shortly. Please keep this Case ID safe.
                      </p>
                    </>
                  ) : (ticket.status === 'claimed' || ticket.status === 'in_progress') ? (
                    <>
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                        <MessageCircle size={40} />
                      </div>
                      <h3 className="font-headline font-black text-2xl md:text-3xl mb-2">Volunteer Connected!</h3>
                      <p className="text-sm font-bold opacity-90 mb-8">
                        {volunteerName || "A volunteer"} has claimed your case. Reach out via their secure handle:
                      </p>
                      <div className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl font-black text-2xl mb-6 select-all border border-white/30 shadow-lg">
                        {ticket.assigned_volunteer_handle}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">This handle is private and only visible to you.</p>
                    </>
                  ) : ticket.status === 'resolved' ? (
                    <>
                      <CheckCircle size={64} className="mb-6 text-success" />
                      <h3 className="font-headline font-black text-2xl mb-2">Case Resolved</h3>
                      <p className="text-sm opacity-70">Your volunteer has marked this case as resolved. Thank you for using Kaagapay.</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={64} className="mb-6 opacity-40" />
                      <h3 className="font-headline font-bold text-xl mb-2">Case Status: {ticket.status.replace('_', ' ')}</h3>
                      <p className="text-sm opacity-70">Please contact the OASH office if you have any questions.</p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-on-surface-variant/40"
            >
              <Search size={80} strokeWidth={1} />
              <p className="mt-4 font-medium italic">Your tracking details will appear here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'pending': return <Clock size={32} className="text-outline" />;
    case 'requested': return <Clock size={32} className="text-secondary animate-pulse" />;
    case 'claimed': return <CheckCircle size={32} className="text-success" />;
    case 'in_progress': return <Loader2 size={32} className="text-primary animate-spin" />;
    default: return <AlertCircle size={32} />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return "text-on-surface-variant";
    case 'requested': return "text-secondary";
    case 'claimed': return "text-success";
    case 'in_progress': return "text-primary";
    case 'resolved': return "text-success";
    default: return "text-on-surface";
  }
}

function TimelineItem({ label, time, done }: { label: string, time: string, done: boolean }) {
  return (
    <div className="relative flex flex-col">
      <div className={cn(
        "absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full border-2",
        done ? "bg-primary border-primary" : "bg-surface border-outline-variant"
      )} />
      <p className={cn("text-sm font-bold", done ? "text-on-surface" : "text-on-surface-variant opacity-40")}>{label}</p>
      <p className="text-[10px] font-medium opacity-60 uppercase tracking-widest">{time}</p>
    </div>
  );
}

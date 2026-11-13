import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Inbox,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ExternalLink,
  ChevronRight,
  Shield,
  MessageCircle,
  X,
  Loader2,
  Bell,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  getRequestedIncidents,
  getPendingIncidents,
  getAssignedIncidents,
  getSpecificIncident,
  claimIncident,
  updateIncidentStatus,
  IncidentTicketResponseDto,
  VolunteerTicketStatus,
} from "@/src/lib/api";
import { supabase } from "@/src/lib/supabase";

const NEXT_STATUS_ACTION: Record<string, { next: VolunteerTicketStatus; label: string }> = {
  claimed: { next: "in_progress", label: "Start Progress" },
  in_progress: { next: "resolved", label: "Mark Resolved" },
  resolved: { next: "closed", label: "Close Case" },
};

export default function VolunteerDashboard() {
  const [requestedTickets, setRequestedTickets] = useState<IncidentTicketResponseDto[]>([]);
  const [pendingTickets, setPendingTickets] = useState<IncidentTicketResponseDto[]>([]);
  const [assignedTickets, setAssignedTickets] = useState<IncidentTicketResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<IncidentTicketResponseDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingCaseId, setUpdatingCaseId] = useState<string | null>(null);

  const [notification, setNotification] = useState<{ id: string; message: string; case_id: string } | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<string>("connecting");

  const refreshQueues = async (token: string) => {
    const sortAsc = (items: IncidentTicketResponseDto[]) =>
      [...items].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const [requested, pending, assigned] = await Promise.all([
      getRequestedIncidents(token),
      getPendingIncidents(token),
      getAssignedIncidents(token),
    ]);
    setRequestedTickets(sortAsc(requested));
    setPendingTickets(sortAsc(pending));
    setAssignedTickets(assigned);
  };

  useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const userId = session?.user?.id;

        if (!token || !userId) {
          setLoading(false);
          setRealtimeStatus("error");
          return;
        }

        // Initial fetch
        await refreshQueues(token);
        setLoading(false);

        // Start Subscription with a unique name to avoid dev collisions
        channel = supabase.channel(`kaagapay-debug-${Math.random()}`);

        channel
          .on('postgres_changes', { event: '*', schema: 'public' }, (payload: any) => {
            console.log('🔥 DATABASE EVENT DETECTED:', payload.eventType, 'on table:', payload.table);

            // Logic for notifications
            if (payload.table === 'notifications' && payload.eventType === 'INSERT') {
              if (String(payload.new.recipient_id).toLowerCase() === String(userId).toLowerCase()) {
                setNotification({
                  id: payload.new.id,
                  message: payload.new.message,
                  case_id: payload.new.case_id
                });
                setTimeout(() => setNotification(null), 60000);
              }
            }

            // Logic for incident tickets
            if (payload.table === 'incident_tickets') {
              // Show toast for new direct assignments
              if (payload.eventType === 'INSERT' && String(payload.new.assigned_volunteer_id).toLowerCase() === String(userId).toLowerCase()) {
                setNotification({
                  id: payload.new.id,
                  message: `New incident assigned: ${payload.new.public_case_id}`,
                  case_id: payload.new.public_case_id
                });
                setTimeout(() => setNotification(null), 60000);
              }
              // Always refresh
              refreshQueues(token).catch((err) => console.error("Error refreshing queues:", err));
            }
          })
          .subscribe((status: string) => {
            console.log('📡 Realtime Status:', status);
            setRealtimeStatus(status === 'SUBSCRIBED' ? 'live' : status.toLowerCase());
          });

      } catch (err) {
        console.error('Setup failed:', err);
        setLoading(false);
        setRealtimeStatus("error");
      }
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const openTicketDetails = async (caseId: string) => {
    try {
      const ticket = await getSpecificIncident(caseId);
      setSelectedTicket(ticket);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    }
  };

  const [claiming, setClaiming] = useState(false);

  const handleAcceptTicket = async () => {
    if (!selectedTicket) return;
    try {
      setClaiming(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert("You must be logged in to claim a ticket.");
        return;
      }

      await claimIncident(selectedTicket.public_case_id, token);
      setIsModalOpen(false);
      await refreshQueues(token);

      alert(`Case ${selectedTicket.public_case_id} successfully claimed!`);
    } catch (error) {
      console.error("Error claiming ticket:", error);
      alert("Failed to claim ticket. It might have already been taken.");
    } finally {
      setClaiming(false);
    }
  };

  const handleAdvanceStatus = async (ticket: IncidentTicketResponseDto) => {
    const transition = NEXT_STATUS_ACTION[ticket.status];
    if (!transition) return;
    try {
      setUpdatingCaseId(ticket.public_case_id);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert("You must be logged in to update a ticket.");
        return;
      }
      const updated = await updateIncidentStatus(ticket.public_case_id, transition.next, token);
      setAssignedTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      if (selectedTicket?.id === updated.id) {
        setSelectedTicket(updated);
      }
    } catch (error: any) {
      console.error("Error updating ticket status:", error);
      alert(error?.message || "Failed to update ticket status.");
    } finally {
      setUpdatingCaseId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 100 }}
            className="fixed bottom-8 right-8 z-[110] w-full max-w-sm"
          >
            <div className="bg-primary text-on-primary p-7 rounded-[2.5rem] shadow-2xl shadow-primary/40 border border-white/20 overflow-hidden relative group editorial-shadow">
              {/* Pulsing Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-2xl"
              />

              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Bell size={28} fill="currentColor" />
                    </motion.div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-70 mb-1 block">New Incident Alert</span>
                    <p className="font-black text-xl leading-tight">{notification.message}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setNotification(null)}
                    className="flex-1 bg-white text-primary py-4 rounded-2xl font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                  >
                    Dismiss Notification
                  </button>
                </div>
              </div>

              {/* Countdown Progress Bar */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 60, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1.5 bg-white/40"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold tracking-widest uppercase mb-4"
          >
            <Shield size={12} fill="currentColor" />
            Volunteer Command Center
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-headline text-primary tracking-tight">
            Case Management
          </h1>
        </div>
        <div className="flex items-center gap-4 bg-surface-container rounded-2xl p-4 border border-outline-variant/10">
          <div className="text-right">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">System Status</p>
            <p className={cn(
              "text-sm font-black flex items-center gap-2",
              realtimeStatus === 'live' ? "text-[#00C853]" : 
              realtimeStatus === 'connecting' ? "text-warning" : "text-error"
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full",
                realtimeStatus === 'live' ? "bg-[#00C853] shadow-[0_0_8px_#00C853] animate-pulse" : 
                realtimeStatus === 'connecting' ? "bg-warning animate-bounce" : "bg-error shadow-[0_0_8px_red]"
              )} />
              {realtimeStatus === 'live' ? 'Live & Connected' : 
               realtimeStatus === 'connecting' ? 'Connecting...' : 'Connection Error'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Requested Tickets */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 editorial-shadow border border-outline-variant/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
                <Inbox className="text-primary" />
                Direct Requests
                <span className="ml-2 text-xs bg-primary text-on-primary px-2 py-0.5 rounded-full">
                  {requestedTickets.length}
                </span>
              </h2>
            </div>

            {requestedTickets.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto opacity-40">
                  <Clock size={32} />
                </div>
                <p className="text-on-surface-variant font-medium">No direct requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requestedTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    isRequested
                    onClick={() => openTicketDetails(ticket.public_case_id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* My Claimed Cases */}
          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 editorial-shadow border border-outline-variant/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
                <CheckCircle className="text-secondary" />
                My Claimed Cases
                <span className="ml-2 text-xs bg-secondary text-on-secondary px-2 py-0.5 rounded-full">
                  {assignedTickets.length}
                </span>
              </h2>
            </div>

            {assignedTickets.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-on-surface-variant font-medium">You have not claimed any cases yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedTickets.map((ticket) => {
                  const transition = NEXT_STATUS_ACTION[ticket.status];
                  const isUpdating = updatingCaseId === ticket.public_case_id;
                  return (
                    <div
                      key={ticket.id}
                      className="p-6 rounded-3xl bg-surface-container-low/60 border border-outline-variant/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <button
                        type="button"
                        onClick={() => openTicketDetails(ticket.public_case_id)}
                        className="text-left space-y-1.5 flex-1 cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-black text-primary">{ticket.public_case_id}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-on-surface">
                          {ticket.demographic} • {ticket.locality}
                        </p>
                        <p className="text-xs text-on-surface-variant">Involved: {ticket.involved_party}</p>
                      </button>

                      {transition ? (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleAdvanceStatus(ticket)}
                          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-extrabold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 shrink-0"
                        >
                          {isUpdating && <Loader2 size={14} className="animate-spin" />}
                          {isUpdating ? 'Updating...' : transition.label}
                        </button>
                      ) : (
                        <span className="px-4 py-2 rounded-xl bg-[#D9FBE8] text-[#007A3D] text-xs font-extrabold uppercase tracking-wider shrink-0">
                          Completed
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Open Pool */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-surface-container rounded-[2.5rem] p-8 editorial-shadow border border-outline-variant/10">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-3 mb-8 text-on-surface">
              <Users className="text-secondary" />
              Open Cases Pool
            </h2>

            {pendingTickets.length === 0 ? (
              <div className="py-12 text-center opacity-60">
                <p className="text-sm font-bold uppercase tracking-widest">Pool is currently empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => openTicketDetails(ticket.public_case_id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Guidelines Card */}
          <div className="bg-primary text-on-primary rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-headline text-xl font-bold mb-4">Response Protocol</h3>
              <ul className="space-y-3 text-sm opacity-90 font-medium">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="shrink-0" />
                  Accept requests within 15 minutes.
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="shrink-0" />
                  Initiate contact via secure handle.
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="shrink-0" />
                  Maintain absolute confidentiality.
                </li>
              </ul>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield size={100} />
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
              className="relative w-full max-w-2xl bg-surface rounded-[3rem] shadow-2xl overflow-hidden border border-outline-variant/20"
            >
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary mb-2 block">Case Incident Report</span>
                    <h2 className="text-3xl font-black font-headline text-on-surface">{selectedTicket.public_case_id}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Demographic</p>
                    <p className="font-bold text-lg">{selectedTicket.demographic}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Locality</p>
                    <p className="font-bold text-lg">{selectedTicket.locality}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Involved Parties</p>
                    <p className="font-bold text-lg">{selectedTicket.involved_party}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</p>
                    <p className="font-bold text-lg text-primary capitalize">{selectedTicket.status}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Reported At</p>
                    <p className="font-bold text-lg">
                      {new Date(selectedTicket.created_at).toLocaleString([], {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-outline-variant/10 flex gap-4">
                  {(selectedTicket.status === 'pending' || selectedTicket.status === 'requested') && (
                    <button
                      onClick={handleAcceptTicket}
                      disabled={claiming}
                      className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-black text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {claiming ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                      {claiming ? "Claiming..." : "Accept Ticket"}
                    </button>
                  )}
                  {NEXT_STATUS_ACTION[selectedTicket.status] && (
                    <button
                      onClick={() => handleAdvanceStatus(selectedTicket)}
                      disabled={updatingCaseId === selectedTicket.public_case_id}
                      className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-black text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {updatingCaseId === selectedTicket.public_case_id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <CheckCircle size={20} />
                      )}
                      {updatingCaseId === selectedTicket.public_case_id
                        ? "Updating..."
                        : NEXT_STATUS_ACTION[selectedTicket.status].label}
                    </button>
                  )}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-4 bg-surface-container text-on-surface font-bold rounded-2xl hover:bg-surface-container-high transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TicketCard({
  ticket,
  isRequested = false,
  onClick
}: {
  ticket: IncidentTicketResponseDto;
  isRequested?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "group p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between",
        isRequested
          ? "bg-surface border-primary/20 hover:border-primary hover:shadow-md"
          : "bg-surface-container-low border-transparent hover:border-outline-variant/30 hover:bg-surface-container-lowest"
      )}
    >
      <div className="flex items-center gap-5">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
          isRequested ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
        )}>
          {isRequested ? <AlertCircle size={20} /> : <Inbox size={20} />}
        </div>
        <div>
          <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">
            {ticket.public_case_id}
          </h4>
          <p className="text-xs text-on-surface-variant font-medium">
            {ticket.locality} • {ticket.demographic}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Created</p>
          <p className="text-xs font-bold text-on-surface">
            {new Date(ticket.created_at).toLocaleString([], {
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <ChevronRight size={20} className="text-outline group-hover:text-primary transition-all group-hover:translate-x-1" />
      </div>
    </motion.div>
  );
}

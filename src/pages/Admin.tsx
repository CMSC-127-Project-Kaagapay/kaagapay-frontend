import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingDown, 
  CheckCircle, 
  AlertCircle, 
  Verified, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  FileText,
  Lock,
  Inbox,
  Clock,
  Loader2,
  Eye,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getAuthToken } from '@/src/lib/auth'; // Import getAuthToken from auth.ts
import { 
  getVolunteerApplications, 
  approveVolunteerApplication, 
  rejectVolunteerApplication,
  getAdminTicketsByStatus,
  AdminTicketStatus,
  IncidentTicketResponseDto,
  VolunteerApplicationResponseDto // Import DTO from api.ts
} from '@/src/lib/api'; // Import API functions from api.ts

const ADMIN_TICKET_STATUSES: AdminTicketStatus[] = ['pending', 'claimed', 'in_progress', 'resolved', 'closed'];

function isAdminTicketStatus(value: string | undefined): value is AdminTicketStatus {
  return ADMIN_TICKET_STATUSES.includes(value as AdminTicketStatus);
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Not recorded';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getTicketStatusClasses(status: string) {
  switch (status) {
    case 'pending':
      return {
        text: 'text-secondary',
        dot: 'bg-secondary',
        pill: 'bg-secondary-container text-on-secondary-container',
      };
    case 'claimed':
      return {
        text: 'text-primary',
        dot: 'bg-primary',
        pill: 'bg-primary/10 text-primary',
      };
    case 'in_progress':
      return {
        text: 'text-[#7C5800]',
        dot: 'bg-[#F2B705]',
        pill: 'bg-[#FFF3C4] text-[#7C5800]',
      };
    case 'resolved':
      return {
        text: 'text-[#007A3D]',
        dot: 'bg-[#00A856]',
        pill: 'bg-[#D9FBE8] text-[#007A3D]',
      };
    case 'closed':
      return {
        text: 'text-on-surface-variant',
        dot: 'bg-outline',
        pill: 'bg-surface-container-high text-on-surface-variant',
      };
    default:
      return {
        text: 'text-on-surface-variant',
        dot: 'bg-outline',
        pill: 'bg-surface-container-high text-on-surface-variant',
      };
  }
}

export default function Admin() {
  const navigate = useNavigate();
  const { ticketStatus } = useParams<{ ticketStatus?: string }>();
  const selectedTicketStatus = isAdminTicketStatus(ticketStatus) ? ticketStatus : 'pending';
  const [volunteerApplications, setVolunteerApplications] = useState<VolunteerApplicationResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<IncidentTicketResponseDto[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState<boolean>(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<VolunteerApplicationResponseDto | null>(null);

  useEffect(() => {
    if (ticketStatus && !isAdminTicketStatus(ticketStatus)) {
      navigate('/admin/tickets/pending', { replace: true });
    }
  }, [navigate, ticketStatus]);

  useEffect(() => {
    async function fetchVolunteerApplications() {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          setError("Authentication token not found. Please log in as an administrator.");
          setLoading(false);
          return;
        }

        const data = await getVolunteerApplications(token); // Use the API function
        setVolunteerApplications(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVolunteerApplications();
  }, []);

  useEffect(() => {
    async function fetchTickets() {
      setTicketsLoading(true);
      setTicketsError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          setTicketsError("Authentication token not found. Please log in as an administrator.");
          setTicketsLoading(false);
          return;
        }

        const data = await getAdminTicketsByStatus(selectedTicketStatus, token);
        setTickets([...data].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      } catch (err: any) {
        setTicketsError(err.message);
      } finally {
        setTicketsLoading(false);
      }
    }

    fetchTickets();
  }, [selectedTicketStatus]);

  useEffect(() => {
    if (!selectedApplication) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedApplication(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedApplication]);

  const handleAction = async (application_id: string, action: 'approve' | 'reject') => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Authentication token not found. Please log in as an administrator.");
        return;
      }

      if (action === 'approve') {
        await approveVolunteerApplication(application_id, token); // Use the API function
      } else {
        await rejectVolunteerApplication(application_id, token); // Use the API function
      }

      // Update the status of the application in the local state
      setVolunteerApplications(prevApps =>
        prevApps.map(app =>
          app.application_id === application_id ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' } : app
        )
      );
      setSelectedApplication(prevApplication =>
        prevApplication?.application_id === application_id
          ? { ...prevApplication, status: action === 'approve' ? 'approved' : 'rejected' }
          : prevApplication
      );
    } catch (err: any) {
      alert(`Error ${action}ing application: ${err.message}`);
    }
  };

  const handleApprove = (application_id: string) => handleAction(application_id, 'approve');
  const handleReject = (application_id: string) => handleAction(application_id, 'reject');

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-12">
      {/* Admin Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold font-headline text-primary tracking-tight mb-2">Administrative Dashboard</h1>
          <p className="text-on-surface-variant text-lg">Secure monitoring and management of campus safety reports. Data shown is anonymized and follows strict privacy protocols.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl text-sm font-bold border border-outline-variant/15">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-on-surface-variant">System Online</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl text-sm font-bold border border-outline-variant/15">
            <Lock size={14} className="text-primary" />
            <span className="text-on-surface-variant">Admin Session Active</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Active Reports */}
        <div className="p-8 bg-surface-container-lowest editorial-shadow rounded-[2.5rem] border border-outline-variant/10 flex flex-col justify-between min-h-[240px]">
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="text-primary" size={28} />
            </div>
            <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Active Reports</h3>
            <p className="text-5xl font-extrabold font-headline text-on-surface mt-2">14</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-secondary text-sm font-bold">
            <TrendingDown size={14} />
            -12% from last month
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="p-8 bg-surface-container-lowest editorial-shadow rounded-[2.5rem] border border-outline-variant/10 flex flex-col justify-between min-h-[240px]">
          <div>
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
              <Verified className="text-secondary" size={28} />
            </div>
            <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Resolution Rate</h3>
            <p className="text-5xl font-extrabold font-headline text-on-surface mt-2">92%</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-primary text-sm font-bold">
            <CheckCircle size={14} />
            Average 4.2 days
          </div>
        </div>

        {/* Incident Trends Chart */}
        <div className="md:col-span-1 lg:col-span-2 p-8 bg-surface-container-lowest editorial-shadow rounded-[2.5rem] border border-outline-variant/10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Incident Trends</h3>
              <p className="text-on-surface text-sm font-medium">6-month anonymized distribution</p>
            </div>
            <select className="bg-surface-container-low border-none rounded-lg text-xs font-bold focus:ring-secondary px-3 py-1.5">
              <option>Monthly</option>
              <option>Quarterly</option>
            </select>
          </div>
          <div className="h-32 flex items-end gap-3 w-full px-4">
            {[40, 65, 85, 55, 45, 30].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className="bg-primary/20 w-full rounded-t-xl transition-all hover:bg-primary cursor-pointer relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-on-surface-variant font-bold px-2 uppercase tracking-widest">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
      </div>

      <section className="bg-surface-container-low rounded-[3rem] p-1 border border-outline-variant/10 overflow-hidden">
        <div className="bg-surface-container-lowest rounded-[3rem] p-10 editorial-shadow">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-bold font-headline text-on-surface">Incident Tickets</h2>
              <p className="text-on-surface-variant text-sm font-medium mt-1">
                Viewing {formatStatus(selectedTicketStatus)} reports from the admin ticket queue.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ADMIN_TICKET_STATUSES.map((status) => {
                const statusClasses = getTicketStatusClasses(status);
                const isSelected = selectedTicketStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => navigate(`/admin/tickets/${status}`)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                      isSelected
                        ? statusClasses.pill
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", statusClasses.dot)} />
                    {formatStatus(status)}
                  </button>
                );
              })}
            </div>
          </div>

          {ticketsLoading && (
            <div className="py-16 flex items-center justify-center gap-3 text-on-surface-variant font-bold">
              <Loader2 className="animate-spin text-primary" size={20} />
              Loading {formatStatus(selectedTicketStatus)} tickets...
            </div>
          )}

          {!ticketsLoading && ticketsError && (
            <p className="py-12 text-error text-center font-medium">{ticketsError}</p>
          )}

          {!ticketsLoading && !ticketsError && tickets.length === 0 && (
            <div className="py-16 text-center space-y-4">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto opacity-50">
                <Inbox size={32} />
              </div>
              <p className="text-on-surface-variant font-medium">
                No {formatStatus(selectedTicketStatus)} incident tickets found.
              </p>
            </div>
          )}

          {!ticketsLoading && !ticketsError && tickets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                    <th className="px-6 pb-2">Case ID</th>
                    <th className="px-6 pb-2">Locality</th>
                    <th className="px-6 pb-2">Demographic</th>
                    <th className="px-6 pb-2">Routing</th>
                    <th className="px-6 pb-2">Volunteer</th>
                    <th className="px-6 pb-2">Status</th>
                    <th className="px-6 pb-2 text-right">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => {
                    const statusClasses = getTicketStatusClasses(ticket.status);
                    return (
                      <tr key={ticket.id} className="bg-surface-container-low transition-all hover:bg-white group">
                        <td className="px-6 py-6 rounded-l-3xl font-bold text-primary">{ticket.public_case_id}</td>
                        <td className="px-6 py-6 text-on-surface font-semibold">{ticket.locality}</td>
                        <td className="px-6 py-6 text-on-surface-variant font-medium">{ticket.demographic}</td>
                        <td className="px-6 py-6 text-on-surface-variant font-medium capitalize">{formatStatus(ticket.routing_type)}</td>
                        <td className="px-6 py-6 text-on-surface-variant font-medium max-w-xs truncate">
                          {ticket.assigned_volunteer_handle || ticket.assigned_volunteer_id || 'Unassigned'}
                        </td>
                        <td className="px-6 py-6">
                          <span className={cn("flex items-center gap-2 font-bold text-sm capitalize", statusClasses.text)}>
                            <span className={cn("w-2 h-2 rounded-full", statusClasses.dot)}></span>
                            {formatStatus(ticket.status)}
                          </span>
                        </td>
                        <td className="px-6 py-6 rounded-r-3xl text-right text-on-surface font-semibold whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-2">
                            <Clock size={14} className="text-outline" />
                            {new Date(ticket.created_at).toLocaleString([], {
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {loading && <p className="text-on-surface-variant text-center">Loading volunteer applications...</p>}
      {error && <p className="text-error text-center">{error}</p>}

      {!loading && !error && volunteerApplications.length === 0 && (
        <p className="text-on-surface-variant text-center">No volunteer applications pending review.</p>
      )}

      {!loading && !error && volunteerApplications.length > 0 && (
        <section className="bg-surface-container-low rounded-[3rem] p-1 border border-outline-variant/10 overflow-hidden">
          <div className="bg-surface-container-lowest rounded-[3rem] p-10 editorial-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <h2 className="text-2xl font-bold font-headline text-on-surface">Volunteer Applications ({volunteerApplications.filter(app => app.status === 'pending').length} pending)</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                    <th className="px-6 pb-2">Applicant</th>
                    <th className="px-6 pb-2">Email</th>
                    <th className="px-6 pb-2">Motivation</th>
                    <th className="px-6 pb-2">Status</th>
                    <th className="px-6 pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteerApplications.map((app) => (
                    <tr
                      key={app.application_id}
                      onClick={() => setSelectedApplication(app)}
                      className="bg-surface-container-low transition-all hover:bg-white group cursor-pointer"
                    >
                      <td className="px-6 py-6 rounded-l-3xl font-bold text-primary">{`${app.first_name} ${app.last_name} (${app.public_alias})`}</td>
                      <td className="px-6 py-6 text-on-surface font-semibold">{app.email}</td>
                      <td className="px-6 py-6 text-on-surface-variant font-medium max-w-xs truncate">{app.motivation}</td>
                      <td className="px-6 py-6">
                        <span className={cn(
                          "flex items-center gap-2 font-bold text-sm",
                          app.status === 'pending' ? "text-secondary" : app.status === 'approved' ? "text-primary" : "text-error"
                        )}>
                          <span className={cn("w-2 h-2 rounded-full", 
                            app.status === 'pending' ? "bg-secondary" : app.status === 'approved' ? "bg-primary" : "bg-error"
                          )}></span>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 rounded-r-3xl text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedApplication(app);
                            }}
                            className="p-2 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-secondary hover:text-white transition-colors"
                            title="View application details"
                          >
                            <Eye size={20} />
                          </button>
                          {app.status === 'pending' && (
                            <>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleApprove(app.application_id);
                              }}
                              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleReject(app.application_id);
                              }}
                              className="p-2 rounded-full bg-error/10 text-error hover:bg-error hover:text-white transition-colors"
                              title="Reject"
                            >
                              <AlertCircle size={20} />
                            </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Removed "View All Active Reports" button as it's not relevant here */}
          </div>
        </section>
      )}

      {selectedApplication && createPortal(
        <div
          className="fixed inset-0 z-[100] flex min-h-dvh w-screen items-center justify-center bg-on-surface/45 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-details-title"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[2rem] bg-surface-container-lowest editorial-shadow border border-outline-variant/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6 border-b border-outline-variant/20 px-8 py-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Volunteer Application</p>
                <h3 id="application-details-title" className="text-2xl font-bold font-headline text-on-surface">
                  {selectedApplication.first_name} {selectedApplication.last_name}
                </h3>
                <p className="text-sm font-semibold text-primary mt-1">@{selectedApplication.public_alias}</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-2 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                title="Close application details"
              >
                <X size={22} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-196px)] px-8 py-6 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-70">Email</p>
                  <p className="mt-1 font-semibold text-on-surface break-all">{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-70">External Handle</p>
                  <p className="mt-1 font-semibold text-on-surface break-all">{selectedApplication.external_handle || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-70">Submitted</p>
                  <p className="mt-1 font-semibold text-on-surface">{formatDateTime(selectedApplication.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-70">Last Updated</p>
                  <p className="mt-1 font-semibold text-on-surface">{formatDateTime(selectedApplication.updated_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-70 mb-3">Status</p>
                <span className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold capitalize",
                  selectedApplication.status === 'pending'
                    ? "bg-secondary-container text-on-secondary-container"
                    : selectedApplication.status === 'approved'
                      ? "bg-primary/10 text-primary"
                      : "bg-error/10 text-error"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    selectedApplication.status === 'pending' ? "bg-secondary" : selectedApplication.status === 'approved' ? "bg-primary" : "bg-error"
                  )}></span>
                  {selectedApplication.status}
                </span>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-70 mb-3">Motivation</p>
                <div className="rounded-3xl bg-surface-container-low p-6 text-on-surface-variant font-medium leading-7 whitespace-pre-wrap break-words">
                  {selectedApplication.motivation}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-outline-variant/20 px-8 py-5 bg-surface-container-low">
              <p className="text-xs font-semibold text-on-surface-variant">
                Application ID: <span className="font-mono break-all">{selectedApplication.application_id}</span>
              </p>
              {selectedApplication.status === 'pending' && (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleReject(selectedApplication.application_id)}
                    className="px-5 py-3 rounded-xl bg-error/10 text-error font-black text-sm hover:bg-error hover:text-white transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApplication.application_id)}
                    className="px-5 py-3 rounded-xl bg-primary text-white font-black text-sm hover:opacity-90 transition-opacity"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Administrative Toolkit */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-headline text-on-surface">Administrative Toolkit</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: 'Policy Manager', desc: 'Update campus safety protocols and internal OASH operational guidelines.', color: 'primary' },
            { icon: Users, title: 'Volunteer Oversight', desc: 'Manage counselor credentials, training schedules, and active duty rosters.', color: 'secondary' },
            { icon: BarChart3, title: 'Detailed Analytics', desc: 'Generate comprehensive annual safety reports for university board review.', color: 'tertiary' },
          ].map((tool, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8 }}
              className="group p-1 rounded-[3rem] hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="bg-surface-container-low p-10 rounded-[3rem] h-full border border-outline-variant/15 group-hover:border-primary/20 transition-all flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <tool.icon className={cn(
                    tool.color === 'primary' ? "text-primary" : tool.color === 'secondary' ? "text-secondary" : "text-tertiary"
                  )} size={32} />
                </div>
                <h4 className="text-xl font-bold font-headline text-on-surface mb-3">{tool.title}</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">{tool.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

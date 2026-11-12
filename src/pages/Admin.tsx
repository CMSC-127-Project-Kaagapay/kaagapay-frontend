import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingDown, 
  TrendingUp,
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
  X,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import ConfirmDeleteDialog from '@/src/components/ConfirmDeleteDialog';
import TicketFilters from '@/src/components/TicketFilters';
import Pagination from '@/src/components/Pagination';
import { getAuthToken } from '@/src/lib/auth'; // Import getAuthToken from auth.ts
import { 
  getVolunteerApplications, 
  approveVolunteerApplication, 
  rejectVolunteerApplication,
  getAdminTicketsByStatus,
  getDeletedAdminTickets,
  getVolunteers,
  deleteAdminTicket,
  restoreAdminTicket,
  getAdminStats,
  AdminStats,
  AdminTicketStatus,
  IncidentTicketResponseDto,
  DeletedTicketResponseDto,
  VolunteerApplicationResponseDto // Import DTO from api.ts
} from '@/src/lib/api'; // Import API functions from api.ts

// 'requested' = a report sent to one chosen volunteer, who has 15 minutes to accept before it returns to 'pending'.
const ADMIN_TICKET_STATUSES: AdminTicketStatus[] = ['pending', 'requested', 'claimed', 'in_progress', 'resolved', 'closed'];

type AdminTicketView = AdminTicketStatus | 'deleted';

function isAdminTicketView(value: string | undefined): value is AdminTicketView {
  return value === 'deleted' || ADMIN_TICKET_STATUSES.includes(value as AdminTicketStatus);
}

const TICKETS_PAGE_SIZE = 25;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDay(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
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
  const selectedTicketStatus: AdminTicketView = isAdminTicketView(ticketStatus) ? ticketStatus : 'pending';
  const isDeletedView = selectedTicketStatus === 'deleted';
  const [searchParams, setSearchParams] = useSearchParams();
  const volunteerFilter = searchParams.get('volunteer') ?? '';
  const rawFrom = searchParams.get('from') ?? '';
  const rawTo = searchParams.get('to') ?? '';
  const dateFrom = ISO_DATE.test(rawFrom) ? rawFrom : '';
  const dateTo = ISO_DATE.test(rawTo) ? rawTo : '';
  const dateError = dateFrom && dateTo && dateFrom > dateTo ? 'The end date must be on or after the start date.' : null;
  const pageParam = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const currentPage = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;
  const hasActiveFilters = Boolean(volunteerFilter || dateFrom || dateTo);
  const [totalTickets, setTotalTickets] = useState(0);
  const [volunteerOptions, setVolunteerOptions] = useState<{ id: string; name: string }[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const loadedStatusRef = useRef<AdminTicketView | null>(null);
  const [volunteerApplications, setVolunteerApplications] = useState<VolunteerApplicationResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<DeletedTicketResponseDto[] | IncidentTicketResponseDto[]>([]);
  const [ticketToDelete, setTicketToDelete] = useState<IncidentTicketResponseDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [ticketNotice, setTicketNotice] = useState<{ text: string; failed: boolean } | null>(null);
  const ticketsHeadingRef = useRef<HTMLHeadingElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [ticketsLoading, setTicketsLoading] = useState<boolean>(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<VolunteerApplicationResponseDto | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [trendMode, setTrendMode] = useState<'monthly' | 'quarterly'>('monthly');

  useEffect(() => {
    if (ticketStatus && !isAdminTicketView(ticketStatus)) {
      navigate('/admin/tickets/pending', { replace: true });
    }
  }, [navigate, ticketStatus]);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const token = getAuthToken();
        if (!token) return;
        const data = await getAdminStats(token);
        if (isMounted) setStats(data);
      } catch (err: any) {
        if (isMounted) setStatsError(err.message || 'Failed to load stats');
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    }
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

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
    getVolunteers()
      .then((list) =>
        setVolunteerOptions(
          list
            .map((v) => ({ id: v.id, name: `${v.first_name} ${v.last_name}`.trim() || v.external_handle }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        ),
      )
      .catch(() => setVolunteerOptions([]));
  }, []);

  useEffect(() => {
    if (dateError) return; // The error is shown next to the date fields; don't query with a reversed range.
    let cancelled = false;

    async function fetchTickets() {
      // Keep current rows visible while refetching the same queue; clear them when the queue itself changes.
      if (loadedStatusRef.current !== selectedTicketStatus) {
        setTickets([]);
        setTotalTickets(0);
        loadedStatusRef.current = selectedTicketStatus;
      }
      setTicketsLoading(true);
      setTicketsError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          setTicketsError("Authentication token not found. Please log in as an administrator.");
          return;
        }

        if (selectedTicketStatus === 'deleted') {
          const deleted = await getDeletedAdminTickets(token);
          if (cancelled) return;
          setTickets(deleted);
          setTotalTickets(deleted.length);
        } else {
          const result = await getAdminTicketsByStatus(selectedTicketStatus, token, {
            volunteerId: volunteerFilter || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            page: currentPage,
            pageSize: TICKETS_PAGE_SIZE,
          });
          if (cancelled) return;
          const lastPage = Math.max(1, Math.ceil(result.total / TICKETS_PAGE_SIZE));
          if (result.items.length === 0 && result.total > 0 && currentPage > lastPage) {
            // The last row on this page was removed; step back to the new last page.
            updateParams({ page: lastPage === 1 ? '' : String(lastPage) });
            return;
          }
          setTickets(result.items);
          setTotalTickets(result.total);
        }
      } catch (err: any) {
        if (!cancelled) setTicketsError(err.message);
      } finally {
        if (!cancelled) setTicketsLoading(false);
      }
    }

    fetchTickets();
    return () => {
      cancelled = true;
    };
  }, [selectedTicketStatus, volunteerFilter, dateFrom, dateTo, currentPage, reloadKey, dateError]);

  // Read the address bar as it is right now. Two filter changes can land before React re-renders
  // (a date picker or autofill setting both dates), and the render's copy of the params would drop the first.
  const liveParams = () => new URLSearchParams(window.location.search);

  function updateParams(changes: Record<string, string>, resetPage = false) {
    const next = liveParams();
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (resetPage) next.delete('page');
    setSearchParams(next);
  }

  const clearFilters = () => {
    const next = liveParams();
    ['volunteer', 'from', 'to', 'page'].forEach((key) => next.delete(key));
    setSearchParams(next);
  };

  const goToQueue = (view: AdminTicketView) => {
    const next = liveParams();
    next.delete('page'); // keep the volunteer and date filters, start the new queue on page 1
    const query = view === 'deleted' ? '' : next.toString();
    navigate(`/admin/tickets/${view}${query ? `?${query}` : ''}`);
  };

  useEffect(() => {
    setTicketNotice(null);
  }, [selectedTicketStatus]);

  const handleDeleteTicket = async (reason: string) => {
    if (!ticketToDelete) return;
    const token = getAuthToken();
    if (!token) {
      setDeleteError('Sign in again as an administrator.');
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const deleted = await deleteAdminTicket(ticketToDelete.public_case_id, token, reason);
      setReloadKey((key) => key + 1);
      setTicketNotice({
        text: deleted.purge_at
          ? `Ticket ${ticketToDelete.public_case_id} deleted. You can restore it until ${formatDate(deleted.purge_at)}.`
          : `Ticket ${ticketToDelete.public_case_id} deleted.`,
        failed: false,
      });
      setTicketToDelete(null);
      // The row (and its Delete button) is gone, so send focus to the section heading.
      requestAnimationFrame(() => ticketsHeadingRef.current?.focus());
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    setTicketToDelete(null);
    setDeleteError(null);
    requestAnimationFrame(() => deleteTriggerRef.current?.focus());
  };

  const handleRestoreTicket = async (ticket: IncidentTicketResponseDto) => {
    const token = getAuthToken();
    if (!token) {
      setTicketNotice({ text: 'Sign in again as an administrator.', failed: true });
      return;
    }
    try {
      await restoreAdminTicket(ticket.public_case_id, token);
      setReloadKey((key) => key + 1);
      setTicketNotice({ text: `Ticket ${ticket.public_case_id} restored.`, failed: false });
      requestAnimationFrame(() => ticketsHeadingRef.current?.focus());
    } catch (err: any) {
      setTicketNotice({ text: `Could not restore ${ticket.public_case_id}: ${err.message}`, failed: true });
    }
  };

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

  const filterParts = [
    volunteerFilter ? (volunteerOptions.find((v) => v.id === volunteerFilter)?.name ?? 'that volunteer') : '',
    dateFrom && dateTo ? `${formatDay(dateFrom)} to ${formatDay(dateTo)}` : dateFrom ? `from ${formatDay(dateFrom)}` : dateTo ? `up to ${formatDay(dateTo)}` : '',
  ].filter(Boolean);
  const noMatchMessage = `No ${formatStatus(selectedTicketStatus)} tickets for ${filterParts.join(', ')}.`;

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
      setReloadKey((k) => k + 1);
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

      {/* Stats Grid - 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Reports */}
        <div className="p-8 bg-surface-container-lowest editorial-shadow rounded-[2.5rem] border border-outline-variant/10 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="text-primary" size={28} />
            </div>
            <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Active Reports</h3>
            <p className="text-5xl font-extrabold font-headline text-on-surface mt-2">
              {statsLoading && !stats ? (
                <Loader2 className="animate-spin text-primary/40" size={36} />
              ) : (
                stats?.active_reports ?? 0
              )}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-secondary text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse"></span>
            <span>{stats?.pending_reports ?? 0} pending claim</span>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="p-8 bg-surface-container-lowest editorial-shadow rounded-[2.5rem] border border-outline-variant/10 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
              <Verified className="text-secondary" size={28} />
            </div>
            <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Resolution Rate</h3>
            <p className="text-5xl font-extrabold font-headline text-on-surface mt-2">
              {statsLoading && !stats ? (
                <Loader2 className="animate-spin text-secondary/40" size={36} />
              ) : (
                `${stats?.resolution_rate ?? 0}%`
              )}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-primary text-sm font-bold">
            <CheckCircle size={14} />
            <span>
              {stats ? `${stats.resolved_tickets} of ${stats.total_tickets} cases resolved` : '0 of 0 resolved'}
            </span>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="p-8 bg-surface-container-lowest editorial-shadow rounded-[2.5rem] border border-outline-variant/10 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="w-12 h-12 bg-[#7C5800]/10 rounded-2xl flex items-center justify-center mb-6">
              <FileText className="text-[#7C5800]" size={28} />
            </div>
            <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Pending Applications</h3>
            <p className="text-5xl font-extrabold font-headline text-on-surface mt-2">
              {statsLoading && !stats ? (
                <Loader2 className="animate-spin text-[#7C5800]/40" size={36} />
              ) : (
                stats?.pending_applications ?? 0
              )}
            </p>
          </div>
          <a
            href="#volunteer-applications"
            className="mt-4 flex items-center gap-2 text-[#7C5800] text-sm font-bold hover:underline"
          >
            <Clock size={14} />
            <span>Awaiting admin review</span>
          </a>
        </div>

        {/* Active Volunteers */}
        <div className="p-8 bg-surface-container-lowest editorial-shadow rounded-[2.5rem] border border-outline-variant/10 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Users className="text-primary" size={28} />
            </div>
            <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Active Volunteers</h3>
            <p className="text-5xl font-extrabold font-headline text-on-surface mt-2">
              {statsLoading && !stats ? (
                <Loader2 className="animate-spin text-primary/40" size={36} />
              ) : (
                stats?.active_volunteers ?? 0
              )}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-secondary text-sm font-bold">
            <ShieldCheck size={14} />
            <span>Ready to claim cases</span>
          </div>
        </div>
      </div>

      {/* Incident Trends Section */}
      <div className="p-8 bg-surface-container-lowest editorial-shadow rounded-[2.5rem] border border-outline-variant/10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-8">
          <div>
            <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Incident Trends</h3>
            <p className="text-on-surface text-sm font-medium mt-1">
              {trendMode === 'monthly'
                ? '6-month distribution of reported incidents'
                : '4-quarter distribution of reported incidents'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={trendMode}
              onChange={(e) => setTrendMode(e.target.value as 'monthly' | 'quarterly')}
              className="bg-surface-container-low border border-outline-variant/15 rounded-lg text-xs font-bold text-on-surface focus:ring-secondary px-3 py-1.5 cursor-pointer"
            >
              <option value="monthly">Monthly (Last 6 Months)</option>
              <option value="quarterly">Quarterly (Last 4 Quarters)</option>
            </select>
          </div>
        </div>

        {statsError ? (
          <div className="py-12 text-center text-sm text-secondary font-medium">
            Failed to load incident trends.
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="ml-3 underline font-bold hover:opacity-80"
            >
              Retry
            </button>
          </div>
        ) : (
          (() => {
            const currentTrendData =
              trendMode === 'monthly'
                ? (stats?.incident_trends?.monthly ?? [])
                : (stats?.incident_trends?.quarterly ?? []);
            const maxCount = Math.max(1, ...currentTrendData.map((d) => d.count));

            return (
              <div>
                <div className="h-40 flex items-end gap-3 sm:gap-6 w-full px-4">
                  {currentTrendData.map((d, i) => {
                    const percent = d.count === 0 ? 0 : Math.max(10, Math.round((d.count / maxCount) * 100));
                    return (
                      <div key={`${trendMode}-${d.label}-${i}`} className="flex-1 flex flex-col items-center h-full justify-end">
                        <div className="w-full flex items-end justify-center h-full">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: d.count === 0 ? '6px' : `${percent}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className={cn(
                              'w-full max-w-[80px] rounded-t-xl transition-all cursor-pointer relative group',
                              d.count > 0 ? 'bg-primary/25 hover:bg-primary' : 'bg-outline-variant/20 hover:bg-outline-variant/40'
                            )}
                          >
                            <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[11px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md whitespace-nowrap z-10">
                              {d.count} {d.count === 1 ? 'case' : 'cases'}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 text-[11px] text-on-surface-variant font-bold px-4 uppercase tracking-widest">
                  {currentTrendData.map((d, i) => (
                    <span key={`${d.label}-${i}`} className="flex-1 text-center truncate">
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()
        )}
      </div>

      <section className="bg-surface-container-low rounded-[3rem] p-1 border border-outline-variant/10 overflow-hidden">
        <div className="bg-surface-container-lowest rounded-[3rem] p-10 editorial-shadow">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <div>
              <h2 ref={ticketsHeadingRef} tabIndex={-1} className="text-2xl font-bold font-headline text-on-surface">Incident Tickets</h2>
              <p className="text-on-surface-variant text-sm font-medium mt-1">
                {isDeletedView
                  ? 'Viewing deleted tickets. Restore one to put it back in its queue.'
                  : `Viewing ${formatStatus(selectedTicketStatus)} reports from the admin ticket queue.`}
              </p>
              <p
                role={ticketNotice?.failed ? 'alert' : 'status'}
                className={cn('mt-2 text-sm font-semibold text-on-surface', !ticketNotice && 'sr-only')}
              >
                {ticketNotice?.text}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ADMIN_TICKET_STATUSES.map((status) => {
                const statusClasses = getTicketStatusClasses(status);
                const isSelected = selectedTicketStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => goToQueue(status)}
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
              <button
                onClick={() => goToQueue('deleted')}
                aria-current={isDeletedView ? 'page' : undefined}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  isDeletedView
                    ? "bg-surface-container-high text-on-surface"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                )}
              >
                Deleted
              </button>
            </div>
          </div>

          {!isDeletedView && (
            <TicketFilters
              values={{ volunteer: volunteerFilter, from: dateFrom, to: dateTo }}
              volunteers={volunteerOptions}
              dateError={dateError}
              hasActiveFilters={hasActiveFilters}
              onChange={(next) =>
                updateParams(
                  {
                    ...(next.volunteer !== undefined && { volunteer: next.volunteer }),
                    ...(next.from !== undefined && { from: next.from }),
                    ...(next.to !== undefined && { to: next.to }),
                  },
                  true,
                )
              }
              onClear={clearFilters}
            />
          )}

          <p aria-live="polite" className="mb-3 text-sm font-medium text-on-surface-variant tabular-nums">
            {!ticketsLoading && !ticketsError && !dateError && (
              totalTickets === 0
                ? ''
                : isDeletedView
                  ? `${totalTickets} deleted ${totalTickets === 1 ? 'ticket' : 'tickets'}`
                  : `Showing ${(currentPage - 1) * TICKETS_PAGE_SIZE + 1}–${(currentPage - 1) * TICKETS_PAGE_SIZE + tickets.length} of ${totalTickets} ${formatStatus(selectedTicketStatus)} tickets`
            )}
          </p>

          {ticketsLoading && tickets.length === 0 && (
            <div className="py-16 flex items-center justify-center gap-3 text-on-surface-variant font-bold">
              <Loader2 className="animate-spin text-primary" size={20} />
              Loading {formatStatus(selectedTicketStatus)} tickets...
            </div>
          )}

          {!ticketsLoading && ticketsError && (
            <div className="py-12 text-center space-y-3">
              <p className="text-on-surface font-medium">Could not load tickets: {ticketsError}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="min-h-11 px-4 text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Try again
              </button>
            </div>
          )}

          {!ticketsLoading && !ticketsError && !dateError && tickets.length === 0 && (
            <div className="py-16 text-center space-y-4">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto opacity-50">
                <Inbox size={32} />
              </div>
              <p className="text-on-surface-variant font-medium">
                {isDeletedView
                  ? 'No deleted tickets.'
                  : hasActiveFilters
                    ? noMatchMessage
                    : `No ${formatStatus(selectedTicketStatus)} incident tickets found.`}
              </p>
              {hasActiveFilters && !isDeletedView && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-11 px-4 text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!ticketsError && tickets.length > 0 && (
            <div className="overflow-x-auto" aria-busy={ticketsLoading}>
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                    <th className="px-6 pb-2">Case ID</th>
                    <th className="px-6 pb-2">Locality</th>
                    <th className="px-6 pb-2">Demographic</th>
                    <th className="px-6 pb-2">Routing</th>
                    <th className="px-6 pb-2">Volunteer</th>
                    <th className="px-6 pb-2">Status</th>
                    <th className="px-6 pb-2 text-right">{isDeletedView ? 'Deleted' : 'Created'}</th>
                    <th className="px-6 pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(tickets as DeletedTicketResponseDto[]).map((ticket) => {
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
                        <td className="px-6 py-6 text-right text-on-surface font-semibold whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-2">
                            <Clock size={14} className="text-outline" />
                            {new Date(isDeletedView && ticket.deleted_at ? ticket.deleted_at : ticket.created_at).toLocaleString([], {
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {isDeletedView && ticket.purge_at && (
                            <p className="text-xs font-medium text-on-surface-variant">Restore until {formatDate(ticket.purge_at)}</p>
                          )}
                          {isDeletedView && ticket.deleted_reason && (
                            <p className="text-xs font-medium text-on-surface-variant max-w-48 truncate" title={ticket.deleted_reason}>
                              {ticket.deleted_reason}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-6 rounded-r-3xl text-right whitespace-nowrap">
                          {isDeletedView ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreTicket(ticket)}
                              aria-label={`Restore ticket ${ticket.public_case_id}`}
                              className="min-h-11 px-3 text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(event) => {
                                deleteTriggerRef.current = event.currentTarget;
                                setDeleteError(null);
                                setTicketToDelete(ticket);
                              }}
                              aria-label={`Delete ticket ${ticket.public_case_id}`}
                              className="min-h-11 px-3 text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!isDeletedView && !ticketsError && (
            <Pagination
              page={currentPage}
              totalPages={Math.max(1, Math.ceil(totalTickets / TICKETS_PAGE_SIZE))}
              onPageChange={(page) => updateParams({ page: page === 1 ? '' : String(page) })}
              label="Ticket pages"
            />
          )}
        </div>
      </section>

      {ticketToDelete && (
        <ConfirmDeleteDialog
          caseId={ticketToDelete.public_case_id}
          submitting={deleting}
          error={deleteError}
          onConfirm={handleDeleteTicket}
          onCancel={closeDeleteDialog}
        />
      )}

      {loading && <p className="text-on-surface-variant text-center">Loading volunteer applications...</p>}
      {error && <p className="text-error text-center">{error}</p>}

      {!loading && !error && volunteerApplications.length === 0 && (
        <p className="text-on-surface-variant text-center">No volunteer applications pending review.</p>
      )}

      {!loading && !error && volunteerApplications.length > 0 && (
        <section id="volunteer-applications" className="bg-surface-container-low rounded-[3rem] p-1 border border-outline-variant/10 overflow-hidden">
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

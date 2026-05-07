import React, { useState, useEffect } from 'react';
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
  Lock
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getAuthToken } from '@/src/lib/auth'; // Import getAuthToken from auth.ts
import { 
  getVolunteerApplications, 
  approveVolunteerApplication, 
  rejectVolunteerApplication,
  VolunteerApplicationResponseDto // Import DTO from api.ts
} from '@/src/lib/api'; // Import API functions from api.ts

export default function Admin() {
  const [volunteerApplications, setVolunteerApplications] = useState<VolunteerApplicationResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
                    <tr key={app.application_id} className="bg-surface-container-low transition-all hover:bg-white group cursor-pointer">
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
                        {app.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleApprove(app.application_id)}
                              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleReject(app.application_id)}
                              className="p-2 rounded-full bg-error/10 text-error hover:bg-error hover:text-white transition-colors"
                              title="Reject"
                            >
                              <AlertCircle size={20} />
                            </button>
                          </div>
                        )}
                        {app.status !== 'pending' && (
                          <span className="text-on-surface-variant text-sm font-medium">Actioned</span>
                        )}
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

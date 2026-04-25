import React from 'react';
import { motion } from 'motion/react';
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

export default function Admin() {
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

      {/* Action Required Table */}
      <section className="bg-surface-container-low rounded-[3rem] p-1 border border-outline-variant/10 overflow-hidden">
        <div className="bg-surface-container-lowest rounded-[3rem] p-10 editorial-shadow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <h2 className="text-2xl font-bold font-headline text-on-surface">Action Required</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full">New (3)</span>
              <span className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full">In Progress (8)</span>
              <span className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full">Flagged (1)</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                  <th className="px-6 pb-2">Case ID</th>
                  <th className="px-6 pb-2">Category</th>
                  <th className="px-6 pb-2">Submission Date</th>
                  <th className="px-6 pb-2">Status</th>
                  <th className="px-6 pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: '#UM-2024-089', cat: 'Harassment Incident', date: 'Oct 24, 2024', status: 'In Progress', color: 'secondary' },
                  { id: '#UM-2024-092', cat: 'Academic Grievance', date: 'Oct 26, 2024', status: 'Unassigned', color: 'tertiary' },
                  { id: '#UM-2024-094', cat: 'Safe Space Violation', date: 'Oct 27, 2024', status: 'Urgent', color: 'error' },
                ].map((row, i) => (
                  <tr key={i} className="bg-surface-container-low transition-all hover:bg-white group cursor-pointer">
                    <td className="px-6 py-6 rounded-l-3xl font-bold text-primary">{row.id}</td>
                    <td className="px-6 py-6 text-on-surface font-semibold">{row.cat}</td>
                    <td className="px-6 py-6 text-on-surface-variant font-medium">{row.date}</td>
                    <td className="px-6 py-6">
                      <span className={cn(
                        "flex items-center gap-2 font-bold text-sm",
                        row.status === 'Urgent' ? "text-error" : row.status === 'In Progress' ? "text-secondary" : "text-on-surface-variant"
                      )}>
                        <span className={cn("w-2 h-2 rounded-full", 
                          row.status === 'Urgent' ? "bg-error" : row.status === 'In Progress' ? "bg-secondary" : "bg-outline-variant"
                        )}></span>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 rounded-r-3xl text-right">
                      <button className="text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 ml-auto">
                        Review Details <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-10 flex justify-center">
            <button className="text-on-surface-variant hover:text-primary font-bold text-sm flex items-center gap-2 transition-colors uppercase tracking-widest">
              View All Active Reports
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

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

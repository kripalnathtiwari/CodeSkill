import React, { useState } from "react";
import { Search, Activity, Monitor, Globe, Clock, Download, RefreshCw } from "lucide-react";

export default function ActivityLogs() {
  const [search, setSearch] = useState("");

  // Mock data representing the UserActivityLog Prisma model
  const MOCK_LOGS = [
    { id: "log-1", user: "John Doe", email: "john@example.com", action: "LOGIN", ipAddress: "192.168.1.1", device: "Desktop", browser: "Chrome", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: "log-2", user: "Jane Smith", email: "jane@example.com", action: "COURSE_PURCHASE", ipAddress: "10.0.0.5", device: "Mobile", browser: "Safari", timestamp: new Date(Date.now() - 1000 * 60 * 45) },
    { id: "log-3", user: "Mike Johnson", email: "mike@example.com", action: "LESSON_COMPLETED", ipAddress: "172.16.0.12", device: "Tablet", browser: "Firefox", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: "log-4", user: "Sarah Williams", email: "sarah@example.com", action: "PASSWORD_CHANGE", ipAddress: "192.168.1.55", device: "Desktop", browser: "Edge", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    { id: "log-5", user: "John Doe", email: "john@example.com", action: "LOGOUT", ipAddress: "192.168.1.1", device: "Desktop", browser: "Chrome", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) },
    { id: "log-6", user: "Alex Chen", email: "alex@example.com", action: "LOGIN", ipAddress: "10.1.1.200", device: "Mobile", browser: "Chrome iOS", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  ];

  const filtered = MOCK_LOGS.filter(log => 
    log.user.toLowerCase().includes(search.toLowerCase()) || 
    log.email.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase())
  );

  const getActionStyle = (action: string) => {
    switch(action) {
      case 'LOGIN': return 'bg-primary/10 text-primary';
      case 'LOGOUT': return 'bg-slate-200 dark:bg-slate-700 text-text-secondary';
      case 'COURSE_PURCHASE': return 'bg-primary/10 text-primary';
      case 'LESSON_COMPLETED': return 'bg-purple-500/10 text-purple-400';
      case 'PASSWORD_CHANGE': return 'bg-amber-500/10 text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-text-secondary';
    }
  };

  const getActionLabel = (action: string) => {
    return action.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-1">User Activity Logs</h2>
          <p className="text-text-muted">Monitor system access, security events, and learning activity.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-text-secondary px-4 py-2 rounded-xl font-bold transition-all">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-xl font-bold transition-all">
            <Download className="w-4 h-4" />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface dark:bg-[#111827] border border-border p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Total Events (24h)</p>
            <h3 className="text-2xl font-bold text-text-primary">1,248</h3>
          </div>
        </div>
        <div className="bg-surface dark:bg-[#111827] border border-border p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Monitor className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Unique Logins</p>
            <h3 className="text-2xl font-bold text-text-primary">452</h3>
          </div>
        </div>
      </div>

      <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border flex justify-between items-center bg-slate-900/50">
          <div className="relative w-96">
            <input 
              type="text" 
              placeholder="Search by user, email, or action..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-rose-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          </div>
          <span className="text-sm font-medium text-text-muted">Showing {filtered.length} logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-white dark:bg-[#1a2333] text-text-muted uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Device & Browser</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-text-primary">{log.user}</div>
                    <div className="text-xs text-text-muted">{log.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${getActionStyle(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-text-muted" />
                      <span>{log.device}</span>
                      <span className="text-text-secondary">•</span>
                      <span className="text-text-muted">{log.browser}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-text-muted font-mono text-xs">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{log.ipAddress}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-text-muted text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{log.timestamp.toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">No activity logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

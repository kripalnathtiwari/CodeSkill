import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  GraduationCap,
  Briefcase,
  ChevronDown,
  UserCheck,
  Send,
  X,
  FileText
} from 'lucide-react';

export interface MentorshipQuery {
  id: string;
  studentName: string;
  email: string;
  phone?: string;
  collegeOrOrg?: string;
  currentYear?: string;
  mentorshipDomain: string;
  targetCompany?: string;
  urgencyLevel?: string;
  queryType: string;
  specificQuestions: string;
  resumeOrGithubLink?: string;
  submittedAt: string;
  status: 'PENDING_REVIEW' | 'IN_TOUCH' | 'RESOLVED';
  adminNotes?: string;
}

const DEFAULT_DEMO_QUERIES: MentorshipQuery[] = [
  {
    id: 'query_1731301000000',
    studentName: 'Saurabh Tiwari',
    email: 'saurabhtiwari08071999@gmail.com',
    phone: '+91 9876543210',
    collegeOrOrg: 'LPU',
    currentYear: 'Final Year (2026)',
    mentorshipDomain: 'DSA & Coding Practice',
    targetCompany: 'Microsoft',
    urgencyLevel: 'Within 1-2 weeks',
    queryType: 'Resume Review & ATS Strategy',
    specificQuestions: 'Looking for 1-on-1 guidance on cracking Microsoft SDE-1 coding assessment and technical round edge case preparation.',
    resumeOrGithubLink: 'https://github.com',
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'PENDING_REVIEW'
  },
  {
    id: 'query_1731302000000',
    studentName: 'Aarav Verma',
    email: 'aarav.verma1@example.com',
    phone: '+91 9812345678',
    collegeOrOrg: 'IIT BHU',
    currentYear: '3rd Year Student',
    mentorshipDomain: 'Full Stack Web Development',
    targetCompany: 'Google',
    urgencyLevel: 'Immediate (Interview in 2-4 days)',
    queryType: 'Portfolio / Project Architecture Review',
    specificQuestions: 'Need assistance reviewing my MERN stack distributed architecture project before an upcoming Summer Analyst interview.',
    resumeOrGithubLink: 'https://linkedin.com',
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'IN_TOUCH',
    adminNotes: 'Connected with Mentor Aditya Verma via Google Meet on Friday.'
  }
];

export default function MentorshipManagement() {
  const [queries, setQueries] = useState<MentorshipQuery[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'IN_TOUCH' | 'RESOLVED'>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [selectedQuery, setSelectedQuery] = useState<MentorshipQuery | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');

  // Load from LocalStorage
  const loadQueries = () => {
    try {
      const stored = localStorage.getItem('student_mentorship_queries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQueries(parsed);
          return;
        }
      }
      // Fallback initial demo records so section is not empty
      setQueries(DEFAULT_DEMO_QUERIES);
      localStorage.setItem('student_mentorship_queries', JSON.stringify(DEFAULT_DEMO_QUERIES));
    } catch {
      setQueries(DEFAULT_DEMO_QUERIES);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const saveQueries = (updated: MentorshipQuery[]) => {
    setQueries(updated);
    try {
      localStorage.setItem('student_mentorship_queries', JSON.stringify(updated));
    } catch {}
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this mentorship request?')) {
      const updated = queries.filter(q => q.id !== id);
      saveQueries(updated);
      if (selectedQuery?.id === id) setSelectedQuery(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: MentorshipQuery['status'], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = queries.map(q => q.id === id ? { ...q, status: newStatus } : q);
    saveQueries(updated);
    if (selectedQuery?.id === id) {
      setSelectedQuery(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleSaveAdminNote = (id: string) => {
    const updated = queries.map(q => q.id === id ? { ...q, adminNotes: adminNoteText } : q);
    saveQueries(updated);
    if (selectedQuery?.id === id) {
      setSelectedQuery(prev => prev ? { ...prev, adminNotes: adminNoteText } : null);
    }
    alert('Admin note updated successfully.');
  };

  const filteredQueries = useMemo(() => {
    return queries.filter(q => {
      const matchSearch = 
        q.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.phone && q.phone.includes(searchQuery)) ||
        (q.targetCompany && q.targetCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
        q.specificQuestions.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || q.status === statusFilter;
      const matchDomain = domainFilter === 'ALL' || q.mentorshipDomain === domainFilter;

      return matchSearch && matchStatus && matchDomain;
    });
  }, [queries, searchQuery, statusFilter, domainFilter]);

  const domainList = useMemo(() => {
    const list = Array.from(new Set(queries.map(q => q.mentorshipDomain).filter(Boolean)));
    return ['ALL', ...list];
  }, [queries]);

  const pendingCount = queries.filter(q => q.status === 'PENDING_REVIEW').length;
  const inTouchCount = queries.filter(q => q.status === 'IN_TOUCH').length;
  const resolvedCount = queries.filter(q => q.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface dark:bg-[#111827] p-6 sm:p-8 rounded-2xl border border-border shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-500/20">
            <Users className="w-3.5 h-3.5" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight">
            Mentorship Requests
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Manage, review, and assign incoming student mentorship requests and mock interview guidance queries.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl text-center">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Pending</div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">{pendingCount}</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 px-3.5 py-2 rounded-xl text-center">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">In Touch</div>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">{inTouchCount}</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-center">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Resolved</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student, email, company, question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-border bg-background text-text-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-text-muted uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-border bg-background text-text-primary text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="ALL">All Status ({queries.length})</option>
              <option value="PENDING_REVIEW">Pending Review ({pendingCount})</option>
              <option value="IN_TOUCH">In Touch ({inTouchCount})</option>
              <option value="RESOLVED">Resolved ({resolvedCount})</option>
            </select>
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-text-muted uppercase">Domain:</span>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-background text-text-primary text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {domainList.map(domain => (
                <option key={domain} value={domain}>
                  {domain === 'ALL' ? 'All Domains' : domain}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Card List */}
      <div className="bg-surface dark:bg-[#111827] rounded-2xl border border-border shadow-xs overflow-hidden">
        {filteredQueries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-text-muted mx-auto" />
            <h3 className="font-bold text-base text-text-primary">No Mentorship Queries Found</h3>
            <p className="text-xs text-text-muted">
              {searchQuery ? 'Try clearing your search query or setting the filter back to All.' : 'No mentorship requests have been submitted by students yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-background/80 dark:bg-slate-800/60 border-b border-border text-text-muted font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Domain & Query Type</th>
                  <th className="py-3.5 px-4">Target Company</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredQueries.map((q) => (
                  <tr 
                    key={q.id}
                    onClick={() => {
                      setSelectedQuery(q);
                      setAdminNoteText(q.adminNotes || '');
                    }}
                    className="hover:bg-background/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Student Info */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-text-primary group-hover:text-rose-500 transition-colors">
                        {q.studentName}
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-text-muted" />
                          {q.email}
                        </span>
                        {q.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-text-muted" />
                            {q.phone}
                          </span>
                        )}
                      </div>
                      {q.collegeOrOrg && (
                        <div className="text-[11px] text-text-secondary mt-0.5 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-text-muted" />
                          <span>{q.collegeOrOrg} ({q.currentYear || 'Student'})</span>
                        </div>
                      )}
                    </td>

                    {/* Domain & Query Type */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-text-primary">
                        {q.mentorshipDomain}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {q.queryType}
                      </div>
                    </td>

                    {/* Target Company */}
                    <td className="py-4 px-4">
                      {q.targetCompany ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          <Building2 className="w-3 h-3" />
                          {q.targetCompany}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted italic">General Tech</span>
                      )}
                    </td>

                    {/* Urgency */}
                    <td className="py-4 px-4">
                      <span className="text-xs font-medium text-text-secondary">
                        {q.urgencyLevel || 'Standard'}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        q.status === 'PENDING_REVIEW'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : q.status === 'IN_TOUCH'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {q.status === 'PENDING_REVIEW' ? 'Pending' : q.status === 'IN_TOUCH' ? 'In Touch' : 'Resolved'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs text-text-muted whitespace-nowrap">
                      {new Date(q.submittedAt).toLocaleDateString()}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQuery(q);
                            setAdminNoteText(q.adminNotes || '');
                          }}
                          className="px-2.5 py-1 bg-surface dark:bg-slate-800 border border-border text-xs font-bold rounded-lg hover:border-rose-500/40 text-text-secondary"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => handleDelete(q.id, e)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-[#111827] border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Student Mentorship Request</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-text-primary dark:text-white">
                  {selectedQuery.studentName}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Submitted on {new Date(selectedQuery.submittedAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedQuery(null)}
                className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-background transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-background/60 p-4 rounded-2xl border border-border">
              <div>
                <span className="font-bold text-text-muted uppercase">Email:</span>{' '}
                <a href={`mailto:${selectedQuery.email}`} className="text-primary hover:underline font-semibold">
                  {selectedQuery.email}
                </a>
              </div>
              <div>
                <span className="font-bold text-text-muted uppercase">Phone:</span>{' '}
                <span className="text-text-primary font-semibold">{selectedQuery.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="font-bold text-text-muted uppercase">College / Company:</span>{' '}
                <span className="text-text-primary font-semibold">{selectedQuery.collegeOrOrg || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-bold text-text-muted uppercase">Current Stage:</span>{' '}
                <span className="text-text-primary font-semibold">{selectedQuery.currentYear || 'Student'}</span>
              </div>
              <div>
                <span className="font-bold text-text-muted uppercase">Domain:</span>{' '}
                <span className="text-text-primary font-semibold">{selectedQuery.mentorshipDomain}</span>
              </div>
              <div>
                <span className="font-bold text-text-muted uppercase">Target Company:</span>{' '}
                <span className="text-primary font-bold">{selectedQuery.targetCompany || 'General Tech'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold text-text-muted uppercase">Guidance Category:</span>{' '}
                <span className="text-text-primary font-semibold">{selectedQuery.queryType}</span>
              </div>
              {selectedQuery.resumeOrGithubLink && (
                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <span className="font-bold text-text-muted uppercase">Attachment Link:</span>
                  <a
                    href={selectedQuery.resumeOrGithubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
                  >
                    <span>{selectedQuery.resumeOrGithubLink}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Student's Exact Roadblocks / Query */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Roadblock & Question Details
              </h4>
              <div className="p-4 rounded-2xl bg-background border border-border text-sm leading-relaxed text-text-primary dark:text-slate-200">
                {selectedQuery.specificQuestions}
              </div>
            </div>

            {/* Update Status Buttons */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Update Status
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChange(selectedQuery.id, 'PENDING_REVIEW')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedQuery.status === 'PENDING_REVIEW'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  Pending Review
                </button>
                <button
                  onClick={() => handleStatusChange(selectedQuery.id, 'IN_TOUCH')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedQuery.status === 'IN_TOUCH'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-500/10 text-blue-600 border border-blue-500/30 hover:bg-blue-500/20'
                  }`}
                >
                  In Touch (Assigned Mentor)
                </button>
                <button
                  onClick={() => handleStatusChange(selectedQuery.id, 'RESOLVED')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedQuery.status === 'RESOLVED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  Resolved (Completed)
                </button>
              </div>
            </div>

            {/* Internal Admin Note */}
            <div className="space-y-2 pt-2 border-t border-border/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
                <span>Internal Mentor / Coordinator Notes</span>
                {selectedQuery.adminNotes && <span className="text-emerald-500 text-[11px] font-bold">Saved</span>}
              </h4>
              <textarea
                rows={3}
                placeholder="Add notes e.g., 'Assigned to Mentor Aditya. Scheduled live Google Meet session on Saturday 6 PM.'"
                value={adminNoteText}
                onChange={(e) => setAdminNoteText(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-background text-text-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                onClick={() => handleSaveAdminNote(selectedQuery.id)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


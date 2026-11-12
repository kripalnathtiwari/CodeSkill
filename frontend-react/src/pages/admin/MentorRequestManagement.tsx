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
  Sparkles,
  Briefcase,
  ChevronDown,
  UserCheck,
  Send,
  X,
  FileText,
  Globe,
  Award,
  Check,
  Ban
} from 'lucide-react';

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63a1.62 1.62 0 0 0 1.62-1.63c0-.9-.72-1.62-1.62-1.62Z"/>
  </svg>
);

export interface MentorRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  currentCompany: string;
  currentRole: string;
  experienceYears: string;
  primaryDomain: string;
  secondaryDomains?: string[];
  linkedinUrl: string;
  githubOrPortfolioUrl?: string;
  resumeUrl?: string;
  weeklyAvailability: string;
  preferredServices: string[];
  priorMentorshipExperience?: string;
  shortBio: string;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  appliedAt: string;
}

const DEFAULT_DEMO_MENTORS: MentorRequest[] = [
  {
    id: 'mentor_req_1731401000000',
    fullName: 'Priya Sharma',
    email: 'priya.sharma.tech@gmail.com',
    phone: '+91 9876543210',
    currentCompany: 'Microsoft',
    currentRole: 'Senior Software Engineer',
    experienceYears: '6+ Years',
    primaryDomain: 'DSA & System Design',
    secondaryDomains: ['Distributed Systems', 'Java / Spring Boot'],
    linkedinUrl: 'https://linkedin.com/in/priya-sharma-tech',
    githubOrPortfolioUrl: 'https://github.com/priyasharma',
    resumeUrl: 'https://drive.google.com',
    weeklyAvailability: '4-6 hours / week (Weekends)',
    preferredServices: ['1-on-1 Mock Interviews', 'System Design Guidance', 'Resume & Career Reviews'],
    priorMentorshipExperience: 'Mentored 35+ engineers internally at Microsoft and conducted campus recruitment technical rounds.',
    shortBio: 'Passionate about algorithmic problem solving and teaching high-throughput distributed systems. Eager to help ambitious freshers crack Tier-1 product tech interviews.',
    status: 'PENDING',
    appliedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'mentor_req_1731402000000',
    fullName: 'Aditya Mehta',
    email: 'aditya.mehta.dev@example.com',
    phone: '+91 9811223344',
    currentCompany: 'Amazon',
    currentRole: 'SDE-2 (AWS Cloud)',
    experienceYears: '4+ Years',
    primaryDomain: 'Full Stack & Cloud Architecture',
    secondaryDomains: ['AWS', 'Node.js', 'React', 'Docker'],
    linkedinUrl: 'https://linkedin.com/in/aditya-mehta',
    githubOrPortfolioUrl: 'https://adityamehta.dev',
    resumeUrl: 'https://drive.google.com',
    weeklyAvailability: '3-5 hours / week',
    preferredServices: ['Project Architecture Review', '1-on-1 Mock Interviews', 'Full Stack Mentorship'],
    priorMentorshipExperience: 'Active open-source contributor and technical blogger with 10k+ followers. Regular mentor at college hackathons.',
    shortBio: 'Experienced full stack developer building cloud-native infrastructure at Amazon. Want to coach students on production-grade web systems and interview behavioral rounds.',
    status: 'IN_REVIEW',
    adminNotes: 'Screening call scheduled for Saturday 4 PM. Very strong AWS & React background.',
    appliedAt: new Date(Date.now() - 3600000 * 28).toISOString()
  },
  {
    id: 'mentor_req_1731403000000',
    fullName: 'Kunal Deshmukh',
    email: 'kunal.deshmukh@example.com',
    phone: '+91 9765432109',
    currentCompany: 'Google',
    currentRole: 'Staff Software Engineer',
    experienceYears: '9+ Years',
    primaryDomain: 'Advanced Data Structures & Algorithms',
    secondaryDomains: ['Competitive Programming', 'Concurrency', 'C++'],
    linkedinUrl: 'https://linkedin.com/in/kunal-deshmukh-google',
    githubOrPortfolioUrl: 'https://github.com/kunal-code',
    resumeUrl: 'https://drive.google.com',
    weeklyAvailability: '2-4 hours / week',
    preferredServices: ['1-on-1 Mock Interviews', 'Advanced DSA Masterclasses'],
    priorMentorshipExperience: 'Top 0.1% LeetCode ranker, former ACM ICPC regionalist, and hiring committee interviewer at Google for 5 years.',
    shortBio: 'Love deep dive algorithmic challenges and graph theory. Looking to groom elite candidates targeting product giants and global tech firms.',
    status: 'APPROVED',
    adminNotes: 'Approved as an Elite DSA Mentor. Onboarding kit and trainer badge delivered.',
    appliedAt: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

export default function MentorRequestManagement() {
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<MentorRequest | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Load applications from localStorage
  const loadRequests = () => {
    try {
      const stored = localStorage.getItem('mentor_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRequests(parsed);
          return;
        }
      }
      setRequests(DEFAULT_DEMO_MENTORS);
      localStorage.setItem('mentor_requests', JSON.stringify(DEFAULT_DEMO_MENTORS));
    } catch (err) {
      console.error('Error loading mentor requests:', err);
      setRequests(DEFAULT_DEMO_MENTORS);
    }
  };

  useEffect(() => {
    loadRequests();
    window.addEventListener('storage', loadRequests);
    return () => window.removeEventListener('storage', loadRequests);
  }, []);

  const saveRequests = (updated: MentorRequest[]) => {
    setRequests(updated);
    try {
      localStorage.setItem('mentor_requests', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save mentor requests to localStorage', err);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: MentorRequest['status']) => {
    const updated = requests.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus };
      }
      return req;
    });
    saveRequests(updated);
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const handleSaveNotes = (id: string) => {
    const updated = requests.map(req => {
      if (req.id === id) {
        return { ...req, adminNotes: adminNoteInput };
      }
      return req;
    });
    saveRequests(updated);
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, adminNotes: adminNoteInput });
    }
    alert('Admin notes saved successfully!');
  };

  const handleDeleteRequest = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this mentor request? This action cannot be undone.')) {
      return;
    }
    const updated = requests.filter(req => req.id !== id);
    saveRequests(updated);
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest(null);
    }
  };

  // Unique domains for filtering
  const allDomains = useMemo(() => {
    const set = new Set<string>();
    requests.forEach(r => {
      if (r.primaryDomain) set.add(r.primaryDomain);
    });
    return Array.from(set);
  }, [requests]);

  // Filtered applications
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = 
        req.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.currentCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.primaryDomain.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
      const matchesDomain = domainFilter === 'ALL' || req.primaryDomain === domainFilter;

      return matchesSearch && matchesStatus && matchesDomain;
    });
  }, [requests, searchQuery, statusFilter, domainFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'PENDING').length,
      inReview: requests.filter(r => r.status === 'IN_REVIEW').length,
      approved: requests.filter(r => r.status === 'APPROVED').length,
      rejected: requests.filter(r => r.status === 'REJECTED').length
    };
  }, [requests]);

  return (
    <div className="space-y-6">
      
      {/* Title & Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface dark:bg-[#111827] p-6 rounded-2xl border border-border">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Mentor Requests</h1>
              <p className="text-sm text-text-muted">Review, verify, and approve mentor applications received from the "Be a Mentor" portal.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="/be-a-mentor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-surface-secondary dark:bg-slate-800 text-text-primary hover:text-primary rounded-xl border border-border text-xs font-semibold transition-colors"
          >
            <span>View Public Application Form</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ALL' 
              ? 'bg-primary/10 border-primary shadow-sm' 
              : 'bg-surface dark:bg-[#111827] border-border hover:border-border/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Requests</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-text-primary mt-2">{stats.total}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('PENDING')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'PENDING' 
              ? 'bg-amber-500/10 border-amber-500 shadow-sm' 
              : 'bg-surface dark:bg-[#111827] border-border hover:border-border/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500 mt-2">{stats.pending}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('IN_REVIEW')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'IN_REVIEW' 
              ? 'bg-blue-500/10 border-blue-500 shadow-sm' 
              : 'bg-surface dark:bg-[#111827] border-border hover:border-border/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">In Review</span>
            <AlertCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-500 mt-2">{stats.inReview}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'APPROVED' 
              ? 'bg-emerald-500/10 border-emerald-500 shadow-sm' 
              : 'bg-surface dark:bg-[#111827] border-border hover:border-border/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Approved Mentors</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500 mt-2">{stats.approved}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface dark:bg-[#111827] p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by mentor name, email, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="relative flex-1 md:flex-initial">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer appearance-none pr-8"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Domain Dropdown */}
          <div className="relative flex-1 md:flex-initial">
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer appearance-none pr-8"
            >
              <option value="ALL">All Domains</option>
              {allDomains.map(dom => (
                <option key={dom} value={dom}>{dom}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-3 top-3 pointer-events-none" />
          </div>

          {(searchQuery || statusFilter !== 'ALL' || domainFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setDomainFilter('ALL');
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-surface dark:bg-[#111827] rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50 dark:bg-slate-900/40 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-4 px-6">Applicant</th>
                <th className="py-4 px-6">Company & Role</th>
                <th className="py-4 px-6">Expertise & Experience</th>
                <th className="py-4 px-6">Availability</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredRequests.map(req => {
                const getStatusBadge = (status: MentorRequest['status']) => {
                  switch (status) {
                    case 'APPROVED':
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      );
                    case 'IN_REVIEW':
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          <Clock className="w-3 h-3" />
                          <span>In Review</span>
                        </span>
                      );
                    case 'REJECTED':
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <Ban className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      );
                    default:
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <AlertCircle className="w-3 h-3" />
                          <span>Pending Review</span>
                        </span>
                      );
                  }
                };

                return (
                  <tr 
                    key={req.id} 
                    onClick={() => {
                      setSelectedRequest(req);
                      setAdminNoteInput(req.adminNotes || '');
                    }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    {/* Applicant Name & Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shrink-0">
                          {req.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary truncate">{req.fullName}</p>
                          <p className="text-xs text-text-muted truncate">{req.email}</p>
                          <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{req.phone}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Company & Role */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-border text-xs font-bold text-text-primary">
                          <Building2 className="w-3 h-3 text-primary" />
                          <span>{req.currentCompany}</span>
                        </div>
                        <p className="text-xs text-text-secondary font-medium">{req.currentRole}</p>
                      </div>
                    </td>

                    {/* Domain & Experience */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-primary block truncate max-w-[200px]">
                          {req.primaryDomain}
                        </span>
                        <span className="text-xs text-text-muted font-medium">
                          {req.experienceYears} Exp
                        </span>
                      </div>
                    </td>

                    {/* Weekly Availability */}
                    <td className="py-4 px-6">
                      <div className="text-xs font-medium text-text-secondary">
                        <Clock className="w-3 h-3 inline mr-1 text-text-muted" />
                        {req.weeklyAvailability}
                      </div>
                      <div className="text-[11px] text-text-muted mt-1">
                        {new Date(req.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      {getStatusBadge(req.status)}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setAdminNoteInput(req.adminNotes || '');
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-border hover:bg-background hover:text-primary transition-colors"
                        >
                          Review
                        </button>
                        <button
                          onClick={(e) => handleDeleteRequest(req.id, e)}
                          className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg transition-colors"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-text-muted">
                    <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold text-base text-text-primary">No mentor requests found</p>
                    <p className="text-xs mt-1">
                      {searchQuery || statusFilter !== 'ALL' || domainFilter !== 'ALL'
                        ? 'Try relaxing your search query or filters.'
                        : 'New applications submitted on the "Be a Mentor" page will automatically appear here.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-[#111827] rounded-3xl border border-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-6 border-b border-border">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-xl">
                  {selectedRequest.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl md:text-2xl font-black text-text-primary">{selectedRequest.fullName}</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Applicant
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-0.5 flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{selectedRequest.currentRole}</span>
                    <span>•</span>
                    <span className="text-primary font-bold">{selectedRequest.currentCompany}</span>
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-background transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & Links Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 py-5 border-b border-border text-xs">
              <div className="flex items-center space-x-2 text-text-secondary">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${selectedRequest.email}`} className="truncate hover:underline text-text-primary font-medium">
                  {selectedRequest.email}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-text-secondary">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href={`tel:${selectedRequest.phone}`} className="hover:underline text-text-primary font-medium">
                  {selectedRequest.phone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <LinkedinIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <a 
                  href={selectedRequest.linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {selectedRequest.githubOrPortfolioUrl && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-primary shrink-0" />
                  <a 
                    href={selectedRequest.githubOrPortfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline font-bold flex items-center gap-1 truncate"
                  >
                    <span>Portfolio / GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Main Application Details */}
            <div className="py-6 space-y-6">
              
              {/* Key Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-secondary dark:bg-background/60 p-4 rounded-2xl border border-border">
                <div>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Total Experience</span>
                  <p className="text-base font-bold text-text-primary mt-1">{selectedRequest.experienceYears}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Primary Domain</span>
                  <p className="text-base font-bold text-primary mt-1">{selectedRequest.primaryDomain}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Weekly Availability</span>
                  <p className="text-base font-bold text-text-primary mt-1">{selectedRequest.weeklyAvailability}</p>
                </div>
              </div>

              {/* Bio & Pitch */}
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Mentor Bio & Pitch</h3>
                <div className="bg-background border border-border p-4 rounded-2xl text-sm text-text-secondary leading-relaxed">
                  {selectedRequest.shortBio || "No bio provided."}
                </div>
              </div>

              {/* Mentorship Experience */}
              {selectedRequest.priorMentorshipExperience && (
                <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Prior Mentorship & Teaching Track Record</h3>
                  <div className="bg-background border border-border p-4 rounded-2xl text-sm text-text-secondary leading-relaxed">
                    {selectedRequest.priorMentorshipExperience}
                  </div>
                </div>
              )}

              {/* Services & Skills */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Offered Mentorship Services</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.preferredServices?.map((service, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{service}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume Link */}
              {selectedRequest.resumeUrl && (
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-text-primary">Resume / Curriculum Vitae</p>
                      <p className="text-xs text-text-muted">Direct link provided by candidate</p>
                    </div>
                  </div>
                  <a
                    href={selectedRequest.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-text-inverse rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Open Resume</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Status Update & Admin Notes */}
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Application Status Workflow</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'PENDING')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        selectedRequest.status === 'PENDING'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-background border-border text-text-muted hover:text-amber-500'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'IN_REVIEW')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        selectedRequest.status === 'IN_REVIEW'
                          ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                          : 'bg-background border-border text-text-muted hover:text-blue-500'
                      }`}
                    >
                      In Review
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'APPROVED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        selectedRequest.status === 'APPROVED'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'bg-background border-border text-text-muted hover:text-emerald-500'
                      }`}
                    >
                      Approve Mentor
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'REJECTED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        selectedRequest.status === 'REJECTED'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                          : 'bg-background border-border text-text-muted hover:text-rose-500'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                    Internal Admin Notes & Interview Assessment
                  </label>
                  <textarea
                    rows={3}
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="Add interview scheduling details, mentor remuneration tier, review notes, etc..."
                    className="w-full bg-background border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-primary placeholder:text-text-muted"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleSaveNotes(selectedRequest.id)}
                      className="px-4 py-2 bg-primary text-text-inverse rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm"
                    >
                      Save Admin Notes
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <a
                href={`mailto:${selectedRequest.email}?subject=CodeSkill%20Mentor%20Application%20Update`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-secondary dark:bg-slate-800 text-text-primary hover:text-primary border border-border text-xs font-bold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email to Candidate</span>
              </a>
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-text-inverse text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

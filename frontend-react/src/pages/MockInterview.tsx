import React, { useState } from 'react';
import { 
  Users, 
  Video, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Award, 
  Code2, 
  BrainCircuit, 
  ShieldCheck, 
  FileText,
  AlertCircle,
  MessageSquare,
  Star,
  PlayCircle,
  HelpCircle,
  Send,
  User,
  GraduationCap,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface InterviewRole {
  id: string;
  title: string;
  category: 'Software Engineering' | 'Frontend' | 'Backend' | 'Data & AI' | 'Behavioral';
  difficulty: 'Fresher' | 'Junior (1-2 yrs)' | 'Senior (3+ yrs)';
  duration: string;
  interviewerProfile: string;
  companyTarget: string;
  rounds: string[];
  keyTopics: string[];
  recommendedPreparation: string;
}

const MOCK_INTERVIEWS: InterviewRole[] = [
  {
    id: 'sde-problem-solving',
    title: 'Software Development Engineer (DSA & Problem Solving)',
    category: 'Software Engineering',
    difficulty: 'Fresher',
    duration: '45 Mins',
    interviewerProfile: 'Tech Leads from Google, Amazon & Microsoft alumni',
    companyTarget: 'Product Companies (MAANG & Unicorns)',
    rounds: ['Resume & Past Experience Deep-dive (10 min)', 'Live Coding on LeetCode Medium problem (25 min)', 'Complexity optimization & Edge cases (10 min)'],
    keyTopics: ['Arrays & Two Pointers', 'Binary Search', 'Trees & Graphs traversals', 'Clean code & variable naming'],
    recommendedPreparation: 'Review foundation DSA problems in practice hub before attending.'
  },
  {
    id: 'frontend-react-system',
    title: 'Frontend Engineer (React.js & Web Performance)',
    category: 'Frontend',
    difficulty: 'Junior (1-2 yrs)',
    duration: '50 Mins',
    interviewerProfile: 'Senior UI Engineers & Staff Architects',
    companyTarget: 'High-Growth Tech Startups & Product Firms',
    rounds: ['JavaScript engine & Event loop mechanics (15 min)', 'Live React Component Architecture (25 min)', 'Web Vitals, SSR vs CSR, caching strategies (10 min)'],
    keyTopics: ['React Hooks & Re-render optimization', 'State Management & TanStack Query', 'CSS layout & Responsive Architecture', 'Accessibility & Performance auditing'],
    recommendedPreparation: 'Be ready to code a component from scratch with clean state management.'
  },
  {
    id: 'backend-system-design',
    title: 'Backend Engineer (Node.js, APIs & Database Design)',
    category: 'Backend',
    difficulty: 'Junior (1-2 yrs)',
    duration: '60 Mins',
    interviewerProfile: 'Principal Engineers & Backend Leads',
    companyTarget: 'Fintech, SaaS & Enterprise Scaled Platforms',
    rounds: ['Core Node.js concurrency & async IO (15 min)', 'Database schema design & query optimization (25 min)', 'API Rate limiting, caching with Redis & security (20 min)'],
    keyTopics: ['PostgreSQL / MongoDB schema models', 'Indexing & query execution plans', 'JWT Auth, CORS, RBAC architectures', 'Microservices vs Monolith trade-offs'],
    recommendedPreparation: 'Prepare a whiteboard schema diagram for a high-traffic e-commerce or chat app.'
  },
  {
    id: 'behavioral-hr-round',
    title: 'HR & Behavioral Interview (STAR Method Mastery)',
    category: 'Behavioral',
    difficulty: 'Fresher',
    duration: '30 Mins',
    interviewerProfile: 'HR Directors & Engineering Hiring Managers',
    companyTarget: 'All Major Tech & Service Companies',
    rounds: ['Introduction & Professional Pitch (5 min)', 'Behavioral Scenarios using STAR framework (20 min)', 'Candidate questions & negotiation advice (5 min)'],
    keyTopics: ['Overcoming technical blockers', 'Handling conflict in engineering teams', 'Delivering projects under tight deadlines', 'Long-term engineering ambition & culture fit'],
    recommendedPreparation: 'Have 3 real project stories formatted with Situation, Task, Action, and Result.'
  }
];

export default function MockInterview() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'interview' | 'customQuery'>('interview');
  const [selectedInterview, setSelectedInterview] = useState<InterviewRole>(MOCK_INTERVIEWS[0]);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('18:00');
  const [candidateNotes, setCandidateNotes] = useState('');

  // Custom Mentorship Query Form State
  const [queryForm, setQueryForm] = useState({
    studentName: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : '',
    email: user?.email || '',
    phone: '',
    collegeOrOrg: '',
    currentYear: 'Final Year (2026)',
    mentorshipDomain: 'DSA & Coding Practice',
    targetCompany: '',
    urgencyLevel: 'Within 1-2 weeks',
    queryType: 'Resume Review & Interview Strategy',
    specificQuestions: '',
    resumeOrGithubLink: ''
  });

  const [querySubmitted, setQuerySubmitted] = useState(false);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitted(true);
    setTimeout(() => {
      setBookingSubmitted(false);
      setPreferredDate('');
      setCandidateNotes('');
    }, 4000);
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryForm.studentName || !queryForm.email || !queryForm.specificQuestions) {
      alert('Please fill in your name, email, and mentorship question.');
      return;
    }

    try {
      const existingQueries = JSON.parse(localStorage.getItem('student_mentorship_queries') || '[]');
      existingQueries.push({
        ...queryForm,
        id: 'query_' + Date.now(),
        submittedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW'
      });
      localStorage.setItem('student_mentorship_queries', JSON.stringify(existingQueries));
    } catch {}

    setQuerySubmitted(true);
    setTimeout(() => {
      setQuerySubmitted(false);
      setQueryForm(prev => ({
        ...prev,
        specificQuestions: '',
        targetCompany: '',
        resumeOrGithubLink: ''
      }));
    }, 4500);
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-indigo-500/5 p-8 md:p-12 rounded-[2rem] border border-primary/20 shadow-sm">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
              <Video className="w-4 h-4" />
              <span>Career Development Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary dark:text-white tracking-tight leading-tight">
              Mock <span className="text-primary">Interviews & Mentorship</span>
            </h1>

            <p className="text-text-secondary dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              Practice real-time technical & behavioral rounds or submit your tailored mentorship query to get 1-on-1 personalized guidance from industry leads.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center relative w-52 h-52 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-[2rem] transform rotate-6 animate-pulse" />
            <div className="absolute inset-0 bg-surface dark:bg-slate-800 rounded-[2rem] border border-border shadow-xl transform -rotate-3 flex flex-col items-center justify-center p-6 transition-transform hover:rotate-0 duration-500">
              <Users className="w-16 h-16 text-primary mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">1-on-1 Mentorship</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border/80 pb-4">
        <button
          onClick={() => setActiveTab('interview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'interview'
              ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102'
              : 'bg-surface dark:bg-slate-900 border border-border text-text-secondary hover:text-text-primary hover:border-primary/40'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Curated Interview Tracks</span>
        </button>

        <button
          onClick={() => setActiveTab('customQuery')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'customQuery'
              ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102'
              : 'bg-surface dark:bg-slate-900 border border-border text-text-secondary hover:text-text-primary hover:border-primary/40'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Submit Custom Mentorship Query</span>
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-primary border border-primary/30">
            Student Request
          </span>
        </button>
      </div>

      {/* TAB 1: CURATED INTERVIEW TRACKS */}
      {activeTab === 'interview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface dark:bg-slate-900 p-6 rounded-2xl border border-border dark:border-border/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-text-primary dark:text-white mb-1">Live Coding Rounds</h4>
                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
                  Share your screen, solve algorithmic questions, and explain your thought process under real exam pressure.
                </p>
              </div>
            </div>

            <div className="bg-surface dark:bg-slate-900 p-6 rounded-2xl border border-border dark:border-border/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-text-primary dark:text-white mb-1">Detailed Scorecard</h4>
                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
                  Receive structured evaluation across code quality, problem breakdown, communication, and time efficiency.
                </p>
              </div>
            </div>

            <div className="bg-surface dark:bg-slate-900 p-6 rounded-2xl border border-border dark:border-border/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-text-primary dark:text-white mb-1">Company-Specific Formats</h4>
                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
                  Tailor each session to mimic the exact hiring process of product giants, startups, or consulting firms.
                </p>
              </div>
            </div>
          </div>

          {/* Main Interactive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Track Choices */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Select Interview Track</span>
              </h3>

              <div className="space-y-3">
                {MOCK_INTERVIEWS.map((interview) => {
                  const isSelected = selectedInterview.id === interview.id;

                  return (
                    <button
                      key={interview.id}
                      onClick={() => setSelectedInterview(interview)}
                      className={`w-full p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-2 ring-primary -translate-y-0.5'
                          : 'border-border dark:border-border/80 hover:border-primary/40 bg-surface dark:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-text-muted">
                            {interview.category}
                          </span>
                          <span className="text-xs font-semibold text-primary flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {interview.duration}
                          </span>
                        </div>

                        <h4 className={`font-bold text-sm sm:text-base leading-snug mb-1.5 ${
                          isSelected ? 'text-primary' : 'text-text-primary dark:text-white'
                        }`}>
                          {interview.title}
                        </h4>

                        <p className="text-xs text-text-muted line-clamp-2">
                          {interview.companyTarget}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mentorship query shortcut card */}
              <div className="p-5 rounded-2xl bg-surface dark:bg-slate-900 border border-border space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>Have a customized query?</span>
                </div>
                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
                  Need guidance on an upcoming round, specific tech stack, or off-campus resume shortlisting?
                </p>
                <button
                  onClick={() => setActiveTab('customQuery')}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Fill Mentorship Query Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Detail & Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface dark:bg-slate-900 rounded-3xl border border-border dark:border-border p-6 sm:p-8 space-y-6">
                {/* Header info */}
                <div className="space-y-3 border-b border-border/80 pb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
                      {selectedInterview.category}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-slate-300">
                      Target: {selectedInterview.difficulty}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white">
                    {selectedInterview.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-text-secondary dark:text-slate-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Mentors: {selectedInterview.interviewerProfile}</span>
                  </p>
                </div>

                {/* Rounds Agenda */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Session Breakdown</h4>
                  <div className="space-y-2">
                    {selectedInterview.rounds.map((round, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-3 p-3 rounded-xl bg-background dark:bg-slate-800/60 border border-border/60 text-xs sm:text-sm text-text-primary dark:text-slate-200">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                          {rIdx + 1}
                        </span>
                        <span>{round}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Topics */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">High-Frequency Discussion Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterview.keyTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-background dark:bg-slate-800 text-text-primary dark:text-slate-200 border border-border"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Booking Form */}
                <div className="pt-4 border-t border-border/80">
                  <h4 className="text-base font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Schedule a 1-on-1 Practice Session</span>
                  </h4>

                  {bookingSubmitted ? (
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-3 animate-in fade-in">
                      <CheckCircle2 className="w-6 h-6 shrink-0" />
                      <div>
                        <h5 className="font-bold text-sm">Session Request Received!</h5>
                        <p className="text-xs mt-0.5">
                          Our mentorship coordinator will match an engineering interviewer and send the meeting link to your email.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBooking} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                            Preferred Date
                          </label>
                          <input
                            type="date"
                            required
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background dark:bg-slate-800 text-text-primary dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                            Preferred Time Slot
                          </label>
                          <select
                            value={preferredTime}
                            onChange={(e) => setPreferredTime(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background dark:bg-slate-800 text-text-primary dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="10:00">10:00 AM - Morning Slot</option>
                            <option value="14:00">02:00 PM - Afternoon Slot</option>
                            <option value="18:00">06:00 PM - Evening Slot</option>
                            <option value="20:00">08:00 PM - Night Slot</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                          Target Company or Specific Focus (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={candidateNotes}
                          onChange={(e) => setCandidateNotes(e.target.value)}
                          placeholder="e.g., I have an upcoming interview with Microsoft for an SDE-1 role. Please focus on Graph problems and edge case handling."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background dark:bg-slate-800 text-text-primary dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Confirm Mock Interview Booking</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM STUDENT MENTORSHIP QUERY FORM */}
      {activeTab === 'customQuery' && (
        <div className="bg-surface dark:bg-slate-900 rounded-3xl border border-border dark:border-border p-6 sm:p-10 space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Mentorship Request Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white">
                Personalized Mentorship Query
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-slate-300 mt-1 max-w-2xl">
                Fill in your background, current level, and exact roadblocks. Our senior mentors will review your submission and connect with tailored feedback or schedule a customized 1-on-1 session.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto px-4 py-2.5 rounded-2xl bg-background border border-border text-xs font-semibold text-text-muted">
              <Clock className="w-4 h-4 text-primary" />
              <span>Response within 24-48 Hours</span>
            </div>
          </div>

          {querySubmitted ? (
            <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 space-y-3 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="text-xl font-bold">Mentorship Query Submitted Successfully!</h3>
              </div>
              <p className="text-sm leading-relaxed max-w-2xl">
                Thank you, <strong>{queryForm.studentName || 'Student'}</strong>. We have received your query regarding <strong>"{queryForm.queryType}"</strong> in domain <strong>{queryForm.mentorshipDomain}</strong>. A dedicated mentor will review your details and contact you at <strong>{queryForm.email}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleQuerySubmit} className="space-y-6">
              {/* Row 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Saurabh Tiwari"
                      value={queryForm.studentName}
                      onChange={(e) => setQueryForm({ ...queryForm, studentName: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@example.com"
                    value={queryForm.email}
                    onChange={(e) => setQueryForm({ ...queryForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={queryForm.phone}
                    onChange={(e) => setQueryForm({ ...queryForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Row 2: College & Academic Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    College / University / Company
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. IIT, NIT, LPU, or Working Professional"
                      value={queryForm.collegeOrOrg}
                      onChange={(e) => setQueryForm({ ...queryForm, collegeOrOrg: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Current Year / Graduation
                  </label>
                  <select
                    value={queryForm.currentYear}
                    onChange={(e) => setQueryForm({ ...queryForm, currentYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="1st Year">1st Year Student</option>
                    <option value="2nd Year">2nd Year Student</option>
                    <option value="3rd Year">3rd Year Student</option>
                    <option value="Final Year (2026)">Final Year Student (2026 Batch)</option>
                    <option value="Recent Graduate (2025/2024)">Recent Graduate (Passout)</option>
                    <option value="Working Professional">Working Professional (1+ Yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Target Dream Company
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Google, Microsoft, Amazon, FinTech"
                      value={queryForm.targetCompany}
                      onChange={(e) => setQueryForm({ ...queryForm, targetCompany: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Domain & Query Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Primary Domain / Focus
                  </label>
                  <select
                    value={queryForm.mentorshipDomain}
                    onChange={(e) => setQueryForm({ ...queryForm, mentorshipDomain: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="DSA & Coding Practice">Data Structures & Algorithms (DSA)</option>
                    <option value="Full Stack Web Development">Full Stack Web (MERN / Next.js)</option>
                    <option value="Backend & System Design">Backend & System Design</option>
                    <option value="Frontend Architecture">Frontend & UI Engineering</option>
                    <option value="AI / ML / Data Science">AI, Machine Learning & Data</option>
                    <option value="DevOps & Cloud">DevOps, Docker & Cloud</option>
                    <option value="Aptitude & Campus Drives">Aptitude & Placement Exams</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    What Kind of Guidance Do You Need?
                  </label>
                  <select
                    value={queryForm.queryType}
                    onChange={(e) => setQueryForm({ ...queryForm, queryType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Resume Review & ATS Strategy">Resume Review & ATS Shortlisting Strategy</option>
                    <option value="DSA Roadmap & Problem-solving Stagnation">DSA Roadmap & Problem-solving Stagnation</option>
                    <option value="Specific Upcoming Interview Guidance">Guidance for an Upcoming Company Interview</option>
                    <option value="Portfolio / Project Architecture Review">Project Architecture & GitHub Portfolio Review</option>
                    <option value="Career Transition to Product Companies">Career Transition to Product Companies</option>
                    <option value="HR & Behavioral Round Preparation">HR, Salary & Behavioral Communication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Timeline / Urgency
                  </label>
                  <select
                    value={queryForm.urgencyLevel}
                    onChange={(e) => setQueryForm({ ...queryForm, urgencyLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Immediate (Interview in 2-4 days)">Urgent (Interview in next 2-4 days)</option>
                    <option value="Within 1-2 weeks">Within 1-2 Weeks</option>
                    <option value="This Month">Sometime this Month</option>
                    <option value="General Long-term Career Planning">General Career Guidance (No rush)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Detailed Query & Roadblocks */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Describe Your Specific Questions, Roadblocks, or Goals <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={queryForm.specificQuestions}
                  onChange={(e) => setQueryForm({ ...queryForm, specificQuestions: e.target.value })}
                  placeholder="Tell us what you're struggling with or what you'd like your mentor to help you solve. E.g.: 'I've solved ~150 LeetCode problems but get stuck on DP and Graph questions during live rounds. I have an upcoming test with JP Morgan next week.'"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>

              {/* Row 5: Resume / Profile Link (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Resume / LinkedIn / GitHub URL <span className="text-text-muted font-normal text-xs">(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username or Google Drive link"
                  value={queryForm.resumeOrGithubLink}
                  onChange={(e) => setQueryForm({ ...queryForm, resumeOrGithubLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/80">
                <p className="text-xs text-text-muted">
                  🔒 Your query is private and only shared with assigned CodeSkill mentors.
                </p>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Mentorship Request</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

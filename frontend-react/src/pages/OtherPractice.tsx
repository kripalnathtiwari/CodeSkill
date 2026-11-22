import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiUrl } from "../utils/apiConfig";
import {
  Search, Target, BookOpen, ArrowLeft, Home, Book, CheckCircle2, ChevronRight,
  Award, ArrowUpRight, FileText, Download, Clock, Sparkles, Filter, Layers,
  Flame, Zap, RotateCcw, Check, Bookmark, Database, Code2, Terminal, Cpu,
  HelpCircle, ArrowRight, X, Play, BarChart2, ShieldCheck, BookMarked
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Returns specialized icon, gradient and tag for each subject
 */
const getSubjectTheme = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("dbms") || lower.includes("sql") || lower.includes("database")) {
    return {
      icon: Database,
      gradient: "from-blue-500 via-indigo-500 to-cyan-500",
      accentColor: "text-blue-500",
      bgSoft: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      badge: "Database Systems",
    };
  }
  if (lower.includes("dsa") || lower.includes("algorithm") || lower.includes("data structure")) {
    return {
      icon: Cpu,
      gradient: "from-purple-500 via-fuchsia-500 to-pink-500",
      accentColor: "text-purple-500",
      bgSoft: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      badge: "Algorithms & DS",
    };
  }
  if (lower.includes("java")) {
    return {
      icon: Terminal,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      accentColor: "text-amber-500",
      bgSoft: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      badge: "Object-Oriented",
    };
  }
  if (lower.includes("python")) {
    return {
      icon: Code2,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      accentColor: "text-emerald-500",
      bgSoft: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      badge: "Scripting & AI",
    };
  }
  if (lower.includes("c++") || lower.includes("cpp") || lower.includes("c language")) {
    return {
      icon: Terminal,
      gradient: "from-sky-500 via-blue-600 to-indigo-600",
      accentColor: "text-sky-500",
      bgSoft: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      badge: "Systems Programming",
    };
  }
  if (lower.includes("javascript") || lower.includes("js") || lower.includes("web") || lower.includes("react")) {
    return {
      icon: Zap,
      gradient: "from-yellow-400 via-amber-500 to-orange-500",
      accentColor: "text-amber-500",
      bgSoft: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      badge: "Full Stack & Web",
    };
  }
  return {
    icon: BookOpen,
    gradient: "from-rose-500 via-pink-500 to-red-500",
    accentColor: "text-rose-500",
    bgSoft: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    badge: "Core Subject",
  };
};

export default function OtherPractice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [questions, setQuestions] = useState<any[]>(() => {
    try {
      const data = localStorage.getItem("admin_other_practice_tests");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });
  const [subjects, setSubjects] = useState<string[]>(() => {
    try {
      const data = localStorage.getItem("admin_subjects_data");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });
  const [subjectNotes, setSubjectNotes] = useState<Record<string, string>>(() => {
    try {
      const data = localStorage.getItem("admin_subject_notes");
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  });
  const [bookmarkedSubjects, setBookmarkedSubjects] = useState<Set<string>>(() => {
    try {
      const data = localStorage.getItem("user_bookmarked_subjects");
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
      return new Set();
    }
  });

  // TanStack Query for tests (cached for 5 minutes)
  const { data: dbTests, isLoading: isTestsLoading } = useQuery({
    queryKey: ['otherPracticeTests'],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await axios.get(getApiUrl("/api/v1/other-practice/tests"), { timeout: 8000 });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // TanStack Query for subjects (cached for 5 minutes)
  const { data: dbSubjects, isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['otherPracticeSubjects'],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await axios.get(getApiUrl("/api/v1/other-practice/subjects"), { timeout: 8000 });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const isLoading = isTestsLoading || isSubjectsLoading;

  // Sync state when fresh data arrives from database
  useEffect(() => {
    if (dbTests && Array.isArray(dbTests)) {
      setQuestions(dbTests);
      try {
        localStorage.setItem("admin_other_practice_tests", JSON.stringify(dbTests));
      } catch (e) {}
    }
  }, [dbTests]);

  useEffect(() => {
    if (dbSubjects && Array.isArray(dbSubjects)) {
      const names = dbSubjects.map((s: any) => s.name);
      const notes: Record<string, string> = {};
      dbSubjects.forEach((s: any) => {
        if (s.noteData) notes[s.name] = s.noteData;
      });
      setSubjects(names);
      setSubjectNotes(notes);
      try {
        localStorage.setItem("admin_subjects_data", JSON.stringify(names));
        localStorage.setItem("admin_subject_notes", JSON.stringify(notes));
      } catch (e) {}
    }
  }, [dbSubjects]);

  // View state synced with URL searchParams so browser back / moving back restores the exact subject
  const selectedSubject = searchParams.get("subject") || "";
  const activeView: "directory" | "topics" = selectedSubject ? "topics" : "directory";

  const toggleBookmark = (subj: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subj)) next.delete(subj);
      else next.add(subj);
      try {
        localStorage.setItem("user_bookmarked_subjects", JSON.stringify(Array.from(next)));
      } catch (err) {}
      return next;
    });
  };

  const handleBackToDirectory = () => {
    setSearchParams({});
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartSubject = (subject: string) => {
    setSearchParams({ subject });
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filtered tests under selected subject
  const filteredTests = useMemo(() => {
    return questions.filter(t => 
      t.subject === selectedSubject &&
      t.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questions, selectedSubject, searchQuery]);

  // Filtered subjects in directory view
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [subjects, searchQuery]);

  // Helper to count tests per subject
  const getSubjectTestCount = (subName: string) => {
    return questions.filter(q => q.subject === subName).length;
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 w-full space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* ======================================================== */}
      {/* VIEW 1: SUBJECTS DIRECTORY (MAIN PAGE)                   */}
      {/* ======================================================== */}
      {activeView === "directory" ? (
        <>
          {/* Hero Header Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-surface to-rose-500/5 dark:from-[#111827] dark:via-[#111827] dark:to-rose-500/10 border border-border p-6 sm:p-8 md:p-10 shadow-sm">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-4">
              {/* Breadcrumb */}
              <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-text-muted space-x-2">
                <Home className="w-3.5 h-3.5 text-text-muted" />
                <span>Home</span>
                <span>/</span>
                <span className="text-rose-500 font-bold">Subjects Directory</span>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Targeted Practice Arena</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary dark:text-text-inverse">
                    More Practice
                  </h1>
                  <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                    Choose your subject to practice timed mock tests, master core concepts, and download comprehensive chapter notes.
                  </p>
                </div>

                {/* Quick Stats Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
                  <div className="bg-background/80 dark:bg-background/40 backdrop-blur border border-border rounded-2xl p-3.5 text-center min-w-[100px]">
                    <div className="text-xl sm:text-2xl font-black text-rose-500">{subjects.length}</div>
                    <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Subjects</div>
                  </div>
                  <div className="bg-background/80 dark:bg-background/40 backdrop-blur border border-border rounded-2xl p-3.5 text-center min-w-[100px]">
                    <div className="text-xl sm:text-2xl font-black text-primary">{questions.length}</div>
                    <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Assessments</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 bg-background/80 dark:bg-background/40 backdrop-blur border border-border rounded-2xl p-3.5 text-center min-w-[100px]">
                    <div className="text-xl sm:text-2xl font-black text-emerald-500">{Object.keys(subjectNotes).length}</div>
                    <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Study Guides</div>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search subject (e.g. DBMS, Java, Python)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none focus:border-rose-500 transition-all text-text-primary dark:text-text-inverse shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="text-xs font-semibold text-text-muted self-end sm:self-center">
                  Showing <span className="font-bold text-text-primary dark:text-text-inverse">{filteredSubjects.length}</span> of {subjects.length} subjects
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-20 text-center">
                <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-text-muted font-medium">Loading subjects directory...</p>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-surface dark:bg-[#111827] rounded-3xl border border-border p-8">
                <Target className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-bold text-text-primary dark:text-text-inverse">No subjects match your search</h3>
                <p className="text-sm text-text-muted mt-1">Try searching with a different keyword or reset filters.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              filteredSubjects.map((subject) => {
                const theme = getSubjectTheme(subject);
                const SubjectIcon = theme.icon;
                const testCount = getSubjectTestCount(subject);
                const hasNotes = !!subjectNotes[subject];
                const isBookmarked = bookmarkedSubjects.has(subject);

                return (
                  <div
                    key={subject}
                    onClick={() => handleStartSubject(subject)}
                    className="group bg-surface dark:bg-[#111827] rounded-3xl border border-border hover:border-rose-500/50 dark:hover:border-rose-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
                  >
                    {/* Top Accent Gradient Bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`}></div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col space-y-5">
                      
                      {/* Subject Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${theme.bgSoft} shadow-sm group-hover:scale-110 transition-transform`}>
                            <SubjectIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                              {theme.badge}
                            </span>
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-inverse group-hover:text-rose-500 transition-colors">
                              {subject}
                            </h2>
                          </div>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => toggleBookmark(subject, e)}
                          title={isBookmarked ? "Remove bookmark" : "Bookmark subject"}
                          className={`p-2 rounded-xl border transition-colors ${
                            isBookmarked
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                              : "bg-background dark:bg-slate-900 border-border text-text-muted hover:text-text-primary"
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-rose-500" : ""}`} />
                        </button>
                      </div>

                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-background dark:bg-slate-900/80 border border-border text-xs font-bold text-text-secondary dark:text-text-muted">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>{testCount} {testCount === 1 ? 'Test' : 'Tests'} Available</span>
                        </span>
                        {hasNotes && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Notes PDF</span>
                          </span>
                        )}
                      </div>

                      {/* Preparation Highlights Checklist */}
                      <div className="space-y-2 pt-2 border-t border-border/60">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                          Module Highlights
                        </div>
                        <ul className="space-y-2 text-xs font-medium text-text-secondary dark:text-text-muted">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>{subject} Question Bank & MCQs</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Timed Practice & Real-time Evaluation</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>{hasNotes ? "Downloadable Lecture Revision Guide" : "Topic-wise Mock Assessments"}</span>
                          </li>
                        </ul>
                      </div>

                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4 bg-background/50 dark:bg-slate-900/50 border-t border-border flex items-center justify-between">
                      <span className="text-xs font-bold text-text-muted group-hover:text-rose-500 transition-colors">
                        Enter Practice Arena
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartSubject(subject);
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm group-hover:shadow-[0_0_15px_rgba(244,63,94,0.35)] transition-all group-hover:translate-x-0.5"
                      >
                        <span>Start Practice</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* ======================================================== */
        /* VIEW 2: SUBJECT TESTS PAGE (e.g. "Java Tests")           */
        /* ======================================================== */
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Back Navigation & Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handleBackToDirectory}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface dark:bg-[#111827] border border-border text-sm font-bold text-text-primary dark:text-text-inverse hover:border-rose-500/40 hover:text-rose-500 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-rose-500" />
              <span>Back to Subjects</span>
            </button>

            <div className="flex items-center text-xs font-semibold text-text-muted space-x-2">
              <Home className="w-3.5 h-3.5 text-text-muted" />
              <button onClick={handleBackToDirectory} className="hover:text-rose-500 transition-colors">
                Home
              </button>
              <span>/</span>
              <button onClick={handleBackToDirectory} className="hover:text-rose-500 transition-colors">
                Subjects
              </button>
              <span>/</span>
              <span className="text-rose-500 font-bold">{selectedSubject}</span>
            </div>
          </div>

          {/* Subject Tests Hero Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-surface to-rose-500/5 dark:from-[#111827] dark:via-[#111827] dark:to-rose-500/10 border border-border p-6 sm:p-8 md:p-10 shadow-sm">
            <div className="absolute -right-12 -top-12 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                  <Target className="w-3.5 h-3.5" />
                  <span>Subject Assessment Arena</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary dark:text-text-inverse flex items-center gap-3">
                  <span>{selectedSubject} Tests</span>
                </h1>
                <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                  Select a specific test under {selectedSubject} to begin your targeted practice. Monitor accuracy and review detailed solutions.
                </p>

                {/* Quick Subject Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-3 py-1 rounded-xl bg-background dark:bg-slate-900 border border-border text-xs font-bold text-text-secondary dark:text-text-muted">
                    {filteredTests.length} {filteredTests.length === 1 ? 'Test' : 'Tests'} Available
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-background dark:bg-slate-900 border border-border text-xs font-bold text-text-secondary dark:text-text-muted">
                    30 Mins Standard Duration
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-background dark:bg-slate-900 border border-border text-xs font-bold text-text-secondary dark:text-text-muted">
                    Instant Score & Solutions
                  </span>
                </div>
              </div>

              {/* Search Bar for Tests */}
              <div className="relative w-full md:w-80 shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder={`Search ${selectedSubject} tests...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl pl-11 pr-10 py-3 text-sm text-text-primary dark:text-text-inverse focus:outline-none focus:border-rose-500 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subject Notes Section (If Uploaded) */}
          {subjectNotes[selectedSubject] && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary dark:text-text-inverse flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-rose-500" />
                  <span>Comprehensive Subject Notes</span>
                </h2>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Verified PDF
                </span>
              </div>

              <div className="bg-surface dark:bg-[#111827] border border-border p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-500/20 to-red-500/10 text-rose-500 border border-rose-500/30 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary dark:text-text-inverse">
                      {selectedSubject} Notes & Revision Guide.pdf
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                      Download or preview comprehensive revision notes, core theory, and quick reference cheatsheets for {selectedSubject}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                  <button 
                    onClick={() => window.open(subjectNotes[selectedSubject], "_blank")} 
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-primary dark:text-text-inverse rounded-xl font-bold text-xs transition-colors border border-border shadow-sm"
                  >
                    View in Browser
                  </button>
                  <a 
                    href={subjectNotes[selectedSubject]} 
                    download={`${selectedSubject}_Notes.pdf`} 
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tests Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary dark:text-text-inverse flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-rose-500" />
                <span>Available Mock Tests</span>
              </h2>
              <span className="text-xs font-semibold text-text-muted">
                {filteredTests.length} tests found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-surface dark:bg-[#111827] rounded-3xl border border-border p-8">
                  <div className="w-16 h-16 bg-background dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-border shadow-sm">
                    <Target className="w-8 h-8 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse mb-1">
                    No tests found
                  </h3>
                  <p className="text-sm text-text-muted max-w-md">
                    {searchQuery 
                      ? `No tests match "${searchQuery}". Clear your search to see all tests.`
                      : `No practice tests are currently available for ${selectedSubject}.`}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
                    >
                      Reset Search Filter
                    </button>
                  )}
                </div>
              ) : (
                filteredTests.map((test, index) => {
                  const storageKey = `testResult_${user?.email || 'guest'}_${test.id}`;
                  const savedResultRaw = localStorage.getItem(storageKey);
                  let savedResult: any = null;
                  if (savedResultRaw) {
                    try { savedResult = JSON.parse(savedResultRaw); } catch (e) {}
                  }
                  const hasTaken = savedResult !== null;
                  const questionCount = test.questions?.length || 20;

                  return (
                    <div
                      key={test.id}
                      className="group bg-surface dark:bg-[#111827] rounded-3xl border border-border hover:border-rose-500/50 dark:hover:border-rose-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                    >
                      {/* Top Accent Line */}
                      <div className={`h-1 w-full ${hasTaken ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-red-500'}`}></div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                        
                        {/* Header Row: Badge & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-xs flex items-center justify-center">
                              #{index + 1}
                            </span>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
                              Mock Assessment
                            </span>
                          </div>

                          {/* Status Badge */}
                          {hasTaken ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                              <Check className="w-3.5 h-3.5" />
                              <span>{savedResult?.score !== undefined ? `Score: ${savedResult.score}` : 'Completed'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background dark:bg-slate-900 border border-border text-xs font-bold text-text-muted">
                              <Clock className="w-3 h-3 text-rose-500" />
                              <span>Ready</span>
                            </span>
                          )}
                        </div>

                        {/* Test Title & Subject Tag */}
                        <div className="space-y-1.5">
                          <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse group-hover:text-rose-500 transition-colors line-clamp-2">
                            {test.title}
                          </h3>
                          <p className="text-xs text-text-muted">
                            Targeted module test covering core {selectedSubject} syllabus.
                          </p>
                        </div>

                        {/* Test Metadata Grid */}
                        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border/70">
                          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary dark:text-text-muted bg-background/60 dark:bg-slate-900/60 p-2 rounded-xl border border-border/50">
                            <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{test.duration || "30 Mins"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary dark:text-text-muted bg-background/60 dark:bg-slate-900/60 p-2 rounded-xl border border-border/50">
                            <HelpCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{questionCount} Questions</span>
                          </div>
                        </div>

                      </div>

                      {/* Card Footer */}
                      <div className="px-6 py-4 bg-background/50 dark:bg-slate-900/50 border-t border-border flex items-center justify-between">
                        <span className="text-xs font-bold text-text-muted">
                          {hasTaken ? "Retake for higher score" : "Standard 70% passing"}
                        </span>

                        <Link
                          to={`/take-test/${test.id}`}
                          state={{ from: window.location.pathname + window.location.search }}
                          className={`px-4 py-2 rounded-xl font-bold text-xs text-white transition-all inline-flex items-center gap-1.5 shadow-sm ${
                            hasTaken
                              ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                              : "bg-rose-500 hover:bg-rose-600 hover:shadow-[0_0_15px_rgba(244,63,94,0.35)]"
                          }`}
                        >
                          {hasTaken ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retake Test</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Take Test</span>
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

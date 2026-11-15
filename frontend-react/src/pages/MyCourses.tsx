import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Award, 
  PlayCircle, 
  BookOpen, 
  Calendar, 
  User, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  Trash2, 
  Search, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  TrendingUp, 
  AlertCircle,
  X
} from "lucide-react";
import CertificateModal from "../components/CertificateModal";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { getCourseById } from "../data/coursesData";

type FilterTab = "ALL" | "IN_PROGRESS" | "COMPLETED" | "UNPAID";

export default function MyCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<{name: string, course: string, id: string} | null>(null);
  const [generatingCertIdx, setGeneratingCertIdx] = useState<number | null>(null);
  const [certNameInput, setCertNameInput] = useState("");
  const [courseSettings, setCourseSettings] = useState<Record<string, any>>({});
  
  // Search and Filter Tab State
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = () => {
      const existingStr = localStorage.getItem("enrolledCourses");
      if (existingStr && user?.email) {
        try {
          const parsed = JSON.parse(existingStr);
          
          // Deduplicate by courseId, prioritizing PAID status
          const bestEnrollments = new Map();
          
          for (const e of parsed) {
            const matchEmail = e.email?.toLowerCase().trim() === user.email?.toLowerCase().trim();
            const matchAccountEmail = e.accountEmail?.toLowerCase().trim() === user.email?.toLowerCase().trim();
            
            if (matchEmail || matchAccountEmail) {
              const existing = bestEnrollments.get(e.courseId);
              if (!existing) {
                bestEnrollments.set(e.courseId, e);
              } else {
                 const isPaid = (status: string) => ["PAID", "completed", "active", "Success"].includes(status);
                 const existingPaid = isPaid(existing.status);
                 const currentPaid = isPaid(e.status);
                 
                 if (currentPaid && !existingPaid) {
                   bestEnrollments.set(e.courseId, e);
                 } else if (currentPaid === existingPaid) {
                   bestEnrollments.set(e.courseId, e);
                 }
              }
            }
          }
          
          const sortedEnrollments = Array.from(bestEnrollments.values()).sort((a: any, b: any) => 
            new Date(b.dateRegistered).getTime() - new Date(a.dateRegistered).getTime()
          );
          
          setEnrollments(sortedEnrollments);
          
          const settingsStr = localStorage.getItem("courseSettings");
          if (settingsStr) {
            try {
              setCourseSettings(JSON.parse(settingsStr));
            } catch (e) {}
          }
        } catch (e) {}
      }
    };

    loadData();
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, [user]);

  const cancelRegistration = (index: number) => {
    if (window.confirm("Are you sure you want to cancel this registration?")) {
      const updated = [...enrollments];
      const canceled = updated.splice(index, 1)[0];
      setEnrollments(updated);

      const existingStr = localStorage.getItem("enrolledCourses");
      if (existingStr) {
        const parsed = JSON.parse(existingStr);
        const newParsed = parsed.filter((e: any) => 
          !(e.courseId === canceled.courseId && 
           (e.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim() || e.accountEmail?.toLowerCase().trim() === user?.email?.toLowerCase().trim()))
        );
        localStorage.setItem("enrolledCourses", JSON.stringify(newParsed));
      }
    }
  };

  const handleGenerateSubmit = () => {
    if (!certNameInput.trim()) return;
    const idx = generatingCertIdx;
    if (idx === null) return;

    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCertId = `CS-${datePart}-${randomPart}`;

    const updated = [...enrollments];
    updated[idx].certificateName = certNameInput;
    updated[idx].certificateId = newCertId;
    setEnrollments(updated);
    
    const existingStr = localStorage.getItem("enrolledCourses");
    if (existingStr) {
      const parsed = JSON.parse(existingStr);
      const globalIndex = parsed.findIndex((e: any) => 
        e.courseId === updated[idx].courseId && 
        (e.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim() || e.accountEmail?.toLowerCase().trim() === user?.email?.toLowerCase().trim())
      );
      if (globalIndex > -1) {
        parsed[globalIndex].certificateName = certNameInput;
        parsed[globalIndex].certificateId = newCertId;
        localStorage.setItem("enrolledCourses", JSON.stringify(parsed));
      }
    }
    setGeneratingCertIdx(null);
  };

  // Helper to determine effective status
  const getCourseStatus = (course: any): "COMPLETED" | "UNPAID" | "IN_PROGRESS" => {
    if (course.status === "completed" || courseSettings[course.courseName]?.certificatePublished) {
      return "COMPLETED";
    }
    if (course.status === "UNPAID") {
      return "UNPAID";
    }
    return "IN_PROGRESS";
  };

  // Counts for tabs
  const stats = useMemo(() => {
    let completed = 0;
    let unpaid = 0;
    let inProgress = 0;

    enrollments.forEach(c => {
      const s = getCourseStatus(c);
      if (s === "COMPLETED") completed++;
      else if (s === "UNPAID") unpaid++;
      else inProgress++;
    });

    return {
      total: enrollments.length,
      completed,
      unpaid,
      inProgress
    };
  }, [enrollments, courseSettings]);

  // Filtered list
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((course, originalIndex) => {
      const status = getCourseStatus(course);
      
      // Filter tab
      if (activeFilter === "COMPLETED" && status !== "COMPLETED") return false;
      if (activeFilter === "UNPAID" && status !== "UNPAID") return false;
      if (activeFilter === "IN_PROGRESS" && status !== "IN_PROGRESS") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const meta = getCourseById(course.courseId);
        const nameMatch = (course.courseName || "").toLowerCase().includes(q);
        const studentMatch = (course.fullName || "").toLowerCase().includes(q);
        const trainerMatch = (meta?.trainer?.name || meta?.trainerName || "").toLowerCase().includes(q);
        if (!nameMatch && !studentMatch && !trainerMatch) return false;
      }

      return true;
    });
  }, [enrollments, activeFilter, searchQuery, courseSettings]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="flex-1 bg-background dark:bg-background text-text-primary dark:text-text-inverse min-h-screen py-8 sm:py-12 px-4 sm:px-6 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-400 mb-3 border border-primary/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-text-primary dark:text-white">
              My Courses
            </h1>
            <p className="text-text-muted dark:text-text-muted text-sm sm:text-base mt-1.5 max-w-xl">
              Track your learning journey, access live modules, manage pending fees, and download verified certificates.
            </p>
          </div>

          <Link to="/dashboard/courses">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all hover:scale-[1.02]">
              <Sparkles className="w-4 h-4" />
              <span>Browse Programs</span>
            </button>
          </Link>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface dark:bg-[#111827] border border-border/80 dark:border-border/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary dark:text-white leading-none">{stats.total}</div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Total Enrolled</div>
            </div>
          </div>

          <div className="bg-surface dark:bg-[#111827] border border-border/80 dark:border-border/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary dark:text-white leading-none">{stats.inProgress}</div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">In Progress</div>
            </div>
          </div>

          <div className="bg-surface dark:bg-[#111827] border border-border/80 dark:border-border/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary dark:text-white leading-none">{stats.completed}</div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Completed</div>
            </div>
          </div>

          <div className="bg-surface dark:bg-[#111827] border border-border/80 dark:border-border/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary dark:text-white leading-none">{stats.unpaid}</div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Pending Payment</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-secondary dark:bg-[#111827] border border-border/80 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === "ALL"
                  ? "bg-surface dark:bg-slate-800 text-text-primary dark:text-white shadow-xs"
                  : "text-text-muted hover:text-text-primary dark:hover:text-white"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveFilter("IN_PROGRESS")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === "IN_PROGRESS"
                  ? "bg-surface dark:bg-slate-800 text-text-primary dark:text-white shadow-xs"
                  : "text-text-muted hover:text-text-primary dark:hover:text-white"
              }`}
            >
              In Progress ({stats.inProgress})
            </button>
            <button
              onClick={() => setActiveFilter("COMPLETED")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === "COMPLETED"
                  ? "bg-surface dark:bg-slate-800 text-text-primary dark:text-white shadow-xs"
                  : "text-text-muted hover:text-text-primary dark:hover:text-white"
              }`}
            >
              Completed ({stats.completed})
            </button>
            <button
              onClick={() => setActiveFilter("UNPAID")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === "UNPAID"
                  ? "bg-surface dark:bg-slate-800 text-text-primary dark:text-white shadow-xs"
                  : "text-text-muted hover:text-text-primary dark:hover:text-white"
              }`}
            >
              Pending ({stats.unpaid})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search enrolled courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface dark:bg-[#111827] border border-border/80 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-text-primary dark:text-white focus:outline-none focus:border-primary transition-colors shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Course Cards Grid */}
        {filteredEnrollments.length === 0 ? (
          <div className="bg-surface/60 dark:bg-[#111827]/60 backdrop-blur-md rounded-3xl border border-border/80 p-12 sm:p-16 text-center shadow-xs">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-text-primary dark:text-white">
              {enrollments.length === 0 ? "You haven't enrolled in any courses yet" : "No courses match your filter"}
            </h3>
            <p className="text-text-muted dark:text-text-muted text-sm max-w-md mx-auto mb-6">
              {enrollments.length === 0 
                ? "Explore our career-accelerating training bootcamps to start your learning journey." 
                : "Try clearing your search query or switching to another filter tab above."}
            </p>
            {enrollments.length === 0 ? (
              <Link to="/dashboard/courses">
                <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 hover:scale-105">
                  Explore Courses Now
                </button>
              </Link>
            ) : (
              <button 
                onClick={() => { setActiveFilter("ALL"); setSearchQuery(""); }}
                className="px-5 py-2.5 bg-surface-secondary dark:bg-slate-800 text-text-primary dark:text-white font-bold text-xs rounded-xl hover:bg-border transition-colors border border-border"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredEnrollments.map((course, idx) => {
              const meta = getCourseById(course.courseId);
              const status = getCourseStatus(course);
              const originalIndex = enrollments.findIndex(e => e.courseId === course.courseId);

              // Accent color border based on status
              const accentColor = 
                status === "COMPLETED" 
                  ? "from-emerald-500 to-teal-400" 
                  : status === "UNPAID" 
                    ? "from-amber-500 to-orange-500" 
                    : "from-blue-600 to-cyan-500";

              return (
                <motion.div 
                  key={course.courseId || idx}
                  variants={itemVariants}
                  className="group bg-surface dark:bg-[#111827] rounded-2xl border border-border dark:border-border/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Subtle top accent gradient */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColor}`} />

                  <div>
                    {/* Header Row: Category Tag & Status Pill */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted dark:text-text-muted bg-surface-secondary dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-border/50">
                        {meta?.category?.toUpperCase() || "PROGRAM"}
                      </span>

                      {/* Status Badge */}
                      {status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Completed</span>
                        </span>
                      )}

                      {status === "UNPAID" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Pending Payment</span>
                        </span>
                      )}

                      {status === "IN_PROGRESS" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                          <span>In Progress</span>
                        </span>
                      )}
                    </div>

                    {/* Course Title */}
                    <h3 className="text-xl font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors leading-snug mb-4">
                      {course.courseName}
                    </h3>

                    {/* Metadata Box */}
                    <div className="bg-surface-secondary/50 dark:bg-slate-900/40 rounded-xl p-3.5 border border-border/60 space-y-2 mb-4">
                      {/* Trainer Row */}
                      {(meta?.trainer?.name || meta?.trainerName) && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-muted font-medium flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-primary" />
                            <span>Trainer:</span>
                          </span>
                          <span className="font-bold text-text-primary dark:text-white truncate max-w-[200px]">
                            {meta?.trainer?.name || meta?.trainerName}
                            {(meta?.trainer?.company || meta?.trainerCompany) && (
                              <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                · {meta?.trainer?.company || meta?.trainerCompany}
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Student Row */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted font-medium flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-text-muted" />
                          <span>Student:</span>
                        </span>
                        <span className="font-semibold text-text-primary dark:text-text-secondary">
                          {course.fullName || user?.name || "Student"}
                        </span>
                      </div>

                      {/* Registration Date Row */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          <span>Registered:</span>
                        </span>
                        <span className="font-medium text-text-muted">
                          {course.dateRegistered ? new Date(course.dateRegistered).toLocaleDateString() : "Recently"}
                        </span>
                      </div>
                    </div>

                    {/* Status Notice / Progress */}
                    {status === "UNPAID" && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Seat reserved! Complete fee payment to unlock batch schedules and modules.</span>
                      </div>
                    )}

                    {status === "IN_PROGRESS" && (
                      <div className="space-y-1.5 mb-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-text-muted">Course Completion</span>
                          <span className="text-primary">60%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full w-3/5 transition-all duration-500" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3 mt-2">
                    {status === "UNPAID" ? (
                      <>
                        <button
                          onClick={() => cancelRegistration(originalIndex > -1 ? originalIndex : idx)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-text-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>

                        <Link 
                          to={`/dashboard/payment/${course.courseId}`} 
                          state={{ newEnrollment: course }}
                        >
                          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg transition-all hover:scale-[1.02]">
                            <CreditCard className="w-4 h-4" />
                            <span>Make Payment</span>
                          </button>
                        </Link>
                      </>
                    ) : status === "COMPLETED" ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <Link to={`/dashboard/course/${course.courseId}`}>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-secondary dark:bg-slate-800 hover:bg-border text-text-primary dark:text-white font-bold text-xs rounded-xl transition-colors border border-border">
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Review Course</span>
                          </button>
                        </Link>

                        {course.certificateName ? (
                          <button 
                            onClick={() => setSelectedCert({ name: course.certificateName, course: course.courseName, id: course.certificateId })}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>View Certificate</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => { setGeneratingCertIdx(originalIndex > -1 ? originalIndex : idx); setCertNameInput(course.fullName); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Claim Certificate</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex justify-end">
                        <Link to={`/dashboard/course/${course.courseId}`}>
                          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 hover:scale-[1.02] group-hover:bg-primary">
                            <PlayCircle className="w-4 h-4" />
                            <span>Go to Course</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal 
          studentName={selectedCert.name} 
          courseName={selectedCert.course} 
          certificateId={selectedCert.id}
          templateImage={courseSettings[selectedCert.course]?.templateImage}
          onClose={() => setSelectedCert(null)} 
        />
      )}

      {/* Generate Certificate Prompt Modal */}
      {generatingCertIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface dark:bg-[#111827] rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-border dark:border-border animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white">Generate Certificate</h3>
            </div>
            <p className="text-xs sm:text-sm text-text-muted dark:text-text-muted mb-4">
              Enter your exact name as you want it to appear on your verified credential. 
              <span className="text-rose-500 font-bold block mt-1">Note: This name cannot be modified after issuing.</span>
            </p>
            <input 
              type="text" 
              value={certNameInput}
              onChange={(e) => setCertNameInput(e.target.value)}
              placeholder="e.g. Saurabh Tiwari"
              className="w-full bg-background dark:bg-slate-900 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary dark:text-white focus:outline-none focus:border-primary mb-5"
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setGeneratingCertIdx(null)}
                className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-primary dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateSubmit}
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                Generate Credential
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

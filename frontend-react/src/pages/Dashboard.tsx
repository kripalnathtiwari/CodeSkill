import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, PlayCircle, BookOpen, Download, Settings, Lock, Sparkles, TrendingUp } from "lucide-react";
import CertificateModal from "../components/CertificateModal";
import ContributionGraph from "../components/ContributionGraph";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../utils/apiConfig";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<{name: string, course: string, id: string} | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);
  const [dsaStats, setDsaStats] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [testStats, setTestStats] = useState({ attempted: 0, correct: 0 });
  const [generatingCertIdx, setGeneratingCertIdx] = useState<number | null>(null);
  const [certNameInput, setCertNameInput] = useState("");
  const [courseSettings, setCourseSettings] = useState<Record<string, any>>({});

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ text: "", type: "" });
  const [trainerId, setTrainerId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      // Load enrollments
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
                 
                 // Upgrade to PAID if current is PAID and existing is UNPAID
                 if (currentPaid && !existingPaid) {
                   bestEnrollments.set(e.courseId, e);
                 } else if (currentPaid === existingPaid) {
                   // If both have the same status priority, keep the latest one
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

      // Load solved problems count and compute difficulty breakdown
      const fetchDsaStats = async () => {
        let solvedArr: string[] = [];
        const solvedStr = localStorage.getItem(`solved_problems_progress_${user?.email || "guest"}`);
        if (solvedStr) {
          try {
            solvedArr = JSON.parse(solvedStr);
            let easy = 0, medium = 0, hard = 0;
            
            solvedArr.forEach((qId: string) => {
              const d = localStorage.getItem(`q_difficulty_${qId}`);
              if (d === "Easy" || d === "easy") easy++;
              else if (d === "Medium" || d === "medium") medium++;
              else if (d === "Hard" || d === "hard") hard++;
              else easy++; // fallback
            });
            
            setDsaStats({ easy, medium, hard, total: solvedArr.length });
          } catch (e) {}
        }
      };
      fetchDsaStats();

      // Load test statistics
      if (user?.email) {
        try {
          const allScores = JSON.parse(localStorage.getItem("all_student_scores") || "[]");
          const myScores = allScores.filter((s: any) => s.studentEmail === user.email);
          
          let totalCorrect = 0;
          let totalAttempted = 0;

          myScores.forEach((s: any) => {
            totalCorrect += (s.score || 0);
            
            // Try to find the exact attempt count from testResult_
            const testResult = localStorage.getItem(`testResult_${s.testId}`);
            if (testResult) {
              const parsedResult = JSON.parse(testResult);
              if (parsedResult.selectedAnswers) {
                totalAttempted += Object.keys(parsedResult.selectedAnswers).length;
              } else {
                totalAttempted += (s.totalQuestions || 0);
              }
            } else {
               totalAttempted += (s.totalQuestions || 0);
            }
          });

          setTestStats({ attempted: totalAttempted, correct: totalCorrect });
        } catch (e) {}
      }
      
      // Load trainer ID for Instructors
      if (user?.role === "INSTRUCTOR") {
        const savedColleges = localStorage.getItem("admin_colleges_v2");
        if (savedColleges) {
          try {
            const colleges = JSON.parse(savedColleges);
            for (const college of colleges) {
              const tutor = college.tutors.find((t: any) => t.email === user.email);
              if (tutor && tutor.trainerId) {
                setTrainerId(tutor.trainerId);
                break;
              }
            }
          } catch (e) {}
        }
      }
    };

    loadData();
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, [user]);

    // Load solved problems count and compute difficulty breakdown
    const fetchDsaStats = async () => {
      let solvedArr: string[] = [];
      const solvedStr = localStorage.getItem(`solved_problems_progress_${user?.email || "guest"}`);
      if (solvedStr) {
        try {
          solvedArr = JSON.parse(solvedStr);
        } catch (e) {}
      }
      setSolvedCount(solvedArr.length);

      if (solvedArr.length > 0) {
        try {
          const mock = [
            { _id: "p1", difficulty: "Easy" },
            { _id: "p2", difficulty: "Medium" },
            { _id: "p3", difficulty: "Hard" },
            { _id: "p4", difficulty: "Medium" },
          ];
          const saved = localStorage.getItem("admin_custom_problems");
          let custom = [];
          if (saved) {
            try { custom = JSON.parse(saved); } catch (e) {}
          }
          
          let fetched = [];
          try {
            const res = await fetch(getApiUrl("/api/v1/questions?limit=100"));
            const data = await res.json();
            if (data.questions) fetched = data.questions;
          } catch(e) {}
          
          const allQs = [...fetched, ...mock, ...custom];
          const diffMap = new Map();
          allQs.forEach((q: any) => { if (q._id) diffMap.set(String(q._id), q.difficulty); });
          
          let easy = 0, medium = 0, hard = 0;
          solvedArr.forEach(id => {
            const d = diffMap.get(String(id));
            if (d === "Easy" || d === "easy") easy++;
            else if (d === "Medium" || d === "medium") medium++;
            else if (d === "Hard" || d === "hard") hard++;
            else easy++; // fallback
          });
          
          setDsaStats({ easy, medium, hard, total: solvedArr.length });
        } catch (e) {}
      }
    };
    // fetchDsaStats(); is already called inside loadData, no need to duplicate

  const markCompleted = (index: number) => {
    const updated = [...enrollments];
    updated[index].status = "completed";
    setEnrollments(updated);
    
    // Also update global store
    const existingStr = localStorage.getItem("enrolledCourses");
    if (existingStr) {
      const parsed = JSON.parse(existingStr);
      const globalIndex = parsed.findIndex((e: any) => 
        e.courseId === updated[index].courseId && 
        (e.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim() || e.accountEmail?.toLowerCase().trim() === user?.email?.toLowerCase().trim())
      );
      if (globalIndex > -1) {
        parsed[globalIndex].status = "completed";
        localStorage.setItem("enrolledCourses", JSON.stringify(parsed));
      }
    }
  };

  const cancelRegistration = (index: number) => {
    if (window.confirm("Are you sure you want to cancel this registration?")) {
      const updated = [...enrollments];
      const canceled = updated.splice(index, 1)[0];
      setEnrollments(updated);

      // Update global store
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

    // Generate unique ID like CS-YYYY-MMDD-XXXX
    const datePart = new Date().toISOString().slice(2,10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCertId = `CS-${datePart}-${randomPart}`;

    const updated = [...enrollments];
    updated[idx].certificateName = certNameInput;
    updated[idx].certificateId = newCertId;
    setEnrollments(updated);
    
    // Update global store
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
    setCertNameInput("");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "New passwords do not match.", type: "error" });
      return;
    }

    const storedPasswords = JSON.parse(localStorage.getItem("user_passwords") || "{}");
    const userEmail = user?.email?.toLowerCase();
    
    if (userEmail) {
      const expectedCurrent = storedPasswords[userEmail] || (user?.role === "INSTRUCTOR" ? "Papa9450@" : "");
      
      if (expectedCurrent && currentPassword !== expectedCurrent) {
        setPasswordMsg({ text: "Incorrect current password.", type: "error" });
        return;
      }

      storedPasswords[userEmail] = newPassword;
      localStorage.setItem("user_passwords", JSON.stringify(storedPasswords));
      setPasswordMsg({ text: "Password successfully updated!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setTimeout(() => setPasswordMsg({ text: "", type: "" }), 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen relative overflow-hidden">
      {/* Background Details */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto space-y-10 py-12 px-6 relative z-10"
      >
        
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent inline-block">Your Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">Manage your active enrollments, track coding progress, and view your earned certificates in one beautiful place.</p>
        </motion.div>

        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 ${(!user?.role || user?.role === "STUDENT") ? "" : "xl:grid-cols-2"}`}>
          {/* Coding Statistics Panel */}
          <motion.div variants={itemVariants} className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10"></div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Coding Stats</h3>
              </div>
              <div className="flex items-baseline space-x-2 mb-6">
                <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                  {solvedCount}
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Problems</div>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-6">
              
              {/* Multi-colored Donut Chart for DSA */}
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" className="stroke-slate-200 dark:stroke-slate-800 opacity-20" strokeWidth="8" />
                  {(() => {
                    const total = dsaStats.total;
                    if (total === 0) return null;
                    
                    const c = 2 * Math.PI * 45; // 282.743
                    const easyLen = (dsaStats.easy / total) * c;
                    const medLen = (dsaStats.medium / total) * c;
                    const hardLen = (dsaStats.hard / total) * c;
                    
                    return (
                      <>
                        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-[#22c55e]" strokeDasharray={`${easyLen} ${c}`} strokeDashoffset={0} strokeLinecap="round" />
                        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-[#f59e0b]" strokeDasharray={`${medLen} ${c}`} strokeDashoffset={-easyLen} strokeLinecap="round" />
                        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-[#ef4444]" strokeDasharray={`${hardLen} ${c}`} strokeDashoffset={-(easyLen + medLen)} strokeLinecap="round" />
                      </>
                    );
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total</span>
                  <span className="text-xl font-black text-slate-900 dark:text-slate-100">{dsaStats.total}</span>
                </div>
              </div>

              {/* Stats Breakdown / Legend */}
              <div className="flex flex-col space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#22c55e]"></span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Easy</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{dsaStats.easy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Medium</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{dsaStats.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Hard</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{dsaStats.hard}</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* MCQ Analytics Card for Students */}
          {(!user?.role || user?.role === "STUDENT") && (
            <motion.div variants={itemVariants} className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -z-10"></div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">MCQ Analytics</h3>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-6">
                  {testStats.attempted * 10 + testStats.correct * 5}
                </div>
              </div>

              <div className="flex flex-col items-center space-y-6">
                
                {/* Circular Progress Donut */}
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" className="stroke-[#6366f1] dark:stroke-[#4f46e5]" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" className="stroke-[#22c55e] dark:stroke-[#10b981]" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${testStats.attempted > 0 ? (testStats.correct / testStats.attempted) * 282.74 : 0} 282.74`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Score</span>
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                      {testStats.correct}/{testStats.attempted}
                    </span>
                  </div>
                </div>

                {/* Stats Breakdown */}
                <div className="flex flex-col space-y-2 w-full pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Attempted</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{testStats.attempted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Correct</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{testStats.correct}</span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ATS Checker Card */}
          {(!user?.role || user?.role === "STUDENT") && (
            <Link to="/ats-checker" className="group h-full">
              <motion.div variants={itemVariants} className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 flex flex-col h-full shadow-xl shadow-slate-200/30 dark:shadow-none hover:shadow-fuchsia-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group-hover:border-fuchsia-500/50 border border-slate-200 dark:border-slate-800">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-fuchsia-500/10 to-transparent rounded-full blur-[50px] -z-10 group-hover:from-fuchsia-500/20 transition-colors duration-500"></div>
                <div className="flex flex-col space-y-4 mb-4">
                  <div className="w-12 h-12 bg-fuchsia-100 dark:bg-fuchsia-900/40 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">ATS Score Checker</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1 text-sm leading-relaxed">
                  Upload your resume and a job description to get an AI-powered ATS score. Discover missing keywords and get actionable tips.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-fuchsia-600 dark:text-fuchsia-400 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform duration-300">
                    Check Score <Sparkles className="w-3 h-3 ml-1" />
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-fuchsia-500 group-hover:text-white transition-colors duration-300">
                    &rarr;
                  </div>
                </div>
              </motion.div>
            </Link>
          )}

          {/* CV Builder Card */}
          {(!user?.role || user?.role === "STUDENT") && (
            <Link to="/cv-builder" className="group h-full">
              <motion.div variants={itemVariants} className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 flex flex-col h-full shadow-xl shadow-slate-200/30 dark:shadow-none hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group-hover:border-cyan-500/50 border border-slate-200 dark:border-slate-800">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-[50px] -z-10 group-hover:from-cyan-500/20 transition-colors duration-500"></div>
                <div className="flex flex-col space-y-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/40 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Pro CV Builder</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1 text-sm leading-relaxed">
                  Craft a stunning, professional, and ATS-friendly resume from scratch using our customizable templates and preview editor.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-cyan-600 dark:text-cyan-400 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform duration-300">
                    Build CV <Sparkles className="w-3 h-3 ml-1" />
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                    &rarr;
                  </div>
                </div>
              </motion.div>
            </Link>
          )}
        </div>

        {/* Contribution Graph for Students */}
        {(!user?.role || user?.role === "STUDENT") && (
          <motion.div variants={itemVariants} className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <ContributionGraph />
          </motion.div>
        )}

        {/* Instructor Profile */}
        {user?.role === "INSTRUCTOR" && (
          <motion.div variants={itemVariants} className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <BookOpen className="w-6 h-6 text-emerald-500 mr-3" />
              <h2 className="text-2xl font-bold">Instructor Profile</h2>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 font-bold text-4xl shadow-inner">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email.split('@')[0]}
                </p>
                <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                  <Award className="w-5 h-5" />
                  <span className="font-mono font-bold">Instructor ID: {trainerId || `TRN-${user.id.substring(0, 6).toUpperCase()}`}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Account Settings / Password Change */}
        {user?.role === "INSTRUCTOR" && (
        <motion.div variants={itemVariants} className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center mb-6">
            <Lock className="w-6 h-6 text-emerald-500 mr-3" />
            <h2 className="text-2xl font-bold">Account Security</h2>
          </div>
          
          {passwordMsg.text && (
            <div className={`p-4 rounded-xl mb-6 ${passwordMsg.type === 'error' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
              <input 
                type="password" 
                required 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="hidden md:block"></div> {/* Spacer */}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
              <input 
                type="password" 
                required 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-emerald-600/20">
                Update Password
              </button>
            </div>
          </form>
        </motion.div>
        )}


        <motion.div variants={itemVariants} className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-emerald-500" />
          <h2 className="text-3xl font-black">Enrolled Courses</h2>
        </motion.div>

        {enrollments.length === 0 ? (
          <motion.div variants={itemVariants} className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">No active enrollments</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto text-lg">You haven't registered for any courses yet. Start your learning journey today!</p>
            <Link to="/courses-training">
              <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-1">
                Explore Courses Now
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {enrollments.map((course, idx) => (
              <div key={idx} className="group glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col shadow-xl shadow-slate-200/30 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] -z-10 group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{course.courseName}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Registered on: {new Date(course.dateRegistered).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Student: <span className="font-semibold text-slate-700 dark:text-slate-300">{course.fullName}</span></p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    (course.status === 'completed' || courseSettings[course.courseName]?.certificatePublished) 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : course.status === 'UNPAID'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {(course.status === 'completed' || courseSettings[course.courseName]?.certificatePublished) ? 'Completed' : course.status === 'UNPAID' ? 'Pending Payment' : 'In Progress'}
                  </span>
                </div>

                <div className="flex-1"></div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                  {(course.status === 'completed' || courseSettings[course.courseName]?.certificatePublished) ? (
                    <>
                      <Link to={`/course/${course.courseId}`} className="mr-2">
                        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Go to Course
                        </button>
                      </Link>
                      {course.certificateName ? (
                        <button 
                          onClick={() => setSelectedCert({ name: course.certificateName, course: course.courseName, id: course.certificateId })}
                          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          View Certificate
                        </button>
                      ) : (
                        <button 
                          onClick={() => { setGeneratingCertIdx(idx); setCertNameInput(course.fullName); }}
                          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Generate Certificate
                        </button>
                      )}
                    </>
                  ) : course.status === 'UNPAID' ? (
                    <>
                      <button 
                        onClick={() => cancelRegistration(idx)}
                        className="flex items-center px-4 py-2 bg-slate-100 hover:bg-red-500 hover:text-white dark:bg-slate-800 dark:hover:bg-red-500 text-slate-600 dark:text-slate-300 font-bold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <Link to={`/payment/${course.courseId}`} state={{ newEnrollment: course }}>
                        <button className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-colors shadow-lg">
                          Make Payment
                        </button>
                      </Link>
                    </>
                  ) : (
                      <Link to={`/course/${course.courseId}`} className="mr-2">
                        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Go to Course
                        </button>
                      </Link>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

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
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2">Generate Your Certificate</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Please enter your exact name as you want it to appear on your certificate. 
              <strong className="text-rose-500 block mt-2">Note: You can only generate this once!</strong>
            </p>
            <input 
              type="text" 
              value={certNameInput}
              onChange={(e) => setCertNameInput(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 mb-6"
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setGeneratingCertIdx(null)}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateSubmit}
                disabled={!certNameInput.trim()}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
              >
                Confirm & Generate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

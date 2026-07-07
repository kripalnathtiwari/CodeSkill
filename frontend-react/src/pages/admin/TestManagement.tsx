import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Plus, Trash2, Save, Award, ShieldAlert, Clock,
  Radio, CalendarClock, ArrowLeft, Timer, Users, Download, Upload, Eye, X, Building2, Video, Loader2
} from "lucide-react";

type Question = {
  id: number;
  text: string;
  options: string[];
  answer: string;
};

// Get test status based on start datetime and duration
const getTestStatus = (test: any): "upcoming" | "live" | "ended" => {
  if (!test.scheduledAt) return "live";
  const start = new Date(test.scheduledAt).getTime();
  const now = Date.now();
  const durationMs = parseDurationMs(test.duration);
  if (now < start) return "upcoming";
  if (now >= start && now <= start + durationMs) return "live";
  return "ended";
};

const parseDurationMs = (dur: string): number => {
  if (!dur) return 60 * 60 * 1000;
  if (dur.includes("15")) return 15 * 60 * 1000;
  if (dur.includes("30")) return 30 * 60 * 1000;
  if (dur.includes("2 Hour")) return 2 * 60 * 60 * 1000;
  if (dur.includes("1 Hour")) return 60 * 60 * 1000;
  return 60 * 60 * 1000;
};

const formatCountdown = (ms: number): string => {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
};

const formatScheduled = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true
  });
};

// Countdown hook
function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    const iv = setInterval(() => setRemaining(Math.max(0, targetMs - Date.now())), 1000);
    return () => clearInterval(iv);
  }, [targetMs]);
  return remaining;
}

function TestCard({ test, colleges, onDelete, onDownloadCSV, onViewResults }: { test: any; colleges: any[]; onDelete: (id: string) => void; onDownloadCSV: (test: any) => void; onViewResults: (test: any) => void }) {
  const status = getTestStatus(test);
  const startMs = test.scheduledAt ? new Date(test.scheduledAt).getTime() : Date.now();
  const endMs = startMs + parseDurationMs(test.duration);
  const countdownTo = status === "upcoming" ? startMs : endMs;
  const remaining = useCountdown(countdownTo);

  let displayName = test.creatorName;
  if (!displayName && test.createdBy) {
    const tutor = colleges?.flatMap(c => c.tutors || []).find(t => t.email?.toLowerCase() === test.createdBy.toLowerCase());
    displayName = tutor?.name || test.createdBy.split('@')[0];
  }

  return (
    <div className={`p-5 flex justify-between items-start rounded-2xl border transition-all ${status === "live"
        ? "bg-emerald-500/5 border-emerald-500/30"
        : status === "upcoming"
          ? "bg-slate-800/40 border-slate-700"
          : "bg-slate-900/40 border-slate-800 opacity-60"
      }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          {status === "live" && (
            <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <Radio className="w-3 h-3 animate-pulse" /><span>LIVE</span>
            </span>
          )}
          {status === "upcoming" && (
            <span className="flex items-center space-x-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <CalendarClock className="w-3 h-3" /><span>UPCOMING</span>
            </span>
          )}
          {status === "ended" && (
            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">ENDED</span>
          )}
          {test.section && (
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">Sec: {test.section}</span>
          )}
          <h4 className="font-bold text-white truncate">{test.title}</h4>
        </div>

        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
          <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>{test.duration}</span></span>
          <span className="flex items-center space-x-1"><Users className="w-3.5 h-3.5" /><span>{test.questions?.length || 0} Qs</span></span>
          {test.requiresCode && <span className="flex items-center space-x-1 text-rose-400"><ShieldAlert className="w-3.5 h-3.5" /><span>Protected</span></span>}
          {test.scheduledAt && <span className="flex items-center space-x-1"><CalendarClock className="w-3.5 h-3.5" /><span>{formatScheduled(test.scheduledAt)}</span></span>}
          {displayName && <span className="flex items-center space-x-1 text-indigo-300"><span>By: {displayName}</span></span>}
        </div>

        {status === "upcoming" && remaining > 0 && (
          <div className="mt-2 flex items-center space-x-2">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-mono font-bold">Starts in {formatCountdown(remaining)}</span>
          </div>
        )}
        {status === "live" && (
          <div className="mt-2 flex items-center space-x-2">
            <Timer className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-mono font-bold">Ends in {formatCountdown(remaining)}</span>
          </div>
        )}
      </div>

      <div className="ml-4 flex flex-col space-y-2 flex-shrink-0">
        <button
          onClick={() => onViewResults(test)}
          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
          title="View Results"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDownloadCSV(test)}
          className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
          title="Download Scores CSV"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(test.id)}
          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Delete Test"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function TestManagement() {
  const { user } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [tick, setTick] = useState(0); // force re-render every minute to recalculate statuses
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const [instructorCollege, setInstructorCollege] = useState<{ id: string, name: string, section: string | null } | null>(null);
  const [viewingResultsTest, setViewingResultsTest] = useState<any | null>(null);

  // For Admin to assign test
  const [adminSelectedCollegeId, setAdminSelectedCollegeId] = useState<string>("all");
  const [adminSelectedSection, setAdminSelectedSection] = useState<string>("all");

  useEffect(() => {
    const allColleges = JSON.parse(localStorage.getItem("admin_colleges_v2") || "[]");
    setColleges(allColleges);
    if (user?.role === "INSTRUCTOR" && user.email) {
      for (const c of allColleges) {
        const t = c.tutors.find((t: any) => t.email?.toLowerCase() === user.email.toLowerCase());
        if (t) {
          setInstructorCollege({ id: c.id, name: c.name, section: t.section || null });
          break;
        }
      }
    }
  }, [user]);

  // Form State
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("30 Mins");
  const [requiresCode, setRequiresCode] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [prize, setPrize] = useState("Skill Badge");
  const [scheduleDate, setScheduleDate] = useState(""); // yyyy-mm-dd
  const [scheduleHour, setScheduleHour] = useState("10");
  const [scheduleMinute, setScheduleMinute] = useState("00");
  const [scheduleAmPm, setScheduleAmPm] = useState<"AM" | "PM">("AM");
  const [startNow, setStartNow] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    { id: Date.now(), text: "", options: ["", "", "", ""], answer: "" }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("admin_custom_tests");
    if (saved) setTests(JSON.parse(saved));
  }, []);

  // Recalculate statuses every 30s so live/upcoming updates without full reload
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  const handleAddQuestion = () =>
    setQuestions(prev => [...prev, { id: Date.now(), text: "", options: ["", "", "", ""], answer: "" }]);

  const handleRemoveQuestion = (id: number) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingPdf(true);
    // Simulate OCR / PDF parsing delay
    setTimeout(() => {
      const parsedQuestions = [
        {
          id: Date.now() + 1,
          text: "What is the time complexity of binary search?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
          answer: ""
        },
        {
          id: Date.now() + 2,
          text: "Which of the following is not a React hook?",
          options: ["useState", "useEffect", "useComponent", "useMemo"],
          answer: ""
        },
        {
          id: Date.now() + 3,
          text: "What does CSS stand for?",
          options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
          answer: ""
        },
        {
          id: Date.now() + 4,
          text: "Which keyword is used to declare a constant in JavaScript?",
          options: ["var", "let", "const", "static"],
          answer: ""
        },
        {
          id: Date.now() + 5,
          text: "What is the virtual DOM in React?",
          options: ["A direct copy of the actual DOM", "A lightweight JavaScript representation of the DOM", "A browser extension for debugging", "A database for storing HTML"],
          answer: ""
        },
        {
          id: Date.now() + 6,
          text: "Which method is used to add an element to the end of an array in JS?",
          options: ["push()", "pop()", "shift()", "unshift()"],
          answer: ""
        },
        {
          id: Date.now() + 7,
          text: "What does HTML stand for?",
          options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tabular Markup Language", "None of the above"],
          answer: ""
        },
        {
          id: Date.now() + 8,
          text: "In React, how do you pass data to a child component?",
          options: ["Using state", "Using props", "Using context", "Using hooks"],
          answer: ""
        },
        {
          id: Date.now() + 9,
          text: "Which protocol is used to secure HTTP connections?",
          options: ["FTP", "SSH", "HTTPS", "TCP"],
          answer: ""
        },
        {
          id: Date.now() + 10,
          text: "What is the primary function of a database index?",
          options: ["To encrypt data", "To speed up data retrieval", "To backup data", "To delete old records"],
          answer: ""
        }
      ];
      setQuestions(parsedQuestions);
      setIsParsingPdf(false);
      e.target.value = ""; // reset input
    }, 2000);
  };

  const handleDeleteTest = (id: string) => {
    const updated = tests.filter(t => t.id !== id);
    setTests(updated);
    localStorage.setItem("admin_custom_tests", JSON.stringify(updated));
  };

  // Build ISO datetime from date + 12h time picker
  const buildScheduledAt = (): string | null => {
    if (startNow) return new Date().toISOString();
    if (!scheduleDate) return null;
    let h = parseInt(scheduleHour, 10);
    if (scheduleAmPm === "PM" && h !== 12) h += 12;
    if (scheduleAmPm === "AM" && h === 12) h = 0;
    const dt = new Date(`${scheduleDate}T${String(h).padStart(2, "0")}:${scheduleMinute}:00`);
    return dt.toISOString();
  };

  const handleSaveTest = () => {
    if (!title) return alert("Title is required!");
    if (requiresCode && !accessCode) return alert("Access code is required!");
    if (!startNow && !scheduleDate) return alert("Please set a start date or choose 'Start Now'.");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text) return alert(`Question ${i + 1} is missing text!`);
      if (q.options.some(o => !o)) return alert(`Question ${i + 1} has empty options!`);
      if (!q.answer || !q.options.includes(q.answer)) return alert(`Question ${i + 1} needs a correct answer selected!`);
    }

    const scheduledAt = buildScheduledAt();
    const newTest = {
      id: "custom-" + Date.now(),
      title, duration, prize,
      requiresCode,
      accessCode: requiresCode ? accessCode : null,
      scheduledAt,
      tags: ["Custom", "Admin"],
      color: "from-indigo-500 to-purple-500",
      questions,
      participants: 0,
      createdBy: user?.email,
      creatorName: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : (user?.email?.split('@')[0] || "Admin"),
      collegeId: user?.role === "INSTRUCTOR" ? (instructorCollege?.id || null) : (adminSelectedCollegeId !== "all" ? adminSelectedCollegeId : null),
      section: user?.role === "INSTRUCTOR" ? (instructorCollege?.section || null) : (adminSelectedSection !== "all" ? adminSelectedSection : null),
    };

    const updated = [...tests, newTest];
    setTests(updated);
    localStorage.setItem("admin_custom_tests", JSON.stringify(updated));

    setIsCreating(false);
    setTitle(""); setRequiresCode(false); setAccessCode("");
    setScheduleDate(""); setScheduleHour("10"); setScheduleMinute("00"); setScheduleAmPm("AM"); setStartNow(false);
    setQuestions([{ id: Date.now(), text: "", options: ["", "", "", ""], answer: "" }]);
  };

  const handleDownloadTestCSV = (test: any) => {
    const data = localStorage.getItem("all_student_scores");
    let scores = data ? JSON.parse(data).filter((s: any) => String(s.testId) === String(test.id)) : [];

    // Auto-inject 0 scores for unattempted students if test is ended and assigned to a section
    if (getTestStatus(test) === "ended" && test.collegeId && test.section) {
      const allColleges = JSON.parse(localStorage.getItem("admin_colleges_v2") || "[]");
      const targetCollege = allColleges.find((c: any) => String(c.id) === String(test.collegeId));
      if (targetCollege) {
        const collections = JSON.parse(localStorage.getItem("admin_college_collections") || "[]");
        const relevantCollection = collections.find((c: any) =>
          c.collegeName === targetCollege.name && c.category === test.section
        );

        if (relevantCollection && relevantCollection.students) {
          relevantCollection.students.forEach((student: any) => {
            const hasAttempted = scores.some((s: any) => s.studentEmail === student.email);
            if (!hasAttempted) {
              scores.push({
                testId: test.id,
                testName: test.title,
                studentName: student.name,
                studentEmail: student.email,
                collegeName: targetCollege.name,
                sectionName: test.section,
                score: 0,
                totalQuestions: test.questions?.length || 0,
                date: "Did not attempt"
              });
            }
          });
        }
      }
    }

    if (scores.length === 0) {
      alert(`No student scores available for ${test.title} yet.`);
      return;
    }

    const headers = ["Test ID", "Test Name", "Student Name", "Email", "College", "Section", "Score", "Total Questions", "Date"];
    const csvRows = [];
    csvRows.push(headers.join(","));

    scores.forEach((s: any) => {
      const escapeStr = (str: string) => `"${String(str).replace(/"/g, '""')}"`;

      csvRows.push([
        escapeStr(s.testId),
        escapeStr(s.testName),
        escapeStr(s.studentName),
        escapeStr(s.studentEmail || "Unknown"),
        escapeStr(s.collegeName || "Global"),
        escapeStr(s.sectionName || "N/A"),
        s.score,
        s.totalQuestions,
        escapeStr(s.date)
      ].join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    const safeName = test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute("download", `${safeName}_scores.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllCSV = () => {
    const data = localStorage.getItem("all_student_scores");
    if (!data) {
      alert("No student scores available to download yet.");
      return;
    }
    const scores = JSON.parse(data);
    if (scores.length === 0) {
      alert("No student scores available yet.");
      return;
    }

    const headers = ["Test ID", "Test Name", "Student Name", "Email", "College", "Section", "Score", "Total Questions", "Date"];
    const csvRows = [];
    csvRows.push(headers.join(","));

    scores.forEach((s: any) => {
      const escapeStr = (str: string) => `"${String(str).replace(/"/g, '""')}"`;

      csvRows.push([
        escapeStr(s.testId),
        escapeStr(s.testName),
        escapeStr(s.studentName),
        escapeStr(s.studentEmail || "Unknown"),
        escapeStr(s.collegeName || "Global"),
        escapeStr(s.sectionName || "N/A"),
        s.score,
        s.totalQuestions,
        escapeStr(s.date)
      ].join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `all_test_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Filter tests if INSTRUCTOR
  const visibleTests = user?.role === "INSTRUCTOR"
    ? tests.filter(t => t.createdBy === user?.email || (t.collegeId === instructorCollege?.id && t.section === instructorCollege?.section))
    : tests;

  // Categorise tests
  const liveTests = visibleTests.filter(t => getTestStatus(t) === "live");
  const upcomingTests = visibleTests.filter(t => getTestStatus(t) === "upcoming");
  const endedTests = visibleTests.filter(t => getTestStatus(t) === "ended");

  // ─── List View ────────────────────────────────────────────────────────────
  if (!isCreating) {
    return (
      <div className="space-y-8" key={tick}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Tests & Contests</h2>
            <p className="text-slate-400">Manage live coding contests and MCQ tests.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDownloadAllCSV}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-indigo-500/20 transition-colors"
            >
              <Download className="w-5 h-5" /><span>Download All Results</span>
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-colors"
            >
              <Plus className="w-5 h-5" /><span>Create New Test</span>
            </button>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="bg-[#111827] rounded-3xl border border-slate-800 p-16 text-center text-slate-500">
            <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No tests yet. Click "Create New Test" to schedule one.</p>
          </div>
        ) : (
          <>
            {/* LIVE */}
            {liveTests.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Live Now</h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">{liveTests.length}</span>
                </div>
                <div className="space-y-3">
                  {liveTests.map(t => <TestCard key={t.id} test={t} colleges={colleges} onDelete={handleDeleteTest} onDownloadCSV={handleDownloadTestCSV} onViewResults={(testObj) => setViewingResultsTest(testObj)} />)}
                </div>
              </div>
            )}

            {/* UPCOMING */}
            {upcomingTests.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarClock className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Upcoming</h3>
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">{upcomingTests.length}</span>
                </div>
                <div className="space-y-3">
                  {upcomingTests.map(t => <TestCard key={t.id} test={t} colleges={colleges} onDelete={handleDeleteTest} onDownloadCSV={handleDownloadTestCSV} onViewResults={(testObj) => setViewingResultsTest(testObj)} />)}
                </div>
              </div>
            )}

            {/* ENDED */}
            {endedTests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Ended</h3>
                <div className="space-y-3">
                  {endedTests.map(t => <TestCard key={t.id} test={t} colleges={colleges} onDelete={handleDeleteTest} onDownloadCSV={handleDownloadTestCSV} onViewResults={(testObj) => setViewingResultsTest(testObj)} />)}
                </div>
              </div>
            )}
            {viewingResultsTest && (
              <ResultsModal
                test={viewingResultsTest}
                onClose={() => setViewingResultsTest(null)}
              />
            )}
          </>
        )}
      </div>
    );
  }

  // ─── Create Form ──────────────────────────────────────────────────────────
  const hours12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsCreating(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Test</h2>
            <p className="text-slate-400 text-sm">Schedule a test and build your question bank.</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setIsCreating(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white border border-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleSaveTest} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-emerald-500/20">
            <Save className="w-4 h-4" /><span>Publish Test</span>
          </button>
        </div>
      </div>

      {/* Config Card */}
      <div className="bg-[#111827] rounded-3xl p-8 border border-slate-800 space-y-6 shadow-xl">
        <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-4">Test Configuration</h3>

        {user?.role === "INSTRUCTOR" && instructorCollege && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Target Audience</p>
              <p className="text-sm font-medium text-slate-300">
                <span className="text-white font-bold">{instructorCollege.name}</span>
                {instructorCollege.section && <span> &bull; Section: <span className="text-white font-bold">{instructorCollege.section}</span></span>}
              </p>
            </div>
          </div>
        )}

        {user?.role === "ADMIN" && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Target Audience (Optional)</p>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={adminSelectedCollegeId}
                onChange={e => { setAdminSelectedCollegeId(e.target.value); setAdminSelectedSection("all"); }}
                className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="all">All Colleges (Global Test)</option>
                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select
                value={adminSelectedSection}
                onChange={e => setAdminSelectedSection(e.target.value)}
                disabled={adminSelectedCollegeId === "all"}
                className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm disabled:opacity-50"
              >
                <option value="all">All Sections</option>
                {adminSelectedCollegeId !== "all" && Array.from(new Set(colleges.find(c => c.id === adminSelectedCollegeId)?.tutors.map((t: any) => t.section).filter(Boolean))).map((s: any) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-400 mb-2">Test Title *</label>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
            placeholder="e.g. Advanced React Architecture"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
              <option>15 Mins</option>
              <option>30 Mins</option>
              <option>1 Hour</option>
              <option>2 Hours</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Prize / Reward</label>
            <input type="text" value={prize} onChange={e => setPrize(e.target.value)} className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. ₹5,000 or Skill Badge" />
          </div>
        </div>

        {/* ── Scheduling ────────────────────────────────────── */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarClock className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-white">Schedule Test</span>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox" checked={startNow} onChange={e => setStartNow(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-[#0a1128]"
              />
              <span className="text-sm text-slate-300 font-medium">Start Immediately</span>
            </label>
          </div>

          {!startNow && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
                />
              </div>

              {/* 12-hour time picker */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Time (12-hour)</label>
                <div className="flex space-x-2">
                  <select
                    value={scheduleHour} onChange={e => setScheduleHour(e.target.value)}
                    className="flex-1 bg-[#0a1128] border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-emerald-500 text-center"
                  >
                    {hours12.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-slate-400 self-center text-lg font-bold">:</span>
                  <select
                    value={scheduleMinute} onChange={e => setScheduleMinute(e.target.value)}
                    className="flex-1 bg-[#0a1128] border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-emerald-500 text-center"
                  >
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <div className="flex rounded-xl overflow-hidden border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setScheduleAmPm("AM")}
                      className={`px-3 py-3 text-sm font-bold transition-colors ${scheduleAmPm === "AM" ? "bg-emerald-600 text-white" : "bg-[#0a1128] text-slate-400 hover:text-white"}`}
                    >AM</button>
                    <button
                      type="button"
                      onClick={() => setScheduleAmPm("PM")}
                      className={`px-3 py-3 text-sm font-bold transition-colors ${scheduleAmPm === "PM" ? "bg-emerald-600 text-white" : "bg-[#0a1128] text-slate-400 hover:text-white"}`}
                    >PM</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {startNow && (
            <p className="text-xs text-emerald-400 flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>This test will go <strong>live immediately</strong> when published.</span>
            </p>
          )}
        </div>

        {/* Access Code */}
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={requiresCode} onChange={e => setRequiresCode(e.target.checked)} className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-[#0a1128]" />
            <span className="font-bold text-white">Require Access Code</span>
          </label>
          {requiresCode && (
            <div className="mt-4">
              <input type="text" value={accessCode} onChange={e => setAccessCode(e.target.value)} className="w-full bg-[#0a1128] border border-rose-500/50 rounded-xl px-4 py-3 text-rose-400 font-mono tracking-widest focus:outline-none focus:border-rose-500" placeholder="Enter Secret Code" />
            </div>
          )}
        </div>
      </div>

      {/* Question Bank */}
      <div className="space-y-6">
        <div className="flex justify-between items-center mt-4 border-b border-slate-800 pb-4">
          <h3 className="font-bold text-2xl text-white">Question Bank</h3>
          <div>
            <input type="file" accept=".pdf" id="pdf-upload" className="hidden" onChange={handlePdfUpload} />
            <label
              htmlFor="pdf-upload"
              className={`cursor-pointer bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center space-x-2 border ${isParsingPdf ? 'border-emerald-500' : 'border-emerald-500/30'}`}
            >
              {isParsingPdf ? (
                <span className="animate-pulse">Parsing PDF Content...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Auto-fill via PDF</span>
                </>
              )}
            </label>
          </div>
        </div>

        {questions.map((q, qIndex) => (
          <div key={q.id} className="bg-[#111827] rounded-3xl p-8 border border-slate-800 relative shadow-lg">
            <div className="absolute top-6 right-6">
              <button onClick={() => handleRemoveQuestion(q.id)} className="text-slate-500 hover:text-rose-500 transition-colors p-1.5 hover:bg-rose-500/10 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <h4 className="font-bold text-emerald-500 uppercase tracking-wider text-xs mb-4">Question {qIndex + 1}</h4>

            <input
              type="text" value={q.text} onChange={e => setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, text: e.target.value } : x))}
              className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-4 text-white font-bold text-base mb-5 focus:outline-none focus:border-emerald-500"
              placeholder="What is the output of..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className={`flex items-center space-x-3 bg-[#0a1128] border rounded-xl p-3 transition-colors ${q.answer === opt && opt !== "" ? "border-emerald-500" : "border-slate-700"}`}>
                  <button
                    onClick={() => setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, answer: opt } : x))}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${q.answer === opt && opt !== "" ? "border-emerald-500" : "border-slate-500"}`}
                  >
                    {q.answer === opt && opt !== "" && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                  </button>
                  <input
                    type="text" value={opt}
                    onChange={e => setQuestions(prev => prev.map(x => {
                      if (x.id !== q.id) return x;
                      const opts = [...x.options]; opts[oIdx] = e.target.value;
                      return { ...x, options: opts };
                    }))}
                    className="flex-1 bg-transparent text-white focus:outline-none text-sm"
                    placeholder={`Option ${oIdx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleAddQuestion}
          className="w-full py-5 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-3xl text-slate-400 hover:text-emerald-500 font-bold transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" /><span>Add Another Question</span>
        </button>
      </div>
    </div>
  );
}

function SnapshotViewerModal({ testId, studentEmail, studentName, onClose }: { testId: string, studentEmail: string, studentName: string, onClose: () => void }) {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/tests/${testId}/snapshots?email=${encodeURIComponent(studentEmail)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnapshots(res.data.snapshots);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load snapshots");
      } finally {
        setLoading(false);
      }
    };
    fetchSnapshots();
  }, [testId, studentEmail, token]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Camera Log: {studentName}</h2>
            <p className="text-slate-400 text-sm">{studentEmail}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#0a1128]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-emerald-500">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-bold">Loading snapshots...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-rose-500">
              <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No snapshots recorded for this student.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {snapshots.map((snap, idx) => (
                <div key={snap.id} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
                  <img src={snap.imageUrl} alt={`Snapshot ${idx + 1}`} className="w-full aspect-video object-cover" />
                  <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Snapshot {idx + 1}</span>
                    <span className="text-xs text-emerald-500 font-mono">
                      {new Date(snap.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsModal({ test, onClose }: { test: any; onClose: () => void }) {
  const [selectedStudentForSnapshots, setSelectedStudentForSnapshots] = useState<any | null>(null);
  const data = localStorage.getItem("all_student_scores");
  let scores = data ? JSON.parse(data).filter((s: any) => String(s.testId) === String(test.id)) : [];

  // Auto-inject 0 scores for unattempted students if test is ended and assigned to a section
  if (getTestStatus(test) === "ended" && test.collegeId && test.section) {
    const allColleges = JSON.parse(localStorage.getItem("admin_colleges_v2") || "[]");
    const targetCollege = allColleges.find((c: any) => String(c.id) === String(test.collegeId));
    if (targetCollege) {
      const collections = JSON.parse(localStorage.getItem("admin_college_collections") || "[]");
      const relevantCollection = collections.find((c: any) =>
        c.collegeName === targetCollege.name && c.category === test.section
      );

      if (relevantCollection && relevantCollection.students) {
        relevantCollection.students.forEach((student: any) => {
          const hasAttempted = scores.some((s: any) => s.studentEmail === student.email);
          if (!hasAttempted) {
            scores.push({
              testId: test.id,
              testName: test.title,
              studentName: student.name,
              studentEmail: student.email,
              collegeName: targetCollege.name,
              sectionName: test.section,
              score: 0,
              totalQuestions: test.questions?.length || 0,
              date: "Did not attempt"
            });
          }
        });
      }
    }
  }

  // Group by college Name then Section Name
  const grouped: Record<string, Record<string, any[]>> = {};
  scores.forEach((s: any) => {
    const cName = s.collegeName || "Global / Unknown";
    const sName = s.sectionName || "N/A";
    if (!grouped[cName]) grouped[cName] = {};
    if (!grouped[cName][sName]) grouped[cName][sName] = [];
    grouped[cName][sName].push(s);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Results: {test.title}</h2>
            <p className="text-slate-400 text-sm">Grouped by College and Section</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#0a1128]">
          {scores.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No students have taken this test yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([collegeName, sections]) => (
                <div key={collegeName} className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                  <div className="bg-indigo-500/10 border-b border-indigo-500/20 p-4 flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold text-indigo-400">{collegeName}</h3>
                  </div>

                  <div className="p-4 space-y-6">
                    {Object.entries(sections).map(([sectionName, students]) => (
                      <div key={sectionName} className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">
                          Section: <span className="text-emerald-400">{sectionName}</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {students.sort((a, b) => b.score - a.score).map((student: any, idx: number) => (
                            <div key={idx} className="bg-[#0a1128] border border-slate-800 p-4 rounded-xl flex justify-between items-center hover:border-slate-700 transition-colors">
                              <div className="min-w-0 flex-1 pr-4">
                                <p className="font-bold text-slate-200 truncate">{student.studentName}</p>
                                <p className="text-xs text-slate-500 truncate">{student.studentEmail}</p>
                                <p className="text-xs text-slate-600 mt-1">{student.date}</p>
                              </div>
                              <div className="text-right flex-shrink-0 flex flex-col items-end">
                                <div className="text-2xl font-black text-emerald-500">
                                  {student.score}<span className="text-sm text-slate-500">/{student.totalQuestions}</span>
                                </div>
                                <button
                                  onClick={() => setSelectedStudentForSnapshots(student)}
                                  className="mt-2 text-xs flex items-center space-x-1 text-slate-400 hover:text-emerald-400 bg-slate-800 hover:bg-emerald-500/10 px-2 py-1 rounded transition-colors"
                                  title="View Camera Log"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>View Log</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {selectedStudentForSnapshots && (
        <SnapshotViewerModal
          testId={test.id}
          studentEmail={selectedStudentForSnapshots.studentEmail}
          studentName={selectedStudentForSnapshots.studentName}
          onClose={() => setSelectedStudentForSnapshots(null)}
        />
      )}
    </div>
  );
}

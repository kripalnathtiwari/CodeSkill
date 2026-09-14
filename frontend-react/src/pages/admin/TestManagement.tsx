import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../utils/apiConfig";
import {
  Plus, Trash2, Save, Award, ShieldAlert, Clock,
  Radio, CalendarClock, ArrowLeft, Timer, Users, Download, Upload, Eye, X, Building2, Video, Loader2,
  Search, Calendar, Filter
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

// Universal date matching helper for calendar filter (handles ISO, timestamp, and toLocaleString "DD/MM/YYYY" or "MM/DD/YYYY" or "04 Aug 2026")
const isSameDateFilter = (rawDate: any, filterYYYYMMDD: string): boolean => {
  if (!filterYYYYMMDD) return true;
  if (!rawDate || rawDate === "Did not attempt" || rawDate === "N/A") return false;
  const s = String(rawDate).trim();

  // 1. Try parsing date object in local timezone FIRST
  let d = new Date(s);
  if (isNaN(d.getTime())) {
    // Try parsing DD/MM/YYYY
    const dmMatch = s.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
    if (dmMatch) {
      const part1 = parseInt(dmMatch[1], 10);
      const part2 = parseInt(dmMatch[2], 10);
      const year = parseInt(dmMatch[3], 10);
      d = new Date(year, part2 - 1, part1);
    }
  }
  if (!isNaN(d.getTime())) {
    const dYear = d.getFullYear();
    const dMonth = String(d.getMonth() + 1).padStart(2, "0");
    const dDay = String(d.getDate()).padStart(2, "0");
    if (`${dYear}-${dMonth}-${dDay}` === filterYYYYMMDD) return true;
  }

  // 2. Direct substring match of YYYY-MM-DD
  if (s.includes(filterYYYYMMDD)) return true;

  // 3. Extract parts from filterYYYYMMDD ("2026-08-04")
  const [yyyy, mm, dd] = filterYYYYMMDD.split("-");
  const dNum = parseInt(dd, 10);
  const mNum = parseInt(mm, 10);
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthNamesLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const mShort = monthNamesShort[mNum - 1] || "";
  const mLong = monthNamesLong[mNum - 1] || "";

  // Check common Indian/UK/US and text formats: "04 Aug 2026", "4 Aug 2026", "04/08/2026", "4/8/2026", "04-08-2026", etc.
  const patterns = [
    `${dd} ${mShort} ${yyyy}`,
    `${dNum} ${mShort} ${yyyy}`,
    `${dd} ${mLong} ${yyyy}`,
    `${dNum} ${mLong} ${yyyy}`,
    `${mShort} ${dd}, ${yyyy}`,
    `${mShort} ${dNum}, ${yyyy}`,
    `${dd}/${mm}/${yyyy}`,
    `${dNum}/${mNum}/${yyyy}`,
    `${dd}-${mm}-${yyyy}`,
    `${dNum}-${mNum}-${yyyy}`,
    `${mm}/${dd}/${yyyy}`,
    `${mNum}/${dNum}/${yyyy}`,
    `${yyyy}/${mm}/${dd}`,
    `${yyyy}-${mm}-${dd}`
  ];
  const sLower = s.toLowerCase();
  if (patterns.some(pat => sLower.includes(pat.toLowerCase()))) return true;

  return false;
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
      ? "bg-surface dark:bg-[#111827] border-primary/50 shadow-xl shadow-blue-500/10"
      : status === "upcoming"
        ? "bg-surface dark:bg-[#111827] border-amber-500/40 shadow-xl"
        : "bg-surface dark:bg-[#111827] border-border/80 shadow-xl hover:border-slate-600"
      }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          {status === "live" && (
            <span className="flex items-center space-x-1 text-xs font-bold text-blue-300 bg-primary/20 px-2.5 py-0.5 rounded-full border border-primary/40">
              <Radio className="w-3 h-3 animate-pulse" /><span>LIVE</span>
            </span>
          )}
          {status === "upcoming" && (
            <span className="flex items-center space-x-1 text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              <CalendarClock className="w-3 h-3" /><span>UPCOMING</span>
            </span>
          )}
          {status === "ended" && (
            <span className="text-xs font-bold text-text-secondary bg-slate-100 dark:bg-slate-800 border border-border px-2.5 py-0.5 rounded-full">ENDED</span>
          )}
          {test.category && (
            <span className="text-xs font-bold text-blue-300 bg-primary/20 px-2.5 py-0.5 rounded-full border border-primary/30">Cat: {test.category}</span>
          )}
          {test.section && (
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">Sec: {test.section}</span>
          )}
          <h4 className="font-extrabold text-text-primary text-base truncate">{test.title}</h4>
        </div>

        <div className="flex flex-wrap gap-2.5 mt-3 text-xs text-text-secondary font-medium">
          <span className="flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1 rounded-lg border border-border/60"><Clock className="w-3.5 h-3.5 text-indigo-400" /><span>{test.duration}</span></span>
          <span className="flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1 rounded-lg border border-border/60"><Users className="w-3.5 h-3.5 text-indigo-400" /><span>{test.questions?.length || 0} Qs</span></span>
          {test.requiresCode && <span className="flex items-center space-x-1.5 text-rose-300 bg-rose-500/20 px-3 py-1 rounded-lg border border-rose-500/30 font-bold"><ShieldAlert className="w-3.5 h-3.5 text-rose-400" /><span>Protected</span></span>}
          {test.scheduledAt && <span className="flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1 rounded-lg border border-border/60"><CalendarClock className="w-3.5 h-3.5 text-indigo-400" /><span>{formatScheduled(test.scheduledAt)}</span></span>}
          {displayName && <span className="flex items-center space-x-1.5 text-indigo-200 bg-indigo-500/20 px-3 py-1 rounded-lg border border-indigo-500/30 font-semibold"><span>By: {displayName}</span></span>}
        </div>

        {status === "upcoming" && remaining > 0 && (
          <div className="mt-2.5 flex items-center space-x-2">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-mono font-bold">Starts in {formatCountdown(remaining)}</span>
          </div>
        )}
        {status === "live" && (
          <div className="mt-2.5 flex items-center space-x-2">
            <Timer className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-primary font-mono font-bold">Ends in {formatCountdown(remaining)}</span>
          </div>
        )}
      </div>

      <div className="ml-4 flex flex-col space-y-2 flex-shrink-0">
        <button
          onClick={() => onViewResults(test)}
          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const mainDateInputRef = useRef<HTMLInputElement>(null);

  // For Admin to assign test
  const [adminSelectedCollegeId, setAdminSelectedCollegeId] = useState<string>("all");
  const [adminSelectedCategory, setAdminSelectedCategory] = useState<string>("all");
  const [adminSelectedSection, setAdminSelectedSection] = useState<string>("all");

  const loadAllColleges = async () => {
    let apiColleges: any[] = [];
    try {
      const res = await axios.get(getApiUrl("/api/v1/college-management"), {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (Array.isArray(res.data)) {
        apiColleges = res.data;
      }
    } catch (err) {
      console.warn("Failed to load colleges from API in TestManagement:", err);
    }

    const localColleges = JSON.parse(localStorage.getItem("admin_colleges_v2") || "[]");
    const collections = JSON.parse(localStorage.getItem("admin_college_collections") || "[]");

    const map = new Map<string, any>();
    localColleges.forEach((c: any) => {
      if (c && c.id) map.set(String(c.id), c);
    });

    apiColleges.forEach((c: any) => {
      if (c && c.id) {
        const existing = map.get(String(c.id));
        map.set(String(c.id), { ...existing, ...c, tutors: c.tutors || existing?.tutors || [] });
      }
    });

    collections.forEach((colc: any) => {
      if (colc.collegeName) {
        const exists = Array.from(map.values()).some(
          (c: any) => c.name?.toLowerCase() === colc.collegeName?.toLowerCase()
        );
        if (!exists) {
          const newId = `col_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          map.set(newId, {
            id: newId,
            name: colc.collegeName,
            tutors: []
          });
        }
      }
    });

    const merged = Array.from(map.values());
    setColleges(merged);
    localStorage.setItem("admin_colleges_v2", JSON.stringify(merged));

    if (user?.role === "INSTRUCTOR" && user.email) {
      for (const c of merged) {
        const t = c.tutors?.find((t: any) => t.email?.toLowerCase() === user.email.toLowerCase());
        if (t) {
          setInstructorCollege({ id: c.id, name: c.name, section: t.section || null });
          break;
        }
      }
    }
  };

  useEffect(() => {
    loadAllColleges();
  }, [user]);

  const getCategoriesForCollege = (collegeId: string): string[] => {
    if (collegeId === "all") return [];
    const col = colleges.find(c => String(c.id) === String(collegeId));
    if (!col) return [];

    const categories = new Set<string>();

    // 1. From course categories
    const courseCategories = JSON.parse(localStorage.getItem(`admin_course_categories_${col.name}`) || "[]");
    courseCategories.forEach((cat: any) => {
      if (cat.courseName) categories.add(cat.courseName);
    });

    // 2. From collections
    const collections = JSON.parse(localStorage.getItem("admin_college_collections") || "[]");
    collections.forEach((c: any) => {
      if (c.collegeName === col.name && c.category) {
        categories.add(c.category);
      }
    });

    return Array.from(categories);
  };

  const getSectionsForCollege = (collegeId: string, categoryName: string = "all"): string[] => {
    if (collegeId === "all") return [];
    const col = colleges.find(c => String(c.id) === String(collegeId));
    if (!col) return [];

    const sections = new Set<string>();
    const courseCategories = JSON.parse(localStorage.getItem(`admin_course_categories_${col.name}`) || "[]");

    if (categoryName && categoryName !== "all") {
      // Find the selected category and add its sections/classes
      const targetCat = courseCategories.find((cat: any) => cat.courseName === categoryName);
      if (targetCat && targetCat.classes) {
        targetCat.classes.forEach((cls: any) => {
          if (cls.className) sections.add(cls.className);
        });
      }
      // Also if a collection category matches
      const collections = JSON.parse(localStorage.getItem("admin_college_collections") || "[]");
      collections.forEach((c: any) => {
        if (c.collegeName === col.name && c.category === categoryName) {
          sections.add(c.category);
        }
      });
      // Plus any tutor sections
      col.tutors?.forEach((t: any) => {
        if (t.section) sections.add(t.section);
      });
    } else {
      col.tutors?.forEach((t: any) => {
        if (t.section) sections.add(t.section);
      });

      const collections = JSON.parse(localStorage.getItem("admin_college_collections") || "[]");
      collections.forEach((c: any) => {
        if (c.collegeName === col.name && c.category) {
          sections.add(c.category);
        }
      });

      courseCategories.forEach((cat: any) => {
        cat.classes?.forEach((cls: any) => {
          if (cls.className) sections.add(cls.className);
        });
      });
    }

    return Array.from(sections);
  };

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
      category: adminSelectedCategory !== "all" ? adminSelectedCategory : null,
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
                courseCategory: test.category || null,
                courseName: test.category || null,
                sectionName: (!test.section || test.section === "all" || test.section === "N/A") ? "All Sections" : test.section,
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
  const baseVisibleTests = user?.role === "INSTRUCTOR"
    ? tests.filter(t => t.createdBy === user?.email || (t.collegeId === instructorCollege?.id && t.section === instructorCollege?.section))
    : tests;

  // Search and Date Filter
  const visibleTests = baseVisibleTests.filter((t) => {
    // 1. Search filter: title, category, or section
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (t.title || "").toLowerCase().includes(q);
      const matchCategory = (t.category || "").toLowerCase().includes(q);
      const matchSection = (t.section || "").toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchSection) {
        return false;
      }
    }

    // 2. Date filter: YYYY-MM-DD (filter ONLY on test conducted test date)
    if (filterDate) {
      const conductedDates: any[] = [
        t.scheduledAt,
        t.date,
        t.startDate,
        t.createdAt
      ].filter(Boolean);

      // If test has no explicit conducted date attribute, fall back to creation timestamp in test.id
      if (conductedDates.length === 0 && t.id) {
        const digits = String(t.id).replace(/\D/g, "");
        if (digits.length >= 13) {
          const d = new Date(parseInt(digits.slice(0, 13), 10));
          if (!isNaN(d.getTime())) conductedDates.push(d.toISOString());
        }
      }

      const hasMatch = conductedDates.some(val => isSameDateFilter(val, filterDate));
      if (!hasMatch) return false;
    }

    return true;
  });

  // Categorise tests
  const liveTests = visibleTests.filter(t => getTestStatus(t) === "live");
  const upcomingTests = visibleTests.filter(t => getTestStatus(t) === "upcoming");
  const endedTests = visibleTests.filter(t => getTestStatus(t) === "ended");

  // â”€â”€â”€ List View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!isCreating) {
    return (
      <div className="space-y-8" key={tick}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Tests & Contests</h2>
            <p className="text-text-muted">Manage live coding contests and MCQ tests.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDownloadAllCSV}
              className="bg-indigo-600 hover:bg-indigo-500 text-text-inverse px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-indigo-500/20 transition-colors"
            >
              <Download className="w-5 h-5" /><span>Download All Results</span>
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-primary hover:bg-primary text-text-inverse px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition-colors"
            >
              <Plus className="w-5 h-5" /><span>Create New Test</span>
            </button>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="bg-surface dark:bg-[#111827] rounded-3xl border border-border p-16 text-center text-text-muted">
            <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No tests yet. Click "Create New Test" to schedule one.</p>
          </div>
        ) : (
          <>
            {/* Filter and Search Bar */}
            <div className="bg-surface dark:bg-[#111827] border border-border/80 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search tests by title, course category, or section name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border/80 rounded-xl pl-11 pr-10 py-2.5 text-sm text-text-secondary placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Date Calendar Filter */}
              <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                <div
                  onClick={() => {
                    try {
                      mainDateInputRef.current?.showPicker();
                    } catch (err) {
                      mainDateInputRef.current?.focus();
                    }
                  }}
                  className="flex items-center space-x-2 bg-background dark:bg-[#0B0F19] border border-border/80 hover:border-indigo-500/60 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                >
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0 cursor-pointer" />
                  <span className="text-xs font-semibold text-text-muted hidden sm:inline select-none">Filter Date:</span>
                  <input
                    ref={mainDateInputRef}
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="bg-transparent text-xs sm:text-sm text-text-secondary focus:outline-none cursor-pointer"
                  />
                  {filterDate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterDate("");
                      }}
                      className="text-text-muted hover:text-text-primary ml-1 p-0.5 rounded transition-colors"
                      title="Clear date filter"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {(searchQuery || filterDate) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterDate("");
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {visibleTests.length === 0 ? (
              <div className="bg-surface dark:bg-[#111827] rounded-3xl border border-border p-12 text-center text-text-muted space-y-3">
                <Filter className="w-12 h-12 mx-auto mb-2 opacity-20 text-indigo-400" />
                <p className="text-base font-semibold text-text-muted">No tests found matching your search or date filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterDate("");
                  }}
                  className="text-sm font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* LIVE */}
                {liveTests.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Radio className="w-4 h-4 text-primary animate-pulse" />
                      <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Live Now</h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{liveTests.length}</span>
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
                    <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">Ended</h3>
                    <div className="space-y-3">
                      {endedTests.map(t => <TestCard key={t.id} test={t} colleges={colleges} onDelete={handleDeleteTest} onDownloadCSV={handleDownloadTestCSV} onViewResults={(testObj) => setViewingResultsTest(testObj)} />)}
                    </div>
                  </div>
                )}
              </>
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

  // â”€â”€â”€ Create Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const hours12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsCreating(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-text-muted hover:text-text-inverse transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Create New Test</h2>
            <p className="text-text-muted text-sm">Schedule a test and build your question bank.</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setIsCreating(false)} className="px-5 py-2.5 rounded-xl font-semibold text-text-muted hover:text-text-primary border border-border transition-colors">
            Cancel
          </button>
          <button onClick={handleSaveTest} className="bg-primary hover:bg-primary text-text-inverse px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20">
            <Save className="w-4 h-4" /><span>Publish Test</span>
          </button>
        </div>
      </div>

      {/* Config Card */}
      <div className="bg-surface dark:bg-[#111827] rounded-3xl p-8 border border-border space-y-6 shadow-xl">
        <h3 className="font-bold text-lg text-text-primary border-b border-border pb-4">Test Configuration</h3>

        {user?.role === "INSTRUCTOR" && instructorCollege && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Target Audience</p>
              <p className="text-sm font-medium text-text-secondary">
                <span className="text-text-primary font-bold">{instructorCollege.name}</span>
                {instructorCollege.section && <span> &bull; Section: <span className="text-text-primary font-bold">{instructorCollege.section}</span></span>}
              </p>
            </div>
          </div>
        )}

        {user?.role === "ADMIN" && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Target Audience (Optional)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={adminSelectedCollegeId}
                onChange={e => {
                  setAdminSelectedCollegeId(e.target.value);
                  setAdminSelectedCategory("all");
                  setAdminSelectedSection("all");
                }}
                className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm"
              >
                <option value="all">All Colleges (Global Test)</option>
                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select
                value={adminSelectedCategory}
                onChange={e => {
                  setAdminSelectedCategory(e.target.value);
                  setAdminSelectedSection("all");
                }}
                disabled={adminSelectedCollegeId === "all"}
                className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm disabled:opacity-50"
              >
                <option value="all">All Categories</option>
                {adminSelectedCollegeId !== "all" && getCategoriesForCollege(adminSelectedCollegeId).map((cat: any) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={adminSelectedSection}
                onChange={e => setAdminSelectedSection(e.target.value)}
                disabled={adminSelectedCollegeId === "all"}
                className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm disabled:opacity-50"
              >
                <option value="all">All Sections</option>
                {adminSelectedCollegeId !== "all" && getSectionsForCollege(adminSelectedCollegeId, adminSelectedCategory).map((s: any) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-text-muted mb-2">Test Title *</label>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary"
            placeholder="e.g. Advanced React Architecture"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-text-muted mb-2">Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary">
              <option>15 Mins</option>
              <option>30 Mins</option>
              <option>1 Hour</option>
              <option>2 Hours</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-text-muted mb-2">Prize / Reward</label>
            <input type="text" value={prize} onChange={e => setPrize(e.target.value)} className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary" placeholder="e.g. ₹5,000 or Skill Badge" />
          </div>
        </div>

        {/* â”€â”€ Scheduling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarClock className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-text-primary">Schedule Test</span>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox" checked={startNow} onChange={e => setStartNow(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-primary focus:ring-blue-500 bg-background dark:bg-[#0B0F19]"
              />
              <span className="text-sm text-text-secondary font-medium">Start Immediately</span>
            </label>
          </div>

          {!startNow && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary [color-scheme:dark]"
                />
              </div>

              {/* 12-hour time picker */}
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Time (12-hour)</label>
                <div className="flex space-x-2">
                  <select
                    value={scheduleHour} onChange={e => setScheduleHour(e.target.value)}
                    className="flex-1 bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-3 text-text-primary focus:outline-none focus:border-primary text-center"
                  >
                    {hours12.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-text-muted self-center text-lg font-bold">:</span>
                  <select
                    value={scheduleMinute} onChange={e => setScheduleMinute(e.target.value)}
                    className="flex-1 bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-3 text-text-primary focus:outline-none focus:border-primary text-center"
                  >
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <div className="flex rounded-xl overflow-hidden border border-border">
                    <button
                      type="button"
                      onClick={() => setScheduleAmPm("AM")}
                      className={`px-3 py-3 text-sm font-bold transition-colors ${scheduleAmPm === "AM" ? "bg-primary text-text-inverse" : "bg-background dark:bg-[#0B0F19] text-text-muted hover:text-text-inverse"}`}
                    >AM</button>
                    <button
                      type="button"
                      onClick={() => setScheduleAmPm("PM")}
                      className={`px-3 py-3 text-sm font-bold transition-colors ${scheduleAmPm === "PM" ? "bg-primary text-text-inverse" : "bg-background dark:bg-[#0B0F19] text-text-muted hover:text-text-inverse"}`}
                    >PM</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {startNow && (
            <p className="text-xs text-primary flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>This test will go <strong>live immediately</strong> when published.</span>
            </p>
          )}
        </div>

        {/* Access Code */}
        <div className="bg-slate-100/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-border">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={requiresCode} onChange={e => setRequiresCode(e.target.checked)} className="w-5 h-5 rounded border-slate-600 text-primary focus:ring-blue-500 bg-background dark:bg-[#0B0F19]" />
            <span className="font-bold text-text-primary">Require Access Code</span>
          </label>
          {requiresCode && (
            <div className="mt-4">
              <input type="text" value={accessCode} onChange={e => setAccessCode(e.target.value)} className="w-full bg-background dark:bg-[#0B0F19] border border-rose-500/50 rounded-xl px-4 py-3 text-rose-400 font-mono tracking-widest focus:outline-none focus:border-rose-500" placeholder="Enter Secret Code" />
            </div>
          )}
        </div>
      </div>

      {/* Question Bank */}
      <div className="space-y-6">
        <div className="flex justify-between items-center mt-4 border-b border-border pb-4">
          <h3 className="font-bold text-2xl text-text-primary">Question Bank</h3>
          <div>
            <input type="file" accept=".pdf" id="pdf-upload" className="hidden" onChange={handlePdfUpload} />
            <label
              htmlFor="pdf-upload"
              className={`cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-primary font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center space-x-2 border ${isParsingPdf ? 'border-primary' : 'border-primary/30'}`}
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
          <div key={q.id} className="bg-surface dark:bg-[#111827] rounded-3xl p-8 border border-border relative shadow-lg">
            <div className="absolute top-6 right-6">
              <button onClick={() => handleRemoveQuestion(q.id)} className="text-text-muted hover:text-rose-500 transition-colors p-1.5 hover:bg-rose-500/10 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <h4 className="font-bold text-primary uppercase tracking-wider text-xs mb-4">Question {qIndex + 1}</h4>

            <input
              type="text" value={q.text} onChange={e => setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, text: e.target.value } : x))}
              className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-4 text-text-primary font-bold text-base mb-5 focus:outline-none focus:border-primary"
              placeholder="What is the output of..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className={`flex items-center space-x-3 bg-background dark:bg-[#0B0F19] border rounded-xl p-3 transition-colors ${q.answer === opt && opt !== "" ? "border-primary" : "border-border"}`}>
                  <button
                    onClick={() => setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, answer: opt } : x))}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${q.answer === opt && opt !== "" ? "border-primary" : "border-slate-500"}`}
                  >
                    {q.answer === opt && opt !== "" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </button>
                  <input
                    type="text" value={opt}
                    onChange={e => setQuestions(prev => prev.map(x => {
                      if (x.id !== q.id) return x;
                      const opts = [...x.options]; opts[oIdx] = e.target.value;
                      return { ...x, options: opts };
                    }))}
                    className="flex-1 bg-transparent text-text-primary focus:outline-none text-sm"
                    placeholder={`Option ${oIdx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleAddQuestion}
          className="w-full py-5 border-2 border-dashed border-border hover:border-primary rounded-3xl text-text-muted hover:text-primary font-bold transition-colors flex items-center justify-center space-x-2"
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
      if (token === "mock-token-instructor" || token === "mock-token-admin") {
        // Load dummy snapshots for mock users
        setTimeout(() => {
          setSnapshots([
            { timestamp: new Date(Date.now() - 3600000).toISOString(), imageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400&h=300", flagReason: null },
            { timestamp: new Date(Date.now() - 1800000).toISOString(), imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=400&h=300", flagReason: "Multiple faces detected" },
            { timestamp: new Date().toISOString(), imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=400&h=300", flagReason: null }
          ]);
          setLoading(false);
        }, 1000);
        return;
      }

      try {
        const res = await axios.get(getApiUrl(`/api/v1/tests/${testId}/snapshots?email=${encodeURIComponent(studentEmail)}`), {
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
      <div className="bg-surface dark:bg-[#111827] border border-border rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-border flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">Camera Log: {studentName}</h2>
            <p className="text-text-muted text-sm">{studentEmail}</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-inverse bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-background dark:bg-[#0B0F19]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-primary">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-bold">Loading snapshots...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-rose-500">
              <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No snapshots recorded for this student.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {snapshots.map((snap, idx) => (
                <div key={snap.id} className="bg-slate-900 rounded-2xl overflow-hidden border border-border shadow-lg">
                  <img src={snap.imageUrl} alt={`Snapshot ${idx + 1}`} className="w-full aspect-video object-cover" />
                  <div className="p-3 bg-slate-900 border-t border-border flex justify-between items-center">
                    <span className="text-xs font-bold text-text-muted">Snapshot {idx + 1}</span>
                    <span className="text-xs text-primary font-mono">
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
  const [resultSearchQuery, setResultSearchQuery] = useState("");
  const [resultDateFilter, setResultDateFilter] = useState("");
  const modalDateInputRef = useRef<HTMLInputElement>(null);
  const [scoresVersion, setScoresVersion] = useState(0);
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

  const handleDeleteStudentAttempt = (studentToDelete: any) => {
    if (studentToDelete.date === "Did not attempt") {
      alert("This student has not attempted the test yet.");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete the test attempt for "${studentToDelete.studentName || studentToDelete.studentEmail}"? This will allow them to attempt the test again.`
      )
    ) {
      try {
        // 1. Remove from all_student_scores in localStorage
        const dataStr = localStorage.getItem("all_student_scores");
        if (dataStr) {
          const allScores = JSON.parse(dataStr);
          const updatedScores = allScores.filter((s: any) => !(
            String(s.testId) === String(test.id) &&
            (
              (s.studentEmail && studentToDelete.studentEmail && s.studentEmail.toLowerCase() === studentToDelete.studentEmail.toLowerCase()) ||
              (s.studentName && studentToDelete.studentName && s.studentName.toLowerCase() === studentToDelete.studentName.toLowerCase())
            )
          ));
          localStorage.setItem("all_student_scores", JSON.stringify(updatedScores));
        }

        // 2. Remove local testResult_* keys for this test so the student can re-attempt immediately if testing on this browser
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("testResult_") && key.endsWith(`_${test.id}`)) {
            if (
              !studentToDelete.studentEmail ||
              studentToDelete.studentEmail === "Unknown" ||
              key.toLowerCase().includes(studentToDelete.studentEmail.toLowerCase()) ||
              key.includes("_guest_")
            ) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        setScoresVersion((v) => v + 1);
      } catch (err) {
        console.error("Failed to delete student test attempt:", err);
      }
    }
  };

  const filteredScores = scores.filter((s: any) => {
    // 1. Search by section name, category wise, test name, student name, or email
    if (resultSearchQuery.trim()) {
      const q = resultSearchQuery.toLowerCase().trim();
      const sName = (s.sectionName || "").toLowerCase();
      const catName = (s.courseCategory || s.courseName || test.category || "").toLowerCase();
      const tName = (s.testName || test.title || "").toLowerCase();
      const stuName = (s.studentName || "").toLowerCase();
      const stuEmail = (s.studentEmail || "").toLowerCase();
      if (!sName.includes(q) && !catName.includes(q) && !tName.includes(q) && !stuName.includes(q) && !stuEmail.includes(q)) {
        return false;
      }
    }

    // 2. Date filter by test result date
    if (resultDateFilter) {
      const possibleDates = [
        s.date,
        s.submittedAt,
        s.createdAt,
        test.scheduledAt,
        test.createdAt,
        test.date
      ];
      const hasMatch = possibleDates.some(val => isSameDateFilter(val, resultDateFilter));
      if (!hasMatch) return false;
    }

    return true;
  });

  // Group by college Name then Section Name
  const grouped: Record<string, Record<string, any[]>> = {};
  filteredScores.forEach((s: any) => {
    const cName = s.collegeName || "Global / Unknown";
    const sName = (!s.sectionName || s.sectionName === "N/A" || s.sectionName === "all" || s.sectionName === "Global / Unassigned") ? "All Sections" : s.sectionName;
    if (!grouped[cName]) grouped[cName] = {};
    if (!grouped[cName][sName]) grouped[cName][sName] = [];
    grouped[cName][sName].push(s);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-surface dark:bg-[#111827] border border-border rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-border flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">Results: {test.title}</h2>
            <p className="text-text-muted text-sm">Grouped by College and Section</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-inverse bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar for Results */}
        <div className="bg-surface dark:bg-[#111827] border-b border-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search results by section name, category, test name, or student..."
              value={resultSearchQuery}
              onChange={(e) => setResultSearchQuery(e.target.value)}
              className="w-full bg-background dark:bg-[#0B0F19] border border-border/80 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-text-secondary placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {resultSearchQuery && (
              <button
                onClick={() => setResultSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 rounded transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <div
              onClick={() => {
                try {
                  modalDateInputRef.current?.showPicker();
                } catch (err) {
                  modalDateInputRef.current?.focus();
                }
              }}
              className="flex items-center space-x-2 bg-background dark:bg-[#0B0F19] border border-border/80 hover:border-indigo-500/60 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0 cursor-pointer" />
              <span className="text-xs font-semibold text-text-muted hidden sm:inline select-none">Filter Date:</span>
              <input
                ref={modalDateInputRef}
                type="date"
                value={resultDateFilter}
                onChange={(e) => setResultDateFilter(e.target.value)}
                className="bg-transparent text-xs text-text-secondary focus:outline-none cursor-pointer"
              />
              {resultDateFilter && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setResultDateFilter("");
                  }}
                  className="text-text-muted hover:text-text-primary ml-1 p-0.5 rounded transition-colors"
                  title="Clear date filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {(resultSearchQuery || resultDateFilter) && (
              <button
                onClick={() => {
                  setResultSearchQuery("");
                  setResultDateFilter("");
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-background dark:bg-[#0B0F19]">
          {filteredScores.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>{scores.length === 0 ? "No students have taken this test yet." : "No results match your search or date filter."}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([collegeName, sections]) => (
                <div key={collegeName} className="bg-surface dark:bg-[#111827] rounded-2xl border border-border overflow-hidden shadow-lg">
                  <div className="bg-indigo-500/10 border-b border-indigo-500/20 p-4 flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold text-indigo-400">{collegeName}</h3>
                  </div>

                  <div className="p-4 space-y-6">
                    {Object.entries(sections)
                      .sort(([aName], [bName]) => {
                        const isAAll = /^all sections|all|general section|n\/a/i.test(aName);
                        const isBAll = /^all sections|all|general section|n\/a/i.test(bName);
                        if (isAAll && !isBAll) return -1;
                        if (!isAAll && isBAll) return 1;
                        return aName.localeCompare(bName);
                      })
                      .map(([sectionName, students]) => (
                        <div key={sectionName} className="space-y-3">
                          <h4 className="text-sm font-bold text-text-muted uppercase tracking-widest pl-2">
                            Section: <span className="text-primary">{sectionName}</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {students.sort((a, b) => b.score - a.score).map((student: any, idx: number) => (
                              <div key={idx} className="bg-background dark:bg-[#0B0F19] border border-border p-4 rounded-xl flex justify-between items-center hover:border-border transition-colors">
                                <div className="min-w-0 flex-1 pr-4">
                                  <p className="font-bold text-text-secondary truncate">{student.studentName}</p>
                                  <p className="text-xs text-text-muted truncate">{student.studentEmail}</p>
                                  <p className="text-xs text-text-secondary mt-1">{student.date}</p>
                                </div>
                                <div className="text-right flex-shrink-0 flex flex-col items-end">
                                  <div className="text-2xl font-black text-primary">
                                    {student.score}<span className="text-sm text-text-muted">/{student.totalQuestions}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <button
                                      onClick={() => setSelectedStudentForSnapshots(student)}
                                      className="text-xs flex items-center space-x-1 text-text-secondary hover:text-primary bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 px-2.5 py-1 rounded-lg border border-border/60 transition-colors"
                                      title="View Camera Log"
                                    >
                                      <Video className="w-3 h-3" />
                                      <span>View Log</span>
                                    </button>
                                    {student.date !== "Did not attempt" && (
                                      <button
                                        onClick={() => handleDeleteStudentAttempt(student)}
                                        className="text-xs flex items-center space-x-1 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/20 transition-colors"
                                        title="Delete student test attempt to allow re-attempt"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        <span>Delete</span>
                                      </button>
                                    )}
                                  </div>
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

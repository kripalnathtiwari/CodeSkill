import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Award, BookOpen, Lock } from "lucide-react";
import CertificateModal from "../components/CertificateModal";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../utils/apiConfig";

// New Components
import DashboardLayout from "../components/dashboard/DashboardLayout";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts";
import ActivitySection from "../components/dashboard/ActivitySection";
import StudentPerformance from "../components/dashboard/StudentPerformance";

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<{ name: string, course: string, id: string } | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);
  const [dsaStats, setDsaStats] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [testStats, setTestStats] = useState({ attempted: 0, correct: 0 });
  const [generatingCertIdx, setGeneratingCertIdx] = useState<number | null>(null);
  const [certNameInput, setCertNameInput] = useState("");
  const [courseSettings, setCourseSettings] = useState<Record<string, any>>({});
  const [mcqTotal, setMcqTotal] = useState(0);
  const [mcqStats, setMcqStats] = useState({ attempted: 0, correct: 0 });
  const [userRank, setUserRank] = useState<number | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ text: "", type: "" });
  const [trainerId, setTrainerId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      // Load enrollments
      setTimeout(() => {
        const existingStr = localStorage.getItem("enrolledCourses");
        if (existingStr && user?.email) {
          try {
            const parsed = JSON.parse(existingStr);
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
              try { setCourseSettings(JSON.parse(settingsStr)); } catch (e) { }
            }
          } catch (e) { }
        }
      }, 0);

      // Load solved problems
      setTimeout(() => {
        const fetchDsaStats = async () => {
          let solvedArr: string[] = [];
          const solvedStr = localStorage.getItem(`solved_problems_progress_${user?.email || "guest"}`);
          if (solvedStr) {
            try {
              solvedArr = JSON.parse(solvedStr);
              setSolvedCount(solvedArr.length);
              let easy = 0, medium = 0, hard = 0;
              solvedArr.forEach((qId: string) => {
                const d = localStorage.getItem(`q_difficulty_${qId}`);
                if (d === "Easy" || d === "easy") easy++;
                else if (d === "Medium" || d === "medium") medium++;
                else if (d === "Hard" || d === "hard") hard++;
                else easy++;
              });
              setDsaStats({ easy, medium, hard, total: solvedArr.length });
            } catch (e) { }
          }
        };
        fetchDsaStats();
      }, 0);

      // Load test statistics
      setTimeout(() => {
        if (user?.email) {
          try {
            const allScores = JSON.parse(localStorage.getItem("all_student_scores") || "[]");
            const myScores = allScores.filter((s: any) => s.studentEmail === user.email);
            let totalCorrect = 0;
            let totalAttempted = 0;
            myScores.forEach((s: any) => {
              totalCorrect += (s.score || 0);
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
          } catch (e) { }
        }
      }, 0);

      // Load aptitude (MCQ) statistics
      setTimeout(() => {
        if (user?.email) {
          try {
            const key = `aptitude_analytics_${user.email.toLowerCase()}`;
            const saved = JSON.parse(localStorage.getItem(key) || "[]");
            let correctCount = 0;
            saved.forEach((q: any) => {
              if (q.correct) correctCount++;
            });
            setMcqStats({ attempted: saved.length, correct: correctCount });
          } catch (e) { }
        }
      }, 0);

      // Load User Rank
      setTimeout(() => {
        if (user?.email) {
          try {
            const allScores = JSON.parse(localStorage.getItem("all_student_scores") || "[]");
            const studentTotals: Record<string, { score: number }> = {};
            
            allScores.forEach((s: any) => {
              const email = s.studentEmail || s.studentName;
              if (email) {
                if (!studentTotals[email]) {
                  studentTotals[email] = { score: 0 };
                }
                studentTotals[email].score += (Number(s.score) || 0);
              }
            });
            
            if (!studentTotals[user.email]) {
              studentTotals[user.email] = { score: 0 };
            }

            const sortedEmails = Object.keys(studentTotals).sort((a, b) => studentTotals[b].score - studentTotals[a].score);
            const myRankIndex = sortedEmails.indexOf(user.email);
            
            setUserRank(myRankIndex !== -1 ? myRankIndex + 1 : null);
          } catch (e) { }
        }
      }, 0);

      // Load trainer ID
      setTimeout(() => {
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
            } catch (e) { }
          }
        }
      }, 0);

      // Fetch MCQ total from database
      setTimeout(() => {
        const fetchDbStats = async () => {
          try {
            const token = localStorage.getItem('accessToken');
            if (token) {
              const res = await axios.get(getApiUrl('/api/v1/auth/dashboard-stats'), {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.data && res.data.mcq && res.data.mcq.total) {
                setMcqTotal(res.data.mcq.total);
              }
            }
          } catch (e) {
            console.error("Failed to fetch dashboard stats from DB", e);
          }
        };
        fetchDbStats();
      }, 0);
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

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Top Banner */}
        <WelcomeBanner solvedCount={solvedCount} totalCount={100} userRank={userRank} />

        {/* Analytics Section - Visible to all roles */}
        <AnalyticsCharts dsaStats={dsaStats} testStats={testStats} mcqTotal={mcqTotal} mcqStats={mcqStats} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Activity & Courses */}
          <div className="xl:col-span-2 space-y-8">
            <ActivitySection 
              enrollments={enrollments} 
              onGenerateCert={(idx, name) => { setGeneratingCertIdx(idx); setCertNameInput(name); }} 
              onViewCert={setSelectedCert} 
            />
          </div>

          {/* Right Column: Calendar & Performance */}
          <div className="space-y-8">
            {(!user?.role || user?.role === "STUDENT") && (
              <StudentPerformance />
            )}
          </div>
        </div>

        {/* Instructor Profile */}
        {user?.role === "INSTRUCTOR" && (
          <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
            <div className="flex items-center mb-6">
              <BookOpen className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Instructor Profile</h2>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="w-24 h-24 bg-primary-light rounded-2xl flex items-center justify-center text-primary font-bold text-4xl shadow-inner border border-primary/20">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-text-primary">
                  {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email.split('@')[0]}
                </p>
                <p className="text-text-secondary">{user.email}</p>
                <div className="inline-flex items-center space-x-2 bg-background text-text-primary px-4 py-2 rounded-xl border border-border mt-2">
                  <Award className="w-5 h-5 text-warning" />
                  <span className="font-mono font-bold text-sm">Instructor ID: {trainerId || `TRN-${user.id.substring(0, 6).toUpperCase()}`}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings / Password Change */}
        {user?.role === "INSTRUCTOR" && (
          <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
            <div className="flex items-center mb-6">
              <Lock className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Account Security</h2>
            </div>

            {passwordMsg.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-semibold ${passwordMsg.type === 'error' ? 'bg-accent-bg text-accent' : 'bg-success-bg text-success'}`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="hidden md:block"></div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button type="submit" className="bg-primary hover:bg-primary-hover text-text-inverse font-bold py-3 px-6 rounded-xl transition-colors">
                  Update Password
                </button>
              </div>
            </form>
          </div>
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
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md w-full border border-border animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2 text-text-primary">Generate Your Certificate</h3>
            <p className="text-sm text-text-secondary mb-6">
              Please enter your exact name as you want it to appear on your certificate.
              <strong className="text-accent block mt-2">Note: You can only generate this once!</strong>
            </p>
            <input
              type="text"
              value={certNameInput}
              onChange={(e) => setCertNameInput(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-6"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setGeneratingCertIdx(null)}
                className="px-4 py-2 font-bold text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateSubmit}
                disabled={!certNameInput.trim()}
                className="px-6 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-inverse font-bold rounded-lg transition-colors"
              >
                Confirm & Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

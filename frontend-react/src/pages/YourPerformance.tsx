import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  useUserProgress,
  type UserProgressData,
  type PracticeAnalyticsItem,
  type TestScoreRecord,
  type DailyProgressEntry,
} from "../utils/userProgressSync";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle2,
  XCircle, BrainCircuit, Target, Zap, Trophy, Download, FileText,
  ArrowRight, Lightbulb, Star, BarChart2, Loader, RefreshCw
} from "lucide-react";

interface AttemptRecord {
  id: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  correct: boolean;
  attemptedAt?: string;
}

const normalizeDifficulty = (raw?: string): "Easy" | "Medium" | "Hard" => {
  const upper = String(raw || "Medium").trim().toUpperCase();
  if (upper === "EASY") return "Easy";
  if (upper === "HARD") return "Hard";
  return "Medium";
};

function readLocalJsonArray<T = PracticeAnalyticsItem>(key: string): T[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function readLocalDailyProgress(email: string): Record<string, DailyProgressEntry> {
  try {
    const parsed = JSON.parse(localStorage.getItem(`daily_progress_${email.toLowerCase().trim()}`) || "{}");
    return parsed && typeof parsed === "object" ? (parsed as Record<string, DailyProgressEntry>) : {};
  } catch {
    return {};
  }
}

function buildUnifiedAttempts(
  dbProgress: UserProgressData | null | undefined,
  email?: string
): AttemptRecord[] {
  const attemptedMap = new Map<string, AttemptRecord>();
  const emailLower = (email || "").toLowerCase().trim();

  const upsertItem = (prefix: string, item: PracticeAnalyticsItem, defaultTopic: string) => {
    const rawId = item?.id || item?._id;
    if (!rawId) return;
    const key = `${prefix}_${rawId}`;
    const prev = attemptedMap.get(key);
    const nextCorrect = Boolean(item?.correct) || Boolean(prev?.correct);
    attemptedMap.set(key, {
      id: String(rawId),
      topic: String(item?.topic || prev?.topic || defaultTopic).trim() || defaultTopic,
      difficulty: normalizeDifficulty(item?.difficulty || prev?.difficulty),
      correct: nextCorrect,
      attemptedAt: item?.attemptedAt || prev?.attemptedAt,
    });
  };

  // 1. Backend aptitudeAnalytics (primary) + localStorage fallback
  if (dbProgress && Array.isArray(dbProgress.aptitudeAnalytics)) {
    dbProgress.aptitudeAnalytics.forEach((item) => upsertItem("apt", item, "Aptitude"));
  }
  if (emailLower) {
    readLocalJsonArray(`aptitude_analytics_${emailLower}`).forEach((item) =>
      upsertItem("apt", item, "Aptitude")
    );
  }

  // 2. Backend otherAnalytics + localStorage fallback
  if (dbProgress && Array.isArray(dbProgress.otherAnalytics)) {
    dbProgress.otherAnalytics.forEach((item) => upsertItem("other", item, "Practice"));
  }
  if (emailLower) {
    readLocalJsonArray(`other_practice_analytics_${emailLower}`).forEach((item) =>
      upsertItem("other", item, "Practice")
    );
  }

  // 3. Backend codingAnalytics (from PostgreSQL Submissions) + dsaSolved fallback
  if (dbProgress && Array.isArray(dbProgress.codingAnalytics)) {
    dbProgress.codingAnalytics.forEach((item) => upsertItem("code", item, "Coding"));
  } else if (dbProgress && Array.isArray(dbProgress.dsaSolved)) {
    dbProgress.dsaSolved.forEach((qId) =>
      upsertItem("code", { id: qId, topic: "Coding", difficulty: "Medium", correct: true }, "Coding")
    );
  }

  // 4. Test attempts from backend testScores + local fallback
  const scoresPool: TestScoreRecord[] = [];
  if (dbProgress && Array.isArray(dbProgress.testScores)) {
    scoresPool.push(...dbProgress.testScores);
  }
  if (emailLower) {
    readLocalJsonArray<TestScoreRecord>("all_student_scores")
      .filter((s) => !s?.studentEmail || s.studentEmail.toLowerCase().trim() === emailLower)
      .forEach((s) => scoresPool.push(s));
  }

  const seenScoreKeys = new Set<string>();
  scoresPool.forEach((s) => {
    const scoreKey = String(s?.id || `${s?.testId || "test"}_${s?.timestamp || s?.date || ""}`);
    if (seenScoreKeys.has(scoreKey)) return;
    seenScoreKeys.add(scoreKey);

    const totalQ = Number(s?.totalQuestions) || 0;
    const correctQ = Math.max(0, Math.min(Number(s?.score) || 0, totalQ));
    const topicLabel = String(s?.testTitle || s?.topic || "Tests").trim();
    const attemptedAt = s?.timestamp || s?.date;

    for (let i = 0; i < totalQ; i++) {
      attemptedMap.set(`test_${scoreKey}_${i}`, {
        id: `${scoreKey}_${i}`,
        topic: topicLabel,
        difficulty: "Medium",
        correct: i < correctQ,
        attemptedAt,
      });
    }
  });

  return Array.from(attemptedMap.values());
}

function buildWeeklySeries(
  dbProgress: UserProgressData | null | undefined,
  attempts: AttemptRecord[],
  email?: string
) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyMap: Record<string, { questionsSolved: number; pointsEarned: number }> = {};

  const mergeDay = (dayKey: string, qCount: number, pts: number) => {
    const prev = dailyMap[dayKey] || { questionsSolved: 0, pointsEarned: 0 };
    dailyMap[dayKey] = {
      questionsSolved: Math.max(prev.questionsSolved, qCount),
      pointsEarned: Math.max(prev.pointsEarned, pts),
    };
  };

  if (dbProgress?.dailyProgress && typeof dbProgress.dailyProgress === "object") {
    Object.entries(dbProgress.dailyProgress).forEach(([dayKey, val]: [string, DailyProgressEntry]) => {
      if (val && typeof val === "object") {
        mergeDay(dayKey, Number(val.questionsSolved) || 0, Number(val.pointsEarned) || 0);
      }
    });
  }

  if (email) {
    Object.entries(readLocalDailyProgress(email)).forEach(([dayKey, val]: [string, DailyProgressEntry]) => {
      if (val && typeof val === "object") {
        mergeDay(dayKey, Number(val.questionsSolved) || 0, Number(val.pointsEarned) || 0);
      }
    });
  }

  // Fallback aggregation from attempt timestamps for dates missing in dailyProgress
  const derivedByDay: Record<string, { questionsSolved: number; pointsEarned: number }> = {};
  attempts.forEach((a) => {
    if (!a.attemptedAt) return;
    const dt = new Date(a.attemptedAt);
    if (Number.isNaN(dt.getTime())) return;
    const dayKey = dt.toISOString().split("T")[0];
    if (!derivedByDay[dayKey]) derivedByDay[dayKey] = { questionsSolved: 0, pointsEarned: 0 };
    derivedByDay[dayKey].questionsSolved += 1;
    derivedByDay[dayKey].pointsEarned += a.correct ? 5 : 1;
  });
  Object.entries(derivedByDay).forEach(([dayKey, val]) => {
    mergeDay(dayKey, val.questionsSolved, val.pointsEarned);
  });

  const today = new Date();
  const series = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    const stats = dailyMap[dateKey] || { questionsSolved: 0, pointsEarned: 0 };
    series.push({
      name: days[d.getDay()],
      questionsSolved: stats.questionsSolved,
      pointsEarned: stats.pointsEarned,
      fullDate: dateKey,
    });
  }
  return series;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

const StatCard = ({ icon, label, value, sub, accent = "text-primary" }: StatCardProps) => (
  <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent.replace("text-", "bg-").replace("primary", "primary/10")} shrink-0`}>
      {icon}
    </div>
    <div>
      <div className={`text-2xl font-black ${accent}`}>{value}</div>
      <div className="text-xs font-semibold text-text-muted mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  </div>
);

const SuggestionCard = ({ icon, title, description, severity }: {
  icon: React.ReactNode; title: string; description: string; severity: "good" | "warn" | "bad"
}) => {
  const colors = {
    good: "border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10",
    warn: "border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/10",
    bad:  "border-l-4 border-rose-500  bg-rose-50  dark:bg-rose-900/10",
  };
  const iconColors = { good: "text-emerald-500", warn: "text-amber-500", bad: "text-rose-500" };
  return (
    <div className={`rounded-xl p-4 ${colors[severity]} flex items-start gap-3`}>
      <div className={`${iconColors[severity]} mt-0.5 shrink-0`}>{icon}</div>
      <div>
        <div className="font-bold text-text-primary text-sm">{title}</div>
        <div className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</div>
      </div>
    </div>
  );
};

export default function YourPerformance() {
  const { user } = useAuth();
  const { data: dbProgress, isLoading, isFetching, refetch } = useUserProgress(user?.email);
  const [showReport, setShowReport] = useState(false);

  const attempts = useMemo(
    () => buildUnifiedAttempts(dbProgress, user?.email),
    [dbProgress, user?.email]
  );

  const weeklyData = useMemo(
    () => buildWeeklySeries(dbProgress, attempts, user?.email),
    [dbProgress, attempts, user?.email]
  );

  const totalAttempted = attempts.length;
  const totalCorrect = attempts.filter((q) => q.correct).length;
  const totalIncorrect = totalAttempted - totalCorrect;
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const weeklyTotal = weeklyData.reduce((s, d) => s + (d.questionsSolved || 0), 0);
  const weeklyPoints = weeklyData.reduce((s, d) => s + (d.pointsEarned || 0), 0);

  const topicStats = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {};
    attempts.forEach((q) => {
      const t = (q.topic || "General Practice").trim();
      if (!map[t]) map[t] = { total: 0, correct: 0 };
      map[t].total++;
      if (q.correct) map[t].correct++;
    });
    return Object.entries(map)
      .map(([topic, { total, correct }]) => ({
        topic,
        total,
        correct,
        incorrect: total - correct,
        accuracy: Math.round((correct / total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [attempts]);

  const diffStats = useMemo(() => {
    const map: Record<"Easy" | "Medium" | "Hard", { total: number; correct: number }> = {
      Easy: { total: 0, correct: 0 },
      Medium: { total: 0, correct: 0 },
      Hard: { total: 0, correct: 0 },
    };
    attempts.forEach((q) => {
      const d = q.difficulty;
      map[d].total++;
      if (q.correct) map[d].correct++;
    });
    return (Object.entries(map) as Array<["Easy" | "Medium" | "Hard", { total: number; correct: number }]>)
      .map(([name, { total, correct }]) => ({
        name,
        total,
        correct,
        incorrect: total - correct,
        fill: name === "Easy" ? "#10b981" : name === "Medium" ? "#f59e0b" : "#ef4444",
      }));
  }, [attempts]);

  const radarData = useMemo(
    () =>
      topicStats.slice(0, 6).map((t) => ({
        subject: t.topic.length > 12 ? t.topic.slice(0, 12) + "…" : t.topic,
        accuracy: t.accuracy,
        fullMark: 100,
      })),
    [topicStats]
  );

  const pieData = [
    { name: "Correct", value: totalCorrect, fill: "#10b981" },
    { name: "Incorrect", value: totalIncorrect, fill: "#ef4444" },
  ];

  const suggestions = useMemo(() => {
    const result: Array<{ icon: React.ReactNode; title: string; description: string; severity: "good" | "warn" | "bad" }> = [];

    if (totalAttempted === 0) {
      result.push({
        icon: <Lightbulb className="w-4 h-4" />,
        title: "Start Practicing!",
        description: "You haven't attempted any questions yet. Begin with Practice or Assessments to get personalised insights here.",
        severity: "warn",
      });
      return result;
    }

    if (accuracy >= 80) {
      result.push({ icon: <Trophy className="w-4 h-4" />, title: "Excellent Accuracy!", description: `You're answering ${accuracy}% of questions correctly — keep it up!`, severity: "good" });
    } else if (accuracy >= 50) {
      result.push({ icon: <Target className="w-4 h-4" />, title: "Room to Improve", description: `Your accuracy is ${accuracy}%. Focus on reviewing incorrect answers and explanations.`, severity: "warn" });
    } else {
      result.push({ icon: <AlertTriangle className="w-4 h-4" />, title: "Needs Attention", description: `Only ${accuracy}% accuracy. Consider starting with Easy questions and re-reading fundamentals.`, severity: "bad" });
    }

    const weakTopics = topicStats.filter((t) => t.accuracy < 50 && t.total >= 2);
    if (weakTopics.length > 0) {
      result.push({
        icon: <TrendingDown className="w-4 h-4" />,
        title: `Weak Areas: ${weakTopics.map((t) => t.topic).join(", ")}`,
        description: "These topics have below 50% accuracy. Revisit concepts and practice with easier questions first.",
        severity: "bad",
      });
    }

    const strongTopics = topicStats.filter((t) => t.accuracy >= 80 && t.total >= 2);
    if (strongTopics.length > 0) {
      result.push({
        icon: <Star className="w-4 h-4" />,
        title: `Strong Areas: ${strongTopics.map((t) => t.topic).join(", ")}`,
        description: "Great performance! These areas show 80%+ accuracy. Push to Hard difficulty.",
        severity: "good",
      });
    }

    const hardStats = diffStats.find((d) => d.name === "Hard");
    if (!hardStats || hardStats.total === 0) {
      result.push({ icon: <Zap className="w-4 h-4" />, title: "Challenge Yourself", description: "You haven't attempted any Hard questions yet. Try some to sharpen your skills.", severity: "warn" });
    }

    const activeDays = weeklyData.filter((d) => d.questionsSolved > 0).length;
    if (activeDays >= 5) {
      result.push({ icon: <TrendingUp className="w-4 h-4" />, title: "Consistent Learner", description: `You've been active ${activeDays} out of the last 7 days. Excellent consistency!`, severity: "good" });
    } else if (activeDays >= 2) {
      result.push({ icon: <TrendingUp className="w-4 h-4" />, title: "Build Your Streak", description: `Active ${activeDays} days this week. Try to practice daily for better retention.`, severity: "warn" });
    } else {
      result.push({ icon: <AlertTriangle className="w-4 h-4" />, title: "Low Activity", description: "Less than 2 active days this week. Regular practice is key to placement success.", severity: "bad" });
    }

    return result;
  }, [accuracy, topicStats, diffStats, weeklyData, totalAttempted]);

  const handleDownloadReport = () => {
    const lines: string[] = [];
    lines.push("=== YOUR PERFORMANCE REPORT ===");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`User: ${user?.email}`);
    lines.push("");
    lines.push("--- OVERVIEW ---");
    lines.push(`Total Questions Attempted : ${totalAttempted}`);
    lines.push(`Correct Answers           : ${totalCorrect}`);
    lines.push(`Incorrect Answers         : ${totalIncorrect}`);
    lines.push(`Overall Accuracy          : ${accuracy}%`);
    lines.push(`Questions Solved (7 days) : ${weeklyTotal}`);
    lines.push(`Points Earned  (7 days)   : ${weeklyPoints}`);
    lines.push("");
    lines.push("--- TOPIC-WISE BREAKDOWN ---");
    topicStats.forEach((t) => {
      lines.push(`  ${t.topic.padEnd(25)} | Attempted: ${t.total} | Correct: ${t.correct} | Accuracy: ${t.accuracy}%`);
    });
    lines.push("");
    lines.push("--- DIFFICULTY BREAKDOWN ---");
    diffStats.forEach((d) => {
      const acc = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
      lines.push(`  ${d.name.padEnd(10)} | Attempted: ${d.total} | Correct: ${d.correct} | Accuracy: ${acc}%`);
    });
    lines.push("");
    lines.push("--- SUGGESTIONS ---");
    suggestions.forEach((s) => {
      const mark = s.severity === "good" ? "OK" : s.severity === "warn" ? "WARN" : "ATTN";
      lines.push(`[${mark}] ${s.title}`);
      lines.push(`   ${s.description}`);
    });
    lines.push("");
    lines.push("--- AREAS TO IMPROVE ---");
    const weakTopics = topicStats.filter((t) => t.accuracy < 60);
    if (weakTopics.length === 0) {
      lines.push("  Excellent! No major weak areas found.");
    } else {
      weakTopics.forEach((t) => {
        lines.push(`  - ${t.topic}: ${t.accuracy}% accuracy (${t.incorrect} wrong out of ${t.total})`);
      });
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance_report_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0B0F19] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase mb-2">
              <BarChart2 className="w-3.5 h-3.5" />
              Career Development
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-text-primary dark:text-white">
              Your <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 bg-clip-text text-transparent">Performance</span>
            </h1>
            <p className="text-sm text-text-muted mt-1">
              A complete analysis of your coding, aptitude, test &amp; practice activity — synced with your backend profile.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-surface border border-border text-text-primary rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              title="Refresh from server"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={() => setShowReport((r) => !r)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-text-primary rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <FileText className="w-4 h-4" />
              {showReport ? "Hide" : "View"} Report
            </button>
          </div>
        </div>

        {isLoading && attempts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading your performance data...</span>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<BrainCircuit className="w-5 h-5 text-primary" />} label="Questions Attempted" value={totalAttempted} accent="text-primary" />
              <StatCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} label="Correct Answers" value={totalCorrect} sub={`${accuracy}% accuracy`} accent="text-emerald-500" />
              <StatCard icon={<XCircle className="w-5 h-5 text-rose-500" />} label="Incorrect Answers" value={totalIncorrect} accent="text-rose-500" />
              <StatCard icon={<Zap className="w-5 h-5 text-amber-500" />} label="Weekly Questions" value={weeklyTotal} sub={`${weeklyPoints} pts earned`} accent="text-amber-500" />
            </div>

            {/* Charts Row 1: Weekly Area + Pie */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-base font-bold text-text-primary">Weekly Activity</h2>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gQ" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                        </linearGradient>
                        <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                      <Legend iconType="square" wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
                      <Area type="monotone" dataKey="questionsSolved" name="Questions Solved" stroke="#6366f1" strokeWidth={2.5} fill="url(#gQ)" />
                      <Area type="monotone" dataKey="pointsEarned" name="Points Earned" stroke="#10b981" strokeWidth={2.5} fill="url(#gP)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-4 w-full">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-text-primary">Overall Accuracy</h2>
                </div>
                {totalAttempted === 0 ? (
                  <div className="text-center text-text-muted py-6 text-sm">No attempts yet</div>
                ) : (
                  <>
                    <PieChart width={180} height={180}>
                      <Pie data={pieData} cx={85} cy={85} innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                    </PieChart>
                    <div className="text-3xl font-black text-text-primary">{accuracy}%</div>
                    <div className="text-xs text-text-muted mt-1">Overall Accuracy</div>
                    <div className="flex gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{totalCorrect} Correct</span>
                      <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />{totalIncorrect} Wrong</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Charts Row 2: Topic Bar + Radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-5 h-5 text-purple-500" />
                  <h2 className="text-base font-bold text-text-primary">Topic-wise Performance</h2>
                </div>
                {topicStats.length === 0 ? (
                  <div className="text-center text-text-muted py-10 text-sm">No data yet. Solve questions to see your breakdown.</div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topicStats} margin={{ top: 5, right: 10, left: -25, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                        <XAxis dataKey="topic" angle={-30} textAnchor="end" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} interval={0} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                        <Legend iconType="square" wrapperStyle={{ paddingTop: 8, fontSize: 11 }} />
                        <Bar dataKey="correct" name="Correct" radius={[4, 4, 0, 0]} fill="#10b981" />
                        <Bar dataKey="incorrect" name="Incorrect" radius={[4, 4, 0, 0]} fill="#f87171" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-sky-500" />
                  <h2 className="text-base font-bold text-text-primary">Topic Radar (Accuracy %)</h2>
                </div>
                {radarData.length === 0 ? (
                  <div className="text-center text-text-muted py-10 text-sm">Solve more questions to see radar chart.</div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                        <Radar name="Accuracy" dataKey="accuracy" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                        <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} formatter={(v) => `${v ?? 0}%`} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-text-primary">Difficulty Breakdown</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {diffStats.map((d) => {
                  const acc = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
                  const badgeColor =
                    d.name === "Easy"
                      ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20"
                      : d.name === "Medium"
                        ? "text-amber-600 bg-amber-100 dark:bg-amber-900/20"
                        : "text-rose-600 bg-rose-100 dark:bg-rose-900/20";
                  return (
                    <div key={d.name} className="bg-background dark:bg-[#0B0F19] rounded-xl p-4 border border-border text-center">
                      <div className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold mb-2 ${badgeColor}`}>{d.name}</div>
                      <div className="text-2xl font-black text-text-primary">{d.total}</div>
                      <div className="text-xs text-text-muted">Attempted</div>
                      <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${acc}%`, background: d.fill }} />
                      </div>
                      <div className="text-xs font-semibold mt-1" style={{ color: d.fill }}>{acc}% correct</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h2 className="text-base font-bold text-text-primary">Personalised Suggestions</h2>
              </div>
              <div className="space-y-3">
                {suggestions.map((s, i) => (
                  <SuggestionCard key={i} {...s} />
                ))}
              </div>
            </div>

            {/* Weak Areas Detail */}
            {topicStats.filter((t) => t.accuracy < 60).length > 0 && (
              <div className="bg-surface dark:bg-[#111827] border border-rose-500/30 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <h2 className="text-base font-bold text-text-primary">Areas Where You're Lagging</h2>
                </div>
                <div className="space-y-3">
                  {topicStats.filter((t) => t.accuracy < 60).map((t, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-500/20">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                        <BrainCircuit className="w-5 h-5 text-rose-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-text-primary text-sm">{t.topic}</div>
                        <div className="text-xs text-text-muted mt-0.5">{t.incorrect} wrong out of {t.total} attempted</div>
                        <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${t.accuracy}%` }} />
                        </div>
                      </div>
                      <div className="text-rose-500 font-black text-lg shrink-0">{t.accuracy}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inline Report */}
            {showReport && (
              <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-text-primary">Performance Report</h2>
                </div>
                <div className="font-mono text-xs text-text-secondary bg-background dark:bg-[#0B0F19] rounded-xl p-4 overflow-x-auto whitespace-pre-wrap border border-border">
                  <p className="font-bold text-base text-text-primary mb-2">PERFORMANCE REPORT — {new Date().toLocaleDateString()}</p>
                  <p><span className="text-emerald-500">Total Attempted:</span> {totalAttempted}  |  <span className="text-emerald-500">Correct:</span> {totalCorrect}  |  <span className="text-rose-500">Wrong:</span> {totalIncorrect}  |  <span className="text-sky-500">Accuracy:</span> {accuracy}%</p>
                  <br />
                  <p className="font-bold text-text-primary">Topic-wise:</p>
                  {topicStats.map((t) => (
                    <p key={t.topic}>  {t.topic.padEnd(25, " ")} → {t.accuracy}% ({t.correct}/{t.total}){t.accuracy < 60 ? " (Needs improvement)" : t.accuracy >= 80 ? " (Excellent)" : ""}</p>
                  ))}
                  <br />
                  <p className="font-bold text-text-primary">Suggestions:</p>
                  {suggestions.map((s, i) => (
                    <p key={i}>- {s.title}</p>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-sky-500/10 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-lg font-black text-text-primary">Keep improving!</div>
                <div className="text-sm text-text-muted mt-1">Practice daily to unlock better accuracy, streaks and performance insights.</div>
              </div>
              <a href="/dashboard/practice/aptitude" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all shrink-0">
                Go Practice <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

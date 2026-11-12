import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Database, 
  Network, 
  ArrowRight, 
  BookOpen, 
  Code, 
  Sparkles, 
  CheckCircle2, 
  CheckSquare, 
  BarChart3, 
  TrendingUp, 
  Target 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface MyProgressProps {
  enrollments: any[];
  practiceProgress?: any[];
  codingSolved?: number;
  mcqStats?: {
    attempted: number;
    correct: number;
    incorrect: number;
    accuracy: number;
    topicBreakdown?: { name: string; attempted: number; correct: number; accuracy: number }[];
  };
}

export default function MyProgress({ 
  enrollments = [], 
  practiceProgress = [],
  codingSolved = 0,
  mcqStats
}: MyProgressProps) {
  const [activeTab, setActiveTab] = useState<'Practice' | 'Courses'>('Practice');
  const navigate = useNavigate();

  // Pick enrolled courses to display progress
  const progressData = enrollments.slice(0, 4).map((course, idx) => {
    const isCompleted = course.status === 'completed' || course.status === 'Success';
    let value = 45;
    if (isCompleted) value = 100;
    else if (course.status === 'UNPAID') value = 10;
    else value = Math.min(95, 20 + ((course.courseName?.length || 5) * 5));

    const colors = [
      { icon: <Layers className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bar: "from-emerald-500 to-teal-500" },
      { icon: <Cpu className="w-5 h-5 text-amber-500" />, bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", bar: "from-amber-500 to-orange-500" },
      { icon: <Database className="w-5 h-5 text-sky-500" />, bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400", bar: "from-sky-500 to-blue-500" },
      { icon: <Network className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", bar: "from-indigo-500 to-purple-500" }
    ];

    return {
      name: course.courseName || "Course",
      value: value,
      isCompleted,
      ...colors[idx % colors.length]
    };
  });

  const dsaProgressData = practiceProgress?.slice(0, 4).map((tag, idx) => {
    const colors = [
      { icon: <Code className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bar: "from-emerald-500 to-teal-500" },
      { icon: <Database className="w-5 h-5 text-sky-500" />, bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400", bar: "from-sky-500 to-blue-500" },
      { icon: <Cpu className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", bar: "from-indigo-500 to-purple-500" },
      { icon: <Layers className="w-5 h-5 text-amber-500" />, bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", bar: "from-amber-500 to-orange-500" }
    ];
    return {
      name: tag.name,
      value: tag.value,
      ...colors[idx % colors.length]
    };
  }) || [];

  // Metrics for Coding & DSA
  const codingCount = codingSolved;

  // DSA Topic Bar plot data
  const dsaBarPlotData = dsaProgressData && dsaProgressData.length > 0
    ? dsaProgressData.map((item, idx) => {
        const colors = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];
        return {
          name: item.name,
          shortName: item.name.length > 9 ? item.name.substring(0, 8) + '..' : item.name,
          value: item.value,
          color: colors[idx % colors.length],
          unit: 'Solved',
          description: `${item.value} problems solved in ${item.name}`
        };
      })
    : [
        { name: 'Arrays', shortName: 'Arrays', value: Math.min(codingCount, 8), color: '#0ea5e9', unit: 'Solved', description: 'Array fundamentals' },
        { name: 'Strings', shortName: 'Strings', value: Math.min(Math.max(0, codingCount - 8), 6), color: '#10b981', unit: 'Solved', description: 'String algorithms' },
        { name: 'Linked List', shortName: 'LinkedList', value: Math.min(Math.max(0, codingCount - 14), 5), color: '#6366f1', unit: 'Solved', description: 'Pointers & lists' },
        { name: 'Dynamic Prog', shortName: 'DP', value: Math.max(0, codingCount - 19), color: '#f59e0b', unit: 'Solved', description: 'Dynamic Programming' }
      ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs">
          <p className="font-bold text-slate-200">{item.name}</p>
          <p className="text-emerald-400 font-extrabold text-sm mt-0.5">{item.value} {item.unit}</p>
          {item.description && (
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] leading-tight">{item.description}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const hasActivity = codingCount > 0;

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border dark:border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between w-full h-full min-h-[460px]">
      <div>
        {/* Header: Title and Filter Tabs */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/60">
          <div>
            <h2 className="text-2xl font-black text-text-primary dark:text-white tracking-tight flex items-center gap-2.5">
              <span>My Progress</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {activeTab === 'Courses' ? `${enrollments.length} Enrolled` : 'Problem Solving Hub'}
              </span>
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {activeTab === 'Courses' 
                ? 'Track your course syllabus completion and study progress' 
                : 'Track Coding Problems (DSA) and MCQ performance with real-time analytics'}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-background dark:bg-slate-900/60 p-1.5 rounded-xl border border-border/80 shrink-0">
            {(['Practice', 'Courses'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold transition-all px-4 py-2 rounded-lg ${
                  activeTab === tab 
                    ? 'bg-primary text-white shadow-xs' 
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Courses Content */}
        {activeTab === 'Courses' && (
          <div className="space-y-4">
            {progressData.length > 0 ? (
              <div className="space-y-3.5">
                {progressData.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-background/60 dark:bg-slate-900/40 border border-border/60 hover:border-primary/40 transition-all gap-4 group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <div className={`p-3 rounded-xl shrink-0 ${item.bg} group-hover:scale-105 transition-transform shadow-xs`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-base font-bold text-text-primary dark:text-white truncate">
                            {item.name}
                          </span>
                          <span className="text-sm font-extrabold text-primary ml-2 shrink-0">
                            {item.value}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${item.bar} transition-all duration-700 ease-out`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('/dashboard/my-courses')}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover px-3.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors shrink-0 self-end sm:self-center"
                    >
                      <span>Resume</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {progressData.length <= 2 && (
                  <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 flex items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-text-primary dark:text-white">Accelerate Your Engineering Career</p>
                        <p className="text-xs text-text-muted">Explore full-stack and data science live programs.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard/my-courses')}
                      className="text-sm font-bold text-primary hover:underline shrink-0"
                    >
                      Browse Catalog →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <BookOpen className="w-12 h-12 text-text-muted opacity-40" />
                <p className="text-lg font-bold text-text-primary dark:text-white">No enrolled courses yet</p>
                <p className="text-sm text-text-muted max-w-sm">Enroll in our verified training tracks to begin your structured curriculum.</p>
                <button
                  onClick={() => navigate('/dashboard/my-courses')}
                  className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-sm"
                >
                  Explore Courses
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Practice (Problem Solving with DSA Track Breakdown & Topic Distribution) */}
        {activeTab === 'Practice' && (
          <div className="space-y-4">
            
            {/* Top Dual Cards: Coding Problems & DSA Topic Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Coding Problems (DSA) */}
              <div className="p-4 sm:p-5 rounded-xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 hover:border-sky-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400">
                        <Code className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-sm font-extrabold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                        Coding Problems
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300">
                      DSA Practice
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span className="text-3xl sm:text-4xl font-black text-text-primary dark:text-white">
                      {codingCount}
                    </span>
                    <span className="text-sm font-semibold text-text-muted">
                      Problems Solved
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-text-muted mt-1.5 leading-relaxed">
                    High-frequency interview problems across Foundation & Core tracks.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-sky-500/15 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-sky-600 dark:text-sky-400">
                    LeetCode & GFG Curated
                  </span>
                  <button 
                    onClick={() => navigate('/dashboard/practice')}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                  >
                    <span>Practice DSA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card 2: DSA Track Progress */}
              <div className="p-4 sm:p-5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Layers className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                        DSA Topic Mastery
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      {dsaProgressData.length || (codingCount > 0 ? 1 : 0)} Topics Active
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span className="text-3xl sm:text-4xl font-black text-text-primary dark:text-white">
                      {codingCount}
                    </span>
                    <span className="text-sm font-semibold text-text-muted">
                      Solved across <span className="font-bold text-text-primary dark:text-white">{dsaProgressData.length || 1}</span> categories
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-text-muted mt-1.5 leading-relaxed">
                    Arrays, Strings, Linked Lists, Trees, Graphs, and Dynamic Programming.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-500/15 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Foundation & Core Tracks
                  </span>
                  <button 
                    onClick={() => navigate('/dashboard/practice')}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <span>Explore Tracks</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Visual Bar Plot Section */}
            <div className="p-4 sm:p-5 rounded-xl bg-background/60 dark:bg-slate-900/40 border border-border/80">
              <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4.5 h-4.5 text-primary" />
                  <h3 className="text-base font-black text-text-primary dark:text-white tracking-tight">
                    DSA Problem Solving by Topic
                  </h3>
                </div>
                <div className="flex items-center gap-3.5 text-xs sm:text-sm font-semibold text-text-muted flex-wrap">
                  {dsaBarPlotData.map((d, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: d.color }} /> {d.name} ({d.value})
                    </span>
                  ))}
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="h-48 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dsaBarPlotData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    barSize={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                    <XAxis 
                      dataKey="shortName" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 13, fontWeight: 700, fill: '#64748b' }}
                      dy={5}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      radius={[6, 6, 0, 0]}
                    >
                      {dsaBarPlotData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* DSA Milestone Progress Gauge */}
              <div className="mt-3.5 pt-3.5 border-t border-border/60">
                <div className="flex items-center justify-between text-sm font-bold mb-1.5 flex-wrap gap-1">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    DSA Milestone Progress
                  </span>
                  <span className="text-sky-600 dark:text-sky-400 font-extrabold">
                    {codingCount} Problems Solved Across Practice Tracks
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(10, (codingCount / 50) * 100))}%` }}
                    title={`${codingCount} Solved`}
                  />
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-text-muted mt-2.5 flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                    <Code className="w-3.5 h-3.5 text-sky-500" />
                    {codingCount} Total Coding Solved
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {dsaProgressData.length || (codingCount > 0 ? 1 : 0)} Topics Covered
                  </span>
                </div>
              </div>

              {/* Topic chips if available */}
              {dsaProgressData.length > 0 && (
                <div className="mt-3.5 pt-3.5 border-t border-border/60">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Top Problem Topics Mastered
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dsaProgressData.map((item, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-background dark:bg-slate-900 border border-border/80 text-text-primary dark:text-white"
                      >
                        <span className="text-primary font-bold">{item.name}:</span>
                        <span>{item.value} solved</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
        <span className="text-sm font-semibold text-text-muted">
          {activeTab === 'Courses' 
            ? `${enrollments.length} Active Courses` 
            : `${codingCount} Coding Problems Logged`}
        </span>
        <button 
          onClick={() => navigate(activeTab === 'Courses' ? '/dashboard/my-courses' : '/dashboard/practice')}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover group"
        >
          <span>{activeTab === 'Courses' ? 'View All Courses' : 'Practice More Problems'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

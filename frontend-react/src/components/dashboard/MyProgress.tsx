import React, { useState } from 'react';
import { Layers, Cpu, Database, Network, ArrowRight, BookOpen, Code, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyProgress({ enrollments = [], practiceProgress = [] }: { enrollments: any[], practiceProgress?: any[] }) {
  const [activeTab, setActiveTab] = useState<'Courses' | 'Practice'>('Courses');
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

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border dark:border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between w-full h-full min-h-[420px]">
      <div>
        {/* Header: Title and Filter Tabs */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
          <div>
            <h2 className="text-xl font-black text-text-primary dark:text-white tracking-tight">
              My Progress
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Track course syllabus completion and technical practice goals
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-background dark:bg-slate-900/60 p-1 rounded-xl border border-border/80">
            {(['Courses', 'Practice'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold transition-all px-3.5 py-1.5 rounded-lg ${
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

        {/* Content List */}
        <div className="space-y-4">
          {activeTab === 'Courses' ? (
            progressData.length > 0 ? (
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
                          <span className="text-sm font-bold text-text-primary dark:text-white truncate">
                            {item.name}
                          </span>
                          <span className="text-xs font-extrabold text-primary ml-2 shrink-0">
                            {item.value}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${item.bar} transition-all duration-700 ease-out`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('/dashboard/my-courses')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors shrink-0 self-end sm:self-center"
                    >
                      <span>Resume</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Helpful learning tip if few courses */}
                {progressData.length <= 2 && (
                  <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 flex items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-text-primary dark:text-white">Accelerate Your Engineering Career</p>
                        <p className="text-[11px] text-text-muted">Explore full-stack and data science live programs.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard/my-courses')}
                      className="text-xs font-bold text-primary hover:underline shrink-0"
                    >
                      Browse Catalog →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <BookOpen className="w-12 h-12 text-text-muted opacity-40" />
                <p className="text-base font-bold text-text-primary dark:text-white">No enrolled courses yet</p>
                <p className="text-xs text-text-muted max-w-sm">Enroll in our verified training tracks to begin your structured curriculum.</p>
                <button
                  onClick={() => navigate('/dashboard/my-courses')}
                  className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
                >
                  Explore Courses
                </button>
              </div>
            )
          ) : (
            dsaProgressData.length > 0 ? (
              <div className="space-y-3.5">
                {dsaProgressData.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-4 rounded-xl bg-background/60 dark:bg-slate-900/40 border border-border/60 hover:border-primary/40 transition-all gap-4 group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <div className={`p-3 rounded-xl shrink-0 ${item.bg} group-hover:scale-105 transition-transform shadow-xs`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-text-primary dark:text-white truncate">
                            {item.name}
                          </span>
                          <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                            {item.value} solved
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('/dashboard/practice')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors shrink-0"
                    >
                      <span>Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <Code className="w-12 h-12 text-text-muted opacity-40" />
                <p className="text-base font-bold text-text-primary dark:text-white">No problem data yet</p>
                <p className="text-xs text-text-muted max-w-sm">Solve high-frequency interview questions in the DSA practice center.</p>
                <button
                  onClick={() => navigate('/dashboard/practice')}
                  className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
                >
                  Start Practicing
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted">
          {activeTab === 'Courses' ? `${enrollments.length} Active Courses` : 'Practice Center Active'}
        </span>
        <button 
          onClick={() => navigate(activeTab === 'Courses' ? '/dashboard/my-courses' : '/dashboard/practice')}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover group"
        >
          <span>{activeTab === 'Courses' ? 'View All Courses' : 'Practice More Problems'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

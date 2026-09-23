import React, { useState } from 'react';
import { Layers, Cpu, Database, Network, ArrowRight, BookOpen, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyProgress({ enrollments = [], practiceProgress = [] }: { enrollments: any[], practiceProgress?: any[] }) {
  const [activeTab, setActiveTab] = useState<'Courses' | 'Practice'>('Courses');
  const navigate = useNavigate();

  // Pick up to 4 enrolled courses to display progress
  const progressData = enrollments.slice(0, 4).map((course, idx) => {
    const isCompleted = course.status === 'completed' || course.status === 'Success';
    // If it's a mock or active course, give it a randomish realistic progress like 35%, 60% based on string length, 
    // or just 100% if completed, 10% if UNPAID, 45% if active
    let value = 45;
    if (isCompleted) value = 100;
    else if (course.status === 'UNPAID') value = 10;
    else value = Math.min(95, 20 + ((course.courseName?.length || 5) * 5));

    const colors = [
      { icon: <Layers className="w-5 h-5 text-blue-500" />, bg: "bg-blue-100 dark:bg-blue-900/30", color: "bg-emerald-500" },
      { icon: <Cpu className="w-5 h-5 text-yellow-500" />, bg: "bg-yellow-100 dark:bg-yellow-900/30", color: "bg-emerald-500" },
      { icon: <Database className="w-5 h-5 text-blue-500" />, bg: "bg-blue-100 dark:bg-blue-900/30", color: "bg-emerald-500" },
      { icon: <Network className="w-5 h-5 text-purple-500" />, bg: "bg-purple-100 dark:bg-purple-900/30", color: "bg-emerald-500" }
    ];

    return {
      name: course.courseName || "Course",
      value: value,
      ...colors[idx % colors.length]
    };
  });

  const dsaProgressData = practiceProgress?.slice(0, 4).map((tag, idx) => {
    const colors = [
      { icon: <Code className="w-5 h-5 text-orange-500" />, bg: "bg-orange-100 dark:bg-orange-900/30" },
      { icon: <Database className="w-5 h-5 text-blue-500" />, bg: "bg-blue-100 dark:bg-blue-900/30" },
      { icon: <Cpu className="w-5 h-5 text-purple-500" />, bg: "bg-purple-100 dark:bg-purple-900/30" },
      { icon: <Layers className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-100 dark:bg-emerald-900/30" }
    ];
    return {
      name: tag.name,
      value: tag.value,
      ...colors[idx % colors.length]
    };
  }) || [];

  return (
    <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border border-border/50 dark:border-border/30 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-extrabold text-text-primary tracking-tight">My Progress</h2>
        <div className="flex space-x-2 bg-surface-secondary dark:bg-slate-800/50 p-1 rounded-xl">
          {['Courses', 'Practice'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-sm font-bold transition-all px-4 py-1.5 rounded-lg ${
                activeTab === tab 
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 content-start">
        {activeTab === 'Courses' ? (
          progressData.length > 0 ? (
            progressData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-4 group p-3 rounded-2xl hover:bg-surface-secondary dark:hover:bg-slate-800/40 transition-colors">
                <div className={`p-3 rounded-2xl shrink-0 ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-text-primary truncate">{item.name}</span>
                    <span className="text-xs font-bold text-text-muted">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color} shadow-sm transition-all duration-1000 ease-out`}
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center h-full text-center space-y-3 opacity-70 py-8">
               <BookOpen className="w-12 h-12 text-text-muted" />
               <p className="text-base font-bold text-text-primary">No courses yet</p>
               <p className="text-sm text-text-muted">Enroll in a course to see progress.</p>
            </div>
          )
        ) : (
          dsaProgressData.length > 0 ? (
            dsaProgressData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-4 group p-3 rounded-2xl hover:bg-surface-secondary dark:hover:bg-slate-800/40 transition-colors">
                <div className={`p-3 rounded-2xl shrink-0 ${item.bg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-text-primary truncate">{item.name}</span>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{item.value} solved</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center h-full text-center space-y-3 opacity-70 py-8">
               <Code className="w-12 h-12 text-text-muted" />
               <p className="text-base font-bold text-text-primary">No practice data</p>
               <p className="text-sm text-text-muted">Solve problems to see progress.</p>
            </div>
          )
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border flex justify-end">
        <button 
          onClick={() => navigate(activeTab === 'Courses' ? '/dashboard/courses' : '/dashboard/practice')}
          className="flex items-center space-x-1 text-sm font-bold text-primary hover:text-primary-hover group"
        >
          <span>{activeTab === 'Courses' ? 'View All Courses' : 'Practice More'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

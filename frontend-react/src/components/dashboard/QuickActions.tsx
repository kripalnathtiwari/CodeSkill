import React from 'react';
import { BookOpen, FileSignature, Code, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "My Courses",
      sub: "Active modules & catalog",
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40",
      path: "/dashboard/my-courses"
    },
    {
      label: "Take a Test",
      sub: "Contests & diagnostics",
      icon: <FileSignature className="w-5 h-5 text-purple-500" />,
      bg: "bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40",
      path: "/dashboard/tests"
    },
    {
      label: "Practice Problems",
      sub: "150+ DSA question bank",
      icon: <Code className="w-5 h-5 text-orange-500" />,
      bg: "bg-orange-500/10 border-orange-500/20 group-hover:border-orange-500/40",
      path: "/dashboard/practice"
    },
    {
      label: "Read Notes",
      sub: "Cheat sheets & guides",
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40",
      path: "/dashboard/notes"
    }
  ];

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border dark:border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider">
          Quick Navigation
        </h2>
        <span className="text-[11px] font-bold text-primary">Fast Access</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 flex-1">
        {actions.map((action, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(action.path)}
            className="flex items-center space-x-3 p-3.5 rounded-xl border border-border/70 hover:border-primary/50 dark:border-border/60 dark:hover:border-primary/50 bg-background/50 dark:bg-slate-900/40 hover:bg-surface-secondary dark:hover:bg-slate-800/50 transition-all text-left group"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${action.bg} group-hover:scale-105 transition-transform shadow-xs`}>
              {action.icon}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-bold text-text-primary dark:text-white truncate block group-hover:text-primary transition-colors">
                {action.label}
              </span>
              <span className="text-[11px] text-text-muted truncate block">
                {action.sub}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { BookOpen, FileSignature, Code, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Explore Courses",
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      path: "/dashboard/courses"
    },
    {
      label: "Take a Test",
      icon: <FileSignature className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-100 dark:bg-purple-500/20",
      path: "/dashboard/tests"
    },
    {
      label: "Practice Problems",
      icon: <Code className="w-6 h-6 text-orange-600" />,
      bg: "bg-orange-100 dark:bg-orange-500/20",
      path: "/dashboard/practice"
    },
    {
      label: "Read Notes",
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-100 dark:bg-blue-500/20",
      path: "/dashboard/notes"
    }
  ];

  return (
    <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border border-border/50 dark:border-border/30 rounded-3xl p-8 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      <h2 className="text-xl font-extrabold text-text-primary mb-8 tracking-tight">Quick Actions</h2>
      
      <div className="grid grid-cols-4 gap-4 flex-1 items-center">
        {actions.map((action, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center text-center space-y-4 group"
          >
            <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center ${action.bg} group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 shadow-sm relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/20 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {action.icon}
            </div>
            <span className="text-xs font-bold text-text-primary leading-tight max-w-[80%]">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

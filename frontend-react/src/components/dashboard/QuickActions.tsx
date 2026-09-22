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
      path: "/courses"
    },
    {
      label: "Take a Test",
      icon: <FileSignature className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-100 dark:bg-purple-500/20",
      path: "/tests"
    },
    {
      label: "Practice Problems",
      icon: <Code className="w-6 h-6 text-orange-600" />,
      bg: "bg-orange-100 dark:bg-orange-500/20",
      path: "/problems"
    },
    {
      label: "Read Notes",
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-100 dark:bg-blue-500/20",
      path: "/notes"
    }
  ];

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-text-primary mb-6">Quick Actions</h2>
      
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center text-center space-y-3 group"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.bg} group-hover:scale-105 transition-transform shadow-sm`}>
              {action.icon}
            </div>
            <span className="text-[11px] font-bold text-text-primary leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

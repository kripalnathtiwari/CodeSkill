import React from 'react';
import { BookOpen, FileSignature, FileText, Code, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecentActivity() {
  const navigate = useNavigate();
  
  const activities = [
    { text: "Started course: Data Science & AI", time: "2 hours ago", icon: <BookOpen className="w-4 h-4 text-orange-500" />, bg: "bg-orange-100 dark:bg-orange-500/20" },
    { text: "Attempted MCQ Test - DBMS (Score: 18/20)", time: "5 hours ago", icon: <FileSignature className="w-4 h-4 text-blue-500" />, bg: "bg-blue-100 dark:bg-blue-500/20" },
    { text: "Viewed notes: OS - Process Scheduling", time: "1 day ago", icon: <FileText className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-100 dark:bg-emerald-500/20" },
    { text: "Solved a problem: Two Sum", time: "1 day ago", icon: <Code className="w-4 h-4 text-orange-500" />, bg: "bg-orange-100 dark:bg-orange-500/20" },
  ];

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-text-primary">Recent Activity</h2>
        <button 
          className="flex items-center space-x-1 text-xs font-bold text-primary hover:text-primary-hover group"
          onClick={() => {}}
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-6 flex-1">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex items-start space-x-4">
            <div className={`p-2 rounded-xl mt-0.5 ${activity.bg}`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary mb-1">{activity.text}</p>
              <p className="text-[11px] font-semibold text-text-muted">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

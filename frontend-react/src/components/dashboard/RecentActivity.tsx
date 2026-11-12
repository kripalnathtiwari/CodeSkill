import React from 'react';
import { BookOpen, FileSignature, FileText, Code, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function getRelativeTime(dateString: string) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export default function RecentActivity({ enrollments = [], testScores = [] }: { enrollments: any[], testScores: any[] }) {
  const navigate = useNavigate();
  
  // Aggregate activities
  const allActivities = [
    ...enrollments.map((e) => ({
      text: e.status === 'completed' || e.status === 'Success' ? `Completed course: ${e.courseName}` : `Enrolled in: ${e.courseName}`,
      time: e.dateRegistered || new Date().toISOString(),
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
      bg: "bg-emerald-100 dark:bg-emerald-500/20"
    })),
    ...testScores.map((t) => ({
      text: `Attempted Test: ${t.testId || 'Assessment'} (Score: ${t.score})`,
      time: t.timestamp || new Date().toISOString(),
      icon: <FileSignature className="w-4 h-4 text-blue-500" />,
      bg: "bg-blue-100 dark:bg-blue-500/20"
    }))
  ];

  // Sort by time descending and take top 4
  const sortedActivities = allActivities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 4);

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
        {sortedActivities.length > 0 ? sortedActivities.map((activity, idx) => (
          <div key={idx} className="flex items-start space-x-4">
            <div className={`p-2 rounded-xl mt-0.5 ${activity.bg}`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary mb-1 truncate">{activity.text}</p>
              <p className="text-[11px] font-semibold text-text-muted">{getRelativeTime(activity.time)}</p>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-70">
             <p className="text-sm font-bold text-text-primary mt-4">No recent activity</p>
             <p className="text-xs text-text-muted">Take a test or enroll in a course!</p>
          </div>
        )}
      </div>
    </div>
  );
}

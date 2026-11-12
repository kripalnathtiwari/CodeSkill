import React from 'react';
import { BookOpen, FileSignature, BrainCircuit, Code, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function getRelativeTime(dateString: string) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function RecentActivity({ 
  enrollments = [], 
  testScores = [] 
}: { 
  enrollments: any[], 
  testScores: any[] 
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const emailLower = user?.email?.toLowerCase().trim() || '';

  // 1. Course Activities
  const courseActivities = enrollments.map((e) => {
    const isCompleted = e.status === 'completed' || e.status === 'Success';
    return {
      id: `course_${e.courseId || e.courseName}_${e.dateRegistered || ''}`,
      title: isCompleted ? `Completed: ${e.courseName}` : `Enrolled: ${e.courseName}`,
      subtitle: isCompleted ? 'Course Completed' : 'Course Enrolled',
      time: e.dateRegistered || new Date().toISOString(),
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      targetUrl: e.courseId ? `/dashboard/course/${e.courseId}` : `/dashboard/my-courses`,
      badge: 'Course'
    };
  });

  // 2. Test Activities
  const testActivities = testScores.map((t) => {
    const rawName = t.testName || t.testTitle || t.testId || 'Assessment Test';
    return {
      id: `test_${t.testId}_${t.date || t.timestamp || ''}`,
      title: `Attempted Test: ${rawName}`,
      subtitle: typeof t.score !== 'undefined' ? `Score: ${t.score}${t.totalQuestions ? ` / ${t.totalQuestions}` : ''}` : 'Test Assessment',
      time: t.timestamp || t.date || new Date().toISOString(),
      icon: <FileSignature className="w-4 h-4 text-blue-500" />,
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      targetUrl: `/dashboard/tests`,
      badge: 'Tests'
    };
  });

  // 3. Aptitude Activities
  let aptitudeActivities: any[] = [];
  if (emailLower) {
    try {
      const raw = localStorage.getItem(`aptitude_analytics_${emailLower}`) || localStorage.getItem(`aptitude_analytics_${user?.email}`);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          aptitudeActivities = list.slice(-5).reverse().map((item: any, idx: number) => ({
            id: `apt_${item.id || idx}_${item.date || item.timestamp || ''}`,
            title: `Aptitude: ${item.title || item.topic || 'Practice Problem'}`,
            subtitle: item.correct ? 'Answered Correctly' : 'Attempted Question',
            time: item.timestamp || item.date || new Date().toISOString(),
            icon: <BrainCircuit className="w-4 h-4 text-purple-500" />,
            bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
            targetUrl: `/dashboard/practice/aptitude`,
            badge: 'Aptitude'
          }));
        }
      }
    } catch (e) {}
  }

  // 4. DSA Solved Activities
  let dsaActivities: any[] = [];
  if (emailLower) {
    try {
      const rawDsa = localStorage.getItem(`codeskill_dsa_solved_${emailLower}`) || localStorage.getItem(`codeskill_dsa_solved_${user?.email}`);
      if (rawDsa) {
        const list = JSON.parse(rawDsa);
        if (Array.isArray(list) && list.length > 0) {
          dsaActivities = list.slice(-3).reverse().map((id: any) => ({
            id: `dsa_${id}`,
            title: `Solved DSA Problem #${id}`,
            subtitle: 'DSA Coding Practice',
            time: new Date().toISOString(),
            icon: <Code className="w-4 h-4 text-sky-500" />,
            bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
            targetUrl: `/dashboard/practice`,
            badge: 'DSA'
          }));
        }
      }
    } catch (e) {}
  }

  // Merge, sort descending by time, take only recent 5 tasks
  const allActivities = [...courseActivities, ...testActivities, ...aptitudeActivities, ...dsaActivities];
  const sortedActivities = allActivities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-bold text-text-primary dark:text-white">Recent Activity</h2>
          <p className="text-xs text-text-muted mt-0.5">Your last 5 tasks and assessments</p>
        </div>
        <button 
          className="flex items-center space-x-1 text-xs font-bold text-primary hover:text-primary-hover group transition-colors"
          onClick={() => navigate('/dashboard/tests')}
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-2.5 flex-1">
        {sortedActivities.length > 0 ? sortedActivities.map((activity, idx) => (
          <div 
            key={activity.id || idx} 
            onClick={() => navigate(activity.targetUrl)}
            className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group shadow-xs"
            title={`Click to open ${activity.badge} section`}
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className={`p-2.5 rounded-xl shrink-0 ${activity.bg} group-hover:scale-105 transition-transform`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors truncate">
                  {activity.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-muted truncate">
                    {activity.subtitle}
                  </span>
                  <span className="text-[10px] text-text-muted">•</span>
                  <span className="text-xs font-semibold text-text-muted shrink-0">
                    {getRelativeTime(activity.time)}
                  </span>
                </div>
              </div>
            </div>

            <div className="ml-3 shrink-0 flex items-center text-text-muted group-hover:text-primary transition-colors">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-70 py-8">
            <p className="text-sm font-bold text-text-primary dark:text-white mt-4">No recent activity</p>
            <p className="text-xs text-text-muted">Take a test, practice problems, or enroll in a course!</p>
          </div>
        )}
      </div>
    </div>
  );
}

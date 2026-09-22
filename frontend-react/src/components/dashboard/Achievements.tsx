import React from 'react';
import { Award, FileSignature, Compass, Flame, ArrowRight, BookOpen, Code } from 'lucide-react';

export default function Achievements({ dsaTotal = 0, enrollmentTotal = 0, testTotal = 0, weeklyProgress = [] }: any) {
  
  // Calculate streak for the streak badge
  let currentStreak = 0;
  for (let i = weeklyProgress.length - 1; i >= 0; i--) {
    if (weeklyProgress[i].questionsSolved > 0 || weeklyProgress[i].pointsEarned > 0) currentStreak++;
    else if (i !== weeklyProgress.length - 1) break;
  }

  const allAchievements = [
    {
      id: 'first_login',
      title: "First Login",
      desc: "Welcome to CodeSkill!",
      icon: <Award className="w-5 h-5 text-yellow-500" />,
      bg: "bg-yellow-100 dark:bg-yellow-500/20",
      unlocked: true // always unlocked
    },
    {
      id: 'test_taker',
      title: "Test Taker",
      desc: "Attempted your first test",
      icon: <FileSignature className="w-5 h-5 text-purple-500" />,
      bg: "bg-purple-100 dark:bg-purple-500/20",
      unlocked: testTotal > 0
    },
    {
      id: 'problem_solver',
      title: "Problem Solver",
      desc: "Solved your first problem",
      icon: <Code className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-100 dark:bg-blue-500/20",
      unlocked: dsaTotal > 0
    },
    {
      id: 'active_learner',
      title: "Active Learner",
      desc: "Enrolled in a course",
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      unlocked: enrollmentTotal > 0
    },
    {
      id: 'streak_3',
      title: "3 Day Streak",
      desc: "Learned for 3 consecutive days",
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      bg: "bg-orange-100 dark:bg-orange-500/20",
      unlocked: currentStreak >= 3
    }
  ];

  // Pick top 4 to show (prefer unlocked)
  const displayAchievements = allAchievements
    .sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1))
    .slice(0, 4);

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-text-primary">Achievements</h2>
        <button className="flex items-center space-x-1 text-xs font-bold text-primary hover:text-primary-hover group">
          <span>View All</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-5 flex-1">
        {displayAchievements.map((item, idx) => (
          <div key={idx} className={`flex items-center space-x-3 transition-opacity ${item.unlocked ? 'opacity-100' : 'opacity-40 grayscale'}`}>
            <div className={`p-2.5 rounded-xl ${item.bg}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">{item.title}</p>
              <p className="text-xs font-semibold text-text-muted">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

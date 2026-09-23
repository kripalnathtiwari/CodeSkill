import React from 'react';
import { Book, Target, Code, Clock, Trophy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatCardsProps {
  enrolledCount: number;
  testsAttempted: number;
  problemsSolved: number;
  globalRank: number | null;
}

export default function StatCards({ enrolledCount, testsAttempted, problemsSolved, globalRank }: StatCardsProps) {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Enrolled Courses",
      value: enrolledCount,
      icon: <Book className="w-6 h-6 text-emerald-500" />,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
      action: "View Courses",
      onClick: () => navigate('/dashboard/courses')
    },
    {
      title: "Tests Attempted",
      value: testsAttempted,
      icon: <Target className="w-6 h-6 text-purple-500" />,
      iconBg: "bg-purple-100 dark:bg-purple-500/20",
      action: "View Results",
      onClick: () => navigate('/dashboard/tests')
    },
    {
      title: "Problems Solved",
      value: problemsSolved,
      icon: <Code className="w-6 h-6 text-orange-500" />,
      iconBg: "bg-orange-100 dark:bg-orange-500/20",
      action: "Start Practicing",
      onClick: () => navigate('/dashboard/practice')
    },
    {
      title: "Global Rank",
      value: globalRank ? `#${globalRank}` : "N/A",
      icon: <Trophy className="w-6 h-6 text-emerald-500" />,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
      action: "View Leaderboard",
      onClick: () => navigate('/dashboard/leaderboard')
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-xl ${card.iconBg}`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-text-primary leading-tight">{card.value}</h3>
              <p className="text-xs font-semibold text-text-muted">{card.title}</p>
            </div>
          </div>
          <button 
            onClick={card.onClick}
            className="flex items-center space-x-1 text-[11px] font-bold text-primary hover:text-primary-hover group"
          >
            <span>{card.action}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ))}
    </div>
  );
}

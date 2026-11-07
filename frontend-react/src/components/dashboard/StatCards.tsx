import React from 'react';
import { Book, Target, Trophy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatCardsProps {
  enrolledCount: number;
  testsAttempted: number;
  globalRank: number | null;
  problemsSolved?: number;
  codingSolved?: number;
  mcqStats?: {
    attempted: number;
    correct: number;
    incorrect: number;
    accuracy: number;
  };
}

export default function StatCards({ 
  enrolledCount, 
  testsAttempted, 
  globalRank
}: StatCardsProps) {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Enrolled Courses",
      value: enrolledCount,
      icon: <Book className="w-6 h-6 text-emerald-500" />,
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
      action: "View Courses",
      onClick: () => navigate('/dashboard/my-courses')
    },
    {
      title: "Tests Attempted",
      value: testsAttempted,
      icon: <Target className="w-6 h-6 text-purple-500" />,
      iconBg: "bg-purple-100 dark:bg-purple-500/20",
      action: "View Results",
      onClick: () => navigate('/dashboard/tests', { state: { tab: 'past' } })
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="bg-surface dark:bg-[#111827] border border-border dark:border-border/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 relative overflow-hidden group cursor-pointer"
          onClick={card.onClick}
        >
          {/* Subtle gradient accent on hover */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-primary transition-all duration-300" />

          <div className="flex items-center space-x-4 mb-3 relative z-10">
            <div className={`w-13 h-13 p-3.5 rounded-2xl ${card.iconBg} shadow-xs group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0`}>
              {card.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-3xl font-black text-text-primary dark:text-white leading-none group-hover:text-primary transition-colors tracking-tight">
                {card.value}
              </h3>
              <p className="text-xs font-bold text-text-muted mt-1.5 uppercase tracking-wider truncate">
                {card.title}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold text-primary group-hover:text-primary-hover relative z-10">
            <span>{card.action}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      ))}
    </div>
  );
}

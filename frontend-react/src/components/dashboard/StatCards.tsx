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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border border-border/50 dark:border-border/30 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer"
          onClick={card.onClick}
        >
          {/* Subtle gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="flex items-center space-x-4 mb-5 relative z-10">
            <div className={`p-4 rounded-2xl ${card.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-text-primary leading-none group-hover:text-primary transition-colors">{card.value}</h3>
              <p className="text-[11px] font-bold text-text-muted mt-1 uppercase tracking-wider">{card.title}</p>
            </div>
          </div>
          <button 
            className="flex items-center space-x-1 text-xs font-bold text-primary group-hover:text-primary-hover relative z-10"
          >
            <span>{card.action}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ))}
    </div>
  );
}

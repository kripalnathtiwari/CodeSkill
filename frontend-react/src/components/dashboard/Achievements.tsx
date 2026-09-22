import React from 'react';
import { Award, FileSignature, Compass, Flame, ArrowRight } from 'lucide-react';

export default function Achievements() {
  const achievements = [
    {
      title: "First Login",
      desc: "Welcome to CodeSkill!",
      icon: <Award className="w-5 h-5 text-yellow-500" />,
      bg: "bg-yellow-100 dark:bg-yellow-500/20"
    },
    {
      title: "Test Taker",
      desc: "Attempted your first test",
      icon: <FileSignature className="w-5 h-5 text-orange-500" />,
      bg: "bg-orange-100 dark:bg-orange-500/20"
    },
    {
      title: "Note Explorer",
      desc: "Viewed 5 notes",
      icon: <Compass className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-100 dark:bg-blue-500/20"
    },
    {
      title: "7 Day Streak",
      desc: "Learned for 7 consecutive days",
      icon: <Flame className="w-5 h-5 text-red-500" />,
      bg: "bg-red-100 dark:bg-red-500/20"
    }
  ];

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
        {achievements.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-3">
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

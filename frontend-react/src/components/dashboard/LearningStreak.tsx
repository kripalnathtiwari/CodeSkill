import React from 'react';
import { Flame, Check } from 'lucide-react';

export default function LearningStreak({ weeklyProgress = [] }: { weeklyProgress: any[] }) {
  // calculate days and streak
  let currentStreak = 0;
  const days = weeklyProgress.map((day) => {
    const isActive = day.questionsSolved > 0 || day.pointsEarned > 0 || day.loggedIn;
    return {
      label: day.name,
      active: isActive
    };
  });

  // Calculate streak from right to left (most recent to oldest)
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].active) {
      currentStreak++;
    } else if (i !== days.length - 1) { // If it's not today and it's inactive, break streak
      break;
    }
  }

  // fallback to mock if no data to not break UI structure
  const displayDays = days.length === 7 ? days : [
    { label: 'Mon', active: false }, { label: 'Tue', active: false }, { label: 'Wed', active: false },
    { label: 'Thu', active: false }, { label: 'Fri', active: false }, { label: 'Sat', active: false }, { label: 'Sun', active: false }
  ];

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-2">
        <Flame className={`w-8 h-8 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
        <div>
          <h2 className="text-xl font-extrabold text-text-primary">Learning Streak</h2>
          <h3 className="text-2xl font-black text-text-primary">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</h3>
        </div>
      </div>
      <p className="text-sm font-semibold text-text-muted mb-6 pl-11">
        {currentStreak > 0 ? "Keep it up! You're on fire 🔥" : "Start learning today to build your streak!"}
      </p>
      
      <div className="flex justify-between items-center px-2">
        {displayDays.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center space-y-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              day.active 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}>
              {day.active && <Check className="w-5 h-5" />}
            </div>
            <span className="text-xs font-bold text-text-muted">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

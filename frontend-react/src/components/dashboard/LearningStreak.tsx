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
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-800 rounded-3xl p-8 shadow-md text-white flex flex-col h-full relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="flex items-start justify-between relative z-10 mb-8">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-sm">
            <Flame className="w-8 h-8 text-white drop-shadow-sm" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Learning Streak</h2>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-black">{currentStreak}</span>
              <span className="text-lg font-bold opacity-90">{currentStreak === 1 ? 'Day' : 'Days'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-sm font-semibold opacity-90 mb-6 relative z-10 pl-1">
        {currentStreak > 0 ? "You're on fire! Keep it up. 🔥" : "Start learning today to build your streak!"}
      </p>

      <div className="flex justify-between items-end mt-auto relative z-10 bg-black/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
        {displayDays.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${
              day.active 
                ? 'bg-white shadow-lg shadow-white/20 scale-110' 
                : 'bg-white/20 backdrop-blur-md'
            }`}>
              {day.active && <Flame className="w-5 h-5 text-purple-600 drop-shadow-sm" />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${day.active ? 'text-white' : 'text-white/60'}`}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

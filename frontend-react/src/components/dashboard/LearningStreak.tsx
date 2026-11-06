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
    <div className="bg-gradient-to-br from-[#0c1222] via-[#151c36] to-[#0b1120] text-white border border-indigo-500/25 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div>
        <div className="flex items-center justify-between relative z-10 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400 shadow-sm shrink-0">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Learning Streak</h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black tracking-tight text-white">{currentStreak}</span>
                <span className="text-sm font-bold text-slate-300">{currentStreak === 1 ? 'Day' : 'Days'}</span>
              </div>
            </div>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            {currentStreak > 0 ? "Active 🔥" : "Inactive"}
          </span>
        </div>
        
        <p className="text-xs font-semibold text-slate-300 relative z-10 mb-5">
          {currentStreak > 0 ? "You're on fire! Keep solving daily to hold your streak." : "Solve problems or log in daily to build your momentum!"}
        </p>
      </div>

      <div className="flex justify-between items-center relative z-10 bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-sm">
        {displayDays.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1.5 transition-all duration-300 ${
              day.active 
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30 scale-105' 
                : 'bg-white/10 text-slate-400'
            }`}>
              {day.active ? (
                <Flame className="w-4 h-4 fill-white" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${day.active ? 'text-amber-300' : 'text-slate-400'}`}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

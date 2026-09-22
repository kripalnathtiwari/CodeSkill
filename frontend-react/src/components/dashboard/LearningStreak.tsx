import React from 'react';
import { Flame, Check } from 'lucide-react';

export default function LearningStreak() {
  const days = [
    { label: 'Mon', active: true },
    { label: 'Tue', active: true },
    { label: 'Wed', active: true },
    { label: 'Thu', active: true },
    { label: 'Fri', active: false },
    { label: 'Sat', active: false },
    { label: 'Sun', active: false },
  ];

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-2">
        <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
        <div>
          <h2 className="text-xl font-extrabold text-text-primary">Learning Streak</h2>
          <h3 className="text-2xl font-black text-text-primary">7 Days</h3>
        </div>
      </div>
      <p className="text-sm font-semibold text-text-muted mb-6 pl-11">Keep it up! You're on fire 🔥</p>
      
      <div className="flex justify-between items-center px-2">
        {days.map((day, idx) => (
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

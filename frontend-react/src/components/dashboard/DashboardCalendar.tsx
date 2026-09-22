import React from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function DashboardCalendar() {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Hardcoded for mock exactly like the image
  const daysInMonth = [
    { day: 30, current: false }, { day: 31, current: false }, { day: 1, current: true }, { day: 2, current: true }, { day: 3, current: true }, { day: 4, current: true }, { day: 5, current: true },
    { day: 6, current: true }, { day: 7, current: true }, { day: 8, current: true }, { day: 9, current: true }, { day: 10, current: true }, { day: 11, current: true }, { day: 12, current: true },
    { day: 13, current: true }, { day: 14, current: true }, { day: 15, current: true }, { day: 16, current: true }, { day: 17, current: true }, { day: 18, current: true }, { day: 19, current: true },
    { day: 20, current: true }, { day: 21, current: true }, { day: 22, current: true, active: true }, { day: 23, current: true }, { day: 24, current: true }, { day: 25, current: true }, { day: 26, current: true },
    { day: 27, current: true }, { day: 28, current: true }, { day: 29, current: true }, { day: 30, current: true }, { day: 1, current: false }, { day: 2, current: false }, { day: 3, current: false },
  ];

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-text-primary">Calendar</h2>
        <button className="flex items-center space-x-1 text-xs font-bold text-primary hover:text-primary-hover group">
          <span>View All</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
          <ChevronLeft className="w-5 h-5 text-text-muted" />
        </button>
        <span className="font-bold text-text-primary text-sm">September 2026</span>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
          <ChevronRight className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center flex-1">
        {daysOfWeek.map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-text-muted uppercase">{d}</div>
        ))}
        {daysInMonth.map((d, i) => (
          <div key={i} className="flex justify-center items-center">
            <span className={`
              w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full
              ${d.active ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : ''}
              ${!d.active && d.current ? 'text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer' : ''}
              ${!d.current ? 'text-text-muted/50' : ''}
            `}>
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

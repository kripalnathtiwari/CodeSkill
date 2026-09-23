import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function DashboardCalendar({ userEmail }: { userEmail: string }) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDates, setActiveDates] = useState<string[]>([]);

  useEffect(() => {
    if (userEmail) {
      try {
        const key = `daily_progress_${userEmail.toLowerCase()}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const progress = JSON.parse(saved);
          const active = Object.keys(progress).filter(
            date => progress[date].questionsSolved > 0 || progress[date].pointsEarned > 0
          );
          setActiveDates(active);
        }
      } catch (e) {
        console.error("Failed to load daily progress for calendar", e);
      }
    }
  }, [userEmail]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();
  const calendarDays = [];

  const today = new Date();
  const isCurrentMonthYear = today.getFullYear() === year && today.getMonth() === month;

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, current: false, active: false, isToday: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isActive = activeDates.includes(dateStr);
    const isToday = isCurrentMonthYear && i === today.getDate();
    calendarDays.push({ day: i, current: true, active: isActive, isToday });
  }

  // Next month days to fill grid (up to 35 or 42 cells)
  const totalCells = calendarDays.length > 35 ? 42 : 35;
  let nextMonthDay = 1;
  while (calendarDays.length < totalCells) {
    calendarDays.push({ day: nextMonthDay++, current: false, active: false, isToday: false });
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
        <button 
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <ChevronLeft className="w-5 h-5 text-text-muted" />
        </button>
        <span className="font-bold text-text-primary text-sm">{monthNames[month]} {year}</span>
        <button 
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <ChevronRight className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center flex-1">
        {daysOfWeek.map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-text-muted uppercase">{d}</div>
        ))}
        {calendarDays.map((d, i) => (
          <div key={i} className="flex justify-center items-center">
            <span className={`
              w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full
              ${d.active ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : ''}
              ${d.isToday && !d.active ? 'bg-primary text-white shadow-md shadow-primary/30' : ''}
              ${!d.active && !d.isToday && d.current ? 'text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer' : ''}
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

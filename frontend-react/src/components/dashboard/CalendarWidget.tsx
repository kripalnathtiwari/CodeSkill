import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget() {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentDay = 15; // mock current day

  // Mock events
  const getEventColor = (date: number) => {
    if (date === 5) return 'bg-accent'; // test
    if (date === 12) return 'bg-success'; // assignment
    if (date === 22) return 'bg-warning'; // class
    return null;
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary">August 2026</h3>
        <div className="flex space-x-2">
          <button className="p-1 rounded-md text-text-muted hover:bg-background transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1 rounded-md text-text-muted hover:bg-background transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {days.map(day => (
          <div key={day} className="text-xs font-bold text-text-muted">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Empty slots for starting day of month (e.g. 3 empty slots) */}
        <div className="p-2"></div>
        <div className="p-2"></div>
        <div className="p-2"></div>
        
        {dates.map(date => {
          const isToday = date === currentDay;
          const eventColor = getEventColor(date);
          
          return (
            <div key={date} className="relative p-2 flex items-center justify-center">
              <span className={`w-8 h-8 flex items-center justify-center text-sm rounded-full ${
                isToday ? 'bg-primary text-text-inverse font-bold' : 'text-text-primary font-medium hover:bg-background cursor-pointer'
              }`}>
                {date}
              </span>
              {eventColor && (
                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${eventColor}`}></span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center space-x-1.5 text-xs text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span>Today</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          <span>Test</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          <span>Assignment</span>
        </div>
      </div>
    </div>
  );
}

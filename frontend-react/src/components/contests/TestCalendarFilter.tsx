import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Sparkles,
  Check
} from "lucide-react";

export interface TestCalendarFilterProps {
  selectedDate: string | null; // "YYYY-MM-DD" or null
  onSelectDate: (date: string | null) => void;
  dateFilterPreset: "all" | "today" | "tomorrow" | "week" | "custom";
  onSelectPreset: (preset: "all" | "today" | "tomorrow" | "week" | "custom") => void;
  testDatesMap: Record<string, number>; // "YYYY-MM-DD" -> count of tests
}

export const formatDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const formatDisplayDate = (dateKey: string): string => {
  try {
    const [y, m, d] = dateKey.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return dateKey;
  }
};

export default function TestCalendarFilter({
  selectedDate,
  onSelectDate,
  dateFilterPreset,
  onSelectPreset,
  testDatesMap
}: TestCalendarFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Month navigation state
  const [navDate, setNavDate] = useState<Date>(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });

  // Keep navDate synced when selectedDate changes from outside
  useEffect(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split("-").map(Number);
      setNavDate(new Date(y, m - 1, d));
    }
  }, [selectedDate]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  const todayKey = formatDateKey(today);

  const tomorrow = new Date(Date.now() + 86400000);
  const tomorrowKey = formatDateKey(tomorrow);

  // Nav Month details
  const navYear = navDate.getFullYear();
  const navMonth = navDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const daysInMonth = new Date(navYear, navMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(navYear, navMonth, 1).getDay();
  const prevMonthDaysCount = new Date(navYear, navMonth, 0).getDate();

  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthDaysCount - i;
    const prevDate = new Date(navYear, navMonth - 1, dayNum);
    const key = formatDateKey(prevDate);
    calendarCells.push({
      day: dayNum,
      isCurrentMonth: false,
      dateKey: key,
      hasTests: (testDatesMap[key] || 0) > 0,
      testCount: testDatesMap[key] || 0,
      isToday: key === todayKey,
      isSelected: key === selectedDate
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const currDate = new Date(navYear, navMonth, i);
    const key = formatDateKey(currDate);
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      dateKey: key,
      hasTests: (testDatesMap[key] || 0) > 0,
      testCount: testDatesMap[key] || 0,
      isToday: key === todayKey,
      isSelected: key === selectedDate
    });
  }

  // Next month leading days
  const totalGridCells = calendarCells.length > 35 ? 42 : 35;
  let nextMonthDay = 1;
  while (calendarCells.length < totalGridCells) {
    const nextDate = new Date(navYear, navMonth + 1, nextMonthDay);
    const key = formatDateKey(nextDate);
    calendarCells.push({
      day: nextMonthDay++,
      isCurrentMonth: false,
      dateKey: key,
      hasTests: (testDatesMap[key] || 0) > 0,
      testCount: testDatesMap[key] || 0,
      isToday: key === todayKey,
      isSelected: key === selectedDate
    });
  }

  const handleSelectDay = (key: string) => {
    onSelectDate(key);
    onSelectPreset(key === todayKey ? "today" : key === tomorrowKey ? "tomorrow" : "custom");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectDate(null);
    onSelectPreset("all");
    setNavDate(new Date());
  };

  const isFilterActive = dateFilterPreset !== "all" || selectedDate !== null;

  // Compute button label
  const getButtonLabel = () => {
    if (dateFilterPreset === "today") return "Today";
    if (dateFilterPreset === "tomorrow") return "Tomorrow";
    if (dateFilterPreset === "week") return "This Week";
    if (selectedDate) return formatDisplayDate(selectedDate);
    return "Filter by Date";
  };

  return (
    <div className="relative inline-block z-30" ref={containerRef}>
      {/* Trigger Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all border ${
            isFilterActive
              ? "bg-primary/10 border-primary text-primary shadow-sm ring-2 ring-primary/20 font-bold"
              : "bg-surface dark:bg-background border-border dark:border-border text-text-secondary dark:text-text-muted hover:border-primary/50 hover:text-text-primary"
          }`}
          title="Filter tests by date"
        >
          <CalendarIcon className={`w-4 h-4 ${isFilterActive ? "text-primary" : "text-text-muted"}`} />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">{getButtonLabel()}</span>
          {isFilterActive && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="ml-1 p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors"
              title="Clear date filter"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </button>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 md:left-0 md:right-auto mt-2 w-[320px] sm:w-[350px] bg-surface dark:bg-[#111827] border border-border dark:border-border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border dark:border-border">
            <div className="flex items-center space-x-2 text-text-primary dark:text-text-primary font-bold text-sm">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span>Search Test by Calendar</span>
            </div>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            <button
              type="button"
              onClick={() => {
                handleClear();
                setIsOpen(false);
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                dateFilterPreset === "all"
                  ? "bg-primary text-text-inverse"
                  : "bg-surface-secondary dark:bg-slate-800 text-text-secondary dark:text-text-muted hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectDate(todayKey);
                onSelectPreset("today");
                setIsOpen(false);
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                dateFilterPreset === "today"
                  ? "bg-primary text-text-inverse"
                  : "bg-surface-secondary dark:bg-slate-800 text-text-secondary dark:text-text-muted hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectDate(tomorrowKey);
                onSelectPreset("tomorrow");
                setIsOpen(false);
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                dateFilterPreset === "tomorrow"
                  ? "bg-primary text-text-inverse"
                  : "bg-surface-secondary dark:bg-slate-800 text-text-secondary dark:text-text-muted hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectDate(null);
                onSelectPreset("week");
                setIsOpen(false);
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                dateFilterPreset === "week"
                  ? "bg-primary text-text-inverse"
                  : "bg-surface-secondary dark:bg-slate-800 text-text-secondary dark:text-text-muted hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              This Week
            </button>
          </div>

          {/* Month Header Navigation */}
          <div className="flex items-center justify-between mb-2 px-1">
            <button
              type="button"
              onClick={() => setNavDate(new Date(navYear, navMonth - 1, 1))}
              className="p-1 rounded-lg hover:bg-surface-secondary dark:hover:bg-slate-800 text-text-muted hover:text-text-primary transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-bold text-text-primary dark:text-text-primary">
              {monthNames[navMonth]} {navYear}
            </div>
            <button
              type="button"
              onClick={() => setNavDate(new Date(navYear, navMonth + 1, 1))}
              className="p-1 rounded-lg hover:bg-surface-secondary dark:hover:bg-slate-800 text-text-muted hover:text-text-primary transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {daysOfWeek.map((d, i) => (
              <div key={i} className="text-[11px] font-bold text-text-muted">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarCells.map((cell, idx) => {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell.dateKey)}
                  className={`relative h-8 w-8 mx-auto flex flex-col items-center justify-center rounded-xl text-xs font-medium transition-all ${
                    cell.isSelected
                      ? "bg-primary text-text-inverse font-bold shadow-md shadow-primary/30"
                      : cell.isToday
                      ? "border border-primary text-primary font-bold hover:bg-primary/10"
                      : cell.isCurrentMonth
                      ? "text-text-primary dark:text-text-secondary hover:bg-surface-secondary dark:hover:bg-slate-800"
                      : "text-text-muted/40 hover:bg-surface-secondary/40"
                  }`}
                  title={
                    cell.hasTests
                      ? `${cell.testCount} test${cell.testCount > 1 ? "s" : ""} on ${cell.dateKey}`
                      : cell.dateKey
                  }
                >
                  <span>{cell.day}</span>
                  {/* Indicator Dot for Days with Tests */}
                  {cell.hasTests && (
                    <span
                      className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                        cell.isSelected ? "bg-white" : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Direct Native Date Input & Legend */}
          <div className="mt-4 pt-3 border-t border-border dark:border-border flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-text-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Has scheduled test</span>
            </div>
            <div>
              <input
                type="date"
                value={selectedDate || ""}
                onChange={(e) => {
                  if (e.target.value) {
                    onSelectDate(e.target.value);
                    onSelectPreset("custom");
                    setIsOpen(false);
                  } else {
                    handleClear();
                  }
                }}
                className="bg-background dark:bg-slate-800 border border-border dark:border-border rounded-lg px-2 py-1 text-text-primary text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


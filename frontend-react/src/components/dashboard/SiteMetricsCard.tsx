import React from 'react';
import { Users, BookOpen } from 'lucide-react';

/**
 * Displays high‑level site metrics.
 * It reads optional values from localStorage (keys `site_user_count` and `site_course_count`).
 * If not present, it falls back to placeholder numbers.
 */
export default function SiteMetricsCard({ userCount = 0, courseCount = 0 }: { userCount?: number; courseCount?: number }) {
  // Attempt to read persisted counts – ignore errors.
  try {
    const storedUsers = Number(localStorage.getItem('site_user_count'));
    const storedCourses = Number(localStorage.getItem('site_course_count'));
    if (!isNaN(storedUsers)) userCount = storedUsers;
    if (!isNaN(storedCourses)) courseCount = storedCourses;
  } catch {}

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
      <h3 className="text-lg font-bold text-text-primary">Site Metrics</h3>
      <div className="flex items-center space-x-3">
        <Users className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-text-primary">Users: {userCount}</span>
      </div>
      <div className="flex items-center space-x-3">
        <BookOpen className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-text-primary">Courses: {courseCount}</span>
      </div>
    </div>
  );
}


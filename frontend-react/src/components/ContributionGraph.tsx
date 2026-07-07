import React, { useState, useEffect } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function ContributionGraph() {
  const { user } = useAuth();
  const [data, setData] = useState<{ date: string; count: number; level: 0|1|2|3|4 }[]>([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect dark mode from html class
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    
    // Optional: observe class changes on html
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    
    // Fetch raw contributions dict
    const storageKey = `user_contributions_${user.email.toLowerCase()}`;
    const existingStr = localStorage.getItem(storageKey);
    let dict: Record<string, number> = {};
    if (existingStr) {
      try { dict = JSON.parse(existingStr); } catch (e) {}
    }

    // Generate array of last 365 days
    const calendarData = [];
    const today = new Date();
    for (let i = 365; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const count = dict[dateStr] || 0;
      let level: 0|1|2|3|4 = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count >= 3 && count <= 4) level = 3;
      else if (count > 4) level = 4;

      calendarData.push({ date: dateStr, count, level });
    }
    
    setData(calendarData);
  }, [user]);

  const customTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  const totalContributions = data.reduce((sum, day) => sum + day.count, 0);

  // Fallback if no data is generated yet
  const displayData = data.length > 0 ? data : [{date: new Date().toISOString().split('T')[0], count: 0, level: 0 as const}];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{totalContributions} contributions in the last year</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your coding and learning activity on TeachSkill.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-[800px] flex justify-center">
          <ActivityCalendar 
            data={displayData} 
            theme={customTheme}
            colorScheme={isDark ? "dark" : "light"}
            labels={{
              totalCount: '{{count}} contributions in {{year}}',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

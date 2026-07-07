import React, { useState, useEffect } from "react";
import { Users, BookOpen, CreditCard, Activity, TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardOverview() {
  const [stats, setStats] = useState({ revenue: 0, users: 1254, enrollments: 0, active: 42 });

  useEffect(() => {
    // Calculate real stats from localstorage
    const enrolledStr = localStorage.getItem("enrolledCourses");
    let totalRevenue = 0;
    let totalEnrollments = 0;
    if (enrolledStr) {
      try {
        const parsed = JSON.parse(enrolledStr);
        totalEnrollments = parsed.length;
        totalRevenue = parsed.length * 3999; // Mock average price
      } catch (e) {}
    }
    setStats(prev => ({ ...prev, revenue: totalRevenue, enrollments: totalEnrollments }));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Platform Overview</h2>
        <div className="text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          Last updated: Just now
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111827] p-6 rounded-2xl border border-emerald-500/20 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="flex items-center text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> +14%
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
          <h3 className="text-3xl font-extrabold text-white">₹{stats.revenue.toLocaleString('en-IN')}</h3>
        </div>

        <div className="bg-[#111827] p-6 rounded-2xl border border-blue-500/20 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="flex items-center text-blue-400 text-sm font-bold bg-blue-500/10 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> +8%
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Course Enrollments</p>
          <h3 className="text-3xl font-extrabold text-white">{stats.enrollments}</h3>
        </div>

        <div className="bg-[#111827] p-6 rounded-2xl border border-rose-500/20 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-rose-400 text-sm font-bold bg-rose-500/10 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> +2.4%
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Registered Users</p>
          <h3 className="text-3xl font-extrabold text-white">{stats.users.toLocaleString()}</h3>
        </div>

        <div className="bg-[#111827] p-6 rounded-2xl border border-amber-500/20 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Activity className="w-6 h-6" />
            </div>
            <span className="flex items-center text-slate-400 text-sm font-bold bg-slate-800 px-2 py-1 rounded-md">
              Live
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Active Sandbox Sessions</p>
          <h3 className="text-3xl font-extrabold text-white">{stats.active}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 min-h-[300px] flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
           <div className="text-center z-10">
             <h4 className="text-xl font-bold text-white mb-2">Revenue Growth Chart</h4>
             <p className="text-slate-500">Visualization rendering...</p>
           </div>
        </div>
        <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800">
           <h4 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-4">Recent System Activity</h4>
           <div className="space-y-4">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="flex items-center justify-between text-sm">
                 <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-slate-300">User {Math.floor(Math.random() * 9000) + 1000} enrolled in "System Design Masterclass"</span>
                 </div>
                 <span className="text-slate-500">{i * 12} mins ago</span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

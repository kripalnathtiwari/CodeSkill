import React, { useState, useEffect } from "react";
import { Users, BookOpen, CreditCard, Activity, TrendingUp, Building2, UserCheck } from "lucide-react";
import axios from "axios";
import { getApiUrl } from "../../utils/apiConfig";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const defaultChartData = [
  { name: 'Jan', revenue: 0 },
  { name: 'Feb', revenue: 0 },
  { name: 'Mar', revenue: 0 },
  { name: 'Apr', revenue: 0 },
  { name: 'May', revenue: 0 },
  { name: 'Jun', revenue: 0 },
  { name: 'Jul', revenue: 0 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

export default function DashboardOverview({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [stats, setStats] = useState({ revenue: 0, users: 0, enrollments: 0, active: 0, colleges: 0, instructors: 0 });
  const [chartData, setChartData] = useState(defaultChartData);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(getApiUrl("/api/v1/admin/dashboard-stats"), {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (res.data && res.data.success) {
          setStats({
            revenue: res.data.data.revenue || 0,
            users: res.data.data.users || 0,
            enrollments: res.data.data.enrollments || 0,
            active: res.data.data.active || 0,
            colleges: res.data.data.colleges || 0,
            instructors: res.data.data.instructors || 0
          });
          if (res.data.data.chartData && res.data.data.chartData.length > 0) {
            setChartData(res.data.data.chartData);
          }
        }
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      }
    };
    fetchStats();
  }, []);

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center">
        <motion.h2 variants={itemVariants} className="text-3xl font-bold text-text-inverse">Platform Overview</motion.h2>
        <motion.div variants={itemVariants} className="text-sm text-text-muted bg-slate-800/50 px-4 py-2 rounded-lg border border-border backdrop-blur-sm">
          Last updated: Just now
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="bg-[#111827] p-6 rounded-2xl border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:border-primary/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary/20 transition-colors">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="flex items-center text-primary text-sm font-bold bg-primary/10 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> +14%
            </span>
          </div>
          <p className="text-text-muted text-sm mb-1">Total Revenue</p>
          <h3 className="text-3xl font-extrabold text-text-inverse tracking-tight">₹{stats.revenue.toLocaleString('en-IN')}</h3>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="bg-[#111827] p-6 rounded-2xl border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:border-primary/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary/20 transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="flex items-center text-primary text-sm font-bold bg-primary/10 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> +8%
            </span>
          </div>
          <p className="text-text-muted text-sm mb-1">Course Enrollments</p>
          <h3 className="text-3xl font-extrabold text-text-inverse tracking-tight">{stats.enrollments}</h3>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="bg-[#111827] p-6 rounded-2xl border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)] hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 group-hover:bg-rose-500/20 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-rose-400 text-sm font-bold bg-rose-500/10 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> +2.4%
            </span>
          </div>
          <p className="text-text-muted text-sm mb-1">Registered Users</p>
          <h3 className="text-3xl font-extrabold text-text-inverse tracking-tight">{stats.users.toLocaleString()}</h3>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="bg-[#111827] p-6 rounded-2xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)] hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <Activity className="w-6 h-6" />
            </div>
            <span className="flex items-center text-text-muted text-sm font-bold bg-slate-800 px-2 py-1 rounded-md">
              Live
            </span>
          </div>
          <p className="text-text-muted text-sm mb-1">Active Sandbox Sessions</p>
          <h3 className="text-3xl font-extrabold text-text-inverse tracking-tight">{stats.active}</h3>
        </motion.div>

        <motion.div 
          onClick={() => setActiveTab && setActiveTab('colleges')}
          variants={itemVariants} 
          whileHover={{ y: -5, scale: 1.02 }} 
          className="bg-[#111827] p-6 rounded-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="flex items-center text-text-muted text-sm font-bold bg-slate-800 px-2 py-1 rounded-md">
              View All
            </span>
          </div>
          <p className="text-text-muted text-sm mb-1">Total Colleges</p>
          <h3 className="text-3xl font-extrabold text-text-inverse tracking-tight">{stats.colleges}</h3>
        </motion.div>

        <motion.div 
          onClick={() => setActiveTab && setActiveTab('users')}
          variants={itemVariants} 
          whileHover={{ y: -5, scale: 1.02 }} 
          className="bg-[#111827] p-6 rounded-2xl border border-sky-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:border-sky-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 group-hover:bg-sky-500/20 transition-colors">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="flex items-center text-text-muted text-sm font-bold bg-slate-800 px-2 py-1 rounded-md">
              View All
            </span>
          </div>
          <p className="text-text-muted text-sm mb-1">Total Instructors</p>
          <h3 className="text-3xl font-extrabold text-text-inverse tracking-tight">{stats.instructors}</h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-[#111827] p-6 rounded-2xl border border-border min-h-[350px] relative overflow-hidden group hover:border-border transition-colors">
           <h4 className="text-xl font-bold text-text-inverse mb-6 flex items-center">
             Revenue Growth
             <span className="ml-3 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">This Year</span>
           </h4>
           <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                 <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                   itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                 />
                 <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-[#111827] p-6 rounded-2xl border border-border hover:border-border transition-colors flex flex-col">
           <h4 className="text-lg font-bold text-text-inverse mb-6 flex items-center">
             Recent System Activity
             <div className="ml-auto flex items-center space-x-2">
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
               </span>
               <span className="text-xs text-text-muted">Live</span>
             </div>
           </h4>
           <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
             {[1, 2, 3, 4, 5].map((i) => (
               <motion.div 
                 key={i} 
                 whileHover={{ x: 5, backgroundColor: 'rgba(31, 41, 55, 0.5)' }}
                 className="flex items-center justify-between text-sm p-3 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border"
               >
                 <div className="flex items-center space-x-4">
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                     <Users className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-text-secondary font-medium">New Enrollment</span>
                     <span className="text-text-muted text-xs mt-0.5">User {Math.floor(Math.random() * 9000) + 1000} enrolled in "System Design Masterclass"</span>
                   </div>
                 </div>
                 <span className="text-text-muted text-xs font-mono bg-slate-800/50 px-2 py-1 rounded-md">{i * 12}m</span>
               </motion.div>
             ))}
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

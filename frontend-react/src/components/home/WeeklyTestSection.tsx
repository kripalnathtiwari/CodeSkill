import React from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, CalendarClock, Target, Trophy, LayoutDashboard, TrendingUp, Users, Activity } from 'lucide-react';

const WeeklyTestSection = () => {
  return (
    <section className="py-24 w-full relative">
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/5 rounded-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        
        {/* ROW 1: Dashboard (Text Left, Image Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Content */}
          <div className="space-y-8 lg:pr-8">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full mb-6 font-medium text-sm border border-blue-500/20">
                <LayoutDashboard className="w-4 h-4" />
                <span>Student Dashboard & Analytics</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary dark:text-text-inverse leading-tight mb-4 tracking-tight">
                Comprehensive <br/>
                <span className="text-blue-600 dark:text-blue-500">Performance Tracking</span>
              </h2>
              <p className="text-text-secondary dark:text-text-muted text-lg leading-relaxed font-medium">
                Our advanced dashboard provides a bird's-eye view of your coding journey. From daily practice streaks to in-depth competency analytics across various domains, everything is tracked to help you focus on what matters most and prepare effectively.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-sm">Growth Metrics</h4>
                  <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">Visualize your improvement over time with beautiful, interactive charts.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-sm">Activity Heatmap</h4>
                  <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">Stay motivated by maintaining your daily coding streaks on the platform.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Image */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative glass-card p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden group hover:-translate-y-1 transition-transform"
          >
            <div className="absolute inset-0 bg-gradient-premium opacity-5 group-hover:opacity-10 transition-opacity duration-500" />
            <img 
              src="https://res.cloudinary.com/zihn8u4b/image/upload/v1789467306/Screenshot_2026-09-15_154436.png" 
              alt="Student Dashboard Interface" 
              className="w-full h-auto rounded-xl object-cover relative z-10 shadow-sm border border-white/10"
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* ROW 2: Weekly Test (Image Left, Text Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Image (order-2 on mobile, order-1 on large screens) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative glass-card p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden group hover:-translate-y-1 transition-transform order-2 lg:order-1"
          >
            <div className="absolute inset-0 bg-gradient-premium opacity-5 group-hover:opacity-10 transition-opacity duration-500" />
            <img 
              src="https://res.cloudinary.com/zihn8u4b/image/upload/v1789467306/Screenshot_2026-09-15_154436.png" 
              alt="Weekly Test Report Interface" 
              className="w-full h-auto rounded-xl object-cover relative z-10 shadow-sm border border-white/10"
              loading="lazy"
            />
          </motion.div>

          {/* Right Side: Content (order-1 on mobile, order-2 on large screens) */}
          <div className="space-y-8 lg:pl-8 order-1 lg:order-2">
            <div>
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary dark:text-primary-light px-4 py-2 rounded-full mb-6 font-medium text-sm border border-primary/20">
                <CalendarClock className="w-4 h-4" />
                <span>Weekly Assessment Engine</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary dark:text-text-inverse leading-tight mb-4 tracking-tight">
                Rigorous Weekly Tests & <br/>
                <span className="text-primary">Student Records</span>
              </h2>
              <p className="text-text-secondary dark:text-text-muted text-lg leading-relaxed font-medium">
                We conduct rigorous weekly tests replicating real interview environments. Every submission is carefully evaluated to generate an exhaustive student record, detailing your logic, execution time, and edge-case handling.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <FileBarChart className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-sm">Detailed Records</h4>
                  <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">Comprehensive historical records of every test attempt and code submission.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-sm">Identify Weaknesses</h4>
                  <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">AI-driven analysis pinpoints exact topics where you need more practice.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-sm">Peer Benchmarking</h4>
                  <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">Compare your test scores and logic efficiency with top-performing students.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-sm">Global Ranking</h4>
                  <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">Climb the leaderboard by consistently performing well in weekly assessments.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WeeklyTestSection;

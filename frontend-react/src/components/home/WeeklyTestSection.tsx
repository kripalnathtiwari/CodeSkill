import React from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, CalendarClock, Target, Trophy } from 'lucide-react';

const WeeklyTestSection = () => {
  return (
    <section className="py-24 w-full relative">
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/5 rounded-3xl -z-10" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Content */}
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary dark:text-primary-light px-4 py-2 rounded-full mb-6 font-medium text-sm">
              <CalendarClock className="w-4 h-4" />
              <span>Weekly Assessment Engine</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary dark:text-text-inverse leading-tight mb-4 tracking-tight">
              Track Your Progress with <br/>
              <span className="text-primary">Weekly Tests</span>
            </h2>
            <p className="text-text-secondary dark:text-text-muted text-lg leading-relaxed font-medium">
              We conduct comprehensive weekly tests to evaluate your coding proficiency, problem-solving skills, and CS fundamentals. Get detailed insights and personalized reports to know exactly where you stand in your preparation journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <FileBarChart className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-sm">Detailed Analytics</h4>
                <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">In-depth performance reports generated for every student after the test.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-sm">Identify Weaknesses</h4>
                <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">Target specific topics to improve your interview readiness and logic.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-sm">Global Ranking</h4>
                <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">Compete with peers globally and track your leaderboard position.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <CalendarClock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-sm">Consistent Practice</h4>
                <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">Habit-building assessments scheduled systematically every week.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative glass-card p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden group hover:-translate-y-1 transition-transform"
        >
          <div className="absolute inset-0 bg-gradient-premium opacity-5 group-hover:opacity-10 transition-opacity duration-500" />
          <img 
            src="https://res.cloudinary.com/zihn8u4b/image/upload/v1789467306/Screenshot_2026-09-15_154436.png" 
            alt="Weekly Test Report Interface" 
            className="w-full h-auto rounded-xl object-cover relative z-10 shadow-sm border border-white/10"
            loading="lazy"
          />
        </motion.div>

      </div>
    </section>
  );
};

export default WeeklyTestSection;

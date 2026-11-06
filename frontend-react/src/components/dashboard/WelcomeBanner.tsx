import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Sparkles, Quote, Target } from 'lucide-react';

export default function WelcomeBanner({ solvedCount }: { solvedCount: number }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const userName = user?.profile?.firstName || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0d9488] dark:from-[#062c20] dark:via-[#043325] dark:to-[#042f2e] rounded-3xl p-6 sm:p-8 lg:p-10 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-xl border border-emerald-500/20">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Left: Greeting, Title, Description, Button */}
      <div className="flex-1 z-10 w-full mb-6 md:mb-0 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-200 uppercase tracking-widest border border-emerald-400/30 rounded-full px-3.5 py-1 bg-white/10 backdrop-blur-md mb-3.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>STUDENT PORTAL • CONTINUOUS LEARNING</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mb-1 tracking-tight text-emerald-100 flex items-center gap-2">
          <span>Hello, {userName}!</span>
          <span className="inline-block animate-bounce">👋</span>
        </h1>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3.5 tracking-tight text-white leading-tight">
          Keep Learning, Keep Growing!
        </h2>
        
        <p className="text-emerald-50/90 text-sm sm:text-base mb-6 leading-relaxed max-w-xl font-medium">
          You've solved <span className="font-extrabold text-white underline underline-offset-4 decoration-emerald-300">{solvedCount} problems</span> so far. Stay consistent and achieve your placement goals. Every small step counts!
        </p>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard/my-courses')}
            className="bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 shadow-md hover:shadow-lg text-sm group"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => navigate('/dashboard/practice')}
            className="bg-white/15 hover:bg-white/20 border border-white/20 text-white px-5 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 text-sm backdrop-blur-sm"
          >
            <span>Practice Problems</span>
          </button>
        </div>
      </div>

      {/* Right: Sleek Motivation Card */}
      <div className="z-10 hidden lg:flex flex-col justify-between w-80 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl relative shrink-0 text-white">
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
            <Quote className="w-4 h-4 text-emerald-300" />
            <span>DAILY MOTIVATION</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
            Inspire
          </span>
        </div>

        <div className="py-4">
          <p className="text-sm font-semibold italic text-white/95 leading-relaxed">
            "The expert in anything was once a beginner."
          </p>
          <p className="text-xs font-bold text-emerald-200 mt-2 text-right">
            — Helen Hayes
          </p>
        </div>

        <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-semibold text-emerald-100">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-300" />
            <span>Daily Goal Target</span>
          </span>
          <span className="text-white font-bold">Active Today</span>
        </div>
      </div>
    </div>
  );
}

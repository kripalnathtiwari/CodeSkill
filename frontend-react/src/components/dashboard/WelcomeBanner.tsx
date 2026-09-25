import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

export default function WelcomeBanner({ solvedCount }: { solvedCount: number }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const userName = user?.profile?.firstName || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="bg-gradient-to-r from-[#009b62] to-[#12b979] rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-lg border-b-4 border-[#068452]">
      {/* Background circles */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-white/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

      <div className="flex-1 z-10 w-full mb-6 md:mb-0 max-w-2xl">
        <h1 className="text-xl font-semibold mb-1 tracking-wide">Hello, {userName}! <span className="inline-block animate-bounce">👋</span></h1>
        <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Keep Learning, Keep Growing!</h2>
        
        <p className="text-white/90 text-[15px] mb-6 leading-relaxed max-w-lg font-medium">
          You've solved {solvedCount} problems so far. Stay consistent and achieve your goals. Every small step counts!
        </p>
        
        <button 
          onClick={() => navigate('/courses')}
          className="bg-white text-[#009b62] hover:bg-gray-50 px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center space-x-2 shadow-sm text-sm"
        >
          <span>Continue Learning</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="z-10 hidden lg:flex items-center justify-end relative pl-4">
        <div className="opacity-90 italic text-lg text-white font-medium text-right max-w-[280px] mr-4">
          "The expert in anything was once a beginner."
          <span className="text-sm opacity-75 mt-2 block">— Helen Hayes</span>
        </div>
        <img 
          src="/images/training1.png" 
          alt="Student learning" 
          className="w-56 h-auto drop-shadow-xl" 
          onError={(e) => {
            // Fallback if image doesn't exist
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}

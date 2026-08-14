import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

export default function WelcomeBanner({ solvedCount, totalCount, userRank }: { solvedCount: number, totalCount: number, userRank?: number | null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const userName = user?.profile?.firstName || user?.email?.split('@')[0] || 'Student';
  const percentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-primary rounded-[20px] p-6 md:p-8 text-text-inverse flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-xl shadow-primary/20">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-surface/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-light/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="flex-1 z-10 w-full mb-6 md:mb-0">
        <div className="flex items-center space-x-2 mb-2">
          <span className="bg-surface/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm">Welcome Back</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-2">Hello, {userName}! <span className="inline-block animate-bounce">👋</span></h1>
        <p className="text-primary-light/80 text-lg max-w-lg mb-6">
          You've solved {solvedCount} problems so far. Keep up the great work and complete your daily goals!
        </p>
        
        <button 
          onClick={() => navigate('/problems')}
          className="bg-surface text-primary hover:bg-primary-light px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center space-x-2 shadow-sm"
        >
          <span>Continue Learning</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="z-10 flex flex-col md:flex-row gap-4 items-center justify-center">
        {/* Overall Rank */}
        {userRank && (
          <div className="flex flex-col items-center justify-center bg-surface/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 w-full md:w-auto h-full min-w-[140px]">
            <div className="text-center">
              <p className="text-primary-light text-sm font-semibold mb-1">Global Rank</p>
              <div className="flex items-end justify-center space-x-1">
                <span className="text-4xl font-black">#{userRank}</span>
              </div>
            </div>
          </div>
        )}

        {/* Overall Progress */}
        <div className="flex flex-col items-center justify-center bg-surface/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 w-full md:w-auto h-full min-w-[200px]">
          <div className="text-center mb-4">
            <p className="text-primary-light text-sm font-semibold mb-1">Overall Progress</p>
          <div className="flex items-end justify-center space-x-1">
            <span className="text-4xl font-black">{percentage}%</span>
          </div>
        </div>
        
        {/* Simple Progress Bar */}
        <div className="w-48 h-2 bg-black/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-surface rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${percentage}%` }}
          ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

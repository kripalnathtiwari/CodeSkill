import React, { useState, useEffect } from 'react';
import { Code2, Target, CheckCircle2, ListChecks, Trophy } from 'lucide-react';

// Helper component for SVG Circular Progress
const CircularProgress = ({ value, total, color, trackColor = "#F1F5F9", strokeWidth = 8, size = 120, label1, label2, labelColor = "text-slate-800" }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = total > 0 ? (value / total) * 100 : 0;
  
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const calculatedOffset = circumference - (percent / 100) * circumference;
    const timeout = setTimeout(() => setOffset(calculatedOffset), 100);
    return () => clearTimeout(timeout);
  }, [percent, circumference]);

  return (
    <div className="relative flex flex-col items-center justify-center group" style={{ width: size, height: size }}>
      {/* Outer Glow */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        style={{ backgroundColor: color }}
      />
      <svg className="transform -rotate-90 relative z-10" width={size} height={size}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out drop-shadow-md"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center z-20">
        {label1 && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label1}</span>}
        <span className={`text-xl font-black ${labelColor} tracking-tight`}>{label2}</span>
      </div>
    </div>
  );
};

const AnimatedProgressBar = ({ value, total, colorClass, bgClass = "bg-slate-100" }: { value: number, total: number, colorClass: string, bgClass?: string }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setWidth(percent), 100);
    return () => clearTimeout(timeout);
  }, [percent]);

  return (
    <div className={`w-full ${bgClass} h-2 rounded-full overflow-hidden shadow-inner`}>
      <div 
        className={`${colorClass} h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden`} 
        style={{ width: `${width}%` }}
      >
        {/* Shine effect */}
        <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      </div>
    </div>
  );
};

export default function AnalyticsCharts({ dsaStats, testStats, mcqTotal, mcqStats }: { dsaStats?: any, testStats?: any, mcqTotal?: number, mcqStats?: any }) {
  
  const coding = {
    total: 100,
    solved: dsaStats?.total || 0,
    easy: { total: 40, solved: dsaStats?.easy || 0 },
    medium: { total: 40, solved: dsaStats?.medium || 0 },
    hard: { total: 20, solved: dsaStats?.hard || 0 },
  };

  const mcq = {
    total: mcqTotal || ((testStats?.attempted || 0) + (mcqStats?.attempted || 0)),
    solved: (mcqStats?.attempted || 0) + (testStats?.attempted || 0),
    correct: (mcqStats?.correct || 0) + (testStats?.correct || 0),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Coding Card - Premium Design */}
      <div className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors duration-500" />
        
        <div className="relative z-10 flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Coding Challenges</h3>
            <p className="text-xs font-semibold text-slate-500">DSA Problem Solving</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto relative z-10">
          <div className="flex-shrink-0 relative">
            <CircularProgress 
              value={coding.solved} 
              total={coding.total} 
              color="#F59E0B"
              size={120}
              strokeWidth={10}
              label1="Solved"
              label2={`${coding.solved}/${coding.total}`}
            />
          </div>
          
          <div className="flex-grow ml-8 space-y-4">
            {/* Easy */}
            <div className="space-y-2 group/bar">
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-bold text-slate-600 group-hover/bar:text-teal-500 transition-colors">Easy</span>
                <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{coding.easy.solved} / {coding.easy.total}</span>
              </div>
              <AnimatedProgressBar value={coding.easy.solved} total={coding.easy.total} colorClass="bg-teal-400" />
            </div>

            {/* Medium */}
            <div className="space-y-2 group/bar">
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-bold text-slate-600 group-hover/bar:text-amber-500 transition-colors">Medium</span>
                <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{coding.medium.solved} / {coding.medium.total}</span>
              </div>
              <AnimatedProgressBar value={coding.medium.solved} total={coding.medium.total} colorClass="bg-amber-400" />
            </div>

            {/* Hard */}
            <div className="space-y-2 group/bar">
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-bold text-slate-600 group-hover/bar:text-rose-500 transition-colors">Hard</span>
                <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{coding.hard.solved} / {coding.hard.total}</span>
              </div>
              <AnimatedProgressBar value={coding.hard.solved} total={coding.hard.total} colorClass="bg-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* MCQ Card - Premium Design */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-7 shadow-xl border border-slate-700/50 hover:shadow-2xl hover:border-slate-600 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-500" />
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">MCQ Assessments</h3>
              <p className="text-xs font-semibold text-slate-400">Multiple Choice Questions</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 mt-auto relative z-10">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"></div>
              <CircularProgress 
                value={mcq.correct} 
                total={mcq.solved || 1}
                color="#34D399" // emerald-400
                trackColor="#1E293B" // slate-800
                labelColor="text-white"
                size={140}
                strokeWidth={12}
                label1="Accuracy"
                label2={`${mcq.solved > 0 ? Math.round((mcq.correct / mcq.solved) * 100) : 0}%`}
              />
            </div>
          </div>
          
          <div className="flex-grow w-full space-y-4">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between group/stat hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                  <ListChecks className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-300">Attempted</span>
              </div>
              <span className="text-xl font-black text-white">{mcq.solved}</span>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between group/stat hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-300">Correct</span>
              </div>
              <span className="text-xl font-black text-emerald-400">{mcq.correct}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

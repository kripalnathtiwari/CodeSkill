import React, { useState, useEffect } from 'react';

// Helper component for SVG Circular Progress
const CircularProgress = ({ value, total, color, strokeWidth = 8, size = 120, label1, label2 }: any) => {
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
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
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
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label1 && <span className="text-[10px] font-bold text-slate-500 uppercase">{label1}</span>}
        <span className="text-sm font-bold text-slate-800">{label2}</span>
      </div>
    </div>
  );
};

const McqCircularProgress = ({ correct, total, size = 120, strokeWidth = 10 }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = total > 0 ? (correct / total) * 100 : 0;
  
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const calculatedOffset = circumference - (percent / 100) * circumference;
    const timeout = setTimeout(() => setOffset(calculatedOffset), 100);
    return () => clearTimeout(timeout);
  }, [percent, circumference]);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Red Background Circle (for incorrect/unanswered) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EF4444"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Green Progress Circle (for correct) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#22C55E"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">TOTAL SCORE</span>
        <span className="text-sm font-bold text-slate-800">{correct}/{total}</span>
      </div>
    </div>
  );
};

const AnimatedProgressBar = ({ value, total, colorClass }: { value: number, total: number, colorClass: string }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setWidth(percent), 100);
    return () => clearTimeout(timeout);
  }, [percent]);

  return (
    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
      <div 
        className={`${colorClass} h-full rounded-full transition-all duration-1000 ease-out`} 
        style={{ width: `${width}%` }}
      ></div>
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
      
      {/* Coding Problem Solved Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
        <h3 className="text-[15px] font-bold text-slate-800 mb-1">Coding Problem Solved</h3>
        <div className="text-3xl font-black text-slate-900 mb-6">{coding.solved}</div>
        
        <div className="flex items-center justify-between mt-auto">
          {/* Left: Circular Chart */}
          <div className="flex-shrink-0">
            <CircularProgress 
              value={coding.solved} 
              total={coding.total} 
              color="#F59E0B" // Orange
              size={110}
              strokeWidth={8}
              label2={`${coding.solved}/${coding.total}`}
            />
          </div>
          
          {/* Right: Progress Bars */}
          <div className="flex-grow ml-8 space-y-4">
            
            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-semibold text-slate-500">Easy</span>
                <span className="font-bold text-slate-700">{coding.easy.solved}/{coding.easy.total}</span>
              </div>
              <AnimatedProgressBar value={coding.easy.solved} total={coding.easy.total} colorClass="bg-teal-400" />
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-semibold text-slate-500">Medium</span>
                <span className="font-bold text-slate-700">{coding.medium.solved}/{coding.medium.total}</span>
              </div>
              <AnimatedProgressBar value={coding.medium.solved} total={coding.medium.total} colorClass="bg-amber-400" />
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-semibold text-slate-500">Hard</span>
                <span className="font-bold text-slate-700">{coding.hard.solved}/{coding.hard.total}</span>
              </div>
              <AnimatedProgressBar value={coding.hard.solved} total={coding.hard.total} colorClass="bg-rose-400" />
            </div>

          </div>
        </div>
      </div>

      {/* MCQ Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
        <h3 className="text-[15px] font-bold text-slate-800 mb-1">MCQ</h3>
        <div className="text-3xl font-black text-slate-900 mb-6">{mcq.solved}</div>
        
        <div className="flex items-center justify-start mt-auto">
          {/* Left: Circular Chart */}
          <div className="flex-shrink-0 mr-12">
            <McqCircularProgress 
              correct={mcq.correct} 
              total={mcq.solved || 1} // avoid division by zero, though logic handles it
              size={110}
              strokeWidth={10}
            />
          </div>
          
          {/* Right: Stats Text */}
          <div className="flex flex-col space-y-5">
            <div>
              <p className="text-[13px] font-semibold text-slate-500 mb-1">Solved Questions</p>
              <p className="text-xl font-bold text-slate-800">{mcq.solved}</p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-500 mb-1">Correct Answers</p>
              <p className="text-xl font-bold text-slate-800">{mcq.correct}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

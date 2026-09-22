import React from 'react';
import { ArrowRight, Clock, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Recommendations() {
  const navigate = useNavigate();

  const recommendations = [
    {
      title: "System Design Basics",
      level: "Intermediate",
      time: "12 hrs",
      image: "bg-slate-700",
      icon: <div className="text-white opacity-80 grid grid-cols-2 gap-1 p-2"><div className="w-3 h-3 bg-emerald-400 rounded-sm"></div><div className="w-3 h-3 border border-white rounded-sm"></div><div className="col-span-2 h-1 bg-white mt-1"></div></div>
    },
    {
      title: "Python for Data Science",
      level: "Beginner",
      time: "8 hrs",
      image: "bg-slate-100",
      icon: <div className="text-blue-600 font-black text-2xl px-2">Python</div>
    }
  ];

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-text-primary">Recommended for You</h2>
        <button className="flex items-center space-x-1 text-xs font-bold text-primary hover:text-primary-hover group">
          <span>View All</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="border border-border rounded-xl p-3 flex flex-col group hover:border-primary/50 transition-colors">
            <div className={`h-24 ${rec.image} rounded-lg mb-3 flex items-center justify-center overflow-hidden relative`}>
              {rec.icon}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            <h3 className="text-sm font-bold text-text-primary line-clamp-1 mb-1">{rec.title}</h3>
            
            <div className="flex items-center justify-between mt-auto mb-3 text-[11px] font-semibold text-text-muted">
              <span>{rec.level}</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{rec.time}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/courses')}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Start Learning
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

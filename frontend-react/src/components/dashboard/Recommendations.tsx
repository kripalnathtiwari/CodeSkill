import React from 'react';
import { ArrowRight, Clock, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COURSES_DATA } from '../../data/coursesData';

export default function Recommendations() {
  const navigate = useNavigate();

  const recommendations = Object.values(COURSES_DATA).filter(c => c.category === 'featured').slice(0, 2);
  const displayCourses = recommendations.length >= 2 ? recommendations : Object.values(COURSES_DATA).slice(0, 2);

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-text-primary">Our Courses</h2>
        <button 
          onClick={() => navigate('/dashboard/courses')}
          className="flex items-center space-x-1 text-xs font-bold text-primary hover:text-primary-hover group"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {displayCourses.map((rec, idx) => (
          <div key={idx} className="border border-border rounded-xl p-3 flex flex-col group hover:border-primary/50 transition-colors">
            <div className={`h-24 bg-gradient-to-br ${rec.color} rounded-lg mb-3 flex items-center justify-center overflow-hidden relative`}>
              {rec.icon && <rec.icon className="w-8 h-8 text-white opacity-80" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            <h3 className="text-sm font-bold text-text-primary line-clamp-1 mb-1" title={rec.title}>{rec.title}</h3>
            
            <div className="flex items-center justify-between mt-auto mb-3 text-[11px] font-semibold text-text-muted">
              <span className="truncate max-w-[60%]">{rec.level}</span>
              <div className="flex items-center space-x-1 shrink-0">
                <Clock className="w-3 h-3" />
                <span className="truncate max-w-[50px]">{rec.duration.replace('Self-paced', '').replace(/[^\d+]/g, '')} hrs</span>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/dashboard/course/${rec.id}`)}
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

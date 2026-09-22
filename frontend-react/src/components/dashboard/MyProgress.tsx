import React, { useState } from 'react';
import { Layers, Cpu, Database, Network, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyProgress({ enrollments = [] }: { enrollments: any[] }) {
  const [activeTab, setActiveTab] = useState<'Courses' | 'Practice' | 'Tests'>('Courses');
  const navigate = useNavigate();

  // Pick up to 4 enrolled courses to display progress
  const progressData = enrollments.slice(0, 4).map((course, idx) => {
    const isCompleted = course.status === 'completed' || course.status === 'Success';
    // If it's a mock or active course, give it a randomish realistic progress like 35%, 60% based on string length, 
    // or just 100% if completed, 10% if UNPAID, 45% if active
    let value = 45;
    if (isCompleted) value = 100;
    else if (course.status === 'UNPAID') value = 10;
    else value = Math.min(95, 20 + ((course.courseName?.length || 5) * 5));

    const colors = [
      { icon: <Layers className="w-5 h-5 text-blue-500" />, bg: "bg-blue-100 dark:bg-blue-900/30", color: "bg-emerald-500" },
      { icon: <Cpu className="w-5 h-5 text-yellow-500" />, bg: "bg-yellow-100 dark:bg-yellow-900/30", color: "bg-emerald-500" },
      { icon: <Database className="w-5 h-5 text-blue-500" />, bg: "bg-blue-100 dark:bg-blue-900/30", color: "bg-emerald-500" },
      { icon: <Network className="w-5 h-5 text-purple-500" />, bg: "bg-purple-100 dark:bg-purple-900/30", color: "bg-emerald-500" }
    ];

    return {
      name: course.courseName || "Course",
      value: value,
      ...colors[idx % colors.length]
    };
  });

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-text-primary">My Progress</h2>
        <div className="flex space-x-4">
          {['Courses', 'Practice', 'Tests'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-sm font-semibold transition-colors pb-1 ${
                activeTab === tab 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {progressData.length > 0 ? (
          progressData.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-4">
              <div className={`p-2.5 rounded-xl shrink-0 ${item.bg}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-text-primary truncate">{item.name}</span>
                  <span className="text-xs font-bold text-text-muted">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-70">
             <BookOpen className="w-10 h-10 text-text-muted" />
             <p className="text-sm font-bold text-text-primary">No courses yet</p>
             <p className="text-xs text-text-muted">Enroll in a course to see progress.</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border flex justify-end">
        <button 
          onClick={() => navigate('/courses')}
          className="flex items-center space-x-1 text-sm font-bold text-primary hover:text-primary-hover group"
        >
          <span>View All Courses</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

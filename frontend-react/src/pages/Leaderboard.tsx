import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Trophy, Medal, Star } from 'lucide-react';

export default function Leaderboard() {
  const [topStudents, setTopStudents] = useState<any[]>([]);

  useEffect(() => {
    try {
      const allScores = JSON.parse(localStorage.getItem("all_student_scores") || "[]");
      const studentTotals: Record<string, { name: string, score: number }> = {};

      allScores.forEach((s: any) => {
        const email = s.studentEmail || s.studentName;
        if (email) {
          if (!studentTotals[email]) {
            studentTotals[email] = { name: s.studentName || email.split('@')[0], score: 0 };
          }
          studentTotals[email].score += (Number(s.score) || 0);
        }
      });

      const leaderboard = Object.values(studentTotals)
        .sort((a, b) => b.score - a.score)
        .map((s, index) => ({
          name: s.name || 'Anonymous',
          score: s.score * 10,
          rank: index + 1,
          avatar: (s.name || 'A')[0].toUpperCase()
        }))
        .slice(0, 10);

      setTopStudents(leaderboard);
    } catch (e) {
      console.error("Failed to parse scores for leaderboard", e);
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-8">
            <Trophy className="w-8 h-8 text-warning" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">Global Leaderboard</h1>
          </div>
          
          <div className="bg-background rounded-xl p-4 md:p-6 border border-border shadow-inner">
            <h3 className="text-lg font-bold text-text-primary mb-6">Top 10 Performers</h3>
            
            {topStudents.length === 0 ? (
              <p className="text-text-muted text-center py-8">No leaderboard data available yet. Start practicing to get on the board!</p>
            ) : (
              <div className="space-y-3">
                {topStudents.map((student) => (
                  <div key={student.rank} className="flex items-center justify-between p-4 bg-surface rounded-xl shadow-sm border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm
                        ${student.rank === 1 ? 'bg-warning text-amber-900 shadow-[0_0_15px_rgba(255,210,31,0.6)] border-2 border-warning' : 
                          student.rank === 2 ? 'bg-slate-200 text-slate-800 border-2 border-slate-300' : 
                          student.rank === 3 ? 'bg-amber-600 text-amber-50 border-2 border-amber-500' : 
                          'bg-primary-light text-primary border border-primary/20'}
                      `}>
                        {student.avatar}
                      </div>
                      
                      <div>
                        <h4 className="text-base font-bold text-text-primary flex items-center space-x-2">
                          <span>{student.name}</span>
                          {student.rank === 1 && <Medal className="w-4 h-4 text-warning" />}
                        </h4>
                        <p className="text-sm font-semibold text-text-secondary flex items-center mt-0.5">
                          <Star className="w-3 h-3 text-emerald-500 mr-1" />
                          {student.score} pts
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border text-text-primary font-extrabold text-lg shadow-inner">
                        #{student.rank}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

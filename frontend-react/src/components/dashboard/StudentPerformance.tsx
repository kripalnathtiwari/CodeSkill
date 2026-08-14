import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

const mockStudents = [
  { name: 'Alex Johnson', score: 1450, rank: 1, avatar: 'A' },
  { name: 'Sarah Miller', score: 1320, rank: 2, avatar: 'S' },
  { name: 'Mike Chen', score: 1280, rank: 3, avatar: 'M' },
  { name: 'Emma Davis', score: 1150, rank: 4, avatar: 'E' },
];

export default function StudentPerformance() {
  const [topStudents, setTopStudents] = useState(mockStudents);

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
        .slice(0, 4);

      if (leaderboard.length > 0) {
        setTopStudents(leaderboard);
      }
    } catch (e) {
      console.error("Failed to parse scores for leaderboard", e);
    }
  }, []);

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary">Top Performers</h3>
        <Trophy className="w-5 h-5 text-warning" />
      </div>
      
      <div className="space-y-4">
        {topStudents.map((student, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-background transition-colors">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${student.rank === 1 ? 'bg-warning text-amber-900 shadow-[0_0_10px_rgba(255,210,31,0.5)]' : 
                  student.rank === 2 ? 'bg-slate-300 text-text-primary' : 
                  student.rank === 3 ? 'bg-amber-600 text-amber-50' : 
                  'bg-primary-light text-primary'}
              `}>
                {student.avatar}
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">{student.name}</h4>
                <p className="text-xs text-text-secondary">{student.score} pts</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background text-text-secondary font-bold text-sm">
              #{student.rank}
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2 text-sm font-bold text-primary hover:bg-primary-light rounded-xl transition-colors">
        View Leaderboard
      </button>
    </div>
  );
}

import React from 'react';
import { Users } from 'lucide-react';

/**
 * Displays top 5 performers based on accumulated scores stored in `all_student_scores`.
 * Falls back to placeholder data if none is available.
 */
export default function TopPerformersCard() {
  const [topPerformers, setTopPerformers] = React.useState<Array<{ email: string; total: number }>>([]);

  React.useEffect(() => {
    try {
      const allScores = JSON.parse(localStorage.getItem('all_student_scores') || '[]');
      const totals: Record<string, number> = {};
      allScores.forEach((s: { studentEmail?: string; studentName?: string; score?: string | number }) => {
        const email = s.studentEmail || s.studentName || '';
        if (email) {
          totals[email] = (totals[email] || 0) + (Number(s.score) || 0);
        }
      });
      const sorted = Object.entries(totals)
        .map(([email, total]) => ({ email, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      setTopPerformers(sorted);
    } catch {
      setTopPerformers([]);
    }
  }, []);

  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
      <h3 className="text-lg font-bold text-text-primary">Top Performers</h3>
      {topPerformers.length === 0 ? (
        <p className="text-sm text-text-muted">No data available.</p>
      ) : (
        <ul className="space-y-2">
          {topPerformers.map((p, idx) => (
            <li key={idx} className="flex items-center justify-between text-sm text-text-primary">
              <span>{idx + 1}. {p.email}</span>
              <span className="font-medium">{p.total}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


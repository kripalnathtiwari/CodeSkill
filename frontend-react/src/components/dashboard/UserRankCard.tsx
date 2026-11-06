import React from 'react';
import { Crown } from 'lucide-react';

/**
 * Displays the current user's global rank.
 * Props:
 *  - rank: number | null – the 1‑based rank of the user. If null, the rank is unknown.
 */
export default function UserRankCard({ rank }: { rank: number | null }) {
  return (
    <div className="bg-surface dark:bg-[#111827] border border-border rounded-2xl p-6 shadow-sm flex items-center space-x-4">
      <div className="p-2.5 rounded-xl bg-primary/10">
        <Crown className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-muted">Global Rank</p>
        {rank !== null ? (
          <p className="text-xl font-bold text-text-primary">#{rank}</p>
        ) : (
          <p className="text-sm text-text-muted">Not ranked yet</p>
        )}
      </div>
    </div>
  );
}


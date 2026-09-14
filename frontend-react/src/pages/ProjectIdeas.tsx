import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function ProjectIdeas() {
  return (
    <div className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-primary" />
            Project Ideas
          </h1>
          <p className="text-text-muted mt-2 font-medium">Explore and get inspired by curated project ideas for your portfolio.</p>
        </div>
      </div>

      {/* Content Placeholder */}
      <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-secondary/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-border/60">
        <Lightbulb className="w-16 h-16 text-text-muted/30 mb-4" />
        <h3 className="text-xl font-bold text-text-primary mb-2">Coming Soon</h3>
        <p className="text-text-muted max-w-md">We are currently gathering an awesome list of project ideas across different domains. Check back later!</p>
      </div>
    </div>
  );
}

import React from 'react';
import { Settings, Wrench, TerminalSquare } from 'lucide-react';

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-text-inverse overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="relative flex flex-col items-center justify-center p-8 bg-slate-900/50 backdrop-blur-sm border border-border rounded-3xl shadow-2xl animate-in fade-in zoom-in">
        
        {/* Animated Icons Container */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
          <div className="absolute bg-slate-800 rounded-full w-20 h-20 flex items-center justify-center border border-border shadow-inner z-10">
            {/* Gear spinning continuously */}
            <Settings className="w-10 h-10 text-primary animate-spin z-20" style={{ animationDuration: '3s' }} />
          </div>
          
          {/* Wrench swinging back and forth - Delayed to prevent render blocking */}
          <div className="absolute bottom-2 -right-2 z-30 animate-pulse origin-bottom-left" style={{ animation: 'swing 2s ease-in-out infinite', animationDelay: '500ms' }}>
            <Wrench className="w-8 h-8 text-amber-500 drop-shadow-lg" />
          </div>

          <style>{`
            @keyframes swing {
              0%, 100% { transform: rotate(-15deg); }
              50% { transform: rotate(15deg); }
            }
          `}</style>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
            Preparing your environment
          </h2>
          <div className="flex items-center justify-center space-x-2 text-text-muted font-mono text-sm">
            <TerminalSquare className="w-4 h-4" />
            <span className="flex items-center">
              Loading<span className="flex w-6 text-left animate-pulse">...</span>
            </span>
          </div>
        </div>

        {/* Progress Bar (Indeterminate) */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-8 overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-primary to-sky-500 rounded-full w-1/2 animate-[progress_1.5s_ease-in-out_infinite_alternate]"></div>
          <style>{`
            @keyframes progress {
              0% { transform: translateX(-100%); width: 50%; }
              100% { transform: translateX(200%); width: 50%; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

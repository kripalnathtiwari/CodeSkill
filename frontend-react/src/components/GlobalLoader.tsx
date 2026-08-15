import React from 'react';
import { Settings, Wrench, TerminalSquare } from 'lucide-react';

export default function GlobalLoader() {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center justify-between p-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-8 fade-in pointer-events-none max-w-sm w-full">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>
      
      <div className="flex items-center space-x-4 relative z-10 w-full">
        {/* Animated Icons Container */}
        <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
          <div className="absolute bg-slate-800 rounded-full w-10 h-10 flex items-center justify-center border border-border shadow-inner z-10">
            {/* Gear spinning continuously */}
            <Settings className="w-5 h-5 text-primary animate-spin z-20" style={{ animationDuration: '3s' }} />
          </div>
          
          {/* Wrench swinging back and forth */}
          <div className="absolute bottom-0 -right-1 z-30 animate-pulse origin-bottom-left" style={{ animation: 'swing 2s ease-in-out infinite', animationDelay: '500ms' }}>
            <Wrench className="w-4 h-4 text-amber-500 drop-shadow-lg" />
          </div>

          <style>{`
            @keyframes swing {
              0%, 100% { transform: rotate(-15deg); }
              50% { transform: rotate(15deg); }
            }
          `}</style>
        </div>

        {/* Loading Text */}
        <div className="flex-1 space-y-1 min-w-0">
          <h2 className="text-sm font-bold text-slate-200 truncate">
            Preparing your environment
          </h2>
          <div className="flex items-center space-x-1.5 text-text-muted font-mono text-xs">
            <TerminalSquare className="w-3 h-3 shrink-0" />
            <span className="flex items-center truncate">
              Loading<span className="flex w-3 text-left animate-pulse">...</span>
            </span>
          </div>
          
          {/* Mini Progress Bar */}
          <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden relative">
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
    </div>
  );
}

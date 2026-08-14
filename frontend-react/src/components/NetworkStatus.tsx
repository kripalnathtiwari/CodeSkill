import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCcw } from 'lucide-react';

export default function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulate a brief delay for UX before checking status
    setTimeout(() => {
      setIsRetrying(false);
      if (navigator.onLine) {
        setIsOffline(false);
      }
    }, 800);
  };

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="relative flex flex-col items-center justify-center p-10 bg-slate-900 border border-border rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500 max-w-md text-center">
        
        {/* Animated Icon */}
        <div className="relative flex items-center justify-center w-28 h-28 mb-6">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping opacity-75"></div>
          <div className="absolute bg-slate-800 rounded-full w-24 h-24 flex items-center justify-center border border-border shadow-inner z-10">
            <WifiOff className="w-12 h-12 text-rose-500 z-20" />
          </div>
        </div>

        {/* Text content */}
        <h2 className="text-3xl font-black text-text-inverse mb-2 tracking-tight">
          Connection Lost
        </h2>
        <p className="text-text-muted mb-8 leading-relaxed">
          It looks like you're disconnected from the internet. Please check your network settings and try again.
        </p>

        {/* Retry Button */}
        <button 
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center space-x-2 bg-primary hover:bg-primary disabled:bg-slate-700 disabled:text-text-muted text-text-inverse px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:shadow-none"
        >
          <RefreshCcw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Checking...' : 'Try Again'}</span>
        </button>
      </div>
    </div>
  );
}

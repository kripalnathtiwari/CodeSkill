import React from 'react';
import { Code2, Zap, Layout, MonitorPlay, Sparkles } from 'lucide-react';

export default function OurProduct() {
  return (
    <div className="min-h-screen bg-background dark:bg-background relative pt-24 pb-20 overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />

      {/* Background Gradient Blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent-light px-4 py-2 rounded-full mb-6 font-medium text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Learning Environment</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary dark:text-text-inverse mb-6 tracking-tight">
            Master Coding with <br className="hidden sm:block" />
            <span className="text-gradient-premium">Real-Time Feedback</span>
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-muted leading-relaxed">
            Dive into our immersive coding interface designed for maximum productivity. Practice DSA, build projects, and prepare for product-based company interviews all in one place.
          </p>
        </div>

        {/* Main Product Image Section */}
        <div className="relative mx-auto rounded-2xl overflow-hidden glass-card p-2 md:p-4 hover-scale-premium duration-500 max-w-5xl group">
          <div className="absolute inset-0 bg-gradient-premium opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
          
          {/* Top Bar for realistic editor look */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-t-xl px-4 py-3 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-error" />
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div className="w-3 h-3 rounded-full bg-success" />
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                <Code2 className="w-4 h-4" />
                <span>codesklii-environment</span>
              </div>
            </div>
          </div>
          
          <img 
            src="https://res.cloudinary.com/zihn8u4b/image/upload/v1789467057/Screenshot_2026-09-15_153549.png" 
            alt="CodeSklii Interactive Coding Environment" 
            className="w-full h-auto rounded-b-xl object-cover shadow-2xl border border-white/5 relative z-10"
            loading="lazy"
          />
        </div>

        {/* Features Grid below image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          
          <div className="glass-card p-6 rounded-2xl text-center md:text-left hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
              <MonitorPlay className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-text-inverse mb-2">Live Execution</h3>
            <p className="text-text-secondary dark:text-text-muted text-sm">
              Write, compile, and run your code instantly within the browser. No complex setups required.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center md:text-left hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
              <Layout className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-text-inverse mb-2">Split-Pane Layout</h3>
            <p className="text-text-secondary dark:text-text-muted text-sm">
              Read problem descriptions and code side-by-side with our optimized dual-pane interface.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center md:text-left hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
              <Zap className="w-6 h-6 text-info" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-text-inverse mb-2">Instant Feedback</h3>
            <p className="text-text-secondary dark:text-text-muted text-sm">
              Get immediate evaluation on your test cases to debug faster and improve problem-solving speed.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Users, Code2 } from 'lucide-react';

export default function OurProduct() {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#040B16] text-white flex flex-col items-center justify-center py-20 px-6 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto text-center flex flex-col items-center relative z-10">
        {/* Top Badge */}
        <div className="mb-10 inline-flex items-center px-5 py-2 rounded-full border border-blue-500/20 bg-blue-900/20 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase">
          ALGOTUTOR ACADEMIC SUITE
        </div>
        
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-black tracking-tight text-white mb-8 leading-[1.1]">
          Next-Generation <span className="text-[#0ea5e9]">AI-Powered Learning Platform</span> for Modern Institutions
        </h1>
        
        {/* Description */}
        <p className="text-slate-300 text-lg md:text-2xl max-w-4xl mb-14 leading-relaxed font-light">
          Deploy white-labeled academic portals and secure coding assessment engines under your university's brand. Used by leading campuses to align curriculum delivery, manage coding labs, and drive placement readiness.
        </p>
        
        {/* Bottom Badges */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-sm md:text-base font-medium">
          <div className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#0f172a]/50 border border-slate-800 text-slate-300 backdrop-blur-sm">
            <Users className="w-5 h-5 text-slate-400" />
            <span>Active Scale: <strong className="text-white">25,000+ Upskilled Students</strong></span>
          </div>
          <div className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#0f172a]/50 border border-slate-800 text-slate-300 backdrop-blur-sm">
            <Code2 className="w-5 h-5 text-slate-400" />
            <span>Compiler Sandbox Capacity: <strong className="text-white">10,000+ Concurrent Sandbox Compiles</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

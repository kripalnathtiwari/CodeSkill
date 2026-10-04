import React from "react";
import { motion } from "framer-motion";

export default function PlatformIllustration() {
  const satellites = [
    { name: "SQL", color: "bg-emerald-500", text: "text-white" },
    { name: "rs", color: "bg-blue-600", text: "text-white" },
    { name: "GO", color: "bg-cyan-600", text: "text-white" },
    { name: "PY", color: "bg-blue-500", text: "text-white" },
    { name: "JS", color: "bg-yellow-400", text: "text-slate-900" },
    { name: "JAVA", color: "bg-red-500", text: "text-white" },
    { name: "C++", color: "bg-indigo-500", text: "text-white" },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden rounded-2xl">
      {/* Background Dots/Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      
      {/* Central Area */}
      <div className="relative flex-grow flex items-center justify-center mt-10">
        
        {/* Orbit Rings */}
        <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full border border-primary/20 border-dashed animate-[spin_40s_linear_infinite]"></div>
        <div className="absolute w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] rounded-full border border-primary/10 border-dashed animate-[spin_50s_linear_infinite_reverse]"></div>
        
        {/* Satellites Container - Orbiting */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px]"
        >
          {satellites.map((sat, index) => {
            const angle = (index * 360) / satellites.length;
            const radius = 100; // % distance
            return (
              <div 
                key={sat.name}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                }}
              >
                {/* Responsive distance from center */}
                <div className="-translate-y-[140px] sm:-translate-y-[190px]">
                  {/* Counter-rotate the animation so it stays upright */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-lg ${sat.color} ${sat.text} border-4 border-white dark:border-slate-800`}
                  >
                    {/* Counter-rotate the initial angle */}
                    <div style={{ transform: `rotate(-${angle}deg)` }}>
                      {sat.name}
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Central Logo - Increased Size */}
        <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 bg-white dark:bg-slate-800 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.3)] flex items-center justify-center border-[6px] border-primary/20">
          <img
            src="/favicon.svg"
            alt="CodeSkill Logo"
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain"
          />
        </div>
      </div>

      {/* Bottom Text - Increased Size */}
      <div className="relative z-10 pb-8 pt-4">
        <h3 className="text-sm sm:text-lg lg:text-xl font-bold tracking-[0.2em] text-slate-700 dark:text-slate-300">
          LEARN <span className="text-primary mx-1 sm:mx-2">•</span> 
          PRACTICE <span className="text-primary mx-1 sm:mx-2">•</span> 
          CODE <span className="text-primary mx-1 sm:mx-2">•</span> 
          GROW
        </h3>
      </div>
    </div>
  );
}

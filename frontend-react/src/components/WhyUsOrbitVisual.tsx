import React, { useEffect, useRef, useState } from 'react';

const orbitsConfig = [
  { cx: 500, cy: 350, rx: 468, ry: 230, tilt: -9, period: 38, dir: 1, icons: ['python', 'react', 'java', 'database'] },
  { cx: 500, cy: 335, rx: 398, ry: 172, tilt: 7, period: 30, dir: -1, icons: ['js', 'node', 'cpp', 'code'] }
];

// Fallback icon URLs using DevIcon or similar public sources
const iconUrls: Record<string, string> = {
  python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  react: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  database: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  js: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  node: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  cpp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  code: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
};

export default function WhyUsOrbitVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const elapsedRef = useRef<number>(0);
  
  const mouseRef = useRef({ x: 0, y: 0 });
  const speedFactorRef = useRef(1); // 1 = normal, 0.3 = hovered
  const targetSpeedRef = useRef(1);

  // We need state to handle reduced motion initially
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll('.item--icon')) as HTMLElement[];
    let kx = 1, ky = 1, H = 1000;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0) continue;
        kx = width / 1000;
        H = 1000 * (height / width);
        ky = height / H;
      }
    });
    resizeObserver.observe(container);

    const animate = (time: number) => {
      // Delta time clamped
      let dt = (time - lastTimeRef.current) / 1000;
      if (dt > 0.05) dt = 0.05; 
      lastTimeRef.current = time;

      // Lerp speed
      speedFactorRef.current += (targetSpeedRef.current - speedFactorRef.current) * 0.06;
      elapsedRef.current += dt * speedFactorRef.current;
      const t = elapsedRef.current;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update positions
      orbitsConfig.forEach((orbit) => {
        orbit.icons.forEach((iconId, iconIndex) => {
          const iconEl = items.find(el => el.dataset.icon === iconId);
          if (!iconEl) return;

          const n = orbit.icons.length;
          const phase = (iconIndex / n) * 2 * Math.PI;
          // Angle
          const a = phase + orbit.dir * 2 * Math.PI * (t / orbit.period);
          
          // Ellipse point
          const px = orbit.rx * Math.cos(a);
          const py = orbit.ry * Math.sin(a);

          // Tilt rotation
          const tiltRad = (orbit.tilt * Math.PI) / 180;
          const cosT = Math.cos(tiltRad);
          const sinT = Math.sin(tiltRad);

          const rxRot = px * cosT - py * sinT;
          const ryRot = px * sinT + py * cosT;

          // Final Virtual Coords
          const vx = orbit.cx + rxRot;
          const vy = orbit.cy + ryRot;

          // Convert to pixels
          const finalX = vx * kx;
          const finalY = vy * ky;

          // Depth
          const depth = (Math.sin(a) + 1) / 2; // 0 far, 1 near
          const scale = 0.8 + 0.3 * depth;
          const opacity = 0.62 + 0.38 * depth;
          const zIndex = depth >= 0.5 ? 5 : 1;

          // Parallax
          const pFactor = 0.02 * (1 + depth); // different per depth
          const pX = -mx * pFactor * kx * 100; // rough scale
          const pY = -my * pFactor * ky * 100;

          iconEl.style.transform = `translate3d(${finalX + pX}px, ${finalY + pY}px, 0) translate(-50%, -50%) scale(${scale})`;
          iconEl.style.opacity = opacity.toString();
          if (iconEl.style.zIndex !== zIndex.toString()) {
            iconEl.style.zIndex = zIndex.toString();
          }
        });
      });

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      resizeObserver.disconnect();
    };
  }, [prefersReducedMotion]);

  const handlePointerEnter = () => { targetSpeedRef.current = 0.3; };
  const handlePointerLeave = () => { 
    targetSpeedRef.current = 1; 
    mouseRef.current = { x: 0, y: 0 };
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Normalized -1 to 1
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseRef.current = { x, y };
  };

  const renderRings = (type: 'back' | 'front') => {
    return (
      <svg 
        className={`absolute inset-0 w-full h-full pointer-events-none orbits--${type}`} 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="xMidYMid slice"
        style={{ 
          zIndex: type === 'back' ? 0 : 4,
          filter: "drop-shadow(0px 0px 8px rgba(0, 166, 81, 0.4))"
        }}
        aria-hidden="true"
      >
        <defs>
          {orbitsConfig.map((orbit, i) => (
            <clipPath id={`clip-${type}-${i}`} key={i}>
              {/* Back: clip far half (top), Front: clip near half (bottom) */}
              {type === 'back' ? (
                <rect x="-1000" y="-1000" width="2000" height="1000" />
              ) : (
                <rect x="-1000" y="0" width="2000" height="1000" />
              )}
            </clipPath>
          ))}
        </defs>

        {orbitsConfig.map((orbit, i) => (
          <g 
            key={i} 
            transform={`translate(${orbit.cx} ${orbit.cy}) rotate(${orbit.tilt})`}
            clipPath={`url(#clip-${type}-${i})`}
          >
            {/* Solid faint */}
            <ellipse cx="0" cy="0" rx={orbit.rx} ry={orbit.ry} fill="none" stroke="#00A651" strokeOpacity="0.15" strokeWidth="2" />
            
            {/* Dotted */}
            <ellipse cx="0" cy="0" rx={orbit.rx} ry={orbit.ry} fill="none" stroke="#00A651" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="4 8" strokeLinecap="round" />
            
            {/* Comets */}
            {!prefersReducedMotion && (
              <>
                <ellipse 
                  cx="0" cy="0" rx={orbit.rx} ry={orbit.ry} fill="none" stroke="#00A651" strokeWidth="3"
                  strokeDasharray="100" strokeDashoffset="100" pathLength="100"
                  style={{
                    animation: `cometOrbit${orbit.dir > 0 ? 'Cw' : 'Ccw'} ${orbit.period}s linear infinite`
                  }}
                />
                <ellipse 
                  cx="0" cy="0" rx={orbit.rx} ry={orbit.ry} fill="none" stroke="#00A651" strokeWidth="3"
                  strokeDasharray="100" strokeDashoffset="100" pathLength="100"
                  style={{
                    animation: `cometOrbit${orbit.dir > 0 ? 'Cw' : 'Ccw'} ${orbit.period}s linear infinite`,
                    animationDelay: `-${orbit.period / 2}s`
                  }}
                />
              </>
            )}
          </g>
        ))}
      </svg>
    );
  };

  return (
    <>
      <style>{`
        @keyframes cometOrbitCw {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -100; }
        }
        @keyframes cometOrbitCcw {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 100; }
        }
        .is-orbit .item--icon {
          position: absolute;
          left: 0 !important;
          top: 0 !important;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .is-orbit .item--icon {
            /* Initial static fallback positions would be here, but we let React handle setting them once */
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
      
      <div 
        id="scene"
        ref={containerRef}
        className={`w-full relative flex justify-center items-center ${prefersReducedMotion ? '' : 'is-orbit'}`}
        style={{ aspectRatio: '2474 / 1899', isolation: 'isolate' }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
      >
        {/* Background Rings */}
        {renderRings('back')}

        {/* Laptop Image (Layer 2) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
           <img
              src="https://res.cloudinary.com/zihn8u4b/image/upload/v1791568976/laptop.png"
              alt="CodeSkill coding laptop displayed on a podium"
              className="w-[115%] h-[115%] max-w-[115%] object-contain filter drop-shadow-[0_30px_40px_rgba(15,23,42,0.28)]"
              style={{ 
                WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 50%, transparent 80%)",
                maskImage: "radial-gradient(circle at 50% 50%, black 50%, transparent 80%)" 
              }}
              width="2474"
              height="1899"
              loading="eager"
              fetchPriority="high"
            />
        </div>

        {/* Foreground Rings */}
        {renderRings('front')}

        {/* Orbiting Icons */}
        {orbitsConfig.flatMap(orbit => orbit.icons).map((iconId) => (
          <div 
            key={iconId}
            className="item item--icon absolute left-0 top-0 w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center p-3 border border-slate-100 dark:border-slate-700 pointer-events-none"
            data-icon={iconId}
            style={prefersReducedMotion ? {
                // Approximate static positions if motion is reduced
                left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: 0.8, zIndex: 5
            } : {
                left: 0, top: 0
            }}
          >
            <img src={iconUrls[iconId]} alt={`${iconId} icon`} className="w-full h-full object-contain" />
          </div>
        ))}
      </div>
    </>
  );
}

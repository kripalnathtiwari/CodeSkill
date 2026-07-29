import React, { useState, useEffect } from "react";
import { RotateCcw, Clock, Plus, X, Zap, Timer as TimerIcon } from "lucide-react";

interface PracticeTimerProps {
  storageKey?: string;
  defaultMode?: "stopwatch" | "countdown";
  defaultMinutes?: number;
  autoStart?: boolean;
  className?: string;
}

export default function PracticeTimer({
  storageKey = "default_practice_timer",
  defaultMode = "stopwatch",
  defaultMinutes = 30,
  autoStart = true,
  className = ""
}: PracticeTimerProps) {
  // Try loading saved state from localStorage
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem(`codeskill_timer_${storageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          mode: parsed.mode || defaultMode,
          seconds: typeof parsed.seconds === "number" ? parsed.seconds : (defaultMode === "countdown" ? defaultMinutes * 60 : 0),
          isRunning: autoStart,
          targetMinutes: parsed.targetMinutes || defaultMinutes,
        };
      }
    } catch (e) {
      // Ignore errors and fall back to default
    }
    return {
      mode: defaultMode,
      seconds: defaultMode === "countdown" ? defaultMinutes * 60 : 0,
      isRunning: autoStart,
      targetMinutes: defaultMinutes,
    };
  };

  const initial = loadInitialState();
  const [mode, setMode] = useState<"stopwatch" | "countdown">(initial.mode);
  const [seconds, setSeconds] = useState<number>(initial.seconds);
  const [isRunning, setIsRunning] = useState<boolean>(initial.isRunning);
  const [targetMinutes, setTargetMinutes] = useState<number>(initial.targetMinutes);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>(String(initial.targetMinutes));

  // Persist state to localStorage whenever timer updates
  useEffect(() => {
    try {
      localStorage.setItem(
        `codeskill_timer_${storageKey}`,
        JSON.stringify({ mode, seconds, targetMinutes })
      );
    } catch (e) {
      // Ignore quota errors
    }
  }, [mode, seconds, targetMinutes, storageKey]);

  // Main timer loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (mode === "stopwatch") {
            return prev + 1;
          } else {
            if (prev <= 1) {
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  const toggleRun = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(autoStart);
    if (mode === "stopwatch") {
      setSeconds(0);
    } else {
      setSeconds(targetMinutes * 60);
    }
  };

  const handleModeChange = (newMode: "stopwatch" | "countdown") => {
    setMode(newMode);
    setIsRunning(autoStart);
    if (newMode === "stopwatch") {
      setSeconds(0);
    } else {
      setSeconds(targetMinutes * 60);
    }
  };

  const handlePresetSelect = (mins: number) => {
    setTargetMinutes(mins);
    setCustomInput(String(mins));
    setMode("countdown");
    setIsRunning(autoStart);
    setSeconds(mins * 60);
    setShowSettings(false);
  };

  const handleCustomApply = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customInput, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
      handlePresetSelect(parsed);
    }
  };

  const addExtraMinutes = (mins: number) => {
    setSeconds((prev) => prev + mins * 60);
    setIsRunning(true);
  };

  // Format MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, "0");

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const isLowTime = mode === "countdown" && seconds > 0 && seconds <= 60;
  const isTimesUp = mode === "countdown" && seconds === 0;

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      {/* Main Timer Pill */}
      <div
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all duration-300 shadow-sm ${
          isTimesUp
            ? "bg-rose-500/20 border-rose-500/60 text-rose-300 animate-pulse"
            : isLowTime
            ? "bg-amber-500/20 border-amber-500/60 text-amber-300 animate-pulse"
            : isRunning
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600"
        }`}
      >
        {/* Mode Icon / Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-1"
          title="Timer Settings & Presets"
        >
          <TimerIcon className={`w-4 h-4 ${isRunning ? "text-emerald-400" : "text-slate-400"}`} />
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-1 py-0.5 rounded bg-black/30 text-slate-400">
            {mode === "stopwatch" ? "UP" : "DOWN"}
          </span>
        </button>

        {/* Time Display */}
        <div className="font-mono text-sm md:text-base font-bold tracking-wider px-1">
          {formatTime(seconds)}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-1 pl-1 border-l border-slate-700/60">
          {isTimesUp ? (
            <button
              onClick={() => addExtraMinutes(5)}
              className="px-2 py-0.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-md flex items-center space-x-1 transition-colors"
              title="Add 5 Extra Minutes"
            >
              <Plus className="w-3 h-3" />
              <span>5m</span>
            </button>
          ) : null}

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Settings Modal / Popover Menu */}
      {showSettings && (
        <div className="absolute top-12 left-0 z-50 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-200 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Practice Timer</span>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode switch pills */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-4 border border-slate-800">
            <button
              onClick={() => handleModeChange("stopwatch")}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                mode === "stopwatch"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Stopwatch (Up)
            </button>
            <button
              onClick={() => handleModeChange("countdown")}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                mode === "countdown"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Countdown (Down)
            </button>
          </div>

          {/* Countdown Presets */}
          {mode === "countdown" && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Interview Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "15m Warmup", mins: 15 },
                  { label: "30m Standard", mins: 30 },
                  { label: "45m Hard", mins: 45 },
                  { label: "60m Full Test", mins: 60 },
                ].map((preset) => (
                  <button
                    key={preset.mins}
                    onClick={() => handlePresetSelect(preset.mins)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                      targetMinutes === preset.mins
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-800 bg-slate-800/50 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <span>{preset.label}</span>
                    <Zap className="w-3 h-3 text-emerald-400/70" />
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <form onSubmit={handleCustomApply} className="pt-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Custom Minutes (1 - 180)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Mins"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Set
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Timer state is saved automatically while you practice.
          </div>
        </div>
      )}
    </div>
  );
}

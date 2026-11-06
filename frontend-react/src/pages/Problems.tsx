import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DSA_TRACKS } from '../data/dsaPracticeData';
import type { DSAQuestion, DSATrack } from '../data/dsaPracticeData';
import {
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  Target,
  Trophy,
  Search,
  Filter,
  ArrowUpRight,
  RotateCcw,
  Code2,
  Check,
  Flame,
  Layers,
  ChevronRight,
  PartyPopper,
  AlertCircle
} from 'lucide-react';

export default function Problems() {
  const { user } = useAuth();
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  const studentKey = user?.email ? user.email.toLowerCase() : (user?.id || 'guest_student');
  const trackStorageKey = `codeskill_dsa_track_${studentKey}`;
  const unlockedStorageKey = `codeskill_dsa_unlocked_${studentKey}`;
  const solvedStorageKey = `codeskill_dsa_solved_${studentKey}`;

  // State
  const [selectedTrackId, setSelectedTrackId] = useState<'beginner' | 'intermediate' | 'pro' | null>(null);
  const [unlockedTracks, setUnlockedTracks] = useState<string[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');
  const [showLevelUpAlert, setShowLevelUpAlert] = useState<string | null>(null);
  const [lockNotice, setLockNotice] = useState<string | null>(null);

  // Load user track & progress
  useEffect(() => {
    try {
      const savedTrack = localStorage.getItem(trackStorageKey) as 'beginner' | 'intermediate' | 'pro' | null;
      const savedUnlocked = localStorage.getItem(unlockedStorageKey);
      const savedSolved = localStorage.getItem(solvedStorageKey);

      if (savedTrack && ['beginner', 'intermediate', 'pro'].includes(savedTrack)) {
        setSelectedTrackId(savedTrack);
      } else {
        setSelectedTrackId(null); // Triggers first-time onboarding screen
      }

      if (savedUnlocked) {
        setUnlockedTracks(JSON.parse(savedUnlocked));
      } else if (savedTrack) {
        if (savedTrack === 'beginner') setUnlockedTracks(['beginner']);
        else if (savedTrack === 'intermediate') setUnlockedTracks(['beginner', 'intermediate']);
        else if (savedTrack === 'pro') setUnlockedTracks(['beginner', 'intermediate', 'pro']);
      } else {
        setUnlockedTracks(['beginner']);
      }

      const initialSolved = new Set<string>();
      if (savedSolved) {
        try {
          JSON.parse(savedSolved).forEach((id: string) => initialSolved.add(String(id)));
        } catch (e) {}
      }

      // Also check if any were saved in solved_problems_progress
      const altKey = `solved_problems_progress_${studentKey}`;
      const altSolved = localStorage.getItem(altKey);
      if (altSolved) {
        try {
          JSON.parse(altSolved).forEach((id: string) => initialSolved.add(String(id)));
        } catch (e) {}
      }

      setSolvedIds(initialSolved);

      // Keep both storage keys synchronized
      if (initialSolved.size > 0) {
        const arr = Array.from(initialSolved);
        localStorage.setItem(solvedStorageKey, JSON.stringify(arr));
        localStorage.setItem(altKey, JSON.stringify(arr));
        if (user?.email) {
          localStorage.setItem(`solved_problems_progress_${user.email}`, JSON.stringify(arr));
        }
      }
    } catch (e) {
      console.error('Failed to load DSA practice state:', e);
    }
  }, [studentKey]);

  // Handle first-time track selection
  const handleSelectInitialTrack = (trackId: 'beginner' | 'intermediate' | 'pro') => {
    let unlocked: string[] = ['beginner'];
    if (trackId === 'beginner') {
      unlocked = ['beginner'];
    } else if (trackId === 'intermediate') {
      unlocked = ['beginner', 'intermediate'];
    } else if (trackId === 'pro') {
      unlocked = ['beginner', 'intermediate', 'pro'];
    }

    setSelectedTrackId(trackId);
    setUnlockedTracks(unlocked);
    localStorage.setItem(trackStorageKey, trackId);
    localStorage.setItem(unlockedStorageKey, JSON.stringify(unlocked));
  };

  // Reset track selection
  const handleResetTrack = () => {
    if (window.confirm('Do you want to switch or recalibrate your DSA level? Your completed problems will be preserved.')) {
      setSelectedTrackId(null);
    }
  };

  // Switch to another track
  const handleSwitchTrack = (trackId: 'beginner' | 'intermediate' | 'pro') => {
    if (!unlockedTracks.includes(trackId)) {
      const prevTrack = trackId === 'intermediate' ? 'Beginner' : 'Intermediate';
      setLockNotice(`🔒 This track is locked! Complete all problems in ${prevTrack} to unlock.`);
      setTimeout(() => setLockNotice(null), 4000);
      return;
    }
    setSelectedTrackId(trackId);
    localStorage.setItem(trackStorageKey, trackId);
    setSelectedTopic('All');
    setSearchQuery('');
  };

  // Toggle question solved state
  const handleToggleSolved = (questionId: string) => {
    const nextSolved = new Set(solvedIds);
    const wasSolved = nextSolved.has(questionId);

    if (wasSolved) {
      nextSolved.delete(questionId);
    } else {
      nextSolved.add(questionId);
    }

    setSolvedIds(nextSolved);
    const solvedArray = Array.from(nextSolved);
    localStorage.setItem(solvedStorageKey, JSON.stringify(solvedArray));

    // Synchronize to solved_problems_progress for dashboard stats & analytics
    localStorage.setItem(`solved_problems_progress_${studentKey}`, JSON.stringify(solvedArray));
    if (user?.email) {
      localStorage.setItem(`solved_problems_progress_${user.email}`, JSON.stringify(solvedArray));
      localStorage.setItem(`codeskill_dsa_solved_${user.email.toLowerCase().trim()}`, JSON.stringify(solvedArray));

      // Record daily progress for streak & calendar
      import('../utils/progressTracker').then(({ recordDailyProgress }) => {
        recordDailyProgress(user.email, wasSolved ? -1 : 1, wasSolved ? -10 : 10);
      });
    }

    // Check if current track is now fully completed to unlock next level
    if (!wasSolved && currentTrack) {
      const allQuestionsInTrack = currentTrack.questions;
      const allCompleted = allQuestionsInTrack.every(q => q.id === questionId || nextSolved.has(q.id));

      if (allCompleted) {
        if (currentTrack.id === 'beginner' && !unlockedTracks.includes('intermediate')) {
          const newUnlocked = [...unlockedTracks, 'intermediate'];
          setUnlockedTracks(newUnlocked);
          localStorage.setItem(unlockedStorageKey, JSON.stringify(newUnlocked));
          setShowLevelUpAlert('Intermediate');
        } else if (currentTrack.id === 'intermediate' && !unlockedTracks.includes('pro')) {
          const newUnlocked = [...unlockedTracks, 'pro'];
          setUnlockedTracks(newUnlocked);
          localStorage.setItem(unlockedStorageKey, JSON.stringify(newUnlocked));
          setShowLevelUpAlert('Pro / Advance');
        } else {
          setShowLevelUpAlert('completed');
        }
      }
    }
  };

  const currentTrack = useMemo(() => {
    if (!selectedTrackId) return null;
    return DSA_TRACKS.find(t => t.id === selectedTrackId) || DSA_TRACKS[0];
  }, [selectedTrackId]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    if (!currentTrack) return [];
    return currentTrack.questions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.problemNumber && String(q.problemNumber).toLowerCase().includes(searchQuery.toLowerCase())) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTopic = selectedTopic === 'All' || q.topic === selectedTopic;
      const matchesPlatform = selectedPlatform === 'All' || q.platform === selectedPlatform;
      
      const isSolved = solvedIds.has(q.id);
      const matchesStatus = selectedStatus === 'ALL' ||
        (selectedStatus === 'SOLVED' && isSolved) ||
        (selectedStatus === 'UNSOLVED' && !isSolved);

      return matchesSearch && matchesTopic && matchesPlatform && matchesStatus;
    });
  }, [currentTrack, searchQuery, selectedTopic, selectedPlatform, selectedStatus, solvedIds]);

  // Group filtered questions by topic
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, DSAQuestion[]> = {};
    filteredQuestions.forEach(q => {
      if (!groups[q.topic]) {
        groups[q.topic] = [];
      }
      groups[q.topic].push(q);
    });
    return groups;
  }, [filteredQuestions]);

  // Track progress stats
  const trackStats = useMemo(() => {
    if (!currentTrack) return { total: 0, solved: 0, percent: 0 };
    const total = currentTrack.questions.length;
    const solved = currentTrack.questions.filter(q => solvedIds.has(q.id)).length;
    const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { total, solved, percent };
  }, [currentTrack, solvedIds]);

  // Platform badge styler
  const renderPlatformBadge = (platform: DSAQuestion['platform']) => {
    switch (platform) {
      case 'LeetCode':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            LeetCode
          </span>
        );
      case 'GeeksforGeeks':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            GeeksforGeeks
          </span>
        );
      case 'Codeforces':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            Codeforces
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            {platform}
          </span>
        );
    }
  };

  // Difficulty badge styler
  const renderDifficultyBadge = (difficulty: DSAQuestion['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return (
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
            Easy
          </span>
        );
      case 'Medium':
        return (
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">
            Medium
          </span>
        );
      case 'Hard':
        return (
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
            Hard
          </span>
        );
      case 'Div. 2/3':
        return (
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/40">
            Div. 2/3 CP
          </span>
        );
    }
  };

  // =========================================================================
  // VIEW 1: FIRST-TIME STUDENT ONBOARDING / LEVEL SELECTION
  // =========================================================================
  if (!selectedTrackId) {
    return (
      <div className="min-h-screen bg-background dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans" style={{ fontSize: '20px' }}>
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DSA Practice Roadmap</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary dark:text-white tracking-tight">
              Select Your <span className="text-primary">DSA Practice Track</span>
            </h1>
            <p className="text-base text-text-secondary dark:text-text-muted leading-relaxed">
              Welcome! Choose your starting level to build a custom practice track. You will solve curated standard problems from LeetCode, GeeksforGeeks, and Codeforces, track your completions with interactive checkmarks, and unlock advanced tiers as you master each level.
            </p>
          </div>

          {/* Track Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DSA_TRACKS.map((track, idx) => {
              const isBeginner = track.id === 'beginner';
              const isIntermediate = track.id === 'intermediate';
              const isPro = track.id === 'pro';

              return (
                <div
                  key={track.id}
                  className="bg-surface dark:bg-[#151a23] rounded-2xl border border-border dark:border-border/80 shadow-md hover:shadow-xl hover:border-primary/60 dark:hover:border-primary/60 transition-all duration-300 flex flex-col justify-between p-6 relative overflow-hidden group"
                >
                  {/* Top Accent Ribbon */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isBeginner ? 'bg-emerald-500' : isIntermediate ? 'bg-amber-500' : 'bg-indigo-600'
                  }`} />

                  <div className="space-y-5">
                    {/* Badge and Icon */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isBeginner
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : isIntermediate
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {track.badge}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-background dark:bg-slate-800/80 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        {isBeginner && <Sparkles className="w-5 h-5 text-emerald-500" />}
                        {isIntermediate && <Target className="w-5 h-5 text-amber-500" />}
                        {isPro && <Trophy className="w-5 h-5 text-indigo-500" />}
                      </div>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <h2 className="text-xl font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                        {track.title}
                      </h2>
                      <p className="text-xs text-text-muted mt-1 font-medium">
                        {track.tagline}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
                      {track.description}
                    </p>

                    {/* Covered Topics */}
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Key Topics Covered:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {track.topics.map(topic => (
                          <span
                            key={topic}
                            className="text-[11px] font-medium bg-background dark:bg-slate-800/60 text-text-secondary dark:text-slate-300 px-2 py-0.5 rounded border border-border/50"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Problem Counts */}
                    <div className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-primary" />
                      <span>{track.questions.length} Handpicked Problems</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-border/60">
                    <button
                      onClick={() => handleSelectInitialTrack(track.id)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                        isBeginner
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                          : isIntermediate
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                      }`}
                    >
                      <span>Start {track.title.split('/')[0].trim()}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice */}
          <div className="text-center text-xs text-text-muted max-w-xl mx-auto flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary shrink-0" />
            <span>Your progress and checked questions will be saved automatically to your profile.</span>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE DSA PRACTICE DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-background dark:bg-black py-8 px-4 sm:px-6 lg:px-8 font-sans" style={{ fontSize: '20px' }}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Level Up & Congratulations Banner */}
        {showLevelUpAlert && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <PartyPopper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Congratulations! Track Conquered!</h3>
                <p className="text-xs text-white/90">
                  {showLevelUpAlert === 'completed'
                    ? 'You have solved all problems in this track! Amazing work on your problem solving journey.'
                    : `You have successfully unlocked the ${showLevelUpAlert} Track! Ready to level up?`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showLevelUpAlert !== 'completed' && (
                <button
                  onClick={() => {
                    const nextId = showLevelUpAlert.includes('Intermediate') ? 'intermediate' : 'pro';
                    handleSwitchTrack(nextId);
                    setShowLevelUpAlert(null);
                  }}
                  className="px-4 py-2 bg-white text-emerald-800 hover:bg-slate-100 font-bold text-xs rounded-xl shadow transition-colors"
                >
                  Switch to {showLevelUpAlert} →
                </button>
              )}
              <button
                onClick={() => setShowLevelUpAlert(null)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Lock Notification Popup */}
        {lockNotice && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{lockNotice}</span>
          </div>
        )}

        {/* Top Header & Track Selector */}
        <div className="bg-surface dark:bg-[#151a23] rounded-2xl border border-border dark:border-border/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs sm:text-sm font-extrabold px-3 py-1 rounded-lg bg-primary/10 text-primary uppercase tracking-wider">
                  Practice Center
                </span>
                <span className="text-xs sm:text-sm font-semibold text-text-muted">Student DSA Journey</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary dark:text-white">
                DSA <span className="text-primary">Practice</span>
              </h1>
              <p className="text-[20px] sm:text-[21px] font-semibold text-text-secondary dark:text-slate-300 mt-3 max-w-4xl leading-relaxed">
                Solve well-known, high-frequency interview questions across LeetCode, GeeksforGeeks, and Codeforces. Tick off completed problems to advance your tier.
              </p>
            </div>

            <button
              onClick={handleResetTrack}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-border dark:border-border text-text-secondary dark:text-text-muted hover:bg-background dark:hover:bg-slate-800 transition-colors shrink-0 self-start md:self-auto shadow-xs"
              title="Change your starting level or recalibrate"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Change Level</span>
            </button>
          </div>

          {/* Level Switcher Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {DSA_TRACKS.map((track) => {
              const isActive = track.id === selectedTrackId;
              const isUnlocked = unlockedTracks.includes(track.id);
              const trackProblems = track.questions;
              const trackSolved = trackProblems.filter(q => solvedIds.has(q.id)).length;
              const isCompleted = trackProblems.length > 0 && trackSolved === trackProblems.length;

              return (
                <button
                  key={track.id}
                  onClick={() => handleSwitchTrack(track.id)}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-2 ring-primary'
                      : isUnlocked
                      ? 'border-border dark:border-border/80 hover:border-slate-400 dark:hover:border-slate-600 bg-background dark:bg-slate-900/40'
                      : 'border-border/40 bg-background/50 dark:bg-slate-900/20 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black px-2.5 py-1 rounded uppercase tracking-wider ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-surface dark:bg-slate-800 text-text-muted'
                    }`}>
                      {track.badge}
                    </span>
                    <div className="flex items-center gap-1">
                      {isCompleted && (
                        <span title="All problems solved!">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </span>
                      )}
                      {!isUnlocked ? (
                        <Lock className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Unlock className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-[20px] font-bold truncate leading-tight ${isActive ? 'text-primary' : 'text-text-primary dark:text-white'}`}>
                      {track.title}
                    </h3>
                    <div className="flex items-center justify-between text-[18px] sm:text-[20px] font-bold text-text-muted mt-2">
                      <span>{trackSolved} / {trackProblems.length} Solved</span>
                      <span className="font-bold">{Math.round((trackSolved / trackProblems.length) * 100)}%</span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-primary h-full transition-all duration-300 rounded-full"
                      style={{ width: `${(trackSolved / trackProblems.length) * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Level Progress Card */}
          {currentTrack && (
            <div className="bg-background dark:bg-slate-900/60 rounded-xl p-4 sm:p-5 border border-border/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[20px] font-bold text-text-primary dark:text-white">
                      {currentTrack.title} Progress
                    </h4>
                    <p className="text-[18px] sm:text-[20px] font-bold text-text-muted">
                      {currentTrack.tagline}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-primary">
                    {trackStats.solved}
                  </span>
                  <span className="text-[18px] sm:text-[20px] font-bold text-text-muted"> / {trackStats.total} Solved ({trackStats.percent}%)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${trackStats.percent}%` }}
                />
              </div>

              {/* Helpful Hint */}
              <div className="flex items-center justify-between text-[16px] sm:text-[18px] font-bold text-text-muted pt-1">
                <span>💡 Click any question to solve on its original platform. Check the tick box on the right once solved.</span>
                {trackStats.percent === 100 && (
                  <span className="text-emerald-500 font-bold">🎉 Level Complete!</span>
                )}
              </div>
            </div>
          )}

          {/* Search & Filter Controls */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search problem name or #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background dark:bg-slate-900 border border-border rounded-xl text-xs text-text-primary dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Topic Filter */}
              <div>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-background dark:bg-slate-900 border border-border rounded-xl text-xs text-text-primary dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="All">All Topics ({currentTrack?.questions.length})</option>
                  {currentTrack?.topics.map(t => {
                    const count = currentTrack.questions.filter(q => q.topic === t).length;
                    return (
                      <option key={t} value={t}>{t} ({count})</option>
                    );
                  })}
                </select>
              </div>

              {/* Platform Filter */}
              <div>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-background dark:bg-slate-900 border border-border rounded-xl text-xs text-text-primary dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="All">All Platforms</option>
                  <option value="LeetCode">LeetCode</option>
                  <option value="GeeksforGeeks">GeeksforGeeks</option>
                  <option value="Codeforces">Codeforces</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-background dark:bg-slate-900 border border-border rounded-xl text-xs text-text-primary dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Status</option>
                  <option value="SOLVED">Solved Only ({trackStats.solved})</option>
                  <option value="UNSOLVED">Unsolved ({trackStats.total - trackStats.solved})</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Problem List (Grouped by Topic) */}
        {Object.keys(groupedQuestions).length === 0 ? (
          <div className="bg-surface dark:bg-[#151a23] rounded-2xl border border-border p-12 text-center space-y-3">
            <Code2 className="w-10 h-10 text-text-muted mx-auto" />
            <h3 className="text-base font-bold text-text-primary dark:text-white">No questions match your filters</h3>
            <p className="text-xs text-text-muted">Try clearing your search query or setting the filters back to "All".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTopic('All');
                setSelectedPlatform('All');
                setSelectedStatus('ALL');
              }}
              className="mt-2 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedQuestions).map(([topic, questions]) => {
              const topicSolved = questions.filter(q => solvedIds.has(q.id)).length;
              const topicPercent = questions.length > 0 ? Math.round((topicSolved / questions.length) * 100) : 0;

              return (
                <div
                  key={topic}
                  className="bg-surface dark:bg-[#151a23] rounded-2xl border border-border dark:border-border/80 shadow-sm overflow-hidden"
                >
                  {/* Topic Group Header */}
                  <div className="px-5 py-4 border-b border-border/80 bg-background/50 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h2 className="text-[20px] font-bold text-text-primary dark:text-white">
                        {topic}
                      </h2>
                      <span className="text-[18px] sm:text-[20px] text-text-muted font-bold">
                        ({questions.length} problems)
                      </span>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-[18px] sm:text-[20px] text-text-muted font-bold">
                        <span className="text-primary font-black">{topicSolved}</span> / {questions.length} Solved
                      </div>
                      <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${topicPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Problem Rows */}
                  <div className="divide-y divide-border/60">
                    {questions.map((q, idx) => {
                      const isSolved = solvedIds.has(q.id);

                      return (
                        <div
                          key={q.id}
                          className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-background/60 dark:hover:bg-slate-900/40 ${
                            isSolved ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                          }`}
                        >
                          {/* Left: Index, Title, Snippet, Badges */}
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                            <span className="text-[20px] font-bold text-text-muted w-7 text-center shrink-0 mt-0.5 sm:mt-0">
                              {idx + 1}.
                            </span>

                            <div className="min-w-0 flex-1 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <a
                                  href={q.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-[20px] font-bold hover:text-primary transition-colors flex items-center gap-1.5 group ${
                                    isSolved ? 'text-text-primary dark:text-slate-300 line-through opacity-85' : 'text-text-primary dark:text-white'
                                  }`}
                                  title="Open problem in new tab"
                                >
                                  <span>{q.title}</span>
                                  {q.problemNumber && (
                                    <span className="text-[18px] sm:text-[20px] text-text-muted font-bold">
                                      ({q.problemNumber})
                                    </span>
                                  )}
                                  <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </a>

                                {renderPlatformBadge(q.platform)}
                                {renderDifficultyBadge(q.difficulty)}
                              </div>

                              {q.descriptionSnippet && (
                                <p className="text-[18px] sm:text-[20px] font-bold text-text-secondary dark:text-slate-300 line-clamp-1 leading-relaxed">
                                  {q.descriptionSnippet}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Direct Platform Button & Interactive Tick Checkbox */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Solve Link Button */}
                            <a
                              href={q.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-primary px-3 py-1.5 rounded-lg border border-border/80 hover:border-primary/50 bg-background dark:bg-slate-900 transition-colors"
                            >
                              <span>Solve</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>

                            {/* The Interactive Tick Box */}
                            <button
                              onClick={() => handleToggleSolved(q.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all transform active:scale-95 ${
                                isSolved
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                                  : 'bg-background dark:bg-slate-900 border-border dark:border-border text-text-secondary dark:text-slate-300 hover:border-primary hover:text-primary'
                              }`}
                              title={isSolved ? 'Mark as incomplete' : 'Mark as solved'}
                            >
                              <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                                isSolved
                                  ? 'bg-white border-white text-emerald-600'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                {isSolved && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="hidden xs:inline">
                                {isSolved ? 'Solved' : 'Tick'}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

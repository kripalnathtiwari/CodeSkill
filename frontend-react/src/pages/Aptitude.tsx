import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, BrainCircuit, CheckCircle2, ChevronRight, Sparkles,
  Trophy, Target, BookOpen, Layers, ArrowRight, TrendingUp,
  LayoutGrid, List, Building2, RotateCcw, Calculator, Compass,
  Zap, Award, Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { getApiUrl } from "../utils/apiConfig";

// Dynamic topic icons generator
const getTopicIcon = (topic: string) => {
  const lower = topic.toLowerCase();
  if (lower.includes("percent") || lower.includes("profit") || lower.includes("loss")) {
    return <Calculator className="w-6 h-6 text-emerald-500" />;
  }
  if (lower.includes("river") || lower.includes("speed") || lower.includes("distance") || lower.includes("train")) {
    return <Compass className="w-6 h-6 text-sky-500" />;
  }
  if (lower.includes("time") || lower.includes("work")) {
    return <TrendingUp className="w-6 h-6 text-amber-500" />;
  }
  if (lower.includes("reason") || lower.includes("logic") || lower.includes("blood") || lower.includes("series")) {
    return <BrainCircuit className="w-6 h-6 text-purple-500" />;
  }
  return <Target className="w-6 h-6 text-indigo-500" />;
};

// Gradient accent colors per topic
const getTopicColor = (index: number) => {
  const colors = [
    { border: "border-t-emerald-500", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", bar: "from-emerald-500 to-teal-500" },
    { border: "border-t-purple-500", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", bar: "from-purple-500 to-indigo-500" },
    { border: "border-t-sky-500", bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20", bar: "from-sky-500 to-blue-500" },
    { border: "border-t-amber-500", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", bar: "from-amber-500 to-orange-500" },
    { border: "border-t-rose-500", bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", bar: "from-rose-500 to-pink-500" },
  ];
  return colors[index % colors.length];
};

export default function AptitudePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [aptitudeQuestions, setAptitudeQuestions] = useState<any[]>([]);
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Load Aggregates and Problem List
  useEffect(() => {
    const fetchAptitudeData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch aggregates
        const aggResponse = await axios.get(getApiUrl("/api/v1/aptitude-problems/metadata/aggregates"));
        const counts = aggResponse.data.topicCounts || {};
        setTopicCounts(counts);

        // 2. Fetch full list of problems to power search, difficulty & company filters
        const probResponse = await axios.get(getApiUrl("/api/v1/aptitude-problems?limit=500"));
        const dataList = probResponse.data?.data || probResponse.data || [];

        if (Array.isArray(dataList) && dataList.length > 0) {
          setAptitudeQuestions(dataList);
        } else {
          // Fallback if list is empty
          const topicsList = Object.keys(counts).sort();
          setAptitudeQuestions(topicsList.map(t => ({ topic: t, title: t })));
        }
      } catch (error) {
        console.error("Error fetching aptitude data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAptitudeData();

    // Fetch Solved Status for user
    if (user?.email) {
      try {
        const key = `aptitude_analytics_${user.email.toLowerCase()}`;
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        const solved = new Set<string>();
        saved.forEach((q: any) => {
          if (q.correct) solved.add(String(q.id || q._id));
        });
        setSolvedIds(solved);
      } catch (e) {
        console.error("[Aptitude Debug] Error reading analytics", e);
      }
    }
  }, [user]);

  // Unique Companies
  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    aptitudeQuestions.forEach(q => {
      if (q.company && q.company.trim()) {
        companies.add(q.company.trim());
      }
    });
    // Add popular placement recruitment firms if not present
    ["TCS", "Infosys", "Wipro", "Amazon", "Accenture", "Cognizant"].forEach(c => companies.add(c));
    return ["All", ...Array.from(companies).sort()];
  }, [aptitudeQuestions]);

  // Unique Topics
  const uniqueTopics = useMemo(() => {
    const topics = new Set<string>();
    Object.keys(topicCounts).forEach(t => topics.add(t));
    aptitudeQuestions.forEach(q => {
      if (q.topic && q.topic.trim()) topics.add(q.topic.trim());
    });
    return ["All", ...Array.from(topics).sort()];
  }, [topicCounts, aptitudeQuestions]);

  // Group questions by Topic
  const groupedByTopic = useMemo(() => {
    const groups: Record<string, any[]> = {};

    // Seed all known topics
    Object.keys(topicCounts).forEach(t => {
      if (!groups[t]) groups[t] = [];
    });

    aptitudeQuestions.forEach(q => {
      const t = q.topic?.trim() || "Uncategorized";
      if (!groups[t]) groups[t] = [];
      groups[t].push(q);
    });

    return groups;
  }, [aptitudeQuestions, topicCounts]);

  // Filter topics based on search, company, difficulty, topic
  const filteredTopicKeys = useMemo(() => {
    const allTopics = Object.keys(groupedByTopic);

    return allTopics.filter(t => {
      const qList = groupedByTopic[t] || [];
      const matchesTopic = selectedTopic === "All" || t === selectedTopic;
      if (!matchesTopic) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const topicMatches = t.toLowerCase().includes(query);
        const anyQuestionMatches = qList.some((q: any) => 
          (q.title || "").toLowerCase().includes(query) ||
          (q.description || "").toLowerCase().includes(query)
        );
        if (!topicMatches && !anyQuestionMatches) return false;
      }

      // Filter by company
      if (selectedCompany !== "All") {
        const hasCompany = qList.some((q: any) => q.company && q.company.trim().toLowerCase() === selectedCompany.toLowerCase());
        if (!hasCompany) return false;
      }

      // Filter by difficulty
      if (selectedDifficulty !== "All") {
        const hasDifficulty = qList.some((q: any) => q.difficulty && q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
        if (!hasDifficulty && qList.length > 0) return false;
      }

      return true;
    }).sort();
  }, [groupedByTopic, searchQuery, selectedTopic, selectedCompany, selectedDifficulty]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCompany, selectedDifficulty, selectedTopic]);

  const totalFilteredTopics = filteredTopicKeys.length;
  const totalPages = Math.ceil(totalFilteredTopics / ITEMS_PER_PAGE);

  const paginatedTopics = filteredTopicKeys.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Compute Overall Stats
  const totalQuestionsAllTopics = useMemo(() => {
    return Object.values(topicCounts).reduce((a, b) => a + b, 0) || aptitudeQuestions.length;
  }, [topicCounts, aptitudeQuestions]);

  const totalSolvedCount = solvedIds.size;
  const overallPercentage = totalQuestionsAllTopics > 0 
    ? Math.round((totalSolvedCount / totalQuestionsAllTopics) * 100) 
    : 0;

  const handleNavigateTopic = (topic: string) => {
    const targetUrl = window.location.pathname.startsWith('/dashboard')
      ? `/dashboard/aptitude/topic/${encodeURIComponent(topic)}`
      : `/aptitude/topic/${encodeURIComponent(topic)}`;
    navigate(targetUrl);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0B0F19] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-surface to-surface-secondary dark:from-[#111827] dark:to-[#161F30] border border-border dark:border-border/70 p-8 md:p-10 shadow-xl">
          {/* Ambient blur lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-[70px] pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            {/* Left Content */}
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Placement & Aptitude Hub</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-text-primary dark:text-white tracking-tight leading-tight">
                Master <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 bg-clip-text text-transparent">Aptitude & Reasoning</span>
              </h1>

              <p className="text-sm sm:text-base text-text-secondary dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                Prepare for campus placements and technical job rounds. Practice curated quantitative aptitude, logical reasoning, and speed math questions asked by top tech and product companies.
              </p>

              {/* Quick Topic Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {Object.keys(topicCounts).slice(0, 4).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleNavigateTopic(t)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-background/80 dark:bg-slate-800/80 text-text-secondary dark:text-slate-300 hover:text-primary dark:hover:text-primary border border-border/80 transition-all hover:scale-105"
                  >
                    <span>{t}</span>
                    <span className="text-[10px] text-text-muted">({topicCounts[t]})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="bg-background/80 dark:bg-[#0B0F19]/90 backdrop-blur-md rounded-2xl border border-border/80 p-6 shadow-lg flex flex-col justify-between gap-5 min-w-[280px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Your Readiness</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {overallPercentage}% Complete
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-black text-text-primary dark:text-white">
                    {Object.keys(topicCounts).length || 3}
                  </div>
                  <div className="text-xs text-text-muted font-medium flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Practice Topics</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-black text-text-primary dark:text-white">
                    {totalQuestionsAllTopics}
                  </div>
                  <div className="text-xs text-text-muted font-medium flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Questions</span>
                  </div>
                </div>
              </div>

              {/* Readiness Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <div className="flex justify-between text-xs text-text-muted font-medium">
                  <span>Questions Solved</span>
                  <span className="text-primary font-bold">{totalSolvedCount} / {totalQuestionsAllTopics}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, overallPercentage)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SEARCH & CONTROLS TOOLBAR */}
        <div className="bg-surface dark:bg-[#111827] rounded-2xl border border-border/80 p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search topics, questions, formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-text-primary dark:text-white focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-text-muted hover:text-text-primary p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns & Layout View Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-primary dark:text-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="All">All Topics ({uniqueTopics.length - 1})</option>
              {uniqueTopics.filter(t => t !== "All").map(t => (
                <option key={t} value={t}>{t} ({topicCounts[t] || 0})</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-primary dark:text-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Layout Toggle (Grid vs List) */}
            <div className="flex items-center bg-background dark:bg-[#0B0F19] border border-border rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {(selectedDifficulty !== "All" || selectedTopic !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedDifficulty("All");
                  setSelectedTopic("All");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-text-muted hover:text-rose-400 px-2 py-1 rounded-lg transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. TOPICS SECTION */}
        {isLoading ? (
          <div className="p-16 text-center text-text-muted flex flex-col items-center justify-center gap-4 bg-surface dark:bg-[#111827] rounded-3xl border border-border">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Loading practice topics...</span>
          </div>
        ) : paginatedTopics.length === 0 ? (
          <div className="p-16 text-center text-text-muted bg-surface dark:bg-[#111827] rounded-3xl border border-border space-y-4">
            <BrainCircuit className="w-12 h-12 text-text-muted mx-auto opacity-40" />
            <h3 className="text-lg font-bold text-text-primary dark:text-white">No aptitude topics match your filters</h3>
            <p className="text-sm max-w-md mx-auto text-text-muted">
              Try clearing your search query or selecting "All" in the filters above to see all available modules.
            </p>
            <button
              onClick={() => {
                setSelectedCompany("All");
                setSelectedDifficulty("All");
                setSelectedTopic("All");
                setSearchQuery("");
              }}
              className="mt-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTopics.map((topic, idx) => {
              const qCount = topicCounts[topic] ?? groupedByTopic[topic]?.length ?? 0;
              const color = getTopicColor(idx);
              const icon = getTopicIcon(topic);
              const qList = groupedByTopic[topic] || [];
              const solvedInTopic = qList.filter((q: any) => solvedIds.has(String(q._id || q.id))).length;
              const percentInTopic = qCount > 0 ? Math.round((solvedInTopic / qCount) * 100) : 0;
              const isAllSolved = qCount > 0 && solvedInTopic === qCount;

              return (
                <div
                  key={topic}
                  onClick={() => handleNavigateTopic(topic)}
                  className={`bg-surface dark:bg-[#111827] rounded-3xl border border-border/80 dark:border-border/70 hover:border-primary/60 dark:hover:border-primary/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-6 relative overflow-hidden group cursor-pointer border-t-4 ${color.border}`}
                >
                  <div className="space-y-4">
                    {/* Header Row: Badge & Icon */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${color.bg}`}>
                        Quantitative
                      </span>

                      <div className="w-11 h-11 rounded-2xl bg-background dark:bg-[#0B0F19] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        {icon}
                      </div>
                    </div>

                    {/* Topic Title & Subtitle */}
                    <div>
                      <h2 className="text-xl font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors leading-snug">
                        {topic}
                      </h2>
                      <p className="text-xs text-text-muted mt-1">
                        High frequency placement test questions with solutions
                      </p>
                    </div>

                    {/* Metrics Row */}
                    <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-border/60">
                      <span className="text-text-primary dark:text-slate-200 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        <span>{qCount} {qCount === 1 ? 'Problem' : 'Problems'}</span>
                      </span>

                      <span className="text-text-muted">
                        {solvedInTopic} / {qCount} Solved
                      </span>
                    </div>

                    {/* Micro Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${color.bar} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percentInTopic}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary group-hover:text-primary-hover">
                    <span className="flex items-center gap-1">
                      {isAllSolved && <Check className="w-4 h-4 text-emerald-500" />}
                      <span>{isAllSolved ? "Review Questions" : "Start Practicing"}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-3">
            {paginatedTopics.map((topic, idx) => {
              const qCount = topicCounts[topic] ?? groupedByTopic[topic]?.length ?? 0;
              const color = getTopicColor(idx);
              const icon = getTopicIcon(topic);
              const qList = groupedByTopic[topic] || [];
              const solvedInTopic = qList.filter((q: any) => solvedIds.has(String(q._id || q.id))).length;
              const percentInTopic = qCount > 0 ? Math.round((solvedInTopic / qCount) * 100) : 0;

              return (
                <div
                  key={topic}
                  onClick={() => handleNavigateTopic(topic)}
                  className="bg-surface dark:bg-[#111827] border border-border/80 hover:border-primary/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-background dark:bg-[#0B0F19] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors truncate">
                          {topic}
                        </h2>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${color.bg}`}>
                          Quantitative
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {qCount} {qCount === 1 ? 'Problem' : 'Problems'} curated for interview rounds
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[11px] text-text-muted font-semibold">
                        <span>Progress</span>
                        <span>{percentInTopic}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${color.bar} h-full rounded-full transition-all`}
                          style={{ width: `${percentInTopic}%` }}
                        />
                      </div>
                    </div>

                    <button className="inline-flex items-center gap-1 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all group-hover:translate-x-0.5">
                      <span>Practice</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="p-4 border border-border/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between bg-surface dark:bg-[#111827] gap-4 shadow-sm">
            <span className="text-xs font-semibold text-text-muted">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalFilteredTopics)} of {totalFilteredTopics} Topics
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border bg-background dark:bg-[#0B0F19] text-text-primary dark:text-white hover:bg-surface-secondary dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-lg">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border bg-background dark:bg-[#0B0F19] text-text-primary dark:text-white hover:bg-surface-secondary dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

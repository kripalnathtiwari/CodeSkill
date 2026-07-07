import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, BrainCircuit, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Utility to title case
const titleCase = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

export default function AptitudePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [aptitudeQuestions, setAptitudeQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    // Fetch Aptitude Questions
    const aptSaved = localStorage.getItem("admin_aptitude_problems");
    if (aptSaved) {
      setAptitudeQuestions(JSON.parse(aptSaved));
    }
    
    // Fetch Solved Status
    if (user?.email) {
      try {
        const key = `aptitude_analytics_${user.email.toLowerCase()}`;
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        const solved = new Set<string>();
        saved.forEach((q: any) => {
          if (q.correct) solved.add(String(q.id));
        });
        console.log("[Aptitude Debug] user:", user.email, "solved list:", Array.from(solved));
        setSolvedIds(solved);
      } catch (e) {
        console.error("[Aptitude Debug] Error reading analytics", e);
      }
    }
    
    setIsLoading(false);
  }, [user]);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    aptitudeQuestions.forEach(q => {
      if (q.company) {
        companies.add(q.company.trim());
      }
    });
    return ["All", ...Array.from(companies).sort()];
  }, [aptitudeQuestions]);

  const uniqueTopics = useMemo(() => {
    const topics = new Set<string>();
    aptitudeQuestions.forEach(q => {
      if (q.topic) {
        topics.add(q.topic.trim());
      }
    });
    return ["All", ...Array.from(topics).sort()];
  }, [aptitudeQuestions]);

  const filteredAptitude = useMemo(() => {
    return aptitudeQuestions.filter(q => {
      const matchesSearch = (q.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCompany = selectedCompany === "All" || (q.company && q.company.trim() === selectedCompany);
      const matchesDifficulty = selectedDifficulty === "All" || (q.difficulty && q.difficulty === selectedDifficulty);
      const matchesTopic = selectedTopic === "All" || (q.topic && q.topic.trim() === selectedTopic);
      return matchesSearch && matchesCompany && matchesDifficulty && matchesTopic;
    });
  }, [aptitudeQuestions, searchQuery, selectedCompany, selectedDifficulty, selectedTopic]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCompany, selectedDifficulty, selectedTopic]);

  const totalFiltered = filteredAptitude.length;
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);

  // Get current page items
  const paginatedQuestions = filteredAptitude.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 gap-8">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-purple-500" />
            Aptitude & Reasoning Practice
          </h1>

          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-purple-500 text-slate-800 dark:text-slate-200"
              />
            </div>
            
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-purple-500 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {uniqueTopics.map(topic => (
                <option key={topic} value={topic}>{topic === "All" ? "All Topics" : topic}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-purple-500 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Company Filters */}
        <div className="flex flex-wrap gap-2 items-center bg-slate-100/50 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-sm font-semibold text-slate-500 ml-1 mr-2">Filter by Company:</span>
          {uniqueCompanies.map(company => (
            <button
              key={company}
              onClick={() => setSelectedCompany(company)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCompany === company 
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" 
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {company}
            </button>
          ))}
        </div>

        {/* Problem List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading questions...</span>
          </div>
        ) : (
          <div className="space-y-0 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-sm flex flex-col">
            {paginatedQuestions.map((q, idx) => (
              <div
                key={q._id || q.id || idx}
                className={`flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${idx !== paginatedQuestions.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/60' : ''
                  }`}
              >
                <div className="flex items-start space-x-4">
                  <BrainCircuit className="h-5 w-5 mt-0.5 text-purple-500" />
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
                        onClick={() => {
                          if (user) {
                            sessionStorage.setItem('current_aptitude', JSON.stringify(q));
                            navigate(`/aptitude/${q._id || q.id}`);
                          }
                        }}>
                      {q.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className={q.difficulty === "Easy" ? "text-emerald-500" : q.difficulty === "Medium" ? "text-amber-500" : "text-rose-500"}>
                        {q.difficulty || "Easy"}
                      </span>
                      {q.company && (
                        <>
                          <span>•</span>
                          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            {q.company}
                          </span>
                        </>
                      )}
                      {q.topic && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {q.topic}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>Multiple Choice</span>
                    </div>
                  </div>
                </div>

                <div>
                  {!user ? (
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center justify-center space-x-1 font-semibold text-sm px-6 py-2 rounded-lg transition-colors border bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-purple-500 hover:border-purple-500"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Login to Solve</span>
                    </button>
                  ) : solvedIds.has(String(q._id || q.id)) ? (
                    <button
                      onClick={() => {
                        sessionStorage.setItem('current_aptitude', JSON.stringify(q));
                        navigate(`/aptitude/${q._id || q.id}`);
                      }}
                      className="flex items-center justify-center space-x-1 font-semibold text-sm px-6 py-2 rounded-lg transition-colors border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      <span>Solved</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sessionStorage.setItem('current_aptitude', JSON.stringify(q));
                        navigate(`/aptitude/${q._id || q.id}`);
                      }}
                      className="flex items-center justify-center space-x-1 font-semibold text-sm px-6 py-2 rounded-lg transition-colors border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      <span>Solve Question</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {paginatedQuestions.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                No aptitude questions found. Admin can add them via the dashboard.
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalFiltered)} of {totalFiltered} entries
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

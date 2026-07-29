import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, BrainCircuit, Lock, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { getApiUrl } from "../utils/apiConfig";

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
    const fetchAptitude = async () => {
      try {
        const response = await axios.get(getApiUrl("/api/v1/aptitude-problems"));
        
        const parsedProblems = response.data.map((p: any) => {
          let opts = p.options;
          try {
            while (typeof opts === 'string') {
              const parsed = JSON.parse(opts);
              if (parsed === opts || typeof parsed !== 'string' && typeof parsed !== 'object') break;
              opts = parsed;
            }
          } catch(e) {}
          
          return {
            ...p,
            _id: p.id,
            options: opts,
            correctOption: p.correctAnswer || p.correctOption
          };
        });
        setAptitudeQuestions(parsedProblems);
      } catch (error) {
        console.error("Error fetching aptitude questions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAptitude();
    
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

  const groupedByTopic = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredAptitude.forEach(q => {
      const t = q.topic || "Uncategorized";
      if (!groups[t]) groups[t] = [];
      groups[t].push(q);
    });
    return groups;
  }, [filteredAptitude]);

  const topicKeys = Object.keys(groupedByTopic).sort();
  const totalTopics = topicKeys.length;
  const totalPages = Math.ceil(totalTopics / ITEMS_PER_PAGE);

  // Get current page topics
  const paginatedTopics = topicKeys.slice(
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

        {/* Problem List Grouped by Topic */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading topics...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedTopics.map((topic, topicIdx) => (
              <div 
                key={topic} 
                onClick={() => navigate(`/aptitude/topic/${encodeURIComponent(topic)}`)}
                className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-sm flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-lg group-hover:scale-105 transition-transform">
                    <BrainCircuit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {topic}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {groupedByTopic[topic].length} {groupedByTopic[topic].length === 1 ? 'Question' : 'Questions'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>View Questions</span>
                  <ChevronRight className="h-5 w-5 ml-1" />
                </div>
              </div>
            ))}

            {paginatedTopics.length === 0 && (
              <div className="p-12 text-center text-slate-500 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-slate-800">
                No aptitude topics found. Try adjusting your filters.
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between bg-white dark:bg-[#0a0a0a] gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalTopics)} of {totalTopics} topics
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

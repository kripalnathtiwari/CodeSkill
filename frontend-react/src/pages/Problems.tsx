import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../utils/apiConfig";
import { Search, Bookmark, ChevronDown, ListFilter, Check, Lock, Code2, Building2 } from "lucide-react";
import Fuse from "fuse.js";
import { useAuth } from "../context/AuthContext";

const TOPICS = [
  { id: "Array", label: "Arrays" },
  { id: "String", label: "Strings" },
  { id: "Linked List", label: "Linked List" },
  { id: "Hash Table", label: "Hash Tables" },
  { id: "Dynamic Programming", label: "Dynamic Programming" },
  { id: "Tree", label: "Trees" },
  { id: "Database", label: "SQL/Databases" }
];

// COMPANIES removed, will be dynamically generated
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUSES = ["Solved", "Unsolved", "Attempted"];

// Utility to title case
const titleCase = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

export default function ProblemsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showTopicTags, setShowTopicTags] = useState(true);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // State for fetched data
  const [questions, setQuestions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [totalProblems, setTotalProblems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch Questions
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(getApiUrl("/api/v1/questions?limit=100&type=CODING"));
        const fetched = res.data.questions || [];
        const saved = localStorage.getItem("admin_custom_problems");
        if (saved) {
          setQuestions([...fetched, ...JSON.parse(saved)]);
        } else {
          setQuestions(fetched);
        }
        setTotalProblems(res.data.total || 0);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        // Fallback mock
        const mock = [
          {
            _id: "p1",
            title: "Two Sum",
            slug: "two-sum",
            difficulty: "Easy",
            topicTags: [{ name: "Array" }, { name: "HashMap" }],
            content: `Given an integer array nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice. Return the answer in any order.\n\n### Input Format\n- The first line contains an integer n (size of array).\n- The second line contains n space-separated integers.\n- The third line contains the target integer.\n\n### Output Format\n- Print the indices of the two numbers separated by a space.\n\n### Constraints\n- 2 <= n <= 100000\n- -1000000000 <= nums[i] <= 1000000000\n- -1000000000 <= target <= 1000000000\n- Exactly one valid answer exists.\n\n### Examples\n**Example 1:**\n\`\`\`\nInput:\n4\n2 7 11 15\n9\nOutput: 0 1\nExplanation: nums[0] + nums[1] = 9\n\`\`\`\n**Example 2:**\n\`\`\`\nInput:\n3\n3 2 4\n6\nOutput: 1 2\nExplanation: nums[1] + nums[2] = 6\n\`\`\``,
            testCases: [
              { input: "4\n2 7 11 15\n9", output: "0 1", hidden: false },
              { input: "3\n3 2 4\n6", output: "1 2", hidden: false },
              { input: "2\n3 3\n6", output: "0 1", hidden: true },
              { input: "5\n-1 -2 -3 -4 -5\n-8", output: "2 4", hidden: true }
            ],
            defaultCode: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}",
            starterCode: {
              java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}",
              cpp: "#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n vector<int> twoSum(vector<int>& nums, int target){ return {}; }\n};",
              python: "class Solution:\n    def twoSum(self, nums, target):\n        pass",
              javascript: "function twoSum(nums, target) {\n    return [];\n}"
            },
            editorial: "Use a hash map to store visited values and indices."
          },
          { _id: "p2", title: "Add Two Numbers", difficulty: "Medium", topicTags: [{ name: "Linked List" }, { name: "Math" }] },
          { _id: "p3", title: "Median of Two Sorted Arrays", difficulty: "Hard", topicTags: [{ name: "Array" }, { name: "Binary Search" }] },
          { _id: "p4", title: "Longest Palindromic Substring", difficulty: "Medium", topicTags: [{ name: "String" }, { name: "Dynamic Programming" }] },
        ];
        const saved = localStorage.getItem("admin_custom_problems");
        if (saved) {
          setQuestions([...mock, ...JSON.parse(saved)]);
        } else {
          setQuestions(mock);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    // Fetch Submissions if logged in
    const fetchSubmissions = async () => {
      if (!token) return;
      // Completely mock this without hitting the network to avoid browser 403 console errors
      const saved = localStorage.getItem("local_submissions");
      setSubmissions(saved ? JSON.parse(saved) : []);
    };
    fetchSubmissions();
  }, [token]);

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  // Map submission history to question status
  const userStatusMap = useMemo(() => {
    const map = new Map<string, { solved: boolean, attempted: boolean }>();
    submissions.forEach(sub => {
      const existing = map.get(sub.questionId) || { solved: false, attempted: false };
      if (sub.status === "ACCEPTED") existing.solved = true;
      existing.attempted = true;
      map.set(sub.questionId, existing);
    });
    return map;
  }, [submissions]);

  const dynamicCompanies = useMemo(() => {
    const set = new Set<string>();
    questions.forEach(q => {
      let tags: any[] = [];
      if (Array.isArray(q.companies)) tags = q.companies;
      if (Array.isArray(q.companyTags)) tags = [...tags, ...q.companyTags];
      
      tags.forEach((t: any) => {
        const name = typeof t === 'string' ? t : t.name;
        if (name) set.add(name);
      });
    });
    return Array.from(set).sort();
  }, [questions]);

  // Compute exact counts for filters
  const filterCounts = useMemo(() => {
    const counts = {
      topics: {} as Record<string, number>,
      companies: {} as Record<string, number>,
      difficulty: {} as Record<string, number>,
      status: { Solved: 0, Unsolved: 0, Attempted: 0 }
    };

    TOPICS.forEach(t => counts.topics[t.id] = 0);
    dynamicCompanies.forEach(c => counts.companies[c] = 0);
    DIFFICULTIES.forEach(d => counts.difficulty[d] = 0);

    questions.forEach(q => {
      // Difficulty
      const uiDiff = titleCase(q.difficulty);
      if (counts.difficulty[uiDiff] !== undefined) counts.difficulty[uiDiff]++;

      // Topics
      let normalizedTags: string[] = [];
      if (Array.isArray(q.tags)) {
        normalizedTags = q.tags.map((t: any) => typeof t === 'string' ? t : t.name).filter(Boolean);
      } else if (Array.isArray(q.topicTags)) {
        normalizedTags = q.topicTags.map((t: any) => typeof t === 'string' ? t : t.name).filter(Boolean);
      }

      normalizedTags.forEach((tag: string) => {
        const foundKey = Object.keys(counts.topics).find(k => k.toLowerCase() === tag.toLowerCase());
        if (foundKey !== undefined) counts.topics[foundKey]++;
      });

      // Companies
      let cTags: any[] = [];
      if (Array.isArray(q.companies)) cTags = q.companies;
      if (Array.isArray(q.companyTags)) cTags = [...cTags, ...q.companyTags];
      
      cTags.forEach((t: any) => {
        const name = typeof t === 'string' ? t : t.name;
        if (name && counts.companies[name] !== undefined) counts.companies[name]++;
      });

      // Status
      const status = userStatusMap.get(q.id) || { solved: false, attempted: false };
      if (status.solved) {
        counts.status.Solved++;
      } else {
        counts.status.Unsolved++;
        if (status.attempted) counts.status.Attempted++;
      }
    });

    return counts;
  }, [questions, userStatusMap]);

  // Combine questions with their respective status and apply filters
  const filteredQuestions = useMemo(() => {
    // Read local solved
    const localSolvedStr = localStorage.getItem(`solved_problems_progress_${user?.email || "guest"}`);
    const localSolved = localSolvedStr ? JSON.parse(localSolvedStr) : [];

    let processed = questions.map(q => {
      const qId = q._id || q.id;
      const beStatus = userStatusMap.get(qId) || { solved: false, attempted: false };
      const isLocalSolved = localSolved.includes(qId);

      const isSolved = beStatus.solved || isLocalSolved;
      const isAttempted = beStatus.attempted || isLocalSolved;

      let normalizedTags: string[] = [];
      if (Array.isArray(q.tags)) {
        normalizedTags = q.tags.map((t: any) => typeof t === 'string' ? t : t.name).filter(Boolean);
      } else if (Array.isArray(q.topicTags)) {
        normalizedTags = q.topicTags.map((t: any) => typeof t === 'string' ? t : t.name).filter(Boolean);
      }
      const normalizedCompanies = q.companies || (q.companyTags ? q.companyTags.map((c: any) => c.name) : []);

      return {
        ...q,
        tags: normalizedTags,
        companies: normalizedCompanies,
        solved: isSolved,
        attempted: isAttempted,
        uiDifficulty: titleCase(q.difficulty)
      };
    });

    if (searchQuery.trim()) {
      const fuse = new Fuse(processed, {
        keys: ['title', 'tags', 'companies'],
        threshold: 0.4
      });
      processed = fuse.search(searchQuery).map(res => res.item);
    }

    return processed.filter((q) => {
      // Topic match
      const normalizedSelectedTopics = selectedTopics.map(t => t.toLowerCase());
      const matchesTopic = selectedTopics.length === 0 || (q.tags && q.tags.some((t: string) => normalizedSelectedTopics.includes(t.toLowerCase())));

      // Difficulty match
      const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(q.uiDifficulty);

      // Company match
      const matchesCompany = selectedCompanies.length === 0 || (q.companies && q.companies.some((c: string) => selectedCompanies.includes(c)));

      // Status match
      let matchesStatus = selectedStatuses.length === 0;
      if (selectedStatuses.length > 0) {
        if (selectedStatuses.includes("Solved") && q.solved) matchesStatus = true;
        if (selectedStatuses.includes("Unsolved") && !q.solved) matchesStatus = true;
        if (selectedStatuses.includes("Attempted") && q.attempted && !q.solved) matchesStatus = true;
      }

      return matchesTopic && matchesDifficulty && matchesStatus && matchesCompany;
    });
  }, [questions, userStatusMap, searchQuery, selectedTopics, selectedCompanies, selectedDifficulties, selectedStatuses, user?.email]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTopics, selectedCompanies, selectedDifficulties, selectedStatuses]);

  const totalFiltered = filteredQuestions.length;
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);

  // Get current page items
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate dynamic solved count based on current filters
  const currentSolvedCount = filteredQuestions.filter(q => q.solved).length;
  const solvedPercent = totalFiltered > 0 ? ((currentSolvedCount / totalFiltered) * 100).toFixed(0) : "0";

  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 md:p-8 gap-8">

      {/* Left Sidebar Filter */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-8 hidden md:block">

        {/* Companies */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Company</h3>
            {selectedCompanies.length > 0 && (
              <span
                onClick={() => setSelectedCompanies([])}
                className="text-xs text-emerald-500 hover:text-emerald-400 cursor-pointer"
              >
                Clear
              </span>
            )}
          </div>
          <div className="space-y-3 pt-2">
            {dynamicCompanies.length === 0 ? (
              <div className="text-sm text-slate-500">No companies available</div>
            ) : dynamicCompanies.map((company) => {
              const isSelected = selectedCompanies.includes(company);
              return (
                <div
                  key={company}
                  className="flex items-center space-x-3 cursor-pointer group select-none"
                  onClick={() => toggleFilter(selectedCompanies, setSelectedCompanies, company)}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-500'}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm flex items-center justify-between w-full transition-colors ${isSelected ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-700 dark:text-slate-300 group-hover:text-emerald-500"}`}>
                    <span>{company}</span>
                    <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md ml-2">{filterCounts.companies[company] || 0}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Topics</h3>
            <span
              onClick={() => setSelectedTopics([])}
              className={`text-xs cursor-pointer transition-colors ${selectedTopics.length > 0 ? "text-emerald-500 hover:text-emerald-400" : "text-slate-400 dark:text-slate-600"}`}
            >
              Clear All
            </span>
          </div>

          <div
            className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer select-none"
            onClick={() => setShowTopicTags(!showTopicTags)}
          >
            <span className="text-xs text-slate-600 dark:text-slate-400">Show topic tag</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${showTopicTags ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${showTopicTags ? 'right-0.5' : 'left-0.5'}`}></div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic.id);
              return (
                <div
                  key={topic.id}
                  className="flex items-center space-x-3 cursor-pointer group select-none"
                  onClick={() => toggleFilter(selectedTopics, setSelectedTopics, topic.id)}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-500'}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm flex items-center justify-between w-full transition-colors ${isSelected ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-700 dark:text-slate-300 group-hover:text-emerald-500"}`}>
                    <span>{topic.label}</span>
                    <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md ml-2">{filterCounts.topics[topic.id] || 0}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Difficulty</h3>
            {selectedDifficulties.length > 0 && (
              <span
                onClick={() => setSelectedDifficulties([])}
                className="text-xs text-emerald-500 hover:text-emerald-400 cursor-pointer"
              >
                Clear
              </span>
            )}
          </div>
          <div className="space-y-3 pt-2">
            {DIFFICULTIES.map((diff) => {
              const isSelected = selectedDifficulties.includes(diff);
              return (
                <div
                  key={diff}
                  className="flex items-center space-x-3 cursor-pointer group select-none"
                  onClick={() => toggleFilter(selectedDifficulties, setSelectedDifficulties, diff)}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-500'}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm flex items-center justify-between w-full transition-colors ${isSelected ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-700 dark:text-slate-300 group-hover:text-emerald-500"}`}>
                    <span>{diff}</span>
                    <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md ml-2">{filterCounts.difficulty[diff] || 0}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Status</h3>
            {selectedStatuses.length > 0 && (
              <span
                onClick={() => setSelectedStatuses([])}
                className="text-xs text-emerald-500 hover:text-emerald-400 cursor-pointer"
              >
                Clear
              </span>
            )}
          </div>
          <div className="space-y-3 pt-2">
            {STATUSES.map((status) => {
              const isSelected = selectedStatuses.includes(status);
              return (
                <div
                  key={status}
                  className="flex items-center space-x-3 cursor-pointer group select-none"
                  onClick={() => toggleFilter(selectedStatuses, setSelectedStatuses, status)}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-500'}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm flex items-center justify-between w-full transition-colors ${isSelected ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-700 dark:text-slate-300 group-hover:text-emerald-500"}`}>
                    <span>{status}</span>
                    <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md ml-2">{filterCounts.status[status as keyof typeof filterCounts.status] || 0}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">

        {/* Interview Prep Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-500/20 p-3 rounded-xl">
              <Building2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Company Interview Prep</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Targeted problem sets asked in recent interviews by top tech giants.</p>
            </div>
          </div>
          <Link to="/company-problems" className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md">
            Start Preparing
          </Link>
        </div>

        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Popular Problems</h1>

          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <button className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition-colors">
              <ListFilter className="h-4 w-4" />
              <span>Sort: <span className="text-emerald-500 font-medium">Submissions</span></span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-slate-100">{currentSolvedCount}</span> of {totalFiltered} Problems Solved ({solvedPercent} %)
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(0, parseInt(solvedPercent))}%` }}></div>
          </div>
        </div>

        {/* Tags Row */}
        <div className="flex space-x-2">
          <span className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs px-3 py-1 rounded-md font-medium">
            Submissions
          </span>
          {(selectedTopics.length > 0 || selectedCompanies.length > 0 || selectedDifficulties.length > 0 || selectedStatuses.length > 0 || searchQuery !== "") && (
            <span
              onClick={() => {
                setSelectedTopics([]);
                setSelectedCompanies([]);
                setSelectedDifficulties([]);
                setSelectedStatuses([]);
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs px-3 py-1 rounded-md font-medium cursor-pointer hover:bg-rose-500/20 transition-colors"
            >
              Clear Filters
            </span>
          )}
        </div>

        {/* Problem List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading problems...</span>
          </div>
        ) : (
          <div className="space-y-0 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-sm flex flex-col">
            {paginatedQuestions.map((q, idx) => (
              <div
                key={q._id || q.id || idx}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${idx !== paginatedQuestions.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/60' : ''
                  }`}
              >
                <div className="flex items-start space-x-4">
                  <Bookmark className={`h-5 w-5 mt-0.5 cursor-pointer transition-colors ${q.attempted ? "text-amber-500" : "text-slate-400 hover:text-emerald-500"}`} />
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors">
                      {q.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className={q.uiDifficulty === "Easy" ? "text-emerald-500" : q.uiDifficulty === "Medium" ? "text-amber-500" : "text-rose-500"}>
                        {q.uiDifficulty}
                      </span>

                      {showTopicTags && q.tags && q.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex space-x-1">
                            {q.tags.map((tag: string) => (
                              <span key={tag} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </>
                      )}

                      {q.companies && q.companies.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex space-x-1">
                            {q.companies.map((company: string) => (
                              <span key={company} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                {company}
                              </span>
                            ))}
                          </div>
                        </>
                      )}

                      <span>•</span>
                      <span>{q.acceptanceRate ? `${q.acceptanceRate}% Acceptance` : 'New'}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex justify-end">
                  {!user ? (
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center justify-center space-x-1 font-semibold text-sm px-6 py-2 rounded-lg transition-colors border bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-emerald-500 hover:border-emerald-500"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Login to Solve</span>
                    </button>
                  ) : q.solved ? (
                    <button
                      onClick={() => {
                        sessionStorage.setItem('current_problem', JSON.stringify(q));
                        navigate(`/solve/${q._id || q.id || q.slug}`);
                      }}
                      className="flex items-center justify-center space-x-1 bg-emerald-600 text-white font-semibold text-sm px-6 py-2 rounded-lg hover:bg-emerald-500 transition-colors shadow-sm"
                    >
                      <span>Solved</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sessionStorage.setItem('current_problem', JSON.stringify(q));
                        navigate(`/solve/${q._id || q.id || q.slug}`);
                      }}
                      className={`flex items-center justify-center space-x-1 font-semibold text-sm px-6 py-2 rounded-lg transition-colors border ${q.attempted
                        ? "bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400"
                        }`}
                    >
                      <span>Solve</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {paginatedQuestions.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                No problems found matching your criteria.
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

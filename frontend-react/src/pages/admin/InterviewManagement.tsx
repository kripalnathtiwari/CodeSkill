import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { getApiUrl } from "../../utils/apiConfig";
import {
  Plus, Edit, Trash2, Search, Code2, Loader2,
  X, Save, ArrowLeft, AlertTriangle, Building2,
  HelpCircle, CheckCircle2, ChevronRight, FileQuestion,
  Layers, ListChecks, ArrowUpRight
} from "lucide-react";

export interface CompanyCardData {
  name: string;
  category: "Product Based" | "Service Based" | "Fintech" | "Startups";
  iconType: string;
  logoUrl?: string;
}

const DEFAULT_COMPANIES: CompanyCardData[] = [
  { name: "Microsoft", category: "Product Based", iconType: "microsoft" },
  { name: "PayPal", category: "Fintech", iconType: "paypal" },
  { name: "Zscaler", category: "Product Based", iconType: "zscaler" },
  { name: "JP Morgan Chase & Co.", category: "Fintech", iconType: "jpmorgan" },
  { name: "Google", category: "Product Based", iconType: "google" },
  { name: "Accolite", category: "Service Based", iconType: "accolite" },
  { name: "Amazon", category: "Product Based", iconType: "amazon" },
  { name: "Apple", category: "Product Based", iconType: "apple" },
  { name: "Meta", category: "Product Based", iconType: "meta" },
  { name: "Netflix", category: "Product Based", iconType: "default" },
  { name: "Adobe", category: "Product Based", iconType: "default" },
  { name: "TCS", category: "Service Based", iconType: "default" },
  { name: "Infosys", category: "Service Based", iconType: "default" },
  { name: "Wipro", category: "Service Based", iconType: "default" },
  { name: "Razorpay", category: "Fintech", iconType: "default" },
  { name: "Stripe", category: "Fintech", iconType: "default" },
  { name: "Zepto", category: "Startups", iconType: "default" },
  { name: "Cred", category: "Startups", iconType: "default" },
];

function CompanyLogoHeader({ name, iconType, logoUrl }: { name: string; iconType: string; logoUrl?: string }) {
  if (logoUrl) {
    return (
      <div className="flex items-center space-x-2.5 font-bold text-text-primary dark:text-text-inverse text-base truncate">
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="w-6 h-6 object-contain rounded-md shrink-0 bg-surface p-0.5"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
        <span className="truncate">{name}</span>
      </div>
    );
  }

  if (iconType === "microsoft" || name.toLowerCase().includes("microsoft")) {
    return (
      <div className="flex items-center space-x-2 font-bold text-text-primary dark:text-text-inverse text-base">
        <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0">
          <div className="bg-[#f25022] w-full h-full rounded-[1px]" />
          <div className="bg-[#7fba00] w-full h-full rounded-[1px]" />
          <div className="bg-[#00a4ef] w-full h-full rounded-[1px]" />
          <div className="bg-[#ffb900] w-full h-full rounded-[1px]" />
        </div>
        <span>Microsoft</span>
      </div>
    );
  }
  if (iconType === "google" || name.toLowerCase().includes("google")) {
    return (
      <div className="flex items-center space-x-1 font-bold text-base">
        <span className="text-[#4285F4]">G</span>
        <span className="text-[#EA4335]">o</span>
        <span className="text-[#FBBC05]">o</span>
        <span className="text-[#4285F4]">g</span>
        <span className="text-[#34A853]">l</span>
        <span className="text-[#EA4335]">e</span>
      </div>
    );
  }
  if (iconType === "amazon" || name.toLowerCase().includes("amazon")) {
    return (
      <div className="flex items-center space-x-1 font-bold text-text-primary dark:text-text-inverse text-base">
        <span>amazon</span>
        <span className="text-[#FF9900] font-black">↗</span>
      </div>
    );
  }
  return (
    <div className="flex items-center space-x-2 font-bold text-text-primary dark:text-text-inverse text-base truncate">
      <Building2 className="w-4 h-4 text-rose-500 shrink-0" />
      <span className="truncate">{name}</span>
    </div>
  );
}

export default function InterviewManagement() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom companies stored in localStorage
  const [customCompanies, setCustomCompanies] = useState<CompanyCardData[]>([]);

  // Selected Company for managing its questions (null = directory view)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Search filter states
  const [searchCompanyQuery, setSearchCompanyQuery] = useState("");
  const [searchQuestionQuery, setSearchQuestionQuery] = useState("");

  // Modals state
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddMCQModal, setShowAddMCQModal] = useState(false);
  const [showAddCodingModal, setShowAddCodingModal] = useState(false);

  // Editing / Deleting states
  const [editingProblem, setEditingProblem] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Company Form state
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyCategory, setNewCompanyCategory] = useState<"Product Based" | "Service Based" | "Fintech" | "Startups">("Product Based");
  const [newCompanyLogoUrl, setNewCompanyLogoUrl] = useState("");


  // MCQ Form state
  const [mcqTitle, setMcqTitle] = useState("");
  const [mcqDifficulty, setMcqDifficulty] = useState("Easy");
  const [mcqTopics, setMcqTopics] = useState("Aptitude, Core CS");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("A");
  const [mcqExplanation, setMcqExplanation] = useState("");

  // Coding Problem Form state
  const [codingTitle, setCodingTitle] = useState("");
  const [codingDifficulty, setCodingDifficulty] = useState("Medium");
  const [codingTopics, setCodingTopics] = useState("Array, Two Pointers");
  const [codingDescription, setCodingDescription] = useState("");
  const [codingConstraints, setCodingConstraints] = useState("1 <= nums.length <= 10^5");
  const [codingExamples, setCodingExamples] = useState<{ input: string; output: string; explanation: string }[]>([
    { input: "", output: "", explanation: "" }
  ]);
  const [starterCodes, setStarterCodes] = useState<{ [key: string]: string }>({
    javascript: "// write your code here",
    cpp: "// write your code here",
    python: "# write your code here",
    java: "// write your code here"
  });
  const [testCases, setTestCases] = useState<{ input: string; output: string; isHidden: boolean }[]>([
    { input: "", output: "", isHidden: false }
  ]);
  const [codingEditorial, setCodingEditorial] = useState("");

  // Load companies & problems on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await axios.get(getApiUrl("/api/v1/questions/metadata/aggregates?type=INTERVIEW"));
        const companyCounts = res.data.companyCounts || {};
        
        const companySet = new Set<string>();
        DEFAULT_COMPANIES.forEach(c => companySet.add(c.name.toLowerCase()));
        
        const mergedCompanies = [...DEFAULT_COMPANIES];
        Object.keys(companyCounts).forEach(compName => {
          if (compName && compName !== 'Uncategorized' && !companySet.has(compName.toLowerCase())) {
            companySet.add(compName.toLowerCase());
            mergedCompanies.push({
              name: compName,
              category: "Product Based",
              iconType: "default"
            });
          }
        });

        // Add locally stored custom companies
        const savedCompanies = localStorage.getItem("admin_custom_companies");
        if (savedCompanies) {
          const parsed = JSON.parse(savedCompanies);
          setCustomCompanies(parsed);
          parsed.forEach((c: any) => {
            if (c.name && !companySet.has(c.name.toLowerCase())) {
              companySet.add(c.name.toLowerCase());
              mergedCompanies.push(c);
            }
          });
        }
        
        // We do not fetch all problems on mount anymore. Just the directory.
        // Save the merged companies to state if we had a state for it, but we can just use useMemo below based on customCompanies.
        // Actually, we'll store allCompanies directly in state.
        setAllCompaniesState(mergedCompanies);
      } catch (err) {
        console.error("Failed fetching metadata:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const [allCompaniesState, setAllCompaniesState] = useState<CompanyCardData[]>(DEFAULT_COMPANIES);

  // Filtered companies based on search
  const filteredCompanies = useMemo(() => {
    if (!searchCompanyQuery) return allCompaniesState;
    return allCompaniesState.filter(c =>
      c.name.toLowerCase().includes(searchCompanyQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchCompanyQuery.toLowerCase())
    );
  }, [allCompaniesState, searchCompanyQuery]);

  // Fetch problems when a company is selected
  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyQuestions();
    }
  }, [selectedCompany, searchQuestionQuery]);

  const fetchCompanyQuestions = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/questions?limit=50&type=INTERVIEW&company=${encodeURIComponent(selectedCompany!)}`;
      if (searchQuestionQuery) {
        url += `&search=${encodeURIComponent(searchQuestionQuery)}`;
      }
      const res = await axios.get(getApiUrl(url));
      let fetched = res.data.questions || [];
      
      const savedQs = localStorage.getItem("admin_custom_interview_problems");
      if (savedQs) {
        const parsedQs = JSON.parse(savedQs);
        let customQ = parsedQs.filter((q: any) => {
          const tags = q.companyTags || q.companies || [];
          return tags.some((t: any) => (t.name || t).toLowerCase() === selectedCompany!.toLowerCase());
        });
        if (searchQuestionQuery) {
          customQ = customQ.filter((q: any) => (q.title || "").toLowerCase().includes(searchQuestionQuery.toLowerCase()));
        }
        fetched = [...customQ, ...fetched];
      }
      setProblems(fetched);
    } catch (err) {
      console.error("Failed fetching company questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const companyQuestions = problems;

  // We skip detailed counts in directory view for performance.
  const getCompanyStats = (companyName: string) => {
    return { mcqCount: "N/A", codingCount: "N/A", totalCount: "N/A" };
  };

  // Handle saving a new custom company
  const handleAddCompany = () => {
    if (!newCompanyName.trim()) {
      alert("Please enter a company name!");
      return;
    }
    const exists = allCompaniesState.some(c => c.name.toLowerCase() === newCompanyName.trim().toLowerCase());
    if (exists) {
      alert("This company already exists in the list!");
      return;
    }
    const newComp: CompanyCardData = {
      name: newCompanyName.trim(),
      category: newCompanyCategory,
      iconType: "default",
      logoUrl: newCompanyLogoUrl.trim() || undefined
    };
    const updated = [...customCompanies, newComp];
    setCustomCompanies(updated);
    localStorage.setItem("admin_custom_companies", JSON.stringify(updated));
    setNewCompanyName("");
    setNewCompanyLogoUrl("");
    setShowAddCompanyModal(false);
  };

  // Handle deleting a custom company
  const handleDeleteCompany = (compName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${compName}" from companies list?`)) return;
    const updated = customCompanies.filter(c => c.name.toLowerCase() !== compName.toLowerCase());
    setCustomCompanies(updated);
    localStorage.setItem("admin_custom_companies", JSON.stringify(updated));
    if (selectedCompany === compName) {
      setSelectedCompany(null);
    }
  };

  // Reset MCQ Form
  const resetMCQForm = () => {
    setMcqTitle("");
    setMcqDifficulty("Easy");
    setMcqTopics("Aptitude, Core CS");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("A");
    setMcqExplanation("");
    setEditingProblem(null);
  };

  // Reset Coding Form
  const resetCodingForm = () => {
    setCodingTitle("");
    setCodingDifficulty("Medium");
    setCodingTopics("Array, Two Pointers");
    setCodingDescription("");
    setCodingConstraints("1 <= nums.length <= 10^5");
    setCodingExamples([{ input: "", output: "", explanation: "" }]);
    setStarterCodes({
      javascript: "// write your code here",
      cpp: "// write your code here",
      python: "# write your code here",
      java: "// write your code here"
    });
    setTestCases([{ input: "", output: "", isHidden: false }]);
    setCodingEditorial("");
    setEditingProblem(null);
  };

  // Open Edit modal for a question
  const handleOpenEditProblem = (prob: any) => {
    setEditingProblem(prob);
    if (prob.questionType === "MCQ" || prob.type === "MCQ") {
      setMcqTitle(prob.title || prob.statement || "");
      setMcqDifficulty(prob.difficulty || "Easy");
      const topicsStr = Array.isArray(prob.topicTags)
        ? prob.topicTags.map((t: any) => t.name || t).join(", ")
        : prob.topicTags || "";
      setMcqTopics(topicsStr);
      const opts = prob.options || {};
      setOptionA(opts.A || opts[0] || "");
      setOptionB(opts.B || opts[1] || "");
      setOptionC(opts.C || opts[2] || "");
      setOptionD(opts.D || opts[3] || "");
      setCorrectOption(prob.correctOption || prob.correctAnswer || "A");
      setMcqExplanation(prob.explanation || prob.editorial || "");
      setShowAddMCQModal(true);
    } else {
      setCodingTitle(prob.title || "");
      setCodingDifficulty(prob.difficulty || "Medium");
      const topicsStr = Array.isArray(prob.topicTags)
        ? prob.topicTags.map((t: any) => t.name || t).join(", ")
        : prob.topicTags || "";
      setCodingTopics(topicsStr);
      setCodingDescription(prob.content || prob.description || "");
      setCodingConstraints(Array.isArray(prob.constraints) ? prob.constraints.join("\n") : (prob.constraints || ""));
      setCodingExamples(prob.examples || [{ input: "", output: "", explanation: "" }]);
      setStarterCodes(prob.starterCode || prob.starterCodes || {
        javascript: "// write your code here",
        cpp: "// write your code here",
        python: "# write your code here",
        java: "// write your code here"
      });
      setTestCases(prob.testCases || [{ input: "", output: "", isHidden: false }]);
      setCodingEditorial(prob.editorial || "");
      setShowAddCodingModal(true);
    }
  };

  // Save MCQ Question
  const handleSaveMCQ = async () => {
    if (!selectedCompany) return;
    if (!mcqTitle.trim() || !optionA.trim() || !optionB.trim()) {
      alert("Please fill in Question title and at least Options A and B.");
      return;
    }
    const questionObj = {
      _id: editingProblem?._id || "custom-interview-mcq-" + Date.now() + Math.random().toString(36).substr(2, 4),
      id: editingProblem?.id || "custom-interview-mcq-" + Date.now() + Math.random().toString(36).substr(2, 4),
      title: mcqTitle.trim(),
      statement: mcqTitle.trim(),
      difficulty: mcqDifficulty,
      type: "INTERVIEW",
      questionType: "MCQ",
      topicTags: mcqTopics.split(",").map(t => ({ name: t.trim() })).filter(t => t.name),
      companyTags: [{ name: selectedCompany }],
      companies: [{ name: selectedCompany }],
      options: {
        A: optionA.trim(),
        B: optionB.trim(),
        C: optionC.trim(),
        D: optionD.trim()
      },
      correctOption: correctOption,
      correctAnswer: correctOption,
      explanation: mcqExplanation.trim(),
      editorial: mcqExplanation.trim()
    };

    const savedRaw = localStorage.getItem("admin_custom_interview_problems");
    const existing: any[] = savedRaw ? JSON.parse(savedRaw) : [];
    let newSavedList: any[];
    if (editingProblem) {
      newSavedList = existing.map(p => (p._id === editingProblem._id || p.id === editingProblem.id) ? questionObj : p);
      if (!newSavedList.some(p => p._id === questionObj._id)) {
        newSavedList.push(questionObj);
      }
    } else {
      newSavedList = [questionObj, ...existing];
    }
    localStorage.setItem("admin_custom_interview_problems", JSON.stringify(newSavedList));

    // Also update state
    setProblems(prev => {
      if (editingProblem) {
        return prev.map(p => (p._id === editingProblem._id || p.id === editingProblem.id) ? questionObj : p);
      }
      return [questionObj, ...prev];
    });

    setShowAddMCQModal(false);
    resetMCQForm();
  };

  // Save Coding Problem
  const handleSaveCoding = async () => {
    if (!selectedCompany) return;
    if (!codingTitle.trim() || !codingDescription.trim()) {
      alert("Please enter Problem Title and Description.");
      return;
    }
    const questionObj = {
      _id: editingProblem?._id || "custom-interview-coding-" + Date.now() + Math.random().toString(36).substr(2, 4),
      id: editingProblem?.id || "custom-interview-coding-" + Date.now() + Math.random().toString(36).substr(2, 4),
      title: codingTitle.trim(),
      slug: codingTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      difficulty: codingDifficulty,
      type: "INTERVIEW",
      questionType: "CODING",
      topicTags: codingTopics.split(",").map(t => ({ name: t.trim() })).filter(t => t.name),
      companyTags: [{ name: selectedCompany }],
      companies: [{ name: selectedCompany }],
      content: codingDescription.trim(),
      constraints: codingConstraints.split("\n").filter(Boolean),
      examples: codingExamples,
      starterCode: starterCodes,
      testCases: testCases,
      editorial: codingEditorial.trim()
    };

    const savedRaw = localStorage.getItem("admin_custom_interview_problems");
    const existing: any[] = savedRaw ? JSON.parse(savedRaw) : [];
    let newSavedList: any[];
    if (editingProblem) {
      newSavedList = existing.map(p => (p._id === editingProblem._id || p.id === editingProblem.id) ? questionObj : p);
      if (!newSavedList.some(p => p._id === questionObj._id)) {
        newSavedList.push(questionObj);
      }
    } else {
      newSavedList = [questionObj, ...existing];
    }
    localStorage.setItem("admin_custom_interview_problems", JSON.stringify(newSavedList));

    setProblems(prev => {
      if (editingProblem) {
        return prev.map(p => (p._id === editingProblem._id || p.id === editingProblem.id) ? questionObj : p);
      }
      return [questionObj, ...prev];
    });

    setShowAddCodingModal(false);
    resetCodingForm();
  };

  // Delete question
  const handleDeleteQuestion = async () => {
    if (!deleteConfirmId) return;
    const savedRaw = localStorage.getItem("admin_custom_interview_problems");
    if (savedRaw) {
      const existing: any[] = JSON.parse(savedRaw);
      const filtered = existing.filter(p => p._id !== deleteConfirmId && p.id !== deleteConfirmId);
      localStorage.setItem("admin_custom_interview_problems", JSON.stringify(filtered));
    }

    try {
      if (!deleteConfirmId.startsWith("custom-")) {
        await axios.delete(getApiUrl(`/api/v1/questions/${deleteConfirmId}`));
      }
    } catch (e) {
      console.log("Only local copy deleted or backend call ignored");
    }

    setProblems(prev => prev.filter(p => p._id !== deleteConfirmId && p.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  const isCustomProblem = (id: string) => id?.toString().startsWith("custom-");

  return (
    <div className="space-y-6">
      {/* LEVEL 1: COMPANIES LIST DIRECTORY */}
      {!selectedCompany ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h1 className="text-2xl font-bold text-text-inverse flex items-center">
                <Building2 className="w-7 h-7 mr-3 text-rose-500" />
                Company Interview Preparation
              </h1>
              <p className="text-sm text-text-muted mt-1">
                Step 1: Select or add a company to manage its MCQ and Coding interview questions.
              </p>
            </div>
            <button
              onClick={() => setShowAddCompanyModal(true)}
              className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-text-inverse font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Company</span>
            </button>
          </div>

          {/* Company Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search companies by name or category..."
              value={searchCompanyQuery}
              onChange={(e) => setSearchCompanyQuery(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-inverse placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
            />
          </div>

          {/* Companies Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCompanies.map((comp) => {
                const stats = getCompanyStats(comp.name);
                const isCustom = customCompanies.some(c => c.name.toLowerCase() === comp.name.toLowerCase());
                return (
                  <div
                    key={comp.name}
                    onClick={() => {
                      setSelectedCompany(comp.name);
                      setSearchQuestionQuery("");
                    }}
                    className="group bg-slate-900/80 hover:bg-slate-900 border border-border hover:border-rose-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-rose-500/5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <CompanyLogoHeader name={comp.name} iconType={comp.iconType} />
                        <div className="flex items-center space-x-1">
                          {isCustom && (
                            <button
                              onClick={(e) => handleDeleteCompany(comp.name, e)}
                              className="text-text-muted hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                              title="Delete Company"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-text-secondary font-semibold uppercase tracking-wider">
                          {comp.category}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-border/80">
                        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-border/40">
                          <div className="text-[10px] font-bold text-text-muted uppercase">MCQ Questions</div>
                          <div className="text-base font-extrabold text-purple-400 mt-0.5">{stats.mcqCount}</div>
                        </div>
                        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-border/40">
                          <div className="text-[10px] font-bold text-text-muted uppercase">Coding Problems</div>
                          <div className="text-base font-extrabold text-primary mt-0.5">{stats.codingCount}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border/80 flex items-center justify-between text-xs font-semibold text-rose-400 group-hover:text-rose-300">
                      <span>Manage Questions</span>
                      <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* LEVEL 2: INSIDE SELECTED COMPANY -> ADD & MANAGE QUESTIONS (MCQ / CODING) */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCompany(null)}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-text-muted hover:text-text-inverse transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Companies List</span>
              </button>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-text-inverse flex items-center">
                  <CompanyLogoHeader
                    name={selectedCompany}
                    iconType={allCompaniesState.find(c => c.name.toLowerCase() === selectedCompany.toLowerCase())?.iconType || "default"}
                    logoUrl={allCompaniesState.find(c => c.name.toLowerCase() === selectedCompany.toLowerCase())?.logoUrl}
                  />
                  <span className="ml-3 text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Interview Preparation
                  </span>
                </h1>
              </div>
              <p className="text-sm text-text-muted">
                Add and manage MCQ questions or Coding problems specifically for {selectedCompany}.
              </p>
            </div>

            {/* Action buttons for MCQ & Coding */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  resetMCQForm();
                  setShowAddMCQModal(true);
                }}
                className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-text-inverse font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 transition-all text-sm"
              >
                <HelpCircle className="w-4 h-4" />
                <span>+ Add MCQ Question</span>
              </button>

              <button
                onClick={() => {
                  resetCodingForm();
                  setShowAddCodingModal(true);
                }}
                className="inline-flex items-center space-x-2 bg-primary hover:bg-blue-700 text-text-inverse font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all text-sm"
              >
                <Code2 className="w-4 h-4" />
                <span>+ Add Coding Problem</span>
              </button>
            </div>
          </div>

          {/* Search bar inside company */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder={`Search questions inside ${selectedCompany}...`}
              value={searchQuestionQuery}
              onChange={(e) => setSearchQuestionQuery(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-inverse placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
            />
          </div>

          {/* Company Questions Table */}
          <div className="bg-slate-900/60 border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-slate-900/80 text-text-muted text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Title / Question</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Difficulty</th>
                    <th className="px-6 py-4">Topics</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                        Loading questions...
                      </td>
                    </tr>
                  ) : companyQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                        No questions found for {selectedCompany}.
                      </td>
                    </tr>
                  ) : (
                    companyQuestions.map((q) => {
                      const isMcq = q.questionType === "MCQ" || q.type === "MCQ";
                      const diff = (q.difficulty || "EASY").toUpperCase();
                      const topics = Array.isArray(q.topicTags)
                        ? q.topicTags.map((t: any) => t.name || t)
                        : (q.topicTags ? q.topicTags.split(",") : []);

                      return (
                        <tr key={q._id || q.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-medium text-text-inverse">
                            <div className="flex items-center space-x-2">
                              {isMcq ? (
                                <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                              ) : (
                                <Code2 className="w-4 h-4 text-primary shrink-0" />
                              )}
                              <span className="truncate max-w-md">{q.title || q.statement}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isMcq ? (
                              <span className="text-xs px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
                                MCQ
                              </span>
                            ) : (
                              <span className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold border border-primary/20">
                                Coding
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                              diff === "EASY"
                                ? "bg-primary/10 text-primary"
                                : diff === "MEDIUM"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}>
                              {diff}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {topics.slice(0, 3).map((t: string, i: number) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-text-secondary">
                                  {t}
                                </span>
                              ))}
                              {topics.length > 3 && (
                                <span className="text-[10px] px-1.5 py-0.5 text-text-muted">+{topics.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenEditProblem(q)}
                                className="p-1.5 text-text-muted hover:text-primary hover:bg-slate-800 rounded-lg transition-colors"
                                title="Edit Question"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(q._id || q.id)}
                                className="p-1.5 text-text-muted hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Delete Question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL: ADD COMPANY */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-border rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text-inverse flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-rose-500" />
                Add New Company
              </h3>
              <button onClick={() => setShowAddCompanyModal(false)} className="text-text-muted hover:text-text-inverse">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stripe, Capgemini, Zomato"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                  Category
                </label>
                <select
                  value={newCompanyCategory}
                  onChange={(e) => setNewCompanyCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-rose-500"
                >
                  <option value="Product Based">Product Based</option>
                  <option value="Service Based">Service Based</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Startups">Startups</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                  Company Logo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://logo.clearbit.com/stripe.com"
                  value={newCompanyLogoUrl}
                  onChange={(e) => setNewCompanyLogoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Paste a direct link to the logo image. It will display on company cards.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowAddCompanyModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-text-muted hover:text-text-inverse bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCompany}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-text-inverse bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
              >
                Add Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MCQ QUESTION */}
      {showAddMCQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-border rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text-inverse flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-purple-400" />
                {editingProblem ? "Edit MCQ Question" : `Add MCQ Question to ${selectedCompany}`}
              </h3>
              <button onClick={() => { setShowAddMCQModal(false); resetMCQForm(); }} className="text-text-muted hover:text-text-inverse">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                  Question Statement
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter the MCQ question statement..."
                  value={mcqTitle}
                  onChange={(e) => setMcqTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={mcqDifficulty}
                    onChange={(e) => setMcqDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-purple-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                    Topic Tags
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Array, Time Complexity, OS"
                    value={mcqTopics}
                    onChange={(e) => setMcqTopics(e.target.value)}
                    className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold uppercase text-text-muted">
                  Options (Select Correct Answer)
                </label>
                {(["A", "B", "C", "D"] as const).map((optLetter) => (
                  <div key={optLetter} className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-border">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOption === optLetter}
                      onChange={() => setCorrectOption(optLetter)}
                      className="w-4 h-4 text-purple-600 accent-purple-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-text-secondary w-6">{optLetter}.</span>
                    <input
                      type="text"
                      placeholder={`Option ${optLetter}`}
                      value={
                        optLetter === "A" ? optionA :
                        optLetter === "B" ? optionB :
                        optLetter === "C" ? optionC : optionD
                      }
                      onChange={(e) => {
                        if (optLetter === "A") setOptionA(e.target.value);
                        if (optLetter === "B") setOptionB(e.target.value);
                        if (optLetter === "C") setOptionC(e.target.value);
                        if (optLetter === "D") setOptionD(e.target.value);
                      }}
                      className="flex-1 bg-transparent text-sm text-text-inverse focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                  Explanation / Editorial (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why the selected option is correct..."
                  value={mcqExplanation}
                  onChange={(e) => setMcqExplanation(e.target.value)}
                  className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <button
                onClick={() => { setShowAddMCQModal(false); resetMCQForm(); }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-text-muted hover:text-text-inverse bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMCQ}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-text-inverse bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
              >
                Save MCQ Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CODING PROBLEM */}
      {showAddCodingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-border rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text-inverse flex items-center">
                <Code2 className="w-5 h-5 mr-2 text-primary" />
                {editingProblem ? "Edit Coding Problem" : `Add Coding Problem to ${selectedCompany}`}
              </h3>
              <button onClick={() => { setShowAddCodingModal(false); resetCodingForm(); }} className="text-text-muted hover:text-text-inverse">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                    Problem Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Find Peak Element"
                    value={codingTitle}
                    onChange={(e) => setCodingTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={codingDifficulty}
                    onChange={(e) => setCodingDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-primary"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                  Topic Tags
                </label>
                <input
                  type="text"
                  placeholder="e.g. Array, Binary Search, DP"
                  value={codingTopics}
                  onChange={(e) => setCodingTopics(e.target.value)}
                  className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                  Problem Description (Markdown)
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the problem, input format, output format..."
                  value={codingDescription}
                  onChange={(e) => setCodingDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                  Constraints (One per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="1 <= nums.length <= 10^5"
                  value={codingConstraints}
                  onChange={(e) => setCodingConstraints(e.target.value)}
                  className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-primary font-mono"
                />
              </div>

              {/* Starter code */}
              <div>
                <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                  JavaScript Starter Code
                </label>
                <textarea
                  rows={3}
                  value={starterCodes.javascript || ""}
                  onChange={(e) => setStarterCodes({ ...starterCodes, javascript: e.target.value })}
                  className="w-full bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-text-inverse focus:outline-none focus:border-primary font-mono"
                />
              </div>

              {/* Test Cases */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase text-text-muted">
                    Test Cases
                  </label>
                  <button
                    type="button"
                    onClick={() => setTestCases([...testCases, { input: "", output: "", isHidden: false }])}
                    className="text-xs text-primary hover:underline"
                  >
                    + Add Test Case
                  </button>
                </div>

                {testCases.map((tc, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-950 p-3 rounded-xl border border-border items-center">
                    <input
                      type="text"
                      placeholder="Input"
                      value={tc.input}
                      onChange={(e) => {
                        const copy = [...testCases];
                        copy[idx].input = e.target.value;
                        setTestCases(copy);
                      }}
                      className="col-span-5 bg-slate-900 border border-border rounded-lg px-3 py-1.5 text-xs text-text-inverse"
                    />
                    <input
                      type="text"
                      placeholder="Expected Output"
                      value={tc.output}
                      onChange={(e) => {
                        const copy = [...testCases];
                        copy[idx].output = e.target.value;
                        setTestCases(copy);
                      }}
                      className="col-span-5 bg-slate-900 border border-border rounded-lg px-3 py-1.5 text-xs text-text-inverse"
                    />
                    <div className="col-span-2 flex items-center justify-end space-x-2">
                      <label className="text-[11px] text-text-muted flex items-center">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => {
                            const copy = [...testCases];
                            copy[idx].isHidden = e.target.checked;
                            setTestCases(copy);
                          }}
                          className="mr-1"
                        />
                        Hidden
                      </label>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setTestCases(testCases.filter((_, i) => i !== idx))}
                          className="text-text-muted hover:text-rose-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <button
                onClick={() => { setShowAddCodingModal(false); resetCodingForm(); }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-text-muted hover:text-text-inverse bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCoding}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-text-inverse bg-primary hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Save Coding Problem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-border rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-inverse">Delete Question?</h3>
            <p className="text-sm text-text-muted">
              This action cannot be undone. The question will be permanently removed.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-text-muted hover:text-text-inverse bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuestion}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-text-inverse bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

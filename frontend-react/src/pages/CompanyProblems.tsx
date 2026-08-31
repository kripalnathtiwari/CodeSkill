import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Search,
  ChevronRight,
  ChevronDown,
  Flame,
  Home,
  CheckCircle2,
  Award,
  ArrowUpRight,
  ArrowLeft,
  Code2,
  Briefcase,
  Users,
  Globe,
  Sparkles,
  Menu,
  X,
  FileText,
  Eye,
  Maximize2
} from "lucide-react";
import axios from "axios";
import { getApiUrl } from "../utils/apiConfig";
import { useAuth } from "../context/AuthContext";

const SECTIONS = ["MCQ", "CODING"];
const CATEGORIES = ["All", "Product Based", "Service Based", "Fintech", "Startups"];

export interface CompanyCardData {
  name: string;
  category: "Product Based" | "Service Based" | "Fintech" | "Startups";
  iconType: "microsoft" | "paypal" | "zscaler" | "jpmorgan" | "google" | "accolite" | "amazon" | "apple" | "meta" | "default" | string;
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

// Render custom logo headers matching the screenshot style
function CompanyLogoHeader({ name, iconType, logoUrl }: { name: string; iconType: string; logoUrl?: string }) {
  if (logoUrl) {
    return (
      <div className="flex items-center justify-center space-x-2 font-bold text-slate-950 text-sm sm:text-base tracking-tight truncate px-1">
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="w-5 h-5 object-contain rounded shrink-0 bg-surface p-0.5"
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
      <div className="flex items-center justify-center space-x-1.5 font-bold text-slate-950 text-sm sm:text-base tracking-tight">
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
  if (iconType === "paypal" || name.toLowerCase().includes("paypal")) {
    return (
      <div className="flex items-center justify-center space-x-1.5 font-extrabold text-[#003087] text-sm sm:text-base tracking-tight">
        <div className="flex -space-x-1 font-black text-base italic">
          <span className="text-[#003087]">P</span>
          <span className="text-[#0079C1]">P</span>
        </div>
        <span className="text-slate-950 font-bold">PayPal</span>
      </div>
    );
  }
  if (iconType === "zscaler" || name.toLowerCase().includes("zscaler")) {
    return (
      <div className="flex items-center justify-center space-x-1.5 font-bold text-slate-950 text-sm sm:text-base tracking-tight">
        <span className="text-primary font-extrabold text-lg">Z</span>
        <span>zscaler</span>
      </div>
    );
  }
  if (iconType === "jpmorgan" || name.toLowerCase().includes("jp morgan") || name.toLowerCase().includes("jpmorgan")) {
    return (
      <div className="flex items-center justify-center space-x-1.5 font-bold text-slate-950 text-xs sm:text-sm tracking-tight">
        <div className="w-3.5 h-3.5 rounded-sm bg-[#5C4033] border border-[#A0522D] flex items-center justify-center text-[8px] text-text-inverse font-extrabold">
          JP
        </div>
        <span>JPMorganChase</span>
      </div>
    );
  }
  if (iconType === "google" || name.toLowerCase().includes("google")) {
    return (
      <div className="flex items-center justify-center font-extrabold text-sm sm:text-base tracking-tight">
        <span className="text-[#4285F4]">G</span>
        <span className="text-[#EA4335]">o</span>
        <span className="text-[#FBBC05]">o</span>
        <span className="text-[#4285F4]">g</span>
        <span className="text-[#34A853]">l</span>
        <span className="text-[#EA4335]">e</span>
      </div>
    );
  }
  if (iconType === "accolite" || name.toLowerCase().includes("accolite")) {
    return (
      <div className="flex items-center justify-center space-x-1.5 font-bold text-slate-950 text-sm sm:text-base tracking-tight">
        <span className="text-[#FF6B00] font-black text-lg">A</span>
        <span>Accolite</span>
      </div>
    );
  }
  if (iconType === "amazon" || name.toLowerCase().includes("amazon")) {
    return (
      <div className="flex items-center justify-center space-x-1 font-bold text-slate-950 text-sm sm:text-base tracking-tight">
        <span>amazon</span>
        <span className="text-[#FF9900] font-black text-sm">↗</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-1.5 font-bold text-slate-950 text-sm sm:text-base tracking-tight truncate px-1">
      <Building2 className="w-4 h-4 text-text-primary shrink-0" />
      <span className="truncate">{name}</span>
    </div>
  );
}

// Render custom illustration circle matching the screenshot
function CompanyCircleIllustration({ iconType, name, logoUrl }: { iconType: string; name: string; logoUrl?: string }) {
  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0066cc] flex items-center justify-center shadow-lg border-2 border-white/40 text-text-inverse relative overflow-hidden">
      {logoUrl ? (
        <div className="w-full h-full flex items-center justify-center bg-surface p-2">
          <img
            src={logoUrl}
            alt={name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      ) : iconType === "microsoft" || name.toLowerCase().includes("microsoft") ? (
        <div className="grid grid-cols-2 gap-1 w-8 h-8 sm:w-10 sm:h-10 rotate-3">
          <div className="bg-[#f25022] rounded-sm shadow-sm" />
          <div className="bg-[#7fba00] rounded-sm shadow-sm" />
          <div className="bg-[#00a4ef] rounded-sm shadow-sm" />
          <div className="bg-[#ffb900] rounded-sm shadow-sm" />
        </div>
      ) : iconType === "paypal" || name.toLowerCase().includes("paypal") ? (
        <div className="flex flex-col items-center justify-center">
          <Users className="w-8 h-8 sm:w-9 sm:h-9 text-amber-200" />
          <div className="text-[9px] font-bold bg-surface/20 px-1.5 py-0.5 rounded mt-0.5">Tie</div>
        </div>
      ) : iconType === "zscaler" || name.toLowerCase().includes("zscaler") ? (
        <div className="flex flex-col items-center justify-center">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 animate-pulse" />
          <div className="text-[8px] font-bold bg-surface/20 px-1.5 py-0.5 rounded mt-0.5">Speed</div>
        </div>
      ) : iconType === "jpmorgan" || name.toLowerCase().includes("jp morgan") || name.toLowerCase().includes("jpmorgan") ? (
        <div className="flex flex-col items-center justify-center">
          <Briefcase className="w-8 h-8 sm:w-9 sm:h-9 text-blue-300" />
          <div className="text-[8px] font-bold bg-surface/20 px-1.5 py-0.5 rounded mt-0.5">Finance</div>
        </div>
      ) : iconType === "google" || name.toLowerCase().includes("google") ? (
        <div className="flex flex-col items-center justify-center">
          <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
          <div className="text-[8px] font-bold bg-surface/20 px-1.5 py-0.5 rounded mt-0.5">Cloud</div>
        </div>
      ) : iconType === "accolite" || name.toLowerCase().includes("accolite") ? (
        <div className="flex flex-col items-center justify-center">
          <Code2 className="w-8 h-8 sm:w-9 sm:h-9 text-purple-300" />
          <div className="text-[8px] font-bold bg-surface/20 px-1.5 py-0.5 rounded mt-0.5">Tech</div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Building2 className="w-8 h-8 sm:w-9 sm:h-9 text-sky-200" />
          <span className="text-[10px] font-bold mt-0.5 truncate max-w-[48px]">{name.slice(0, 4)}</span>
        </div>
      )}
    </div>
  );
}

export default function CompanyProblems() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [testSeriesList, setTestSeriesList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<CompanyCardData[]>(DEFAULT_COMPANIES);
  const [isLoading, setIsLoading] = useState(true);

  // View state: "directory" (card grid) or "problems" (company practice view)
  const [activeView, setActiveView] = useState<"directory" | "problems">("directory");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [problemSearchQuery, setProblemSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("MCQ");

  // New UI states
  const [selectedTestSeries, setSelectedTestSeries] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modulesExpanded, setModulesExpanded] = useState(true);
  const [mcqModulesExpanded, setMcqModulesExpanded] = useState(false);

  // Pagination for problems view
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const takenTests = useMemo(() => {
    if (!user?.email) return new Set<string>();
    try {
      const allScores = JSON.parse(localStorage.getItem("all_student_scores") || "[]");
      const myScores = allScores.filter((s: any) => s.studentEmail === user.email);
      return new Set(myScores.map((s: any) => String(s.testId)));
    } catch {
      return new Set<string>();
    }
  }, [user]);

  const solvedCodingProblems = useMemo(() => {
    if (!user?.email) return new Set<string>();
    try {
      const solved = JSON.parse(localStorage.getItem(`solved_problems_progress_${user.email}`) || "[]");
      return new Set<string>(solved.map(String));
    } catch {
      return new Set<string>();
    }
  }, [user]);

  // Fetch company metadata for the directory grid
  useEffect(() => {
    const fetchCompanies = async () => {
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

        const customCompsRaw = localStorage.getItem("admin_custom_companies");
        if (customCompsRaw) {
          const customComps = JSON.parse(customCompsRaw);
          customComps.forEach((c: any) => {
            if (c.name && !companySet.has(c.name.toLowerCase())) {
              companySet.add(c.name.toLowerCase());
              mergedCompanies.push(c);
            }
          });
        }

        setCompaniesList(mergedCompanies);
      } catch (err) {
        console.error("Failed to fetch companies metadata:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const fetchCompanyQuestions = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      let url = `/api/v1/questions?limit=50&type=INTERVIEW&company=${encodeURIComponent(selectedCompany)}`;

      if (problemSearchQuery.trim()) {
        url += `&search=${encodeURIComponent(problemSearchQuery.trim())}`;
      }
      if (isLoadMore && nextCursor) {
        url += `&cursor=${nextCursor}`;
      }

      const res = await axios.get(getApiUrl(url));
      let fetchedQuestions = res.data.questions || [];

      // Still check local custom questions if not loading more and no strict search
      if (!isLoadMore && !problemSearchQuery) {
        try {
          const savedCustom = localStorage.getItem("admin_custom_interview_problems");
          if (savedCustom) {
            let customQuestions = JSON.parse(savedCustom);

            // Filter custom ones by company
            customQuestions = customQuestions.filter((q: any) => {
              const tags = q.companyTags || q.companies || [];
              return tags.some((t: any) => (t.name || t).toLowerCase() === selectedCompany.toLowerCase());
            });

            fetchedQuestions = [...customQuestions, ...fetchedQuestions];
          }
        } catch (e) {
          console.warn("Could not load custom interview problems from local storage", e);
        }
      }

      if (isLoadMore) {
        setQuestions(prev => [...prev, ...fetchedQuestions]);
      } else {
        setQuestions(fetchedQuestions);
      }

      setHasMore(res.data.hasMore);
      setNextCursor(res.data.nextCursor);
    } catch (err: any) {
      console.error('Failed to fetch company questions:', err);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };


  // Fetch questions for the selected company
  useEffect(() => {
    if (activeView === "problems" && selectedCompany) {
      fetchCompanyQuestions(false);
    }
  }, [activeView, selectedCompany, selectedSection, problemSearchQuery]);

  // Fetch test series for the selected company
  useEffect(() => {
    if (activeView === "problems" && selectedCompany) {
      const savedTS = localStorage.getItem("admin_company_test_series");
      if (savedTS) {
        const allTS = JSON.parse(savedTS);
        const filteredTS = allTS.filter((ts: any) => (ts.companyName || ts.company || '').toLowerCase() === selectedCompany.toLowerCase());
        setTestSeriesList(filteredTS);
      }
    }
  }, [activeView, selectedCompany]);

  // Filtered companies for directory grid
  const filteredCompanies = useMemo(() => {
    return companiesList.filter((company) => {
      const matchCategory = selectedCategory === "All" || company.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [companiesList, selectedCategory, searchQuery]);

  // Active questions filtered by section
  const activeQuestions = useMemo(() => {
    return questions.filter((q: any) => {
      const isMcq = q.questionType === "MCQ" || q.type === "MCQ";
      if (selectedSection === "MCQ") return isMcq;
      return !isMcq;
    });
  }, [questions, selectedSection]);

  const handleStartPreparing = (companyName: string) => {
    setSelectedCompany(companyName);
    setActiveView("problems");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToDirectory = () => {
    setActiveView("directory");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-10 lg:p-12 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary dark:text-text-inverse">
          Company Preparation
        </h1>
        <div className="flex items-center text-xs sm:text-sm font-medium text-text-muted dark:text-text-muted space-x-1.5">
          <Home className="w-4 h-4 text-text-muted shrink-0" />
          <button onClick={handleBackToDirectory} className="hover:text-primary dark:hover:text-primary transition-colors">
            Home
          </button>
          <span>/</span>
          {activeView === "directory" ? (
            <span className="text-primary dark:text-primary font-semibold">Company Preparation</span>
          ) : (
            <>
              <button
                onClick={handleBackToDirectory}
                className="hover:text-primary dark:hover:text-primary transition-colors"
              >
                Company Preparation
              </button>
              <span>/</span>
              <span className="text-primary dark:text-primary font-semibold">{selectedCompany}</span>
            </>
          )}
        </div>
      </div>

      {activeView === "directory" ? (
        <>
          {/* Top Filter and Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="bg-surface-secondary dark:bg-background/80 p-1.5 rounded-full border border-border/80 dark:border-border flex items-center space-x-1 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === category
                      ? "bg-surface dark:bg-slate-800 text-primary dark:text-primary shadow-sm font-semibold border border-border/60 dark:border-border"
                      : "text-text-secondary dark:text-text-muted hover:text-text-primary dark:hover:text-text-secondary"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface dark:bg-background border border-border dark:border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-500/20 text-text-primary dark:text-text-inverse placeholder-slate-400 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Company Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-16 text-center text-text-muted text-sm">
                Loading companies...
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="col-span-full py-16 text-center text-text-muted text-sm">
                No companies found matching your filter.
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <div
                  key={company.name}
                  className="bg-surface dark:bg-background rounded-2xl border border-border dark:border-border/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Body */}
                  <div className="p-5 sm:p-6 flex gap-4 sm:gap-5 items-start">
                    {/* Left Box (Yellow/Gold Card Banner) */}
                    <div className="w-36 h-40 sm:w-40 sm:h-44 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-400 to-yellow-500 p-3 sm:p-3.5 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-sm">
                      {/* Logo Header */}
                      <CompanyLogoHeader name={company.name} iconType={company.iconType} logoUrl={company.logoUrl} />

                      {/* Subtitle */}
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-950 uppercase tracking-tight mt-0.5">
                        Interview Prepration
                      </span>

                      {/* Blue Circle Illustration */}
                      <CompanyCircleIllustration iconType={company.iconType} name={company.name} logoUrl={company.logoUrl} />
                    </div>

                    {/* Right Side (Company Details & Checklist) */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-inverse truncate">
                        {company.name}
                      </h2>

                      <div className="text-[10px] sm:text-[11px] font-bold text-text-muted dark:text-text-muted uppercase tracking-wider mt-2.5 sm:mt-3 mb-2">
                        PREPARATION INCLUDES:
                      </div>

                      <ul className="space-y-1.5 sm:space-y-2">
                        <li className="flex items-center text-xs sm:text-[13px] text-text-primary dark:text-text-secondary font-medium">
                          <CheckCircle2 className="text-primary shrink-0 h-4 w-4 mr-2" />
                          <span className="truncate">{company.name} Interview Practise Set</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-[13px] text-text-primary dark:text-text-secondary font-medium">
                          <CheckCircle2 className="text-primary shrink-0 h-4 w-4 mr-2" />
                          <span>Coding Assessments</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-[13px] text-text-primary dark:text-text-secondary font-medium">
                          <CheckCircle2 className="text-primary shrink-0 h-4 w-4 mr-2" />
                          <span>Technical MCQ Assessments</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-[13px] text-text-primary dark:text-text-secondary font-medium">
                          <CheckCircle2 className="text-primary shrink-0 h-4 w-4 mr-2" />
                          <span className="truncate">CS Fundamentals MCQ Assessments</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3.5 bg-background/70 dark:bg-background/70 border-t border-slate-100 dark:border-border/80 flex items-center justify-between">
                    <div className="inline-flex items-center justify-center p-2 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-primary dark:text-primary">
                      <Award className="w-5 h-5" />
                    </div>

                    <button
                      onClick={() => handleStartPreparing(company.name)}
                      className="bg-[#0066cc] hover:bg-blue-700 text-text-inverse text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg inline-flex items-center space-x-1.5 shadow-sm hover:shadow transition-all group"
                    >
                      <span>Start Preparing</span>
                      <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Company Problems Practice View (when a user clicks "Start Preparing") */
        <div className="space-y-6">
          {/* Back button */}
          <div>
            <button
              onClick={handleBackToDirectory}
              className="inline-flex items-center space-x-2 text-sm font-semibold text-primary dark:text-primary hover:underline transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Company Preparation</span>
            </button>
          </div>

          {/* New Header Banner for Selected Company */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 p-8 flex flex-col md:flex-row md:items-center justify-between shadow-xl mb-6 border border-blue-500/30">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

            <div className="relative z-10 space-y-6 max-w-2xl">
              <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-widest border border-white/20 rounded-full px-4 py-1.5 w-fit bg-white/10 backdrop-blur-sm">
                <Award className="w-3.5 h-3.5" />
                <span>ALGOTUTOR PRACTICE</span>
                <span>|</span>
                <span>INTERVIEW PREPARATION</span>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0">
                  {companiesList.find(c => c.name.toLowerCase() === selectedCompany?.toLowerCase())?.logoUrl ? (
                    <img
                      src={companiesList.find(c => c.name.toLowerCase() === selectedCompany?.toLowerCase())?.logoUrl}
                      alt={`${selectedCompany} logo`}
                      className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <CompanyCircleIllustration iconType={companiesList.find(c => c.name.toLowerCase() === selectedCompany?.toLowerCase())?.iconType || "default"} name={selectedCompany} />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white flex flex-col space-y-1">
                    <span>{selectedCompany}</span>
                    <span className="text-xl sm:text-3xl font-semibold text-blue-100">Interview Preparation</span>
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 text-white/95 text-xs sm:text-sm font-medium hover:bg-black/30 transition-colors">
                  <Code2 className="w-4 h-4" />
                  <span>Company-Specific Preparation</span>
                </div>
                <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 text-white/95 text-xs sm:text-sm font-medium hover:bg-black/30 transition-colors">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span>Expert-Led Content</span>
                </div>
                <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 text-white/95 text-xs sm:text-sm font-medium hover:bg-black/30 transition-colors">
                  <Award className="w-4 h-4 text-yellow-300" />
                  <span>Real Interview Experience</span>
                </div>
                <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 text-white/95 text-xs sm:text-sm font-medium hover:bg-black/30 transition-colors">
                  <Users className="w-4 h-4 text-emerald-300" />
                  <span>Career Success</span>
                </div>
              </div>
            </div>

            {/* Right side graphic approximation */}
            <div className="hidden md:flex relative z-10 items-center justify-center pr-8">
              <div className="bg-white rounded-2xl shadow-2xl p-7 relative w-72 h-64 flex flex-col transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-slate-100">
                <div className="flex items-center space-x-3 mb-5">
                  {companiesList.find(c => c.name.toLowerCase() === selectedCompany?.toLowerCase())?.logoUrl ? (
                    <img
                      src={companiesList.find(c => c.name.toLowerCase() === selectedCompany?.toLowerCase())?.logoUrl}
                      alt={`${selectedCompany} logo`}
                      className="h-7 w-7 object-contain"
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-blue-600" />
                  )}
                  <span className="font-extrabold text-slate-800 text-lg">{selectedCompany}</span>
                </div>
                <h3 className="font-black text-3xl leading-tight text-slate-900 mb-2">
                  Interview<br/>
                  <span className="text-blue-600">Preparation</span>
                </h3>
                <p className="text-[11px] font-bold text-slate-500 mt-auto flex space-x-1">
                  <span className="text-slate-700">Practice.</span>
                  <span className="text-blue-600">Prepare.</span>
                  <span className="text-slate-900">Succeed.</span>
                </p>
                
                {/* Floating clipboard icon approximation */}
                <div className="absolute -right-14 top-6 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-[5px] border-blue-600 w-24 h-36 flex flex-col items-center justify-center overflow-hidden transform -rotate-6">
                  <div className="w-12 h-3 bg-blue-600 rounded-b-md absolute top-0"></div>
                  <div className="space-y-3 mt-4 w-full px-4">
                    <div className="flex items-center space-x-2"><CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" /><div className="h-1.5 bg-slate-200 w-full rounded-full"></div></div>
                    <div className="flex items-center space-x-2"><CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" /><div className="h-1.5 bg-slate-200 w-full rounded-full"></div></div>
                    <div className="flex items-center space-x-2"><CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" /><div className="h-1.5 bg-slate-200 w-full rounded-full"></div></div>
                    <div className="flex items-center space-x-2"><CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" /><div className="h-1.5 bg-slate-200 w-8 rounded-full"></div></div>
                  </div>
                  
                  {/* Floating logo circle over clipboard */}
                  <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-white rounded-full shadow-lg border-2 border-slate-100 flex items-center justify-center">
                    {companiesList.find(c => c.name.toLowerCase() === selectedCompany?.toLowerCase())?.logoUrl ? (
                      <img src={companiesList.find(c => c.name.toLowerCase() === selectedCompany?.toLowerCase())?.logoUrl} className="w-8 h-8 object-contain" />
                    ) : (
                      <Building2 className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </div>
                
                {/* Decorative dots */}
                <div className="absolute top-4 left-4 grid grid-cols-3 gap-1">
                  {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 bg-blue-200 rounded-full"></div>)}
                </div>
                <div className="absolute bottom-16 right-4 grid grid-cols-3 gap-1 opacity-50">
                  {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 bg-slate-300 rounded-full"></div>)}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            {!selectedTestSeries ? (
              // COURSE CONTENT ACCORDION VIEW (Screenshot 3)
              <div className="bg-white dark:bg-background rounded-2xl border border-border dark:border-border/80 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-border dark:border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="flex items-center space-x-3 text-slate-900 dark:text-white">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold">Course Content</h2>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-300">
                      <FileText className="w-4 h-4" />
                      <span>2 Sections</span>
                    </span>
                    <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-300">
                      <FileText className="w-4 h-4" />
                      <span>{testSeriesList.length} Lessons</span>
                    </span>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4">
                  {/* CODING ASSESSMENT ACCORDION */}
                  <div className="rounded-xl border border-border dark:border-border/60 overflow-hidden bg-white dark:bg-slate-900/30">
                    <button 
                      onClick={() => setModulesExpanded(!modulesExpanded)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <ChevronRight className={`w-5 h-5 text-blue-600 transition-transform ${modulesExpanded ? 'rotate-90' : ''}`} />
                        <Code2 className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                          {selectedCompany} Coding Assessment
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold whitespace-nowrap hidden sm:block">
                        {testSeriesList.length} Lessons
                      </span>
                    </button>
                    
                    {modulesExpanded && (
                      <div className="border-t border-slate-100 dark:border-border/50 divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/30 dark:bg-transparent">
                        {testSeriesList.length === 0 ? (
                          <div className="p-6 text-center text-sm text-text-muted">No coding test series available.</div>
                        ) : (
                          testSeriesList.map((ts, idx) => {
                            const qCount = questions.filter(q => q.testSeriesTags?.some((t:any) => t.name === ts.name)).length;
                            return (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 pl-12 hover:bg-white dark:hover:bg-slate-800/40 transition-colors gap-4">
                                <div className="flex items-center space-x-3 min-w-0">
                                  <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
                                  <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-text-inverse truncate">{ts.name}</span>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end sm:space-x-6 w-full sm:w-auto">
                                  <div className="flex items-center space-x-1.5 text-text-muted text-xs sm:text-sm font-medium">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{qCount} Questions</span>
                                  </div>
                                  <button 
                                    onClick={() => setSelectedTestSeries(ts.name)}
                                    className="bg-[#0066cc] hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-colors shadow-sm shrink-0"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* MCQ ASSESSMENT ACCORDION */}
                  <div className="rounded-xl border border-border dark:border-border/60 overflow-hidden bg-white dark:bg-slate-900/30">
                    <button 
                      onClick={() => setMcqModulesExpanded(!mcqModulesExpanded)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <ChevronRight className={`w-5 h-5 text-blue-600 transition-transform ${mcqModulesExpanded ? 'rotate-90' : ''}`} />
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                          {selectedCompany} MCQ Assessment
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold whitespace-nowrap hidden sm:block">
                        0 Lessons
                      </span>
                    </button>
                    
                    {mcqModulesExpanded && (
                      <div className="border-t border-slate-100 dark:border-border/50 bg-slate-50/30 dark:bg-transparent">
                        <div className="p-6 text-center text-sm text-text-muted">No MCQ test series available for this company yet.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
                // TABLE VIEW (Screenshot 2)
                <div className="bg-white dark:bg-background rounded-2xl border border-border dark:border-border/80 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-border dark:border-border/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-500 dark:text-text-muted uppercase tracking-wider">
                      Practice Problems
                    </h2>
                    <button
                      onClick={() => setSelectedTestSeries(null)}
                      className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Course Content</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-[#e6f2ff] dark:bg-slate-800/80 text-[#0066cc] dark:text-blue-300 text-[11px] sm:text-xs font-extrabold uppercase tracking-wide">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4 text-center">Difficulty</th>
                          <th className="px-6 py-4 text-center">Score</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-center">Latest Submission</th>
                          <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                        {(() => {
                          const tsQuestions = questions.filter(q => q.testSeriesTags?.some((t: any) => t.name === selectedTestSeries));
                          if (tsQuestions.length === 0) {
                            return (
                              <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                  No practice problems found in this set.
                                </td>
                              </tr>
                            );
                          }
                          return tsQuestions.map((q) => {
                            const isCoding = q.questionType === "CODING" || q.type === "CODING";
                            const isSolved = isCoding ? solvedCodingProblems.has(String(q._id || q.id)) : false;
                            const diff = (q.difficulty || "EASY").toUpperCase();

                            return (
                              <tr key={q._id || q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-text-inverse truncate max-w-xs">
                                  {q.title || q.statement}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded uppercase ${diff === "EASY" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                      diff === "MEDIUM" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                        "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                    }`}>
                                    {diff}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-slate-800 dark:text-text-inverse">
                                  0
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {isSolved ? (
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-50 text-green-600 border border-green-200">
                                      Solved
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-50 text-rose-500 border border-rose-200">
                                      Unsolved
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center text-text-muted font-medium">
                                  -
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {isCoding ? (
                                    <Link
                                      to={`/solve/${q._id || q.id}`}
                                      className="inline-flex items-center justify-center bg-[#0066cc] hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors shadow-sm"
                                    >
                                      Solve
                                    </Link>
                                  ) : (
                                    <Link
                                      to={`/take-test/${encodeURIComponent(selectedTestSeries)}`}
                                      className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors shadow-sm"
                                      title="Take Full Test"
                                    >
                                      Take Test
                                    </Link>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
      )}
    </div>
  );
}

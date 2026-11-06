import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  Maximize2,
  Target,
  Layers,
  Clock,
  BookOpen,
  Check
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
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get("view") === "problems" ? "problems" : "directory";
  const selectedCompany = searchParams.get("company") || "";
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [problemSearchQuery, setProblemSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("MCQ");

  useEffect(() => {
    setVisibleCount(9);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 9);
        }
      },
      { threshold: 0.1 }
    );
    
    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isLoading, selectedCategory, searchQuery]);

  // New UI states
  const [selectedTestSeries, setSelectedTestSeries] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modulesExpanded, setModulesExpanded] = useState(false);
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
    setSearchParams({ view: "problems", company: companyName });
    setModulesExpanded(false);
    setMcqModulesExpanded(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToDirectory = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-10 lg:p-12 w-full space-y-6 sm:space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary dark:text-text-inverse">
          Company Preparation
        </h1>
        <div className="flex items-center text-xs sm:text-sm font-medium text-text-muted dark:text-text-muted space-x-1.5">
          <Home className="w-4 h-4 text-text-muted shrink-0" />
          <Link to="/" className="hover:text-primary dark:hover:text-primary transition-colors">
            Home
          </Link>
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
              <>
                {filteredCompanies.slice(0, visibleCount).map((company) => (
                  <div
                    key={company.name}
                    className="bg-surface dark:bg-[#0B0F19] rounded-2xl border border-border dark:border-border/80 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col p-6 group"
                  >
                    {/* Card Header */}
                    <div className="flex items-center space-x-4 mb-5">
                      <div className="shrink-0 scale-75 origin-left -my-2 -ml-2">
                        <CompanyCircleIllustration iconType={company.iconType} name={company.name} logoUrl={company.logoUrl} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-text-primary dark:text-text-inverse truncate">
                          {company.name}
                        </h2>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Interview Preparation
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="flex-1 mb-6">
                      <ul className="space-y-3">
                        <li className="flex items-start text-sm text-text-primary dark:text-text-secondary font-medium">
                          <CheckCircle2 className="text-emerald-500 shrink-0 h-4 w-4 mr-3 mt-0.5" />
                          <span className="leading-snug">Comprehensive {company.name} Interview Practice Set</span>
                        </li>
                        <li className="flex items-start text-sm text-text-primary dark:text-text-secondary font-medium">
                          <CheckCircle2 className="text-emerald-500 shrink-0 h-4 w-4 mr-3 mt-0.5" />
                          <span className="leading-snug">Coding & Algorithmic Assessments</span>
                        </li>
                        <li className="flex items-start text-sm text-text-primary dark:text-text-secondary font-medium">
                          <CheckCircle2 className="text-emerald-500 shrink-0 h-4 w-4 mr-3 mt-0.5" />
                          <span className="leading-snug">Technical & CS Fundamentals MCQ</span>
                        </li>
                      </ul>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-5 border-t border-border flex items-center justify-between mt-auto">
                      <div className="flex items-center text-xs font-bold text-text-muted">
                        <Award className="w-4 h-4 mr-1.5 text-emerald-500" />
                        <span>Premium Prep</span>
                      </div>
                      <button
                        onClick={() => handleStartPreparing(company.name)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl inline-flex items-center space-x-2 shadow-sm transition-all group-hover:scale-[1.02]"
                      >
                        <span>Start Preparing</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {visibleCount < filteredCompanies.length && (
                  <div ref={loadMoreRef} className="col-span-full py-8 flex justify-center text-text-muted text-sm font-medium animate-pulse">
                    Loading more...
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        /* Company Problems Practice View (when a user clicks "Start Preparing") */
        <div className="space-y-6">
          {(() => {
            const codingQuestions = questions.filter(q => q.questionType === "CODING" || q.type === "CODING");
            const solvedCodingCount = codingQuestions.filter(q => solvedCodingProblems.has(String(q.id || q._id))).length;
            const takenMcqCount = testSeriesList.filter(ts => takenTests.has(String(ts.name))).length;
            const totalItems = codingQuestions.length + testSeriesList.length;
            const totalCompleted = solvedCodingCount + takenMcqCount;
            const readinessPct = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
            const currentCompanyObj = companiesList.find(c => c.name.toLowerCase() === selectedCompany?.toLowerCase());

            return (
              <>
                {/* Enterprise Company Hero Banner */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a101f] via-[#101b33] to-[#0a1329] p-6 sm:p-8 lg:p-10 border border-slate-700/60 shadow-2xl text-white">
                  {/* Subtle Background Glow Orbs */}
                  <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    {/* Left: Branding, Titles, Badges */}
                    <div className="space-y-6 max-w-2xl">
                      {/* Top Pill */}
                      <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-sky-300 uppercase tracking-widest border border-sky-400/30 rounded-full px-4 py-1.5 bg-sky-500/10 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span>INTERVIEW PREPARATION</span>
                        <span className="text-white/30">•</span>
                        <span>{selectedCompany.toUpperCase()} RECRUITMENT TRACK</span>
                      </div>

                      {/* Company Header Block */}
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl p-2.5 sm:p-3 shadow-xl flex items-center justify-center shrink-0 border border-white/20">
                          {currentCompanyObj?.logoUrl ? (
                            <img
                              src={currentCompanyObj.logoUrl}
                              alt={`${selectedCompany} logo`}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <CompanyCircleIllustration iconType={currentCompanyObj?.iconType || "default"} name={selectedCompany} />
                          )}
                        </div>

                        <div>
                          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex flex-wrap items-baseline gap-2">
                            <span>{selectedCompany}</span>
                            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-indigo-200">
                              Interview Preparation
                            </span>
                          </h1>
                          <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1.5 leading-relaxed">
                            Master online assessments and technical rounds with curated coding challenges and diagnostic MCQs for {selectedCompany}.
                          </p>
                        </div>
                      </div>

                      {/* Feature Pills */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold backdrop-blur-sm hover:bg-white/10 transition-colors">
                          <Code2 className="w-4 h-4 text-emerald-400" />
                          <span>Company-Specific Preparation</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold backdrop-blur-sm hover:bg-white/10 transition-colors">
                          <Flame className="w-4 h-4 text-amber-400" />
                          <span>Expert-Led Content</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold backdrop-blur-sm hover:bg-white/10 transition-colors">
                          <Award className="w-4 h-4 text-sky-400" />
                          <span>Real Interview Experience</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold backdrop-blur-sm hover:bg-white/10 transition-colors">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span>Career Success</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Modern Readiness Hub Card */}
                    <div className="w-full lg:w-84 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/15 shadow-2xl relative shrink-0">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                          <Target className="w-4 h-4" />
                          <span>READINESS MATRIX</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {readinessPct === 100 ? "Ready!" : "In Progress"}
                        </span>
                      </div>

                      <div className="py-4 space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                          <span>Overall Track Completion</span>
                          <span className="font-bold text-white">{readinessPct}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${readinessPct}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coding Solved</div>
                            <div className="text-base sm:text-lg font-black text-white mt-1">
                              <span className="text-emerald-400">{solvedCodingCount}</span>
                              <span className="text-slate-400 text-xs font-normal"> / {codingQuestions.length}</span>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MCQ Completed</div>
                            <div className="text-base sm:text-lg font-black text-white mt-1">
                              <span className="text-sky-400">{takenMcqCount}</span>
                              <span className="text-slate-400 text-xs font-normal"> / {testSeriesList.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-medium text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Practice. Prepare. Succeed.</span>
                        </span>
                        <span className="text-sky-300 font-bold">2 Assessment Rounds</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full">
                  {!selectedTestSeries ? (
                    /* COURSE CONTENT ACCORDION VIEW */
                    <div className="bg-surface dark:bg-[#121826] rounded-2xl border border-border dark:border-border/80 shadow-sm overflow-hidden">
                      {/* Course Content Header */}
                      <div className="p-5 sm:p-6 border-b border-border/80 dark:border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50 dark:bg-slate-900/40">
                        <div className="flex items-center space-x-3 text-text-primary dark:text-white">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">Course Content</h2>
                            <p className="text-xs text-text-muted mt-0.5">
                              Step-by-step assessment rounds aligned with {selectedCompany}'s hiring format.
                            </p>
                          </div>
                        </div>

                        {/* Top Summary Badges */}
                        <div className="flex items-center space-x-2.5 flex-wrap">
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface dark:bg-slate-800 border border-border text-text-primary dark:text-slate-200 text-xs sm:text-sm font-bold shadow-xs">
                            <Layers className="w-4 h-4 text-primary" />
                            <span>2 Sections</span>
                          </span>
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold shadow-xs">
                            <Code2 className="w-4 h-4" />
                            <span>{codingQuestions.length} Problems</span>
                          </span>
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-bold shadow-xs">
                            <FileText className="w-4 h-4" />
                            <span>{testSeriesList.length} Lessons</span>
                          </span>
                        </div>
                      </div>

                      {/* Accordions Container */}
                      <div className="p-4 sm:p-6 space-y-4">
                        {/* 1. CODING ASSESSMENT ACCORDION */}
                        <div className="rounded-xl border border-border dark:border-border/70 overflow-hidden bg-background dark:bg-slate-900/30 transition-all">
                          <button
                            onClick={() => setModulesExpanded(!modulesExpanded)}
                            className={`w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors ${
                              modulesExpanded ? 'bg-primary/5 dark:bg-primary/10 border-b border-border dark:border-border/60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center space-x-3.5 min-w-0">
                              <ChevronRight className={`w-5 h-5 text-primary shrink-0 transition-transform duration-200 ${modulesExpanded ? 'rotate-90' : ''}`} />
                              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                                <Code2 className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-base sm:text-lg text-text-primary dark:text-white truncate block">
                                  {selectedCompany} Coding Assessment
                                </span>
                                <span className="text-xs text-text-muted hidden sm:block">
                                  Algorithmic challenges, Data Structures & Problem Solving rounds
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 shrink-0">
                              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                {solvedCodingCount} / {codingQuestions.length} Solved
                              </span>
                              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-text-muted text-xs font-bold hidden sm:block">
                                {codingQuestions.length} Problems
                              </span>
                            </div>
                          </button>

                          {modulesExpanded && (
                            <div className="divide-y divide-border/60 bg-surface/50 dark:bg-slate-900/10">
                              {codingQuestions.length === 0 ? (
                                <div className="p-8 text-center text-sm text-text-muted space-y-1">
                                  <Code2 className="w-8 h-8 text-text-muted mx-auto opacity-50 mb-2" />
                                  <p className="font-semibold text-text-primary dark:text-white">No coding problems available yet</p>
                                  <p className="text-xs">Questions for {selectedCompany} will appear here once published.</p>
                                </div>
                              ) : (
                                codingQuestions.map((q, idx) => {
                                  const isSolved = solvedCodingProblems.has(String(q.id || q._id));
                                  const diff = (q.difficulty || 'MEDIUM').toUpperCase();

                                  return (
                                    <div
                                      key={idx}
                                      className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-background/80 dark:hover:bg-slate-800/40 transition-colors ${
                                        isSolved ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                                        <span className="w-6 text-center text-xs font-bold text-text-muted shrink-0">
                                          {idx + 1}.
                                        </span>
                                        <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                          <Code2 className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={`font-bold text-sm sm:text-base truncate ${
                                          isSolved ? 'text-text-primary dark:text-slate-300 line-through opacity-85' : 'text-text-primary dark:text-white'
                                        }`}>
                                          {q.title || q.statement}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto shrink-0">
                                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                          diff === 'EASY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                          diff === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                                          'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                                        }`}>
                                          {diff}
                                        </span>

                                        {isSolved ? (
                                          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 shrink-0 cursor-default">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Solved</span>
                                          </div>
                                        ) : (
                                          <Link
                                            to={`/solve-problem/${q.slug || q.id || q._id}`}
                                            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition-all shrink-0 group"
                                          >
                                            <Code2 className="w-3.5 h-3.5" />
                                            <span>Solve</span>
                                            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>

                        {/* 2. MCQ ASSESSMENT ACCORDION */}
                        <div className="rounded-xl border border-border dark:border-border/70 overflow-hidden bg-background dark:bg-slate-900/30 transition-all">
                          <button
                            onClick={() => setMcqModulesExpanded(!mcqModulesExpanded)}
                            className={`w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors ${
                              mcqModulesExpanded ? 'bg-primary/5 dark:bg-primary/10 border-b border-border dark:border-border/60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center space-x-3.5 min-w-0">
                              <ChevronRight className={`w-5 h-5 text-primary shrink-0 transition-transform duration-200 ${mcqModulesExpanded ? 'rotate-90' : ''}`} />
                              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-base sm:text-lg text-text-primary dark:text-white truncate block">
                                  {selectedCompany} MCQ Assessment
                                </span>
                                <span className="text-xs text-text-muted hidden sm:block">
                                  CS Fundamentals, Technical Aptitude & Domain Knowledge rounds
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 shrink-0">
                              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                {takenMcqCount} / {testSeriesList.length} Taken
                              </span>
                              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-text-muted text-xs font-bold hidden sm:block">
                                {testSeriesList.length} Lessons
                              </span>
                            </div>
                          </button>

                          {mcqModulesExpanded && (
                            <div className="divide-y divide-border/60 bg-surface/50 dark:bg-slate-900/10">
                              {testSeriesList.length === 0 ? (
                                <div className="p-8 text-center text-sm text-text-muted space-y-1">
                                  <FileText className="w-8 h-8 text-text-muted mx-auto opacity-50 mb-2" />
                                  <p className="font-semibold text-text-primary dark:text-white">No MCQ assessments available yet</p>
                                  <p className="text-xs">Practice test series for {selectedCompany} will appear here.</p>
                                </div>
                              ) : (
                                testSeriesList.map((ts, idx) => {
                                  const qCount = questions.filter(q => q.testSeriesTags?.some((t: any) => t.name === ts.name)).length;
                                  const isTaken = takenTests.has(String(ts.name));

                                  return (
                                    <div
                                      key={idx}
                                      className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-background/80 dark:hover:bg-slate-800/40 transition-colors ${
                                        isTaken ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                                        <span className="w-6 text-center text-xs font-bold text-text-muted shrink-0">
                                          {idx + 1}.
                                        </span>
                                        <div className="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                          <FileText className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                          <span className="font-bold text-sm sm:text-base text-text-primary dark:text-white truncate block">
                                            {ts.name}
                                          </span>
                                          <span className="text-xs text-text-muted">
                                            Comprehensive MCQ Practice Set
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto shrink-0">
                                        <div className="inline-flex items-center space-x-1.5 text-text-muted text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface dark:bg-slate-800 border border-border">
                                          <FileText className="w-3.5 h-3.5 text-primary" />
                                          <span>{qCount} Questions</span>
                                        </div>

                                        {isTaken ? (
                                          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 shrink-0 cursor-default">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Taken</span>
                                          </div>
                                        ) : (
                                          <Link
                                            to={`/take-test/${encodeURIComponent(ts.name)}`}
                                            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all shrink-0 group"
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Take Test</span>
                                            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
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
          </>
        );
      })()}
    </div>
  )}
</div>
);
}

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Search, 
  ChevronRight, 
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
  Sparkles 
} from "lucide-react";
import axios from "axios";
import { getApiUrl } from "../utils/apiConfig";

const SECTIONS = ["MCQ", "CODING"];
const CATEGORIES = ["All", "Product Based", "Service Based", "Fintech", "Startups"];

export interface TestCardData {
  name: string;
  category: "Product Based" | "Service Based" | "Fintech" | "Startups";
  iconType: "microsoft" | "paypal" | "zscaler" | "jpmorgan" | "google" | "accolite" | "amazon" | "apple" | "meta" | "default" | string;
  logoUrl?: string;
}

const DEFAULT_TESTS: TestCardData[] = [
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
function TestLogoHeader({ name, iconType, logoUrl }: { name: string; iconType: string; logoUrl?: string }) {
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
function TestCircleIllustration({ iconType, name, logoUrl }: { iconType: string; name: string; logoUrl?: string }) {
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

export default function TestSeries() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [testList, setTestList] = useState<TestCardData[]>(DEFAULT_TESTS);
  const [isLoading, setIsLoading] = useState(true);

  // View state: "directory" (card grid) or "problems" (company practice view)
  const [activeView, setActiveView] = useState<"directory" | "problems">("directory");
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [problemSearchQuery, setProblemSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("MCQ");
  
  // Pagination for problems view
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Fetch company metadata for the directory grid
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get(getApiUrl("/api/v1/questions/metadata/aggregates?type=TEST_SERIES"));
        const testCounts = res.data.testCounts || {};

        const testSet = new Set<string>();
        DEFAULT_TESTS.forEach(c => testSet.add(c.name.toLowerCase()));

        const mergedTests = [...DEFAULT_TESTS];
        Object.keys(testCounts).forEach(testNameVar => {
          if (testNameVar && testNameVar !== 'Uncategorized' && !testSet.has(testNameVar.toLowerCase())) {
            testSet.add(testNameVar.toLowerCase());
            mergedTests.push({
              name: testNameVar,
              category: "Product Based",
              iconType: "default"
            });
          }
        });

        const customCompsRaw = localStorage.getItem("admin_test_series_names");
        if (customCompsRaw) {
          const customComps = JSON.parse(customCompsRaw);
          customComps.forEach((c: any) => {
            if (c.name && !testSet.has(c.name.toLowerCase())) {
              testSet.add(c.name.toLowerCase());
              mergedTests.push(c);
            }
          });
        }

        setTestList(mergedTests);
      } catch (err) {
        console.error("Failed to fetch test series metadata:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTests();
  }, []);

  // Fetch questions for the selected company
  useEffect(() => {
    if (activeView === "problems" && selectedTest) {
      fetchTestQuestions(false);
    }
  }, [activeView, selectedTest, selectedSection, problemSearchQuery]);

  const fetchTestQuestions = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      let url = `/api/v1/questions?limit=50&type=TEST_SERIES&company=${encodeURIComponent(selectedTest)}`;
      
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
          const savedCustom = localStorage.getItem("admin_test_series_problems");
          if (savedCustom) {
            let customQuestions = JSON.parse(savedCustom);
            
            // Filter custom ones by company
            customQuestions = customQuestions.filter((q: any) => {
              const tags = q.testSeriesTags || q.companies || [];
              return tags.some((t: any) => (t.name || t).toLowerCase() === selectedTest.toLowerCase());
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

  // Filtered companies for directory grid
  const filteredTests = useMemo(() => {
    return testList.filter((test) => {
      const matchCategory = selectedCategory === "All" || test.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [testList, selectedCategory, searchQuery]);

  // Active questions filtered by section
  const activeQuestions = useMemo(() => {
    return questions.filter((q: any) => {
      const isMcq = q.questionType === "MCQ" || q.type === "MCQ";
      if (selectedSection === "MCQ") return isMcq;
      return !isMcq;
    });
  }, [questions, selectedSection]);

  const handleStartPreparing = (testName: string) => {
    setSelectedTest(testName);
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
          Test Series
        </h1>
        <div className="flex items-center text-xs sm:text-sm font-medium text-text-muted dark:text-text-muted space-x-1.5">
          <Home className="w-4 h-4 text-text-muted shrink-0" />
          <button onClick={handleBackToDirectory} className="hover:text-primary dark:hover:text-primary transition-colors">
            Home
          </button>
          <span>/</span>
          {activeView === "directory" ? (
            <span className="text-primary dark:text-primary font-semibold">Test Series</span>
          ) : (
            <>
              <button
                onClick={handleBackToDirectory}
                className="hover:text-primary dark:hover:text-primary transition-colors"
              >
                Test Series
              </button>
              <span>/</span>
              <span className="text-primary dark:text-primary font-semibold">{selectedTest}</span>
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
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === category
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
                placeholder="Search test series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface dark:bg-background border border-border dark:border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-500/20 text-text-primary dark:text-text-inverse placeholder-slate-400 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Test Series Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-16 text-center text-text-muted text-sm">
                Loading tests...
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="col-span-full py-16 text-center text-text-muted text-sm">
                No tests found matching your filter.
              </div>
            ) : (
              filteredTests.map((test) => (
                <div
                  key={test.name}
                  className="bg-surface dark:bg-background rounded-2xl border border-border dark:border-border/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Body */}
                  <div className="p-5 sm:p-6 flex gap-4 sm:gap-5 items-start">
                    {/* Left Box (Yellow/Gold Card Banner) */}
                    <div className="w-36 h-40 sm:w-40 sm:h-44 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-400 to-yellow-500 p-3 sm:p-3.5 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-sm">
                      {/* Logo Header */}
                      <TestLogoHeader name={test.name} iconType={test.iconType} logoUrl={test.logoUrl} />

                      {/* Subtitle */}
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-950 uppercase tracking-tight mt-0.5">
                        Interview Prepration
                      </span>

                      {/* Blue Circle Illustration */}
                      <TestCircleIllustration iconType={test.iconType} name={test.name} logoUrl={test.logoUrl} />
                    </div>

                    {/* Right Side (Test Series Details & Checklist) */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-inverse truncate">
                        {test.name}
                      </h2>

                      <div className="text-[10px] sm:text-[11px] font-bold text-text-muted dark:text-text-muted uppercase tracking-wider mt-2.5 sm:mt-3 mb-2">
                        PREPARATION INCLUDES:
                      </div>

                      <ul className="space-y-1.5 sm:space-y-2">
                        <li className="flex items-center text-xs sm:text-[13px] text-text-primary dark:text-text-secondary font-medium">
                          <CheckCircle2 className="text-primary shrink-0 h-4 w-4 mr-2" />
                          <span className="truncate">{test.name} Interview Practise Set</span>
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
                      onClick={() => handleStartPreparing(test.name)}
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
        /* Test Series Problems Practice View (when a user clicks "Start Preparing") */
        <div className="space-y-6">
          {/* Back button */}
          <div>
            <button
              onClick={handleBackToDirectory}
              className="inline-flex items-center space-x-2 text-sm font-semibold text-primary dark:text-primary hover:underline transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Test Series</span>
            </button>
          </div>

          {/* Header Banner for Selected Test Series */}
          <div className="relative rounded-2xl overflow-hidden glass-card p-8 flex flex-col md:flex-row md:items-center justify-between border border-border dark:border-border/40 gap-4">
            <div className="space-y-2 max-w-xl">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent flex items-center gap-3">
                {testList.find(c => c.name.toLowerCase() === selectedTest?.toLowerCase())?.logoUrl ? (
                  <img
                    src={testList.find(c => c.name.toLowerCase() === selectedTest?.toLowerCase())?.logoUrl}
                    alt={`${selectedTest} logo`}
                    className="h-9 w-9 object-contain rounded-lg bg-surface p-1 shadow-sm shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-primary shrink-0" />
                )}
                <span>{selectedTest} Interview Prep</span>
              </h1>
              <p className="text-sm text-text-primary dark:text-text-muted leading-relaxed">
                Targeted problem sets asked in recent interviews by {selectedTest}. Master these exactly as they appeared to guarantee your success.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Section Tabs */}
            <div className="flex bg-surface-secondary dark:bg-background p-1 rounded-xl border border-border dark:border-border w-full overflow-x-auto max-w-md mx-auto">
              {SECTIONS.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-all ${
                    selectedSection === sec
                      ? sec === "MCQ"
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-primary text-text-inverse shadow-md"
                      : "text-text-primary dark:text-text-muted hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            {/* Search bar for problems */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder={`Search ${selectedTest} ${selectedSection === "MCQ" ? "MCQ" : "coding"} questions...`}
                value={problemSearchQuery}
                onChange={(e) => setProblemSearchQuery(e.target.value)}
                className="w-full bg-surface dark:bg-background border border-border dark:border-border rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all text-slate-950 dark:text-text-inverse"
              />
            </div>

            <div className="flex justify-end mt-4 mb-2">
              <Link
                to={`/take-test/${encodeURIComponent(selectedTest)}`}
                className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center space-x-2"
              >
                <span>Start Test</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Questions List Table */}
            <div className="glass rounded-2xl overflow-x-auto border border-border dark:border-border">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-border dark:border-border bg-background dark:bg-background/40 text-text-primary dark:text-text-muted text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4 pl-6">Problem</th>
                    <th className="p-4">Acceptance</th>
                    <th className="p-4">Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-text-muted text-sm">
                        Loading questions...
                      </td>
                    </tr>
                  ) : activeQuestions.map((q) => (
                    <tr
                      key={q._id || q.id || q.slug}
                      className="hover:bg-background dark:hover:bg-slate-800 transition-colors"
                    >
                      <td className="p-4 pl-6 font-semibold text-slate-950 dark:text-text-inverse">
                        <div className="flex items-center space-x-2.5">
                          <span>{q.title || q.statement}</span>
                          {(q.questionType === "MCQ" || q.type === "MCQ") ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-semibold border border-purple-500/20 shrink-0">
                              MCQ
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20 shrink-0">
                              Coding
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-text-secondary dark:text-text-secondary">
                        {q.acceptanceRate || (Math.random() * 40 + 40).toFixed(1)}%
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1 text-amber-500">
                          <Flame className="h-4 w-4" />
                          <span className="text-text-primary dark:text-text-secondary">
                            {q.likes || Math.floor(Math.random() * 500) + 50}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && activeQuestions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-text-primary text-sm">
                        No matching questions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {hasMore && (
                <div className="flex justify-center py-6 bg-surface dark:bg-background border-t border-border dark:border-border">
                  <button 
                    onClick={() => fetchTestQuestions(true)}
                    disabled={loadingMore}
                    className="px-6 py-2.5 bg-surface dark:bg-[#151a23] hover:bg-slate-100 dark:hover:bg-slate-800 text-text-primary dark:text-text-primary border border-border dark:border-border font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {loadingMore ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : null}
                    {loadingMore ? 'Loading...' : 'Load More Questions'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

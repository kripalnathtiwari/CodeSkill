import React, { useState, useEffect, useRef } from "react";
import { Trophy, Calendar, Clock, Users, ArrowRight, Award, Star, Search, Lock, X, ChevronDown, Building2 } from "lucide-react";
import Fuse from "fuse.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { getApiUrl } from "../utils/apiConfig";

function SearchableDropdown({ options, value, onChange, placeholder, disabled }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return options;
    const fuse = new Fuse(options, { keys: ['label'], threshold: 0.4 });
    return fuse.search(search).map(res => res.item);
  }, [options, search]);
  const selectedLabel = options.find((o: any) => o.value === value)?.label || placeholder;

  return (
    <div className="relative w-full md:w-64 flex-shrink-0 z-20" ref={dropdownRef}>
      <button
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-surface dark:bg-background border border-border dark:border-border rounded-xl px-4 py-3 text-left flex justify-between items-center text-text-primary dark:text-text-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="text-sm truncate font-medium">{value === "all" ? placeholder : selectedLabel}</span>
        <ChevronDown className="w-4 h-4 text-text-muted" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 w-full mt-2 bg-surface dark:bg-slate-800 border border-border dark:border-border rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border dark:border-border">
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-background dark:bg-background border border-border dark:border-border rounded-lg px-3 py-2 text-sm text-text-primary dark:text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            <button
              onClick={() => { onChange("all"); setIsOpen(false); setSearch(""); }}
              className="w-full text-left px-4 py-2.5 text-sm font-bold text-text-primary dark:text-text-primary hover:bg-background dark:hover:bg-slate-700 transition-colors"
            >
              All {placeholder.replace("Select ", "")}s
            </button>
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-text-muted text-center">No results found</div>
            ) : (
              filtered.map((o: any) => (
                <button
                  key={o.value}
                  onClick={() => { onChange(o.value); setIsOpen(false); setSearch(""); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-text-primary dark:text-text-secondary hover:bg-background dark:hover:bg-slate-700 hover:text-primary transition-colors"
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Contests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  // Access Code Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [selectedTestId, setSelectedTestId] = useState<string | number | null>(null);

  const [customTests, setCustomTests] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [courseCategories, setCourseCategories] = useState<any[]>([]);

  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(() => {
    return localStorage.getItem("user_selected_college_id") || "all";
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return localStorage.getItem("user_selected_category") || "all";
  });
  const [selectedSection, setSelectedSection] = useState<string>(() => {
    return localStorage.getItem("user_selected_section") || "all";
  });

  useEffect(() => {
    localStorage.setItem("user_selected_college_id", selectedCollegeId);
  }, [selectedCollegeId]);

  useEffect(() => {
    localStorage.setItem("user_selected_section", selectedSection);
  }, [selectedSection]);

  useEffect(() => {
    localStorage.setItem("user_selected_category", selectedCategory);
  }, [selectedCategory]);

  React.useEffect(() => {
    const savedTests = localStorage.getItem("admin_custom_tests");
    if (savedTests) {
      setCustomTests(JSON.parse(savedTests));
    }
    const fetchColleges = async () => {
      try {
        const response = await axios.get(getApiUrl("/api/v1/college-management/public"));
        setColleges(response.data);
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };
    const fetchCourses = async () => {
      try {
        const response = await axios.get(getApiUrl("/api/v1/college-management/public/courses"));
        setCourseCategories(response.data);
      } catch (error) {
        console.error('Error fetching course categories:', error);
      }
    };
    fetchColleges();
    fetchCourses();
  }, []);

  const getCategoriesForCollege = (collegeId: string): string[] => {
    if (collegeId === "all") return [];
    const col = colleges.find(c => String(c.id) === String(collegeId));
    if (!col) return [];

    const categories = new Set<string>();
    const collegeCourseCategories = courseCategories.filter(cat => cat.collegeName === col.name);
    collegeCourseCategories.forEach((cat: any) => {
      if (cat.courseName) categories.add(cat.courseName);
    });

    const collections = JSON.parse(localStorage.getItem("admin_college_collections") || "[]");
    collections.forEach((c: any) => {
      if (c.collegeName === col.name && c.category) {
        categories.add(c.category);
      }
    });
    return Array.from(categories);
  };

  const getSectionsForCollege = (collegeId: string, categoryName: string = "all"): string[] => {
    if (collegeId === "all") return [];
    const col = colleges.find(c => String(c.id) === String(collegeId));
    if (!col) return [];

    const sections = new Set<string>();
    const collegeCourseCategories = courseCategories.filter(cat => cat.collegeName === col.name);

    if (categoryName && categoryName !== "all") {
      const targetCat = collegeCourseCategories.find((cat: any) => cat.courseName === categoryName);
      if (targetCat && targetCat.classes) {
        targetCat.classes.forEach((cls: any) => {
          if (cls.className) sections.add(cls.className);
        });
      }
      const collections = JSON.parse(localStorage.getItem("admin_college_collections") || "[]");
      collections.forEach((c: any) => {
        if (c.collegeName === col.name && c.category === categoryName) {
          sections.add(c.category);
        }
      });
      col.tutors?.forEach((t: any) => {
        if (t.section) sections.add(t.section);
      });
    } else {
      col.tutors?.forEach((t: any) => {
        if (t.section) sections.add(t.section);
      });
      const collections = JSON.parse(localStorage.getItem("admin_college_collections") || "[]");
      collections.forEach((c: any) => {
        if (c.collegeName === col.name && c.category) {
          sections.add(c.category);
        }
      });
      collegeCourseCategories.forEach((cat: any) => {
        cat.classes?.forEach((cls: any) => {
          if (cls.className) sections.add(cls.className);
        });
      });
    }
    return Array.from(sections);
  };

  const availableCategories = getCategoriesForCollege(selectedCollegeId);
  const availableSections = getSectionsForCollege(selectedCollegeId, selectedCategory);

  const parseDurationMs = (dur: string): number => {
    if (!dur) return 60 * 60 * 1000;
    if (dur.includes("15")) return 15 * 60 * 1000;
    if (dur.includes("30")) return 30 * 60 * 1000;
    if (dur.includes("2 Hour")) return 2 * 60 * 60 * 1000;
    if (dur.includes("1 Hour")) return 60 * 60 * 1000;
    return 60 * 60 * 1000;
  };

  const getTestStatus = (test: any): "upcoming" | "live" | "past" => {
    if (!test.scheduledAt) return "live";
    const start = new Date(test.scheduledAt).getTime();
    const now = Date.now();
    const durationMs = parseDurationMs(test.duration);
    if (now < start) return "upcoming";
    if (now >= start && now <= start + durationMs) return "live";
    return "past";
  };

  const defaultContests: any[] = [];

  const formattedCustomTests = customTests.map(test => {
    const status = getTestStatus(test);

    let startTimeStr = "Started";
    let minutesSinceStart = 0;

    if (test.scheduledAt) {
      const d = new Date(test.scheduledAt);
      if (status === "upcoming") {
        startTimeStr = d.toLocaleString("en-IN", {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true
        });
      } else if (status === "live") {
        minutesSinceStart = Math.floor((Date.now() - d.getTime()) / 60000);
        startTimeStr = `Started ${minutesSinceStart} mins ago`;
      } else {
        startTimeStr = "Ended";
      }
    } else {
      if (status === "live") {
        startTimeStr = "Started just now";
      }
    }

    return {
      ...test,
      status,
      startTime: startTimeStr,
      minutesSinceStart
    };
  });

  const allContests = [...formattedCustomTests, ...defaultContests];

  const filteredContests = allContests.filter(c => {
    const matchesTab = c.status === activeTab;
    const searchLower = searchQuery.toLowerCase();

    const formattedId = String(c.id).padStart(3, '0');
    const idString = `#${formattedId}`;

    const matchesSearch = c.title?.toLowerCase().includes(searchLower) ||
      (c.tags || []).some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
      String(c.id).toLowerCase() === searchLower ||
      formattedId.includes(searchLower) ||
      idString.includes(searchLower);

    let matchesCollege = true;
    if (c.collegeId && c.collegeId !== "all") {
      if (c.collegeId !== selectedCollegeId) {
        matchesCollege = false;
      } else {
        if (selectedCategory !== "all") {
          if (c.category && c.category !== selectedCategory) matchesCollege = false;
        }
        if (matchesCollege && selectedSection !== "all") {
          if (c.section && c.section !== selectedSection) matchesCollege = false;
        }
      }
    }

    return matchesTab && matchesSearch && matchesCollege;
  });

  return (
    <div className="flex-1 bg-background dark:bg-background min-h-screen p-6 md:p-12">
      <div className="w-full space-y-12">

        {/* Header Section */}

        {/* Institution Filters */}
        <div className="bg-surface dark:bg-[#111827] border border-border dark:border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center z-20 relative">
          <div className="flex items-center text-text-muted dark:text-text-muted mr-2 whitespace-nowrap">
            <Building2 className="w-5 h-5 mr-2 text-primary" />
            <span className="font-bold text-sm">Find your College:</span>
          </div>
          <SearchableDropdown
            options={colleges.map(c => ({ label: c.name, value: c.id }))}
            value={selectedCollegeId}
            onChange={(v: string) => { setSelectedCollegeId(v); setSelectedCategory("all"); setSelectedSection("all"); }}
            placeholder="Select College"
          />
          <SearchableDropdown
            options={availableCategories.map(cat => ({ label: cat, value: cat }))}
            value={selectedCategory}
            onChange={(v: string) => { setSelectedCategory(v); setSelectedSection("all"); }}
            placeholder="Select Category"
            disabled={selectedCollegeId === "all" || availableCategories.length === 0}
          />
          <SearchableDropdown
            options={availableSections.map(s => ({ label: s, value: s }))}
            value={selectedSection}
            onChange={setSelectedSection}
            placeholder="Select Section"
            disabled={selectedCollegeId === "all" || availableSections.length === 0}
          />
        </div>

        {/* Tabs and Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border dark:border-border pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {["live", "upcoming", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full font-bold transition-all text-sm uppercase tracking-wider ${activeTab === tab
                    ? "bg-primary text-text-inverse shadow-lg shadow-blue-600/30 scale-105"
                    : "bg-surface dark:bg-background text-text-secondary dark:text-text-muted hover:bg-background dark:hover:bg-slate-800 border border-border dark:border-border"
                  }`}
              >
                {tab} Tests
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests or tags..."
              className="w-full bg-surface dark:bg-background border border-border dark:border-border rounded-full pl-12 pr-4 py-2.5 text-text-primary dark:text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-blue-500 transition-all shadow-sm text-sm"
            />
            <Search className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
          </div>
        </div>

        {/* Contests Grid */}
        <div className="flex flex-col border border-border dark:border-border rounded-md overflow-hidden bg-surface dark:bg-[#111827]">
          {filteredContests.map((contest) => {
            const hasTaken = localStorage.getItem(`testResult_${user?.email || 'guest'}_${contest.id}`) !== null;
            const isLate = contest.status === 'live' && contest.minutesSinceStart !== undefined && contest.minutesSinceStart > 10;

            // Calculate end time if scheduledAt and duration exist
            let endTimeStr = "TBD";
            if (contest.scheduledAt) {
              const start = new Date(contest.scheduledAt).getTime();
              const durationMs = parseDurationMs(contest.duration);
              const endD = new Date(start + durationMs);
              endTimeStr = endD.toLocaleString("en-IN", {
                month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true
              });
            }

            return (
              <div
                key={contest.id}
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                    return;
                  }
                  if (hasTaken) {
                    navigate(`/take-test/${contest.id}`);
                  } else if (contest.status === 'live' && !isLate) {
                    if (contest.requiresCode) {
                      setSelectedTestId(contest.id);
                      setIsModalOpen(true);
                    } else {
                      navigate(`/take-test/${contest.id}`, { state: { collegeId: selectedCollegeId, section: selectedSection } });
                    }
                  }
                }}
                className="p-4 border-b border-border dark:border-border last:border-0 hover:bg-background dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row justify-between sm:items-start gap-4"
              >
                <div>
                  <h3 className="text-lg font-medium text-text-primary dark:text-text-secondary uppercase tracking-wide">
                    {contest.title}
                  </h3>
                  <div className="text-sm text-text-muted mt-1 space-y-0.5">
                    <p>Start: {contest.scheduledAt ? new Date(contest.scheduledAt).toLocaleString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) : contest.startTime}</p>
                    <p>End: {endTimeStr}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap text-text-inverse block text-center sm:inline-block ${hasTaken ? 'bg-primary' : (isLate ? 'bg-rose-600' : 'bg-primary')}`}>
                    {hasTaken ? 'View Mark' : (isLate ? 'Test Expired' : 'Take Test')}
                  </span>
                </div>
              </div>
            )
          })}

          {filteredContests.length === 0 && (
            <div className="col-span-1 lg:col-span-2 text-center py-20 bg-surface dark:bg-[#111827] rounded-3xl border border-border dark:border-border">
              <Trophy className="w-16 h-16 text-text-secondary dark:text-text-primary mx-auto mb-4" />
              {(selectedCollegeId === "all" || (availableSections.length > 0 && selectedSection === "all")) ? (
                <>
                  <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary mb-2">Select College & Section</h3>
                  <p className="text-text-muted">Please select your college and section name to view your tests.</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary mb-2">No {activeTab} tests</h3>
                  <p className="text-text-muted">Check back soon for new challenges!</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Access Code Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-surface dark:bg-background rounded-3xl p-8 max-w-md w-full shadow-2xl border border-border dark:border-border relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setAccessCode("");
                setCodeError("");
              }}
              className="absolute top-6 right-6 text-text-muted hover:text-text-secondary dark:hover:text-text-secondary"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary">Protected Test</h2>
              <p className="text-text-muted dark:text-text-muted mt-2">
                This test requires an access code.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setCodeError("");
                  }}
                  placeholder="Enter Access Code"
                  className="w-full bg-background dark:bg-slate-800 border border-border dark:border-border rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 text-text-primary dark:text-text-primary"
                />
                {codeError && <p className="text-rose-500 text-sm mt-2 text-center font-semibold">{codeError}</p>}
              </div>

              <button
                onClick={() => {
                  const targetTest = allContests.find(t => t.id === selectedTestId);
                  const expectedCode = targetTest?.accessCode || "1234a";

                  if (accessCode === expectedCode) {
                    navigate(`/take-test/${selectedTestId}`, { state: { collegeId: selectedCollegeId, section: selectedSection } });
                  } else {
                    setCodeError(`Invalid access code!`);
                  }
                }}
                className="w-full bg-primary hover:bg-primary text-text-inverse font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                Unlock & Enter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

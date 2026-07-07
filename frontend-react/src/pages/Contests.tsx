import React, { useState, useEffect, useRef } from "react";
import { Trophy, Calendar, Clock, Users, ArrowRight, Award, Star, Search, Lock, X, ChevronDown, Building2 } from "lucide-react";
import Fuse from "fuse.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
        className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-left flex justify-between items-center text-slate-900 dark:text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="text-sm truncate font-medium">{value === "all" ? placeholder : selectedLabel}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <input 
              autoFocus
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => { onChange("all"); setIsOpen(false); setSearch(""); }}
              className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              All {placeholder.replace("Select ", "")}s
            </button>
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">No results found</div>
            ) : (
              filtered.map((o: any) => (
                <button 
                  key={o.value}
                  onClick={() => { onChange(o.value); setIsOpen(false); setSearch(""); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-emerald-500 transition-colors"
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
  
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(() => {
    return localStorage.getItem("user_selected_college_id") || "all";
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

  React.useEffect(() => {
    const savedTests = localStorage.getItem("admin_custom_tests");
    if (savedTests) {
      setCustomTests(JSON.parse(savedTests));
    }
    const savedColleges = localStorage.getItem("admin_colleges_v2");
    if (savedColleges) {
      setColleges(JSON.parse(savedColleges));
    }
  }, []);

  const selectedCollege = colleges.find(c => c.id === selectedCollegeId);
  const availableSections = selectedCollege 
    ? Array.from(new Set(selectedCollege.tutors.map((t: any) => t.section).filter(Boolean))) as string[]
    : [];

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
      } else if (c.section && c.section !== "all") {
        if (c.section !== selectedSection) {
          matchesCollege = false;
        }
      }
    }
                          
    return matchesTab && matchesSearch && matchesCollege;
  });

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="relative rounded-3xl overflow-hidden glass-card p-10 flex flex-col md:flex-row md:items-center justify-between border border-slate-200 dark:border-slate-800/60 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Trophy className="h-4 w-4" />
              <span>Compete & Win</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Global Coding <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Tests</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Test your skills against thousands of developers worldwide. Participate in weekly challenges, win exciting prizes, and boost your global ranking!
            </p>
          </div>
          
          <div className="hidden md:flex relative z-10 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex-col items-center justify-center min-w-[200px]">
            <Star className="w-10 h-10 text-amber-400 mb-2" />
            <span className="text-3xl font-black text-slate-900 dark:text-white">#1</span>
            <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">Your Rank</span>
          </div>
        </div>

        {/* Institution Filters */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center z-20 relative">
          <div className="flex items-center text-slate-500 dark:text-slate-400 mr-2 whitespace-nowrap">
            <Building2 className="w-5 h-5 mr-2 text-emerald-500" />
            <span className="font-bold text-sm">Find your College:</span>
          </div>
          <SearchableDropdown 
            options={colleges.map(c => ({ label: c.name, value: c.id }))} 
            value={selectedCollegeId} 
            onChange={(v: string) => { setSelectedCollegeId(v); setSelectedSection("all"); }} 
            placeholder="Select College" 
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {["live", "upcoming", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full font-bold transition-all text-sm uppercase tracking-wider ${
                  activeTab === tab 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105" 
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
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
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full pl-12 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm text-sm"
            />
            <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Contests Grid */}
        <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden bg-white dark:bg-[#111827]">
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
              className="p-4 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-row justify-between items-start"
            >
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  {contest.title}
                </h3>
                <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                  <p>Start: {contest.scheduledAt ? new Date(contest.scheduledAt).toLocaleString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) : contest.startTime}</p>
                  <p>End: {endTimeStr}</p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap text-white ${hasTaken ? 'bg-emerald-500' : (isLate ? 'bg-rose-600' : 'bg-emerald-600')}`}>
                  {hasTaken ? 'View Mark' : (isLate ? 'Test Expired' : 'Take Test')}
                </span>
              </div>
            </div>
          )})}

          {filteredContests.length === 0 && (
            <div className="col-span-1 lg:col-span-2 text-center py-20 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800">
              <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              { (selectedCollegeId === "all" || (availableSections.length > 0 && selectedSection === "all")) ? (
                <>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select College & Section</h3>
                  <p className="text-slate-500">Please select your college and section name to view your tests.</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No {activeTab} tests</h3>
                  <p className="text-slate-500">Check back soon for new challenges!</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Access Code Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button 
              onClick={() => {
                setIsModalOpen(false);
                setAccessCode("");
                setCodeError("");
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Protected Test</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
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
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
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
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
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

import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Target, BookOpen, ArrowLeft, Home, Book, CheckCircle2, ChevronRight, Award, ArrowUpRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function OtherPractice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View state: "directory" (subjects grid) or "topics" (topics inside a subject)
  const [activeView, setActiveView] = useState<"directory" | "topics">("directory");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  useEffect(() => {
    try {
      const data = localStorage.getItem("admin_other_practice_tests");
      if (data) {
        setQuestions(JSON.parse(data));
      }
      const subjectsData = localStorage.getItem("admin_subjects_data");
      if (subjectsData) {
        setSubjects(JSON.parse(subjectsData));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBackToDirectory = () => {
    setActiveView("directory");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartSubject = (subject: string) => {
    setSelectedSubject(subject);
    setActiveView("topics");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // For topics view: unique topics within the selected subject
  

    const filteredTests = useMemo(() => {
    return questions.filter(t => 
      t.subject === selectedSubject &&
      t.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questions, selectedSubject, searchQuery]);

  // For directory view: filtered subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [subjects, searchQuery]);

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-10 lg:p-12 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Page Title & Breadcrumb */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary dark:text-text-inverse flex items-center gap-3">
          <Target className="w-8 h-8 text-rose-500" />
          More Practice
        </h1>
        <div className="flex items-center text-xs sm:text-sm font-medium text-text-muted dark:text-text-muted space-x-1.5">
          <Home className="w-4 h-4 text-text-muted shrink-0" />
          <button onClick={handleBackToDirectory} className="hover:text-primary dark:hover:text-primary transition-colors">
            Home
          </button>
          <span>/</span>
          {activeView === "directory" ? (
            <span className="text-primary dark:text-primary font-semibold">Subjects</span>
          ) : (
            <>
              <button
                onClick={handleBackToDirectory}
                className="hover:text-primary dark:hover:text-primary transition-colors"
              >
                Subjects
              </button>
              <span>/</span>
              <span className="text-primary dark:text-primary font-semibold">{selectedSubject}</span>
            </>
          )}
        </div>
      </div>

      {activeView === "directory" ? (
        <>
          {/* Top Filter and Search Bar for Subjects */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface dark:bg-[#111827] border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-rose-500 transition-colors shadow-sm text-text-primary dark:text-text-inverse"
              />
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-16 text-center">
                <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="col-span-full py-16 text-center text-text-muted text-sm">
                No subjects found matching your search.
              </div>
            ) : (
              filteredSubjects.map((subject) => (
                <div
                  key={subject}
                  className="bg-surface dark:bg-[#111827] rounded-2xl border border-border dark:border-border/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Body */}
                  <div className="p-5 sm:p-6 flex gap-4 sm:gap-5 items-start">
                    {/* Left Box (Rose Card Banner) */}
                    <div className="w-36 h-40 sm:w-40 sm:h-44 shrink-0 rounded-2xl bg-gradient-to-br from-rose-400 via-rose-500 to-red-500 p-3 sm:p-3.5 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-sm">
                      {/* Logo Header */}
                      <div className="flex items-center justify-center space-x-1.5 font-bold text-white text-sm sm:text-base tracking-tight truncate px-1">
                        <Book className="w-4 h-4 shrink-0 text-white" />
                        <span className="truncate">{subject}</span>
                      </div>

                      {/* Subtitle */}
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-white uppercase tracking-tight mt-0.5">
                        Subject Practice
                      </span>

                      {/* Illustration */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600 flex items-center justify-center shadow-lg border-2 border-white/40 text-text-inverse relative overflow-hidden">
                         <Target className="w-8 h-8 sm:w-10 sm:h-10 text-rose-100" />
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-inverse truncate">
                        {subject}
                      </h2>

                      <div className="text-[10px] sm:text-[11px] font-bold text-text-muted dark:text-text-muted uppercase tracking-wider mt-2.5 sm:mt-3 mb-2">
                        PREPARATION INCLUDES:
                      </div>

                      <ul className="space-y-1.5 sm:space-y-2">
                        <li className="flex items-center text-xs sm:text-[13px] text-text-primary dark:text-text-secondary font-medium">
                          <CheckCircle2 className="text-rose-500 shrink-0 h-4 w-4 mr-2" />
                          <span className="truncate">{subject} Topics</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-[13px] text-text-primary dark:text-text-secondary font-medium">
                          <CheckCircle2 className="text-rose-500 shrink-0 h-4 w-4 mr-2" />
                          <span>Custom Questions</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-[13px] text-text-primary dark:text-text-secondary font-medium">
                          <CheckCircle2 className="text-rose-500 shrink-0 h-4 w-4 mr-2" />
                          <span>Targeted Practice</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3.5 bg-background/70 dark:bg-background/70 border-t border-border/80 flex items-center justify-between">
                    <div className="inline-flex items-center justify-center p-2 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-500">
                      <Award className="w-5 h-5" />
                    </div>

                    <button
                      onClick={() => handleStartSubject(subject)}
                      className="bg-rose-500 hover:bg-rose-600 text-text-inverse text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg inline-flex items-center space-x-1.5 shadow-sm hover:shadow transition-all group-hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                    >
                      <span>Start Practice</span>
                      <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Topics View */
        <div className="space-y-6">
          <div>
            <button
              onClick={handleBackToDirectory}
              className="inline-flex items-center space-x-2 text-sm font-semibold text-rose-500 hover:underline transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Subjects</span>
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden glass-card p-8 flex flex-col md:flex-row md:items-center justify-between border border-border dark:border-border/40 gap-4">
            <div className="space-y-2 max-w-xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-text-primary dark:text-text-inverse flex items-center gap-3">
                <Book className="w-8 h-8 text-rose-500 shrink-0" />
                <span>{selectedSubject} Tests</span>
              </h1>
              <p className="text-sm text-text-primary dark:text-text-muted leading-relaxed">
                Select a specific test under {selectedSubject} to begin your targeted practice.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface dark:bg-[#111827] border border-border rounded-xl pl-12 pr-4 py-3 text-text-primary dark:text-text-inverse focus:outline-none focus:border-rose-500 transition-colors shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-surface dark:bg-[#111827] rounded-full flex items-center justify-center mb-4 border border-border shadow-sm">
                  <Target className="w-10 h-10 text-text-muted" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary dark:text-text-inverse mb-2">No tests found</h2>
                <p className="text-text-secondary dark:text-text-muted max-w-md">
                  No practice tests available for {selectedSubject}. Admin needs to add tests.
                </p>
              </div>
            ) : (
              filteredTests.map((test) => (
                <div key={test.id} className="group flex flex-col bg-surface dark:bg-[#111827] rounded-2xl border border-border hover:border-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-500/5 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-[0_0_30px_rgba(225,29,72,0.1)] relative text-left">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
                  
                  <div className="p-6 flex-1 flex flex-col z-10 relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center border border-rose-200 dark:border-rose-500/30 flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-rose-500" />
                      </div>
                      <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse line-clamp-2">{test.title}</h3>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{test.duration}</span>
                        <span className="text-sm font-bold uppercase tracking-wider text-rose-500">{test.questions?.length || 0} Questions</span>
                      </div>
                      
                      <Link 
                        to={`/take-test/${test.id}`}
                        className="px-4 py-2 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition-colors shadow-md text-sm inline-flex items-center space-x-1"
                      >
                        <span>Take Test</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

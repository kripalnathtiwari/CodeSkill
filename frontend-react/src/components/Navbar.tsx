import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Code2, Trophy, BookOpen, User, Flame, LogOut, ShieldAlert, Building2, Sun, Moon, GraduationCap, Target, Home as HomeIcon, Settings, ChevronDown, Lock, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  
  // Theme toggle state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || 
             localStorage.getItem("theme") === "dark" ||
             (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCoursesOpen, setIsMobileCoursesOpen] = useState(false);
  const [isMobileProblemsOpen, setIsMobileProblemsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors">
      <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
        <Code2 className="h-6 w-6 text-emerald-500" />
        <span>TeachSkill</span>
      </Link>

      <nav className="hidden lg:flex items-center space-x-6 text-base font-medium text-slate-900 dark:text-slate-200">
        <Link to="/" className="hover:text-emerald-500 transition-colors flex items-center space-x-1">
          <HomeIcon className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <div className="relative group">
          <button className="hover:text-emerald-500 transition-colors flex items-center space-x-1 py-4">
            <GraduationCap className="h-4 w-4" />
            <span>Courses & Training</span>
            <ChevronDown className="h-4 w-4 ml-0.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
          </button>
          
          <div className="absolute top-[80%] left-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
            <div className="flex flex-col py-2">
              <Link to="/courses-training?category=summer" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 transition-colors text-sm border-b border-slate-100 dark:border-slate-800/50 last:border-0 flex items-center space-x-2">
                <span>Summer internship and training</span>
              </Link>
              <Link to="/courses-training?category=featured" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 transition-colors text-sm border-b border-slate-100 dark:border-slate-800/50 last:border-0 flex items-center space-x-2">
                <span>Coding</span>
              </Link>
              <Link to="/courses-training?search=Data Analyst" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 transition-colors text-sm border-b border-slate-100 dark:border-slate-800/50 last:border-0 flex items-center space-x-2">
                <span>Data Analyst</span>
              </Link>
              <Link to="/courses-training?search=Full stack" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 transition-colors text-sm border-b border-slate-100 dark:border-slate-800/50 last:border-0 flex items-center space-x-2">
                <span>Full stack</span>
              </Link>
              <Link to="/courses-training?category=all" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 transition-colors text-sm flex items-center space-x-2">
                <span>All course</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="relative group">
          <button className="hover:text-emerald-500 transition-colors flex items-center space-x-1 py-4">
            <BookOpen className="h-4 w-4" />
            <span>Practice Problems</span>
            <ChevronDown className="h-4 w-4 ml-0.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
          </button>
          
          <div className="absolute top-[80%] left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
            <div className="flex flex-col py-2">
              <Link to="/problems" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 transition-colors text-sm border-b border-slate-100 dark:border-slate-800/50 last:border-0 flex items-center space-x-2">
                <span>DSA Problem</span>
              </Link>
              <Link to="/company-problems" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 transition-colors text-sm border-b border-slate-100 dark:border-slate-800/50 last:border-0 flex items-center space-x-2">
                <span>Company interview preperation</span>
              </Link>
              <Link to="/aptitude" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 transition-colors text-sm flex items-center space-x-2">
                <span>Apptitude question</span>
              </Link>
            </div>
          </div>
        </div>
        <Link to="/contests" className="hover:text-emerald-500 transition-colors flex items-center space-x-1">
          <Trophy className="h-4 w-4" />
          <span>Test</span>
        </Link>
        <Link to="/sandbox" className="hover:text-emerald-500 transition-colors flex items-center space-x-1">
          <Code2 className="h-4 w-4" />
          <span>Compiler</span>
        </Link>
        
        {user && (
          <Link to="/dashboard" className="hover:text-emerald-500 transition-colors flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        )}

        {/* ROLE BASED ACCESS: Admin and Instructors */}
        {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR" || user?.role === "COLLEGE_ADMIN") && (
          <Link to="/admin" className="text-rose-500 hover:text-rose-400 transition-colors flex items-center space-x-1">
            <ShieldAlert className="h-4 w-4" />
            <span>{user.role === "ADMIN" ? "Admin Panel" : (user.role === "COLLEGE_ADMIN" ? "College Panel" : "Instructor Panel")}</span>
          </Link>
        )}
      </nav>

      <div className="flex items-center space-x-4">
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Toggle Dark Mode"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {user ? (
          <>
            {/* Daily Streak Tracker widget */}
            <div className="hidden sm:flex items-center space-x-1 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Flame className="h-4 w-4" />
              <span>{user.profile?.dailyStreak || 0} Day Streak!</span>
            </div>

            {/* User Profile Dropdown / Card */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <div className="h-7 w-7 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-base font-medium text-slate-950 dark:text-slate-100">
                  {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email.split('@')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1e2327] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800/60 overflow-hidden z-50 py-2">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <User className="w-4 h-4 mr-3" />
                      My Profile
                    </Link>
                    <Link to="/my-courses" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <BookOpen className="w-4 h-4 mr-3" />
                      My Courses
                    </Link>
                    <Link to="/edit-profile" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <Settings className="w-4 h-4 mr-3" />
                      Edit Profile
                    </Link>
                    <Link to="/verify" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <ShieldAlert className="w-4 h-4 mr-3" />
                      Verify Certificate
                    </Link>
                    <Link to="/change-password" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <Lock className="w-4 h-4 mr-3" />
                      Change Password
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/60 py-2">
                    <button 
                      onClick={() => { setIsProfileOpen(false); logout(); }}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          !isLoading && (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="text-base font-medium text-slate-900 dark:text-slate-200 hover:text-emerald-500 transition-colors">
                Log In
              </Link>
              <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold px-4 py-2 rounded-lg transition-colors">
                Sign Up
              </Link>
            </div>
          )
        )}
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#1e2327] border-b border-slate-200 dark:border-slate-800/60 shadow-lg flex flex-col p-4 max-h-[80vh] overflow-y-auto z-40">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 rounded-lg flex items-center space-x-2 text-slate-900 dark:text-slate-200">
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <div className="py-2 px-4 flex flex-col space-y-2">
            <button 
              onClick={() => setIsMobileCoursesOpen(!isMobileCoursesOpen)}
              className="flex items-center justify-between w-full text-slate-900 dark:text-slate-200 font-medium py-2 hover:text-emerald-500 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Courses & Training</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isMobileCoursesOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isMobileCoursesOpen && (
              <div className="pl-6 flex flex-col space-y-2 text-sm mt-1 mb-2 animate-in slide-in-from-top-2 duration-200">
                <Link to="/courses-training?category=summer" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-500 text-slate-600 dark:text-slate-400 py-1.5">Summer internship</Link>
                <Link to="/courses-training?category=featured" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-500 text-slate-600 dark:text-slate-400 py-1.5">Coding</Link>
                <Link to="/courses-training?search=Data Analyst" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-500 text-slate-600 dark:text-slate-400 py-1.5">Data Analyst</Link>
                <Link to="/courses-training?search=Full stack" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-500 text-slate-600 dark:text-slate-400 py-1.5">Full stack</Link>
                <Link to="/courses-training?category=all" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-500 text-slate-600 dark:text-slate-400 py-1.5">All course</Link>
              </div>
            )}
          </div>
          
          <div className="py-2 px-4 flex flex-col space-y-2">
            <button 
              onClick={() => setIsMobileProblemsOpen(!isMobileProblemsOpen)}
              className="flex items-center justify-between w-full text-slate-900 dark:text-slate-200 font-medium py-2 hover:text-emerald-500 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Practice Problems</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isMobileProblemsOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isMobileProblemsOpen && (
              <div className="pl-6 flex flex-col space-y-2 text-sm mt-1 mb-2 animate-in slide-in-from-top-2 duration-200">
                <Link to="/problems" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-500 text-slate-600 dark:text-slate-400 py-1.5">DSA Problem</Link>
                <Link to="/company-problems" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-500 text-slate-600 dark:text-slate-400 py-1.5">Company interview prep</Link>
                <Link to="/aptitude" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-500 text-slate-600 dark:text-slate-400 py-1.5">Aptitude questions</Link>
              </div>
            )}
          </div>
          <Link to="/contests" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 rounded-lg flex items-center space-x-2 text-slate-900 dark:text-slate-200">
            <Trophy className="h-4 w-4" />
            <span>Test</span>
          </Link>
          <Link to="/sandbox" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 rounded-lg flex items-center space-x-2 text-slate-900 dark:text-slate-200">
            <Code2 className="h-4 w-4" />
            <span>Compiler</span>
          </Link>
          {user && (
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-emerald-500 rounded-lg flex items-center space-x-2 text-slate-900 dark:text-slate-200">
              <User className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          )}
          {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR" || user?.role === "COLLEGE_ADMIN") && (
            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-rose-500 hover:text-rose-400 rounded-lg flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4" />
              <span>{user.role === "ADMIN" ? "Admin Panel" : (user.role === "COLLEGE_ADMIN" ? "College Panel" : "Instructor Panel")}</span>
            </Link>
          )}
          {!user && !isLoading && (
             <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-3">
               <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-2.5 font-medium text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Log In</Link>
               <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors">Sign Up</Link>
             </div>
          )}
        </div>
      )}
    </header>
  );
}

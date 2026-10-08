import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Code2, Trophy, BookOpen, User, Flame, LogOut, ShieldAlert, Building2, Sun, Moon, GraduationCap, Target, Home as HomeIcon, Settings, ChevronDown, Lock, Menu, X, Briefcase, FileText, Sparkles, TrendingUp, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  
  // Scroll Spy for Home Page sections
  const [activeSection, setActiveSection] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection(location.pathname);
      return;
    }

    const handleScroll = () => {
      const sections = [
        { id: "our-product", path: "/our-product" },
        { id: "why-us", path: "/why-us" },
        { id: "about", path: "/about" },
      ];

      let current = "/"; 
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the section's top is past the top third of the viewport, and bottom is not past it yet
          if (rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.3) {
            current = section.path;
          }
        }
      }
      
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initially

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);
  
  // Theme toggle state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || 
             localStorage.getItem("theme") === "dark";
    }
    return false;
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

  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCoursesOpen, setIsMobileCoursesOpen] = useState(false);
  const [isMobileProblemsOpen, setIsMobileProblemsOpen] = useState(false);
  const [isMobileCareerOpen, setIsMobileCareerOpen] = useState(false);
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

  if (isFullscreen) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-border dark:border-border px-6 py-3 flex items-center justify-between transition-colors">
      
      {/* LEFT SIDE: Logo */}
      <Link to="/" className="flex items-center text-2xl font-extrabold tracking-tight">
        <img 
          src="/favicon.svg" 
          alt="CodeSkill Logo" 
          className="h-8 w-8 object-contain mr-2" 
        />
        <span className="text-black dark:text-white">Code</span><span className="text-primary">Skill</span>
      </Link>

      {/* CENTER: Navigation Links */}
      <nav className="hidden lg:flex items-center space-x-3 xl:space-x-5 text-xs lg:text-[13px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 whitespace-nowrap">
        <Link to="/" className="hover:text-primary transition-colors flex items-center space-x-1">
          <span>Home</span>
        </Link>

        <div className="relative group">
          <Link to="/courses-training?category=all" className="hover:text-primary transition-colors flex items-center space-x-1 py-4">
            <span>Courses & Training</span>
            <ChevronDown className="h-4 w-4 ml-0.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
          </Link>
          
          <div className="absolute top-[80%] left-0 w-72 bg-surface dark:bg-background border border-border dark:border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
            <div className="flex flex-col py-2">
              <Link to="/courses-training?category=summer" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm border-b border-slate-100 dark:border-border/50 last:border-0 flex items-center space-x-2">
                <span>Summer internship and training</span>
              </Link>
              <Link to="/courses-training?category=featured" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm border-b border-slate-100 dark:border-border/50 last:border-0 flex items-center space-x-2">
                <span>Coding</span>
              </Link>
              <Link to="/courses-training?search=Data Analyst" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm border-b border-slate-100 dark:border-border/50 last:border-0 flex items-center space-x-2">
                <span>Data Analyst</span>
              </Link>
              <Link to="/courses-training?search=Full stack" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm border-b border-slate-100 dark:border-border/50 last:border-0 flex items-center space-x-2">
                <span>Full stack</span>
              </Link>
              <Link to="/courses-training?category=all" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm flex items-center space-x-2">
                <span>All course</span>
              </Link>
            </div>
          </div>
        </div>
        {!user && (
          <Link to="/our-product" className={`hover:text-primary transition-colors flex items-center space-x-1 ${activeSection === '/our-product' ? 'text-primary border-b-2 border-primary' : ''}`}>
            <span>Our Product</span>
          </Link>
        )}
        <Link to="/why-us" className={`hover:text-primary transition-colors flex items-center space-x-1 uppercase ${activeSection === '/why-us' ? 'text-primary border-b-2 border-primary' : ''}`}>
          <span>Why Us</span>
        </Link>
        <Link to="/about" className={`hover:text-primary transition-colors flex items-center space-x-1 uppercase ${activeSection === '/about' ? 'text-primary border-b-2 border-primary' : ''}`}>
          <span>About Us</span>
        </Link>

        {user && (
          <>
            <div className="relative group">
              <button className="uppercase hover:text-primary transition-colors flex items-center space-x-1 py-4">
                <span>Practice Problems</span>
                <ChevronDown className="h-4 w-4 ml-0.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              
              <div className="absolute top-[80%] left-0 w-64 bg-surface dark:bg-background border border-border dark:border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                <div className="flex flex-col py-2">
                  <Link to="/problems" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm border-b border-slate-100 dark:border-border/50 last:border-0 flex items-center space-x-2">
                    <span>DSA Problem</span>
                  </Link>
                  <Link to="/company-problems" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm border-b border-slate-100 dark:border-border/50 last:border-0 flex items-center space-x-2">
                    <span>Company interview preperation</span>
                  </Link>
                  <Link to="/aptitude" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm border-b border-slate-100 dark:border-border/50 last:border-0 flex items-center space-x-2">
                    <span>Apptitude question</span>
                  </Link>
                  <Link to="/other-practice" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm flex items-center space-x-2">
                    <span>More Practice</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative group">
              <Link to="/jobs" className="hover:text-primary transition-colors flex items-center space-x-1 py-4">
                <span>Career</span>
                <ChevronDown className="h-4 w-4 ml-0.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </Link>
              
              <div className="absolute top-[80%] left-0 w-64 bg-surface dark:bg-background border border-border dark:border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                <div className="flex flex-col py-2">
                  <Link to="/jobs" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm border-b border-slate-100 dark:border-border/50 last:border-0 flex items-center space-x-2">
                    <span>Job</span>
                  </Link>
                  <Link to="/cv-builder" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm border-b border-slate-100 dark:border-border/50 last:border-0 flex items-center space-x-2">
                    <span>Resume</span>
                  </Link>
                  <Link to="/ats-checker" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm border-b border-slate-100 dark:border-border/50 last:border-0 flex items-center space-x-2">
                    <span>Resume Analysis</span>
                  </Link>
                  <Link to="/jobs?tab=tracker" className="px-4 py-3 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary transition-colors text-sm flex items-center space-x-2">
                    <span>Track Application Progress</span>
                  </Link>
                </div>
              </div>
            </div>
            <Link to="/contests" className="hover:text-primary transition-colors flex items-center space-x-1">
              <span>Test</span>
            </Link>
            <Link to="/sandbox" className="hover:text-primary transition-colors flex items-center space-x-1">
              <span>Compiler</span>
            </Link>
            <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center space-x-1">
              <span>Dashboard</span>
            </Link>
          </>
        )}

        {/* ROLE BASED ACCESS: Admin and Instructors */}
        {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR" || user?.role === "COLLEGE_ADMIN") && (
          <Link to="/admin" className="text-rose-500 hover:text-rose-400 transition-colors flex items-center space-x-1">
            <span>{user.role === "ADMIN" ? "Admin Panel" : (user.role === "COLLEGE_ADMIN" ? "College Panel" : "Instructor Panel")}</span>
          </Link>
        )}
      </nav>

      {/* RIGHT SIDE: Theme Toggle, Login/Profile, Mobile Menu */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full bg-surface-secondary dark:bg-slate-800 text-text-secondary dark:text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Toggle Dark Mode"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {user ? (
          <>
            {/* User Profile Dropdown / Card */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 bg-surface dark:bg-background border border-border dark:border-border px-3 py-1.5 rounded-lg hover:bg-background dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <div className="h-7 w-7 bg-primary rounded-full flex items-center justify-center font-bold text-text-inverse text-sm shadow-sm">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-base font-medium text-slate-950 dark:text-text-inverse">
                  {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email.split('@')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface dark:bg-[#1e2327] rounded-xl shadow-2xl border border-border dark:border-border/60 overflow-hidden z-50 py-2">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-border/60">
                    <p className="text-sm font-bold text-text-primary dark:text-text-inverse truncate">
                      {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
                    </p>
                    <p className="text-xs text-text-muted dark:text-text-muted truncate mt-0.5">{user.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-text-primary dark:text-text-secondary hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary transition-colors">
                      My Profile
                    </Link>
                    <Link to="/my-courses" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-text-primary dark:text-text-secondary hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary transition-colors">
                      My Courses
                    </Link>
                    <Link to="/dashboard/edit-profile" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-text-primary dark:text-text-secondary hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary transition-colors">
                      Edit Profile
                    </Link>
                    <Link to="/verify" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-text-primary dark:text-text-secondary hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary transition-colors">
                      Verify Certificate
                    </Link>
                    <Link to="/change-password" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-text-primary dark:text-text-secondary hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary transition-colors">
                      Change Password
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 dark:border-border/60 py-2">
                    <button 
                      onClick={() => { setIsProfileOpen(false); logout(); }}
                      className="flex w-full items-center px-4 py-2 text-sm text-text-primary dark:text-text-secondary hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    >
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
              {/* Log In Button */}
              <Link 
                to="/login" 
                className="bg-primary hover:bg-white text-text-inverse hover:text-primary border border-primary text-base font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Log In
              </Link>
              
              {/* Register Button */}
              <Link 
                to="/login?mode=register" 
                className="bg-white hover:bg-primary text-primary hover:text-text-inverse border border-primary text-base font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Register
              </Link>
            </div>
          )
        )}

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-text-secondary dark:text-text-secondary hover:bg-surface-secondary dark:hover:bg-slate-800 rounded-md transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-surface dark:bg-[#1e2327] border-b border-border dark:border-border/60 shadow-lg flex flex-col p-4 max-h-[80vh] overflow-y-auto z-40">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary rounded-lg flex items-center space-x-2 text-text-primary dark:text-text-secondary">
            <span>Home</span>
          </Link>

          <div className="py-2 px-4 flex flex-col space-y-2">
            <div className="flex items-center justify-between w-full text-text-primary dark:text-text-secondary font-medium py-2">
              <Link 
                to="/courses-training?category=all" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 hover:text-primary transition-colors flex-1"
              >
                <span>Courses & Training</span>
              </Link>
              <button 
                onClick={() => setIsMobileCoursesOpen(!isMobileCoursesOpen)}
                className="p-1 hover:text-primary transition-colors"
                aria-label="Toggle courses submenu"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileCoursesOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {isMobileCoursesOpen && (
              <div className="pl-6 flex flex-col space-y-2 text-sm mt-1 mb-2 animate-in slide-in-from-top-2 duration-200">
                <Link to="/courses-training?category=summer" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5">Summer internship</Link>
                <Link to="/courses-training?category=featured" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5">Coding</Link>
                <Link to="/courses-training?search=Data Analyst" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5">Data Analyst</Link>
                <Link to="/courses-training?search=Full stack" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5">Full stack</Link>
                <Link to="/courses-training?category=all" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5">All course</Link>
              </div>
            )}
          </div>
          
          {!user && (
            <Link to="/our-product" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 px-4 rounded-lg flex items-center space-x-2 ${activeSection === '/our-product' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary text-text-primary dark:text-text-secondary'}`}>
              <span>Our Product</span>
            </Link>
          )}
          <Link to="/why-us" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 px-4 rounded-lg flex items-center space-x-2 uppercase ${activeSection === '/why-us' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary text-text-primary dark:text-text-secondary'}`}>
            <span>Why Us</span>
          </Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 px-4 rounded-lg flex items-center space-x-2 uppercase ${activeSection === '/about' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary text-text-primary dark:text-text-secondary'}`}>
            <span>About Us</span>
          </Link>

          {user && (
            <>
              <div className="py-2 px-4 flex flex-col space-y-2">
                <button 
                  onClick={() => setIsMobileProblemsOpen(!isMobileProblemsOpen)}
                  className="flex items-center justify-between w-full text-text-primary dark:text-text-secondary font-medium py-2 hover:text-primary transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span>Practice Problems</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMobileProblemsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileProblemsOpen && (
                  <div className="pl-6 flex flex-col space-y-2 text-sm mt-1 mb-2 animate-in slide-in-from-top-2 duration-200">
                    <Link to="/problems" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5">DSA Problem</Link>
                    <Link to="/company-problems" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5">Company interview prep</Link>
                    <Link to="/aptitude" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5">Aptitude questions</Link>
                    <Link to="/other-practice" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5">More Practice</Link>
                  </div>
                )}
              </div>
              
              <div className="py-2 px-4 flex flex-col space-y-2">
                <div className="flex items-center justify-between w-full text-text-primary dark:text-text-secondary font-medium py-2">
                  <Link 
                    to="/jobs" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 hover:text-primary transition-colors flex-1"
                  >
                    <span>Career</span>
                  </Link>
                  <button 
                    onClick={() => setIsMobileCareerOpen(!isMobileCareerOpen)}
                    className="p-1 hover:text-primary transition-colors"
                    aria-label="Toggle career submenu"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isMobileCareerOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {isMobileCareerOpen && (
                  <div className="pl-6 flex flex-col space-y-2 text-sm mt-1 mb-2 animate-in slide-in-from-top-2 duration-200">
                    <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5 flex items-center space-x-2">
                      <span>Job</span>
                    </Link>
                    <Link to="/cv-builder" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5 flex items-center space-x-2">
                      <span>Resume</span>
                    </Link>
                    <Link to="/ats-checker" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5 flex items-center space-x-2">
                      <span>Resume Analysis</span>
                    </Link>
                    <Link to="/jobs?tab=tracker" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary text-text-secondary dark:text-text-muted py-1.5 flex items-center space-x-2">
                      <span>Track Application Progress</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/contests" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary rounded-lg flex items-center space-x-2 text-text-primary dark:text-text-secondary">
                <span>Test</span>
              </Link>
              <Link to="/sandbox" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary rounded-lg flex items-center space-x-2 text-text-primary dark:text-text-secondary">
                <span>Compiler</span>
              </Link>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-background dark:hover:bg-slate-800/50 hover:text-primary rounded-lg flex items-center space-x-2 text-text-primary dark:text-text-secondary">
                <span>Dashboard</span>
              </Link>
            </>
          )}
          {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR" || user?.role === "COLLEGE_ADMIN") && (
            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-rose-500 hover:text-rose-400 rounded-lg flex items-center space-x-2">
              <span>{user.role === "ADMIN" ? "Admin Panel" : (user.role === "COLLEGE_ADMIN" ? "College Panel" : "Instructor Panel")}</span>
            </Link>
          )}
          {!user && !isLoading && (
             <div className="pt-4 mt-2 border-t border-border dark:border-border flex flex-col space-y-3">
               <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-2.5 font-bold text-text-inverse bg-primary hover:bg-primary rounded-lg transition-colors">Log In</Link>
               <Link to="/login?mode=register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-2.5 font-bold text-primary bg-white border border-primary hover:bg-primary hover:text-white rounded-lg transition-colors">Register</Link>
             </div>
          )}
        </div>
      )}
    </header>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Code2,
  LayoutDashboard,
  BookOpen,
  Trophy,
  Briefcase,
  Settings,
  LogOut,
  Target,
  Menu,
  ChevronDown,
  FileEdit,
  ScanSearch,
  StickyNote,
  Lightbulb,
  GraduationCap,
  ShieldAlert,
  Terminal,
  Building,
  BrainCircuit,
  LayoutGrid,
  Compass,
  Video
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const getNavItems = (userRole?: string) => {
  const items: any[] = [
    { isHeader: true, label: 'Menu' },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/learning-path', label: 'Learning Path', icon: Compass },
    { path: '/dashboard/courses', label: 'Courses', icon: BookOpen },
    { path: '/dashboard/my-courses', label: 'Enrolled Courses', icon: GraduationCap },
    
    { isHeader: true, label: 'Practice' },
    { path: '/dashboard/practice', label: 'DSA Practice', icon: Terminal },
    { path: '/dashboard/tests', label: 'Tests', icon: Trophy },
    { path: '/dashboard/compiler', label: 'Compiler', icon: Code2 },
    { path: '/dashboard/practice/aptitude', label: 'Aptitude Question', icon: BrainCircuit },
    { path: '/dashboard/practice/other', label: 'More Practice', icon: LayoutGrid },
    
    { isHeader: true, label: 'Career Development' },
    { path: '/dashboard/practice/company-problems', label: 'Company Interview Prep', icon: Building },
    { path: '/dashboard/career/mock-interview', label: 'Mock Interview', icon: Video },
    { path: '/dashboard/career', label: 'Career', icon: Briefcase },
    { path: '/dashboard/career/resume-maker', label: 'Resume Maker', icon: FileEdit },
    { path: '/dashboard/career/resume-analysis', label: 'Resume Analysis', icon: ScanSearch },
    { path: '/dashboard/projects', label: 'Project Ideas', icon: Lightbulb },
    
    { isHeader: true, label: 'More' },
    { path: '/dashboard/notes', label: 'Notes', icon: StickyNote },
  ];

  if (['ADMIN', 'INSTRUCTOR', 'COLLEGE_ADMIN'].includes(userRole || '')) {
    items.push({ isHeader: true, label: 'Admin' });
    items.push({ path: '/admin', label: 'Admin Dashboard', icon: ShieldAlert });
  }

  return items;
};

const DEFAULT_WIDTH = 256;
const MIN_WIDTH = 200;
const MAX_WIDTH = 440;
const COLLAPSED_WIDTH = 80;

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navItems = getNavItems(user?.role);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          return parsed;
        }
      }
    }
    return DEFAULT_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const widthRef = useRef(sidebarWidth);
  widthRef.current = sidebarWidth;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX));
      widthRef.current = newWidth;
      setSidebarWidth(newWidth);
      if (isCollapsed) {
        setIsCollapsed(false);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('dashboard_sidebar_width', String(widthRef.current));
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, isCollapsed]);

  const resetWidth = () => {
    setSidebarWidth(DEFAULT_WIDTH);
    widthRef.current = DEFAULT_WIDTH;
    localStorage.setItem('dashboard_sidebar_width', String(DEFAULT_WIDTH));
  };

  const toggleMenu = (label: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside 
      style={{ width: isCollapsed ? `${COLLAPSED_WIDTH}px` : `${sidebarWidth}px` }}
      className={`bg-surface border-r border-border h-screen sticky top-0 flex flex-col shrink-0 relative ${
        isResizing ? 'transition-none select-none' : 'transition-[width] duration-200'
      }`}
    >
      {/* Draggable Resize Handle (Desktop Only) */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        onDoubleClick={resetWidth}
        title="Drag to resize sidebar • Double-click to reset"
        className={`hidden lg:flex absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-40 items-center justify-center group ${
          isResizing ? 'pointer-events-auto' : ''
        }`}
      >
        <div
          className={`w-1 rounded-full transition-all duration-200 ${
            isResizing
              ? 'bg-primary w-1.5 h-16 shadow-md shadow-primary/40'
              : 'bg-transparent group-hover:bg-primary/50 group-hover:h-12'
          }`}
        />
      </div>

      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border overflow-hidden">
        <div className={`flex items-center space-x-2 text-2xl font-black tracking-tight overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`}>
          <span className="truncate">
            <span className="text-black dark:text-white">Code</span>
            <span className="text-primary">Skill</span>
          </span>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-background text-text-secondary flex-shrink-0 mx-auto hidden lg:block" title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item, index) => {
          if (item.isHeader) {
            return (
              <div key={`header-${index}`} className={`text-xs font-bold text-text-muted uppercase tracking-wider mt-6 mb-2 px-2 truncate ${isCollapsed ? 'hidden' : 'block'}`}>
                {item.label}
              </div>
            );
          }

          const isActive = pathname === item.path || (item.subItems && item.subItems.some((sub: any) => pathname === sub.path));
          const hasSubItems = !!item.subItems;
          const isExpanded = openMenus[item.label] || (hasSubItems && isActive && openMenus[item.label] !== false);

          return (
            <div key={item.path} className="flex flex-col">
              <Link
                to={hasSubItems ? '#' : item.path}
                onClick={(e) => hasSubItems ? toggleMenu(item.label, e) : undefined}
                className={`flex items-center justify-between ${isCollapsed ? 'px-0 justify-center' : 'px-3'} py-3 rounded-xl transition-colors font-medium text-sm ${isActive && !hasSubItems
                    ? 'bg-primary-light text-primary'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                  }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 overflow-hidden'}`}>
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive || isExpanded ? 'text-primary' : 'text-text-muted'}`} />
                  {!isCollapsed && <span className={`uppercase tracking-wider font-bold text-xs truncate ${isExpanded ? 'text-text-primary' : ''}`}>{item.label}</span>}
                </div>
                {!isCollapsed && hasSubItems && (
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-primary' : 'text-text-muted'}`} />
                )}
              </Link>
              
              {/* Sub Items */}
              {!isCollapsed && hasSubItems && isExpanded && (
                <div className="flex flex-col mt-1 ml-9 space-y-1 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                  {item.subItems.map((subItem: any) => {
                    const isSubActive = pathname === subItem.path;
                    return (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`text-xs uppercase tracking-wider font-bold py-2 px-3 rounded-lg transition-all duration-200 flex items-center truncate ${
                          isSubActive 
                            ? 'bg-primary/10 text-primary translate-x-1' 
                            : 'text-text-primary hover:text-primary hover:bg-primary/5 hover:translate-x-1'
                        }`}
                      >
                        <span className="truncate">{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-1 overflow-hidden">
        <Link
          to="/dashboard/edit-profile"
          className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-3 rounded-xl transition-colors font-medium text-sm text-text-secondary hover:bg-background hover:text-text-primary`}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 text-text-muted shrink-0" />
          {!isCollapsed && <span className="truncate">Settings</span>}
        </Link>
        <button
          onClick={logout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-3 rounded-xl transition-colors font-medium text-sm text-text-secondary hover:bg-rose-50 hover:text-rose-600`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 text-text-muted shrink-0" />
          {!isCollapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

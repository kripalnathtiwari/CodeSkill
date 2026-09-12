import React, { useState } from 'react';
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
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { path: '/dashboard/practice', label: 'Practice', icon: Target },
  { path: '/dashboard/tests', label: 'Tests', icon: Trophy },
  { path: '/dashboard/career', label: 'Career', icon: Briefcase },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`bg-surface border-r border-border h-screen sticky top-0 flex flex-col hidden lg:flex shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link to="/" className={`flex items-center space-x-2 text-xl font-bold tracking-tight text-primary ${isCollapsed ? 'hidden' : 'block'}`}>
          <Code2 className="h-6 w-6 text-primary shrink-0" />
          <span>CodeSkill</span>
        </Link>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-background text-text-secondary flex-shrink-0 mx-auto">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className={`text-xs font-bold text-text-muted uppercase tracking-wider mb-4 px-2 ${isCollapsed ? 'hidden' : 'block'}`}>Menu</div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-3 rounded-xl transition-colors font-medium text-sm ${isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-1">
        <Link
          to="/edit-profile"
          className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-3 rounded-xl transition-colors font-medium text-sm text-text-secondary hover:bg-background hover:text-text-primary`}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 text-text-muted shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={logout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-3 rounded-xl transition-colors font-medium text-sm text-text-secondary hover:bg-rose-50 hover:text-rose-600`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 text-text-muted shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

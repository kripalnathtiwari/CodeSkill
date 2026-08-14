import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Code2,
  LayoutDashboard,
  BookOpen,
  Trophy,
  Briefcase,
  Settings,
  LogOut,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/courses-training', label: 'Courses', icon: BookOpen },
  { path: '/problems', label: 'Practice', icon: Target },
  { path: '/contests', label: 'Tests', icon: Trophy },
  { path: '/jobs', label: 'Career', icon: Briefcase },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen sticky top-0 flex flex-col hidden lg:flex shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-primary">
          <Code2 className="h-6 w-6 text-primary" />
          <span>CodeSkill</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 px-2">Menu</div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-colors font-medium text-sm ${isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-1">
        <Link
          to="/edit-profile"
          className="flex items-center space-x-3 px-3 py-3 rounded-xl transition-colors font-medium text-sm text-text-secondary hover:bg-background hover:text-text-primary"
        >
          <Settings className="h-5 w-5 text-text-muted" />
          <span>Settings</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-colors font-medium text-sm text-text-secondary hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-5 w-5 text-text-muted" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

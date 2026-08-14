import React from 'react';
import { Search, Bell, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopNavProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function TopNav({ isDark, toggleTheme }: TopNavProps) {
  const { user } = useAuth();

  const userName = user?.profile?.firstName 
    ? `${user.profile.firstName} ${user.profile.lastName}` 
    : user?.email?.split('@')[0] || 'Student';

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search for courses, activities..."
            className="w-full bg-background border border-border rounded-full pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-text-secondary hover:bg-background transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button className="p-2 rounded-full text-text-secondary hover:bg-background transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border border-surface"></span>
        </button>

        <div className="h-8 w-px bg-border mx-2"></div>

        <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-bold text-text-primary">{userName}</span>
            <span className="text-xs text-text-muted capitalize">{user?.role?.toLowerCase() || 'Student'}</span>
          </div>
          <div className="h-9 w-9 bg-primary-light text-primary rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-primary/20">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
}

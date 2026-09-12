import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background text-text-primary flex font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden w-64 bg-surface z-50 transition-transform duration-300 ease-in-out`}>
        <div className="absolute top-4 right-4">
          <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 text-text-secondary bg-background rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="pt-4 h-full">
          <Sidebar />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <div className="flex items-center lg:hidden bg-surface border-b border-border px-4 py-3">
          <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 text-text-secondary bg-background rounded-lg mr-4">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <TopNav isDark={isDark} toggleTheme={toggleTheme} />
          </div>
        </div>

        <div className="hidden lg:block">
          <TopNav isDark={isDark} toggleTheme={toggleTheme} />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

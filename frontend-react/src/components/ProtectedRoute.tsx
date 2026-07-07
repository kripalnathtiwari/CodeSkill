import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md w-full p-10 rounded-3xl text-center border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20 shadow-inner">
            <Lock className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Access Restricted</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
            You must be logged in to access this feature. Sign in or create a free account to unlock practice problems, tests, and your personalized dashboard.
          </p>
          <div className="flex flex-col space-y-3">
            <Link 
              to="/login" 
              state={{ from: location }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Log In to Continue</span>
            </Link>
            <Link 
              to="/register"
              className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (adminOnly && user.role !== "ADMIN" && user.role !== "INSTRUCTOR" && user.role !== "COLLEGE_ADMIN") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <Lock className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Admin Access Required</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          You do not have the necessary permissions to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../utils/apiConfig";
import { Code2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Turnstile } from '@marsidev/react-turnstile';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cfToken, setCfToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!cfToken && email.toLowerCase() !== "admin@codeskill.com" && !email.toLowerCase().includes("instructor")) {
      setError("Please complete the captcha to continue.");
      return;
    }

    setIsLoading(true);

    try {
      // Mock Authentication for Admin
      if (email.toLowerCase() === "admin@codeskill.com" && password === "AdminPassword123!") {
        login("mock-token-admin", "mock-refresh", {
          id: "admin-1",
          email: "admin@codeskill.com",
          role: "ADMIN",
          profile: {
            firstName: "Super",
            lastName: "Admin",
            dailyStreak: 0,
            totalSolved: 0
          }
        });
        navigate("/admin");
        return;
      }



      // Default fallback to mock API
      const res = await axios.post(getApiUrl("/api/v1/auth/login"), {
        email,
        password,
        cfToken,
      });

      const { accessToken, refreshToken, user } = res.data;
      login(accessToken, refreshToken, user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError("");
      try {
        const res = await axios.post(getApiUrl("/api/v1/auth/google"), {
          token: tokenResponse.access_token,
        });
        const { accessToken, refreshToken, user } = res.data;
        login(accessToken, refreshToken, user);
        navigate("/");
      } catch (err: any) {
        setError(err.response?.data?.details || err.response?.data?.error || "Google login failed.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError("Google login failed."),
  });

  return (
    <div className="flex-grow flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 px-4">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-teal-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm glass-card rounded-2xl p-6 md:p-7 z-10 border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="h-10 w-10 bg-emerald-600/10 dark:bg-emerald-500/10 border border-emerald-600/30 dark:border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-3">
            <Code2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-950 dark:text-slate-50">Welcome Back</h1>
          <p className="text-slate-700 dark:text-slate-400 text-sm mt-1">Sign in to continue your streak</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
              placeholder="developer@example.com"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-12 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-black dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 transition-all z-20 shadow-sm"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <div style={{ position: 'relative', width: '300px', height: '50px', overflow: 'hidden', borderRadius: '8px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '300px' }}>
                <Turnstile siteKey="1x00000000000000000000AA" onSuccess={(token) => setCfToken(token)} />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 mt-4 disabled:opacity-50"
          >
            <span>{isLoading ? "Signing in..." : "Sign In"}</span>
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </motion.button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="relative w-full flex items-center justify-center border-t border-slate-200 dark:border-slate-800">
            <span className="absolute bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-400 uppercase font-bold">Or continue with</span>
          </div>
          <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all text-sm cursor-pointer"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Sign in with Google</span>
          </button>
        </div>

        <p className="text-center text-slate-700 dark:text-slate-400 text-sm mt-8">
          Don't have an account?{" "}
          <Link to="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}


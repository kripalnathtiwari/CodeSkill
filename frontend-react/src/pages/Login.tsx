import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../utils/apiConfig";
import { Code2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Turnstile } from '@marsidev/react-turnstile';
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cfToken, setCfToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

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
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }
        
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
      
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }
      
      login(accessToken, refreshToken, user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex-grow min-h-[calc(100vh-4rem)] flex w-full">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 relative p-6 lg:p-12 overflow-hidden">
        {/* Subtle background nodes pattern (simulated with CSS or existing grid) */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10 bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100"
        >
          <div className="flex items-center mb-8">
            <div className="h-8 w-8 bg-[#0056D2] rounded flex items-center justify-center text-white mr-2.5">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">CodeSklii</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to CodeSklii 👋</h1>
          <p className="text-slate-500 text-sm mb-8 font-medium">Enter your credentials below to access your account.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Id <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/50 transition-all placeholder:text-slate-400 text-sm font-medium"
                placeholder="developer@example.com"
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/50 transition-all placeholder:text-slate-400 text-sm font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0056D2] focus:ring-[#0056D2]" 
                />
                <span className="text-xs font-medium text-slate-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-[#0056D2] hover:underline">
                Forgot Password?
              </Link>
            </div>

            <div className="flex justify-center mt-2">
              <div style={{ position: 'relative', width: '100%', height: '50px', overflow: 'hidden', borderRadius: '8px' }} className="flex justify-center">
                <div style={{ position: 'absolute', top: 0, transform: 'scale(0.9)' }}>
                  <Turnstile siteKey="1x00000000000000000000AA" onSuccess={(token) => setCfToken(token)} />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full bg-[#0056D2] hover:bg-blue-700 text-white font-bold px-4 py-3.5 rounded-xl shadow-[0_4px_14px_rgba(0,86,210,0.3)] flex items-center justify-center transition-all disabled:opacity-50 mt-4 text-sm"
            >
              {isLoading ? "Signing in..." : "Login"}
            </motion.button>
          </form>


          <div className="text-center mt-8 space-y-4">
            <p className="text-xs text-slate-400 font-medium">
              Version 11.08
            </p>

          </div>
        </motion.div>
      </div>

      {/* Right Side: Visuals */}
      <div className="hidden lg:flex w-1/2 bg-[#0056D2] relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-sky-400/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="z-10 w-full max-w-2xl flex flex-col items-center mt-[-40px]">
          {/* Illustration Area */}
          <div className="w-full aspect-video mb-8 relative flex items-center justify-center p-2 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden group">
            {/* The user will replace this src with their actual illustration */}
            <img 
              src="/assets/auth-illustration.png" 
              alt="Teacher teaching student" 
              className="w-full h-full object-cover rounded-2xl opacity-90 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.02]"
            />
          </div>

          <div className="text-left w-full">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight">Learn, Practice and Succeed with CodeSkill</h2>
            <p className="text-blue-100 text-sm lg:text-base leading-relaxed mb-10 max-w-md font-medium">
              Access courses, build skills through self-learning, practice consistently, and get interview-ready.
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-slate-50/95 backdrop-blur-md rounded-2xl p-6 w-full flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20">
            <div className="text-center flex-1 border-r border-slate-200">
              <div className="text-2xl font-extrabold text-slate-900">25,000+</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Careers Empowered</div>
            </div>
            <div className="text-center flex-1 border-r border-slate-200">
              <div className="text-2xl font-extrabold text-slate-900">20+</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Campus Partners</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-2xl font-extrabold text-slate-900">4.9/5</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


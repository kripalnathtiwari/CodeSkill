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
    <div className="flex-grow min-h-screen flex w-full">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 relative p-4 lg:p-6 overflow-hidden">
        {/* Subtle background nodes pattern (simulated with CSS or existing grid) */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10 bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100"
        >
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white mr-2.5">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">CodeSklii</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome to CodeSklii 👋</h1>
          <p className="text-slate-500 text-sm mb-5 font-medium">Enter your credentials below to access your account.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Id <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400 text-sm font-medium"
                placeholder="developer@example.com"
              />
            </div>

            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 pr-12 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400 text-sm font-medium"
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

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
                />
                <span className="text-xs font-medium text-slate-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <div className="flex justify-center mt-2">
              <div style={{ position: 'relative', width: '100%', height: '50px', overflow: 'hidden', borderRadius: '8px' }} className="flex justify-center">
                <div style={{ position: 'absolute', top: 0, transform: 'scale(0.85)' }}>
                  <Turnstile siteKey="1x00000000000000000000AA" onSuccess={(token) => setCfToken(token)} />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center transition-all disabled:opacity-50 mt-2 text-sm"
            >
              {isLoading ? "Signing in..." : "Login"}
            </motion.button>
          </form>

          <div className="text-center mt-6 space-y-4">
            <p className="text-xs text-slate-400 font-medium">
              Version 11.08
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Visuals */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-white via-orange-50 to-primary/10 relative flex-col items-center justify-center p-8 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-300/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="z-10 w-full max-w-xl flex flex-col items-center justify-center h-full relative">
          {/* Decorative Primary Squares */}
          <div className="absolute top-[5%] -left-6 w-12 h-12 bg-primary rounded-xl shadow-lg shadow-primary/30 rotate-12 z-0 animate-bounce" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-[35%] -right-12 w-16 h-16 bg-primary rounded-2xl shadow-xl shadow-primary/20 -rotate-6 z-0 animate-bounce" style={{ animationDuration: '6s' }}></div>
          <div className="absolute top-[60%] -left-8 w-8 h-8 bg-primary/80 rounded-lg shadow-md shadow-primary/20 rotate-45 z-0 animate-pulse"></div>
          <div className="absolute top-[20%] -right-4 w-10 h-10 bg-primary/90 rounded-xl shadow-lg shadow-primary/20 rotate-12 z-0 animate-bounce" style={{ animationDuration: '5s' }}></div>
          <div className="absolute bottom-[10%] left-4 w-14 h-14 bg-primary/70 rounded-2xl shadow-xl shadow-primary/20 -rotate-12 z-0 animate-pulse" style={{ animationDuration: '3s' }}></div>
          <div className="absolute -top-4 right-[20%] w-6 h-6 bg-primary/50 rounded-lg shadow-sm shadow-primary/10 rotate-45 z-0 animate-pulse"></div>
          
          {/* Illustration Area */}
          <div className="w-full aspect-video mb-6 relative flex items-center justify-center p-3 rounded-3xl bg-primary/10 backdrop-blur-md border-2 border-primary/20 shadow-xl overflow-hidden group z-10">
            <img 
              src="/assets/auth-illustration.png" 
              alt="Teacher teaching student" 
              className="w-full h-full object-cover rounded-2xl opacity-90 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.02]"
            />
          </div>

          <div className="text-left w-full mb-6">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Learn, Practice and Succeed with CodeSkill</h2>
            <p className="text-slate-600 text-sm lg:text-base leading-relaxed font-medium">
              Access courses, build skills through self-learning, practice consistently, and get interview-ready.
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 w-full flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
            <div className="text-center flex-1 border-r border-slate-200">
              <div className="text-xl font-extrabold text-slate-900">25,000+</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Careers Empowered</div>
            </div>
            <div className="text-center flex-1 border-r border-slate-200">
              <div className="text-xl font-extrabold text-slate-900">20+</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Campus Partners</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-xl font-extrabold text-slate-900">4.9/5</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


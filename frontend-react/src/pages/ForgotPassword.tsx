import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getApiUrl } from "../utils/apiConfig";
import { Code2, ArrowLeft, Eye, EyeOff, Mail, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(getApiUrl("/api/v1/auth/request-otp"), { email });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to request OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(getApiUrl("/api/v1/auth/verify-otp"), { email, otp });
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(getApiUrl("/api/v1/auth/reset-password"), {
        email,
        resetToken,
        newPassword
      });
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow min-h-[calc(100vh-4rem)] flex w-full">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 relative p-6 lg:p-12 overflow-hidden">
        {/* Subtle background nodes pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10 bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white mr-2.5">
                <Code2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">CodeSklii</span>
            </div>
            
            {step < 4 && (
              <Link to="/login" className="flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: REQUEST OTP */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password? 🔒</h1>
                <p className="text-slate-500 text-sm mb-8 font-medium">Enter your registered email address and we'll send you an OTP to reset your password.</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-lg mb-6 text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Id <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400 text-sm font-medium"
                        placeholder="developer@example.com"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading || !email}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold px-4 py-3.5 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center transition-all disabled:opacity-50 mt-4 text-sm"
                  >
                    {isLoading ? "Sending OTP..." : "Get OTP"}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: VERIFY OTP */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify OTP ✉️</h1>
                <p className="text-slate-500 text-sm mb-8 font-medium">We've sent a 6-digit OTP to <span className="font-bold text-slate-700">{email}</span>. Please enter it below.</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-lg mb-6 text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">6-Digit OTP <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400 text-sm font-bold tracking-[0.5em] text-center"
                        placeholder="••••••"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold px-4 py-3.5 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center transition-all disabled:opacity-50 mt-4 text-sm"
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </motion.button>
                  
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => { setStep(1); setOtp(""); }} className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                      Change Email Address
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Set New Password 🔑</h1>
                <p className="text-slate-500 text-sm mb-8 font-medium">Your email is verified. Please set a new strong password for your account.</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-lg mb-6 text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-12 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400 text-sm font-medium"
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

                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-12 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400 text-sm font-medium"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading || !newPassword || !confirmPassword}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold px-4 py-3.5 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center transition-all disabled:opacity-50 mt-4 text-sm"
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Successful! 🎉</h1>
                <p className="text-slate-500 text-sm mb-8 font-medium">You can now use your new password to log in to your account.</p>
                
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold px-4 py-3.5 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center transition-all"
                  >
                    Proceed to Login
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
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

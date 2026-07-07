import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Code2, ArrowRight, User, Mail, Phone, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Turnstile } from '@marsidev/react-turnstile';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cfToken, setCfToken] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!cfToken) {
      setError("Please complete the captcha to continue.");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post("http://localhost:5000/api/v1/auth/register", {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        cfToken,
      });

      // After successful registration, auto redirect to login
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/v1/auth/google", {
        token: credentialResponse.credential
      });
      // For register, we can automatically log them in or redirect them
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Google sign-up failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 py-12">
      {/* Animated Background orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-1/4 w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 left-1/4 w-[40%] h-[40%] bg-teal-600/20 rounded-full blur-[100px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-8 md:p-10 z-10 border border-slate-200 dark:border-slate-800 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 shadow-lg shadow-emerald-500/10">
            <Code2 className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create an Account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Join us and start building your profile</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium p-4 rounded-xl mb-6 text-center">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* 2-Column Grid for Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  placeholder="Aarav"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  placeholder="Sharma"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  placeholder="developer@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number <span className="text-slate-400 font-normal">(Optional)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  placeholder="+91 98765 43210"
                  pattern="(\+91\s?)?[6-9]\d{9}"
                  title="Please enter a valid Indian phone number (e.g., +91 98765 43210)"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
            <div className="shrink-0" style={{ position: 'relative', width: '300px', height: '50px', overflow: 'hidden', borderRadius: '12px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '300px' }}>
                <Turnstile siteKey="1x00000000000000000000AA" onSuccess={(token) => setCfToken(token)} />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.01, boxShadow: "0px 10px 20px rgba(16, 185, 129, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="flex-1 w-full h-[50px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? "Creating..." : "Create Account"}</span>
              {!isLoading && <ArrowRight className="h-5 w-5" />}
            </motion.button>
          </div>
        </form>

        <div className="mt-8 flex flex-col items-center gap-5">
          <div className="relative w-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Or sign up with
            </div>
          </div>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError("Google authentication failed.");
            }}
            shape="rectangular"
            theme="outline"
            text="signup_with"
            size="large"
            width="350"
          />
        </div>

        <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-8 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}


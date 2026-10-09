import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function CareerTools() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleActionClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (user) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="py-20 px-6 w-full z-10 relative border-t border-border dark:border-border/50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="bg-blue-50/50 dark:bg-gradient-to-br dark:from-blue-900/40 dark:via-sky-900/40 dark:to-slate-900 border border-blue-200 dark:border-primary/30 rounded-3xl p-8 md:p-14 overflow-hidden relative"
      >
        {/* Background glowing effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 dark:bg-primary/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 dark:bg-sky-500/20 rounded-full blur-[80px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Visual/Image for ATS & CV (Left Side) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1 w-full flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg glass-card p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl group hover:-translate-y-1 transition-transform z-10">
              <div className="absolute inset-0 bg-gradient-premium opacity-5 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl" />
              <img 
                src="https://res.cloudinary.com/zihn8u4b/image/upload/v1789450374/cv.png" 
                alt="CodeSklii Career Tools & ATS Analysis" 
                className="w-full h-auto rounded-xl object-cover relative z-10 shadow-sm border border-white/10"
                loading="lazy"
              />
            </div>

            <motion.div
               initial={{ opacity: 0, y: 30, scale: 0.9 }}
               whileInView={{ opacity: 1, y: 0, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, delay: 0.3 }}
               className="absolute -bottom-10 -right-6 md:-bottom-16 md:-right-12 w-2/3 md:w-3/5 z-20 hover:-translate-y-2 transition-transform duration-500 drop-shadow-2xl"
            >
              <img 
                src="https://res.cloudinary.com/zihn8u4b/image/upload/v1789450743/cv2.png" 
                alt="Resume Templates" 
                className="w-full h-auto object-contain rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                loading="lazy"
              />
            </motion.div>
          </motion.div>

          {/* Content (Right Side) */}
          <div className="flex flex-col h-full order-1 lg:order-2 space-y-8 lg:pl-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-primary/20 border border-blue-200 dark:border-primary/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
                <Target className="w-4 h-4" />
                <span>Career Advancement Tools</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary dark:text-text-primary leading-tight tracking-tight">
                Optimize Your CV for <br className="hidden md:block"/>
                <span className="text-primary drop-shadow-sm">
                  Top Tech Companies
                </span>
              </h2>

              <p className="text-xl text-text-secondary dark:text-text-secondary leading-relaxed max-w-xl font-medium">
                Our comprehensive suite of career tools is engineered to ensure you don't let Applicant Tracking Systems (ATS) reject your hard work. 
                We use intelligent parsing and advanced algorithms to analyze your resume's structure, keyword optimization, and overall readability.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start space-x-3 bg-surface/50 dark:bg-slate-800/40 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary dark:text-text-inverse text-lg">Keyword Matching</h4>
                    <p className="text-sm md:text-base text-text-secondary dark:text-text-muted mt-1 leading-relaxed">AI-driven extraction ensures your skills align with targeted job roles.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-surface/50 dark:bg-slate-800/40 p-4 rounded-xl border border-border/50 hover:border-blue-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary dark:text-text-inverse text-lg">ATS Compatibility</h4>
                    <p className="text-sm md:text-base text-text-secondary dark:text-text-muted mt-1 leading-relaxed">Receive an instant readability and ATS compatibility score before applying.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 bg-surface/50 dark:bg-slate-800/40 p-4 rounded-xl border border-border/50 sm:col-span-2 hover:border-emerald-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary dark:text-text-inverse text-lg">Recruiter-Approved Formats</h4>
                    <p className="text-sm md:text-base text-text-secondary dark:text-text-muted mt-1 leading-relaxed">Build standout resumes from scratch using professional, structured templates that recruiters love.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-auto pt-6">
              <div onClick={(e) => handleActionClick(e, "/dashboard/career/resume-maker")} className="inline-block w-full sm:w-auto cursor-pointer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-text-inverse font-extrabold px-8 py-4 rounded-xl border-2 border-transparent transition-all shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 w-full sm:w-auto text-base sm:text-lg tracking-wide"
                >
                  <FileText className="w-5 h-5" />
                  <span>Make your CV</span>
                </motion.button>
              </div>

              <div onClick={(e) => handleActionClick(e, "/dashboard/career/resume-analysis")} className="inline-block w-full sm:w-auto cursor-pointer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 bg-surface dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-slate-700 text-text-primary dark:text-text-primary font-extrabold px-8 py-4 rounded-xl border-2 border-primary/50 hover:border-primary transition-all shadow-lg w-full sm:w-auto text-base sm:text-lg tracking-wide"
                >
                  <ShieldCheck className="w-5 h-5 text-primary dark:text-primary" />
                  <span>Check ATS Score</span>
                </motion.button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}

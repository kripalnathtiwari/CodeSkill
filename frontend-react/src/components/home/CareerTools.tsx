import React from "react";
import { Link } from "react-router-dom";
import { FileText, ShieldCheck, BarChart3, PenTool } from "lucide-react";
import { motion } from "framer-motion";

export default function CareerTools() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10 relative border-t border-border dark:border-border/50">
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
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-primary/20 border border-blue-200 dark:border-primary/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest rounded-full">
              Career Tools
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-text-primary dark:text-text-primary leading-tight">
              Optimize Your CV for <br />
              <span className="text-primary drop-shadow-sm">
                Top Tech Companies
              </span>
            </h2>

            <p className="text-lg text-text-secondary dark:text-text-secondary leading-relaxed max-w-xl">
              Don't let the Applicant Tracking System (ATS) reject your hard work. Use our AI-powered tools to build a standout resume and check your ATS score instantly.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/cv-builder" className="inline-block w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-text-inverse font-extrabold px-8 py-4 rounded-xl border-2 border-white/90 transition-all shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 w-full sm:w-auto text-base sm:text-lg tracking-wide"
                >
                  <FileText className="w-5 h-5" />
                  <span>Make your CV</span>
                </motion.button>
              </Link>

              <Link to="/ats-checker" className="inline-block w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 bg-surface dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-slate-700 text-text-primary dark:text-text-primary font-extrabold px-8 py-4 rounded-xl border-2 border-primary/50 hover:border-primary transition-all shadow-lg w-full sm:w-auto text-base sm:text-lg tracking-wide"
                >
                  <ShieldCheck className="w-5 h-5 text-primary dark:text-primary" />
                  <span>Check ATS Score</span>
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Visual/Cards for ATS & CV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            <Link to="/ats-checker" className="block">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-surface dark:bg-background/80 backdrop-blur-sm border border-slate-100 dark:border-primary/20 hover:border-primary/50 p-6 rounded-2xl shadow-lg dark:shadow-xl h-full cursor-pointer transition-all"
              >
                <motion.div
                  animate={{ rotate: [-3, 3, -3] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-12 h-12 bg-blue-50 dark:bg-primary/20 text-primary dark:text-primary rounded-xl flex items-center justify-center mb-4"
                >
                  <BarChart3 className="w-6 h-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-text-primary dark:text-text-primary mb-2 flex items-center justify-between">
                  <span>Smart ATS Scoring</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary dark:text-primary">Try Free</span>
                </h3>
                <p className="text-text-secondary dark:text-text-muted text-sm">
                  Get instant feedback on keyword matching, formatting, and readability to ensure your CV passes the bot screens.
                </p>
              </motion.div>
            </Link>

            <Link to="/cv-builder" className="block mt-0 sm:mt-12">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-surface dark:bg-background/80 backdrop-blur-sm border border-slate-100 dark:border-sky-500/20 hover:border-sky-500/50 p-6 rounded-2xl shadow-lg dark:shadow-xl h-full cursor-pointer transition-all"
              >
                <motion.div
                  animate={{ rotate: [3, -3, 3] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                  className="w-12 h-12 bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center mb-4"
                >
                  <PenTool className="w-6 h-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-text-primary dark:text-text-primary mb-2 flex items-center justify-between">
                  <span>Modern Templates</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400">Try Free</span>
                </h3>
                <p className="text-text-secondary dark:text-text-muted text-sm">
                  Choose from a variety of professionally designed, recruiter-approved templates tailored for software engineering roles.
                </p>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

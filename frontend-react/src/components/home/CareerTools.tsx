import React from "react";
import { Link } from "react-router-dom";
import { FileText, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import cvImage from "../../assets/cv-image.jpg";

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

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          <div className="flex flex-col h-full">
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

              <ul className="space-y-4 pt-2">
                {[
                  "AI-driven keyword optimization for your target roles",
                  "Professional, recruiter-approved formatting templates",
                  "Instant readability and ATS compatibility score"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center text-text-primary dark:text-text-secondary font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-auto pt-8">
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

          {/* Visual/Image for ATS & CV */}
          <div className="relative group lg:ml-auto w-full flex items-center justify-center lg:justify-end mt-10 lg:mt-0 lg:h-full py-6">
            <div className="relative w-full max-w-sm lg:max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-primary/20 transform rotate-2 hover:rotate-0 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
              <img 
                src={cvImage} 
                alt="CV Builder and ATS Checker Preview" 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

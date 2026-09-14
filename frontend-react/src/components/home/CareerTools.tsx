import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import kripalCvImage from "../../assets/kripal-cv-image.png";
import originalCvImage from "../../assets/cv-image.jpg";
import cvStackImage from "../../assets/cv-stack-image.png";

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
              <div onClick={(e) => handleActionClick(e, "/dashboard/career/resume-maker")} className="inline-block w-full sm:w-auto cursor-pointer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-text-inverse font-extrabold px-8 py-4 rounded-xl border-2 border-white/90 transition-all shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 w-full sm:w-auto text-base sm:text-lg tracking-wide"
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

          {/* Visual/Image for ATS & CV */}
          <div className="relative group lg:ml-auto w-full flex items-center justify-center h-[350px] sm:h-[400px] lg:h-[500px] py-6 lg:max-w-xl xl:max-w-2xl">
            {/* Left Image */}
            <div className="absolute left-0 sm:left-4 lg:left-0 top-1/2 -translate-y-1/2 w-[55%] sm:w-[50%] lg:w-[55%] rounded-md shadow-xl border border-white/10 opacity-80 transform -translate-x-4 scale-[0.85] transition duration-500 group-hover:-translate-x-16 group-hover:scale-[0.9] group-hover:opacity-100 z-0 hover:!z-30 cursor-pointer will-change-transform">
              <img 
                src={originalCvImage} 
                alt="CV Stack Example" 
                className="w-full h-auto object-cover rounded-md"
              />
            </div>
            
            {/* Right Image */}
            <div className="absolute right-0 sm:right-4 lg:right-0 top-1/2 -translate-y-1/2 w-[55%] sm:w-[50%] lg:w-[55%] rounded-md shadow-xl border border-white/10 opacity-80 transform translate-x-4 scale-[0.85] transition duration-500 group-hover:translate-x-16 group-hover:scale-[0.9] group-hover:opacity-100 z-0 hover:!z-30 cursor-pointer will-change-transform">
              <img 
                src={originalCvImage} 
                alt="Original CV Example" 
                className="w-full h-auto object-cover rounded-md"
              />
            </div>
            
            {/* Center Image (Foreground) */}
            <div className="relative z-10 hover:!z-40 w-[65%] sm:w-[60%] lg:w-[65%] rounded-md shadow-2xl border border-white/20 dark:border-primary/20 transform transition duration-500 group-hover:scale-105 group-hover:-translate-y-4 cursor-pointer will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none rounded-md"></div>
              <img 
                src={kripalCvImage} 
                alt="CV Builder and ATS Checker Preview" 
                className="w-full h-auto object-cover rounded-md transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

import React from "react";
import { ClipboardCheck, LayoutGrid, BarChart2, Zap, Briefcase, Award } from "lucide-react";
import { motion } from "framer-motion";
import industryReadyImg from "../../assets/real-classroom-2.jpg";

export default function EngineSection() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch"
      >
        {/* Left Side Content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-text-primary dark:text-text-primary mb-4 leading-tight">
              How We Build <span className="text-primary dark:text-primary">Industry-Ready Engineers</span>
            </h2>
            <p className="text-text-secondary dark:text-text-muted text-lg font-medium leading-relaxed">
              A structured 4-year parallel program running inside your campus from pre-assessment to global placement offers.
            </p>
          </div>

          <div>
            <h3 className="text-blue-700 dark:text-primary font-bold uppercase tracking-[0.2em] text-sm md:text-base mb-6">
              Parallel Execution Engine
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <ClipboardCheck className="w-6 h-6 text-primary" />, title: "Pre-Assessment" },
                { icon: <LayoutGrid className="w-6 h-6 text-primary" />, title: "Foundation Building" },
                { icon: <BarChart2 className="w-6 h-6 text-primary" />, title: "Regular Assessments" },
                { icon: <Zap className="w-6 h-6 text-primary" />, title: "Advanced Concepts" },
                { icon: <Briefcase className="w-6 h-6 text-primary" />, title: "Projects & Internships" },
                { icon: <Award className="w-6 h-6 text-primary" />, title: "Placement" },
              ].map((step, idx) => (
                <div 
                  key={idx}
                  className="flex items-center space-x-4 bg-surface/90 dark:bg-background/90 border border-border/80 dark:border-border/80 rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 dark:bg-primary/15 rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                  <h4 className="text-text-primary dark:text-text-secondary font-bold text-sm sm:text-base">
                    {step.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="relative group lg:ml-auto w-full lg:h-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative h-[300px] sm:h-[400px] lg:h-full rounded-[2rem] overflow-hidden border border-border shadow-2xl">
            <img 
              src={industryReadyImg} 
              alt="Industry Ready Engineers Classroom" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
          </div>
        </div>

      </motion.div>
    </section>
  );
}

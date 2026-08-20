import React from "react";
import { UserCog, ClipboardCheck, LayoutGrid, BarChart2, Zap, Briefcase, Award, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function EngineSection() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-text-primary dark:text-text-primary mb-4">
          How We Build <span className="text-primary dark:text-primary">Industry-Ready Engineers</span>
        </h2>
        <p className="text-text-secondary dark:text-text-muted max-w-3xl mx-auto text-lg mb-12 font-medium">
          A structured 4-year parallel program running inside your campus from pre-assessment to global placement offers.
        </p>

        <div className="flex flex-col items-center justify-center mb-16">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-24 h-24 bg-surface dark:bg-slate-800 border-2 border-slate-100 dark:border-border rounded-3xl flex items-center justify-center shadow-xl mb-6 shadow-blue-500/10"
          >
            <div className="bg-primary w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner">
              <UserCog className="w-10 h-10 text-text-inverse" />
            </div>
          </motion.div>
          <h3 className="text-blue-700 dark:text-primary font-bold uppercase tracking-[0.2em] text-sm md:text-base">
            Parallel Execution Engine
          </h3>
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row items-center justify-between gap-3 lg:gap-2 xl:gap-3 w-full max-w-6xl mx-auto px-2"
        >
          {[
            { icon: <ClipboardCheck className="w-8 h-8 text-primary" />, title: "Pre-Assessment" },
            { icon: <LayoutGrid className="w-8 h-8 text-primary" />, title: "Foundation Building" },
            { icon: <BarChart2 className="w-8 h-8 text-primary" />, title: "Regular Assessments" },
            { icon: <Zap className="w-8 h-8 text-primary" />, title: "Advanced Concepts" },
            { icon: <Briefcase className="w-8 h-8 text-primary" />, title: "Projects & Internships" },
            { icon: <Award className="w-8 h-8 text-primary" />, title: "Placement" },
          ].map((step, idx, arr) => (
            <React.Fragment key={idx}>
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 15 },
                  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex flex-col items-center justify-center w-full lg:flex-1 min-w-0 bg-surface/90 dark:bg-background/90 backdrop-blur-md border border-border/80 dark:border-border/80 rounded-2xl py-8 px-4 shadow-sm hover:shadow-blue-500/10 hover:border-primary/40 transition-all cursor-default group"
              >
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary/15 group-hover:bg-primary/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                  {step.icon}
                </div>
                <h4 className="text-text-primary dark:text-text-secondary font-bold text-base sm:text-lg text-center leading-snug">
                  {step.title}
                </h4>
              </motion.div>
              {idx < arr.length - 1 && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 0.6, transition: { duration: 0.3 } }
                  }}
                  className="hidden lg:flex items-center justify-center w-3 xl:w-5 shrink-0 text-primary/70"
                >
                  <ArrowRight className="w-4 h-4 xl:w-5 xl:h-5" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </motion.div>

      </motion.div>
    </section>
  );
}

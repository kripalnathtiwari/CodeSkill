import React from "react";
import { Terminal, Cpu, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturesGrid() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10 relative border-t border-border dark:border-border/50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-text-primary mb-14">
          Engineered for Enterprise Assessment Scaling
        </h2>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { icon: Terminal, title: "Monaco IDE Sandbox", textClass: "text-primary dark:text-primary", bgClass: "bg-blue-50 dark:bg-primary/10", borderClass: "border-blue-100 dark:border-primary/20", desc: "Fully customized Monaco editor workspace with automatic formatting scripts, themes support, auto-save triggers, and interactive output logs." },
            { icon: Cpu, title: "Multi-Lang Compiler", textClass: "text-sky-500 dark:text-sky-400", bgClass: "bg-sky-50 dark:bg-sky-500/10", borderClass: "border-sky-100 dark:border-sky-500/20", desc: "Asynchronous evaluation runner supporting Python, JavaScript, TypeScript, Rust, Go, C/C++, Java, and PHP with precise execution telemetry." },
            { icon: Layers, title: "Leaderboards & Streaks", textClass: "text-sky-500 dark:text-sky-400", bgClass: "bg-sky-50 dark:bg-sky-500/10", borderClass: "border-sky-100 dark:border-sky-500/20", desc: "Encourage healthy coding competition through global leaderboards, streak awards, achievements levels, and interactive rating metrics." }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring" } }
              }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-surface dark:bg-background/50 backdrop-blur-md rounded-3xl p-8 border border-border dark:border-border space-y-5 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 h-full"
            >
              <motion.div
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: idx * 0.5 }}
                className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 border ${feature.bgClass} ${feature.borderClass} ${feature.textClass}`}
              >
                <feature.icon className="h-8 w-8" />
              </motion.div>
              <h3 className="text-xl font-bold text-text-primary dark:text-text-primary">{feature.title}</h3>
              <p className="text-sm text-text-secondary dark:text-text-muted leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

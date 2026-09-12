import React from "react";
import { Code2, Zap, Trophy, Laptop } from "lucide-react";
import { motion } from "framer-motion";
import compilerImg from "../../assets/compiler-image.png";

export default function CompilerSection() {
  return (
    <section className="py-20 px-6 w-full z-10 relative bg-surface dark:bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-sm font-bold text-primary uppercase tracking-widest mb-6">
            <Code2 className="w-4 h-4" />
            <span>Interactive Coding</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary dark:text-text-primary mb-6">
            Meet <span className="text-primary">Our Compiler</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary dark:text-text-muted max-w-3xl mx-auto leading-relaxed">
            Experience a powerful, enterprise-grade coding environment directly in your browser. Write, test, and execute your code in real-time across multiple programming languages without any local setup.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Features List */}
          <div className="space-y-8 order-2 lg:order-1 lg:col-span-5">
            {[
              {
                icon: <Laptop className="w-6 h-6 text-primary" />,
                title: "Advanced IDE Sandbox",
                desc: "A fully customized editor workspace with automatic formatting, syntax highlighting, and intelligent code completion.",
              },
              {
                icon: <Zap className="w-6 h-6 text-primary" />,
                title: "Multi-Language Support",
                desc: "Lightning-fast execution supporting Python, JavaScript, C++, Java, Rust, Go, and many more industry-standard languages.",
              },
              {
                icon: <Trophy className="w-6 h-6 text-primary" />,
                title: "Leaderboards & Streaks",
                desc: "Stay motivated and compete globally. Earn streaks, unlock achievements, and climb the ranks on our live leaderboards.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="flex space-x-4 bg-background dark:bg-slate-900/50 p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary dark:text-text-muted leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Compiler UI Image */}
          <div className="order-1 lg:order-2 lg:col-span-7 lg:-mr-8">
            <div className="relative group rounded-[2rem] overflow-hidden border-2 border-border/50 shadow-2xl bg-white dark:bg-slate-900">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <img 
                src={compilerImg} 
                alt="Our Compiler Interface" 
                className="w-full h-auto object-contain transform transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

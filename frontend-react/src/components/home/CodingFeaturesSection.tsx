import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Zap, Layout, MonitorPlay, Sparkles } from 'lucide-react';

const CodingFeaturesSection = () => {
  return (
    <section className="py-24 w-full relative">
      {/* Background with slight variation */}
      <div className="absolute inset-0 bg-accent/5 dark:bg-accent/5 rounded-3xl -z-10" />
      
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Coding Features (Text Left, Image Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Content */}
          <div className="space-y-8 lg:pr-8 order-2 lg:order-1">
            <div>
              <div className="inline-flex items-center space-x-2 bg-accent/10 text-accent dark:text-accent-light px-4 py-2 rounded-full mb-6 font-medium text-sm border border-accent/20">
                <Code2 className="w-4 h-4" />
                <span>Advanced Cloud IDE</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-text-primary dark:text-text-inverse leading-tight mb-4 tracking-tight">
                Immersive Coding with <br/>
                <span className="text-accent">Enterprise-Grade Tools</span>
              </h2>
              <p className="text-text-secondary dark:text-text-muted text-xl leading-relaxed font-medium">
                Experience a world-class coding environment right in your browser. Write, test, and debug seamlessly with our advanced editor featuring multi-language support, real-time execution, and intelligent code assistance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <MonitorPlay className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-base">Real-Time Execution</h4>
                  <p className="text-sm text-text-secondary dark:text-text-muted leading-relaxed">Run and test your code instantly without setting up local environments.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-base">Intelligent Assistance</h4>
                  <p className="text-sm text-text-secondary dark:text-text-muted leading-relaxed">Syntax highlighting and auto-completion to code faster and with fewer errors.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Layout className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-base">Split-Pane Interface</h4>
                  <p className="text-sm text-text-secondary dark:text-text-muted leading-relaxed">Read problem statements and write code side-by-side efficiently.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 bg-surface dark:bg-slate-800/50 p-4 rounded-xl border border-border dark:border-border/50 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary dark:text-text-inverse mb-1 text-base">Zero Latency</h4>
                  <p className="text-sm text-text-secondary dark:text-text-muted leading-relaxed">Lightning-fast compiler that evaluates your edge cases in milliseconds.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Image */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative glass-card p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden group hover:-translate-y-1 transition-transform order-1 lg:order-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-500" />
            <img 
              src="https://res.cloudinary.com/zihn8u4b/image/upload/v1789534566/coding.png" 
              alt="Advanced Coding Environment" 
              className="w-full h-auto rounded-xl object-cover relative z-10 shadow-sm border border-white/10"
              loading="lazy"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default CodingFeaturesSection;

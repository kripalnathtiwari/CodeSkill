import React from "react";
import { Link } from "react-router-dom";
import { Terminal, Award, Cpu, ShieldAlert, Users, Layers, ArrowRight, Code, Code2, MonitorPlay, Clock, CheckCircle2, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

import { getCoursesByCategory } from "../data/coursesData";

export default function Home() {
  return (
    <div className="flex-grow flex flex-col justify-center items-center relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* Dynamic Animated Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-600/20 rounded-full blur-[120px]" 
      />

      {/* Hero section */}
      <section className="text-center py-24 px-6 max-w-5xl mx-auto space-y-8 z-10 relative">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 flex flex-col items-center">
          
          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-400 backdrop-blur-md">
            <Award className="h-4 w-4" />
            <span>TeachSkill Assessment Suite v2.0</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight">
            Evaluate & Match <br className="hidden sm:block" /> Developer Talents <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              With Real-time Engines
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-700 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Create, edit, compile, and execute code solutions dynamically in 10+ programming languages. Backed by highly scalable, interactive environments.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 w-full sm:w-auto">
            <Link to="/problems" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] w-full justify-center"
              >
                <span>Practice Playground</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
            
            <Link to="/dashboard" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(30, 41, 59, 1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-100 font-bold px-8 py-4 rounded-xl transition-colors w-full justify-center"
              >
                <span>View Dashboard</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col items-center mb-14 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Master Your Skills</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Explore our most popular self-paced courses designed by industry experts to help you land your dream tech job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getCoursesByCategory("featured").map(course => (
              <motion.div 
                key={course.id} 
                whileHover={{ y: -8 }}
                className="group bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col shadow-sm hover:shadow-2xl overflow-hidden"
              >
                {/* Course Image */}
                <div className="w-full h-48 overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10`} />
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute bottom-4 left-4 z-20 flex space-x-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${course.color} p-[1px]`}>
                      <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center">
                        <course.icon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {course.title}
                    </h3>
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-md text-sm font-bold ml-2 whitespace-nowrap">
                      {course.price}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
                    {course.description}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{course.level}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{course.students} Enrolled</span>
                      </div>
                    </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {course.tags.map(tag => (
                      <span key={tag} className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-1 rounded font-semibold tracking-wider uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>

                    <Link to={`/course/${course.id}`} className="block mt-4">
                      <button className="w-full py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <span>Explore Syllabus</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/courses-training">
              <button className="inline-flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                <span>View all courses & summer training</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10 relative border-t border-slate-200 dark:border-slate-800/50">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-slate-700 mb-14">
            Engineered for Enterprise Assessment Scaling
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Terminal, title: "Monaco IDE Sandbox", color: "violet", desc: "Fully customized Monaco editor workspace with automatic formatting scripts, themes support, auto-save triggers, and interactive output logs." },
              { icon: Cpu, title: "Multi-Lang Compiler", color: "indigo", desc: "Asynchronous evaluation runner supporting Python, JavaScript, TypeScript, Rust, Go, C/C++, Java, and PHP with precise execution telemetry." },
              { icon: Layers, title: "Leaderboards & Streaks", color: "cyan", desc: "Encourage healthy coding competition through global leaderboards, streak awards, achievements levels, and interactive rating metrics." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10, scale: 1.02 }}
                className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-slate-200 dark:border-slate-800/40 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
              >
                {/* Dynamically construct class name or use inline style for colors if tailwind dynamic classes are purged, but sticking to original code for now */}
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 border bg-slate-800/50 border-slate-700 text-${feature.color}-400`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-slate-50">{feature.title}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { Terminal, Award, Cpu, ShieldAlert, Users, Layers, ArrowRight, Code, Code2, MonitorPlay, Clock, CheckCircle2, GraduationCap, MessageCircle, FileText, ShieldCheck, BarChart3, PenTool, ClipboardCheck, LayoutGrid, BarChart2, Zap, Briefcase, UserCog } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

import { getCoursesByCategory } from "../data/coursesData";

export default function Home() {
  return (
    <div className="flex-grow flex flex-col justify-center items-center relative overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* Dynamic Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-600/20 rounded-full blur-[120px]"
      />

      {/* Hero section */}
      <section className="text-center py-24 px-6 max-w-5xl mx-auto space-y-8 z-10 relative">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 flex flex-col items-center">

          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-5 py-2 rounded-full text-sm font-semibold text-emerald-600 dark:text-emerald-400 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Award className="h-4 w-4" />
            <span>CodeSkill Assessment Suite v2.0</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
            One Platform for Training, <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              Certifications & Career Growth.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Create, edit, compile, and execute code solutions dynamically in 10+ programming languages. Backed by highly scalable, interactive environments.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 w-full sm:w-auto">
            <Link to="/problems" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] w-full justify-center border border-emerald-500/50"
              >
                <span>Practice Playground</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>

            <Link to="/dashboard" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center space-x-2 bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm sm:text-base px-6 py-3 rounded-xl transition-colors w-full justify-center shadow-sm dark:shadow-none"
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

          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {getCoursesByCategory("featured").map(course => (
              <motion.div
                key={course.id}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", bounce: 0.3 } }
                }}
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
          </motion.div>

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

      {/* Campus Drives & Workshops Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10 relative border-t border-slate-200 dark:border-slate-800/50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Side Content */}
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-full">
              Campus Drives & Workshops
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Colleges: Elevate Student Readiness with Custom Trainer Bookings
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Bring industry subject-matter experts to your campus. Schedule interactive bootcamps, hands-on hackathons, or custom placement training modules tailored to your engineering curriculum.
            </p>
            
            <ul className="space-y-4 pt-2 pb-4">
              {[
                "Vetted corporate trainers with 5+ years of active field experience",
                "Complete syllabus alignment & training material distribution",
                "Lab assignments, hackathons, and placement certifications"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-[15px]">{item}</span>
                </li>
              ))}
            </ul>
            
            <Link to="/contact">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]">
                Request Session Now
              </button>
            </Link>
          </div>
          
          {/* Right Side Workflow Card */}
          <div className="relative">
            {/* Green border accent on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-2xl z-20 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            
            <div className="bg-[#111827] border border-slate-700/50 rounded-2xl p-8 md:p-10 shadow-2xl relative z-10 overflow-hidden">
              <h3 className="text-2xl font-bold text-white mb-8">Trainer Allocation Workflow</h3>
              
              <div className="space-y-8">
                {[
                  {
                    num: "1",
                    title: "Submit Requirements:",
                    desc: "Define topic, expected attendance, preferred dates and session type."
                  },
                  {
                    num: "2",
                    title: "Trainer Mapping:",
                    desc: "Our admins select and assign the optimal available trainer based on skills and background."
                  },
                  {
                    num: "3",
                    title: "On-Campus Execution:",
                    desc: "Trainer executes the training session, manages materials, and conducts hands-on labs."
                  }
                ].map((step, idx) => (
                  <div key={idx} className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm">
                        {step.num}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-200 text-[15px] leading-relaxed">
                        <span className="font-bold text-white">{step.title}</span> {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Engine Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            How We Build <span className="text-emerald-600 dark:text-emerald-500">Industry-Ready Engineers</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto text-lg mb-12 font-medium">
            A structured 4-year parallel program running inside your campus from pre-assessment to global placement offers.
          </p>

          <div className="flex flex-col items-center justify-center mb-16">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-24 h-24 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl flex items-center justify-center shadow-xl mb-6 shadow-emerald-500/10"
            >
              <div className="bg-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner">
                 <UserCog className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h3 className="text-emerald-700 dark:text-emerald-500 font-bold uppercase tracking-[0.2em] text-sm md:text-base">
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
              { icon: <ClipboardCheck className="w-5 h-5 text-emerald-500" />, title: "Pre-Assessment" },
              { icon: <LayoutGrid className="w-5 h-5 text-emerald-500" />, title: "Foundation Building" },
              { icon: <BarChart2 className="w-5 h-5 text-emerald-500" />, title: "Regular Assessments" },
              { icon: <Zap className="w-5 h-5 text-emerald-500" />, title: "Advanced Concepts" },
              { icon: <Briefcase className="w-5 h-5 text-emerald-500" />, title: "Projects & Internships" },
              { icon: <Award className="w-5 h-5 text-emerald-500" />, title: "Placement" },
            ].map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95, y: 15 },
                    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center justify-center w-full lg:flex-1 min-w-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-xl py-4 px-2.5 shadow-sm hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-default group"
                >
                  <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/15 group-hover:bg-emerald-500/20 rounded-full flex items-center justify-center mb-2.5 transition-colors">
                    {step.icon}
                  </div>
                  <h4 className="text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm text-center leading-snug">
                    {step.title}
                  </h4>
                </motion.div>
                {idx < arr.length - 1 && (
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 0.6, transition: { duration: 0.3 } }
                    }}
                    className="hidden lg:flex items-center justify-center w-3 xl:w-5 shrink-0 text-emerald-500/70"
                  >
                    <ArrowRight className="w-4 h-4 xl:w-5 xl:h-5" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </motion.div>

        </motion.div>
      </section>

      {/* Trainer Reviews Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10 relative border-t border-slate-200 dark:border-slate-800/50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              What Colleges Say About Our Trainers
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Read authentic feedback from institutions and students who have experienced our transformative on-campus training programs.
            </p>
          </div>

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
              {
                quote: "The on-campus corporate training module was exactly what our final year students needed. The industry trainer gave them real-world scenarios to solve, helping over 60% of the batch secure placements instantly.",
                name: "Dr. Sharma",
                role: "HOD, Computer Science",
                course: "Custom Placement Training Bootcamps",
                initial: "D"
              },
              {
                quote: "The trainer assigned to our campus was phenomenal. Handling Redis, Docker, and CI/CD pipelines in a hands-on lab environment boosted our students' practical confidence immensely.",
                name: "Prof. Priya Patel",
                role: "Placement Coordinator",
                course: "DevOps & Cloud Workshop",
                initial: "P"
              },
              {
                quote: "Bringing CodeSklii experts for a 3-day hackathon completely transformed the coding culture here. The trainer's 7+ years of active field experience really showed during the 1-on-1 mentoring sessions.",
                name: "Amit Kumar",
                role: "College Tech Lead",
                course: "Full-Stack Web Development Hackathon",
                initial: "A"
              }
            ].map((review, idx) => (
              <motion.div 
                key={idx}
                variants={{
                  hidden: { opacity: 0, scale: 0.9, y: 30 },
                  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, type: "spring" } }
                }}
                whileHover={{ y: -8 }}
                className="bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-lg dark:shadow-2xl hover:shadow-xl hover:border-emerald-500/30 dark:hover:border-emerald-500/50 transition-all duration-300"
              >
                <div>
                  <div className="flex space-x-1 mb-6 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic mb-8 leading-relaxed text-[15px] font-medium">
                    "{review.quote}"
                  </p>
                </div>
                
                <div className="flex items-center pt-6 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0 shadow-md">
                    {review.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px]">{review.name}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{review.role}</p>
                    <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-1 pr-2 line-clamp-1">{review.course}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CV & ATS Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full z-10 relative border-t border-slate-200 dark:border-slate-800/50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-emerald-50/50 dark:bg-gradient-to-br dark:from-emerald-900/40 dark:via-teal-900/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-3xl p-8 md:p-14 overflow-hidden relative"
        >
          {/* Background glowing effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-[80px]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest rounded-full">
                Career Tools
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                Optimize Your CV for <br/>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Top Tech Companies
                </span>
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Don't let the Applicant Tracking System (ATS) reject your hard work. Use our AI-powered tools to build a standout resume and check your ATS score instantly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/cv-builder" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] dark:shadow-[0_0_20px_rgba(16,185,129,0.4)] w-full"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Build Your CV</span>
                  </motion.button>
                </Link>
                
                <Link to="/ats-checker" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center space-x-2 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 backdrop-blur-md border border-slate-200 dark:border-white/20 text-emerald-700 dark:text-white font-bold px-8 py-4 rounded-xl transition-all w-full shadow-sm dark:shadow-none"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Check ATS Score</span>
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Visual/Cards for ATS & CV */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-[#0f172a]/80 backdrop-blur-sm border border-slate-100 dark:border-emerald-500/20 p-6 rounded-2xl shadow-lg dark:shadow-xl"
              >
                <motion.div 
                  animate={{ rotate: [-3, 3, -3] }} 
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4"
                >
                  <BarChart3 className="w-6 h-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Smart ATS Scoring</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Get instant feedback on keyword matching, formatting, and readability to ensure your CV passes the bot screens.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-[#0f172a]/80 backdrop-blur-sm border border-slate-100 dark:border-teal-500/20 p-6 rounded-2xl shadow-lg dark:shadow-xl mt-0 sm:mt-12"
              >
                <motion.div 
                  animate={{ rotate: [3, -3, 3] }} 
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                  className="w-12 h-12 bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center mb-4"
                >
                  <PenTool className="w-6 h-6" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Modern Templates</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Choose from a variety of professionally designed, recruiter-approved templates tailored for software engineering roles.
                </p>
              </motion.div>
            </div>
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
              { icon: Terminal, title: "Monaco IDE Sandbox", textClass: "text-emerald-500 dark:text-emerald-400", bgClass: "bg-emerald-50 dark:bg-emerald-500/10", borderClass: "border-emerald-100 dark:border-emerald-500/20", desc: "Fully customized Monaco editor workspace with automatic formatting scripts, themes support, auto-save triggers, and interactive output logs." },
              { icon: Cpu, title: "Multi-Lang Compiler", textClass: "text-teal-500 dark:text-teal-400", bgClass: "bg-teal-50 dark:bg-teal-500/10", borderClass: "border-teal-100 dark:border-teal-500/20", desc: "Asynchronous evaluation runner supporting Python, JavaScript, TypeScript, Rust, Go, C/C++, Java, and PHP with precise execution telemetry." },
              { icon: Layers, title: "Leaderboards & Streaks", textClass: "text-cyan-500 dark:text-cyan-400", bgClass: "bg-cyan-50 dark:bg-cyan-500/10", borderClass: "border-cyan-100 dark:border-cyan-500/20", desc: "Encourage healthy coding competition through global leaderboards, streak awards, achievements levels, and interactive rating metrics." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring" } }
                }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-5 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 h-full"
              >
                <motion.div 
                  animate={{ rotate: [-2, 2, -2] }} 
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: idx * 0.5 }}
                  className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 border ${feature.bgClass} ${feature.borderClass} ${feature.textClass}`}
                >
                  <feature.icon className="h-8 w-8" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Floating Chat Button */}
      <Link to="/contact">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 z-50 bg-emerald-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer flex items-center justify-center group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 ease-in-out font-bold">
            Chat with us
          </span>
        </motion.div>
      </Link>

    </div>
  );
}

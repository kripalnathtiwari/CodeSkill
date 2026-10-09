import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Zap, Users, Trophy, Code2, ArrowRight, GraduationCap, Building, Briefcase, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import WhyUsOrbitVisual from '../components/WhyUsOrbitVisual';

export default function WhyUs() {
  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28 overflow-hidden bg-[#020617] border-b border-white/5">
        <div className="max-w-[1280px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-[48px] items-center">
          
          {/* Left Column: Text */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="w-[68px] h-[5px] bg-[#00A651] rounded-full mb-6"></div>
            <h1 
              className="font-black text-white drop-shadow-sm"
              style={{
                fontSize: "clamp(40px, 5.2vw, 76px)",
                lineHeight: 1.12,
                letterSpacing: "-0.02em"
              }}
            >
              We Don't Just Teach Code.<br />
              <span className="text-[#00A651]">We Engineer Careers.</span>
            </h1>
            <p 
              className="mt-6 text-slate-300"
              style={{
                fontSize: "18px",
                lineHeight: 1.9,
                maxWidth: "560px"
              }}
            >
              A modern, no-nonsense approach to tech education. From day one, you'll be building real products, writing production-ready code, and preparing to stand out in the most competitive industry in the world.
            </p>
          </div>

          {/* Right Column: 3D Orbit Visual */}
          <div className="w-full relative mt-12 lg:mt-0 lg:pl-10">
            <WhyUsOrbitVisual />
          </div>
        </div>
      </section>

      {/* About Our Project */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-surface/30 border-t border-border/50">
        <div className="max-w-[90rem] mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary">
              About Our Project
            </h2>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-4xl mx-auto mt-6">
              CodeSkill is designed to bridge the widening gap between traditional education and industry demands. We provide a comprehensive ecosystem that seamlessly connects students, colleges, and corporate organizations. Our mission is to upskill learners with cutting-edge technologies, empower colleges with industry-aligned curriculums, and provide corporates with highly trained, job-ready talent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature 1: Project Based */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50 bg-surface/50">
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>Learn By Doing</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary">
              Practical, Project-Based Learning
            </h2>
            <div className="space-y-4 text-lg text-text-secondary leading-relaxed">
              <p>
                We believe that watching tutorials is not enough. The only way to master software engineering is to get your hands dirty.
              </p>
              <p>
                Our curriculum completely ditches endless theory in favor of practical application. You will build, debug, and deploy actual real-world web applications, APIs, and algorithms that simulate the exact work you'll do on the job.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] overflow-hidden shadow-2xl h-[450px] border border-border"
          >
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" 
              alt="Students collaborating on code" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>
      </section>

      {/* Feature 2: Mentorship */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] overflow-hidden shadow-2xl h-[450px] border border-border lg:order-1 order-2"
          >
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
              alt="Mentorship session" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 lg:order-2 order-1"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full font-bold text-sm">
              <Users className="w-4 h-4" />
              <span>Direct Guidance</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary">
              1-on-1 Expert Mentorship
            </h2>
            <div className="space-y-4 text-lg text-text-secondary leading-relaxed">
              <p>
                The tech landscape can be overwhelming. That's why you won't be navigating it alone. We pair you with seasoned engineers who are actively working at top-tier product companies.
              </p>
              <p>
                Your mentor will review your code line-by-line, conduct rigorous mock interviews, and share industry secrets that you simply can't find in textbooks. They are your personal guide to breaking into the industry.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature 3: Placement */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 border-y border-border/50 bg-surface/50">
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-rose-500/10 text-rose-500 px-4 py-2 rounded-full font-bold text-sm">
              <Target className="w-4 h-4" />
              <span>Career Driven</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary">
              Unmatched Placement Support
            </h2>
            <div className="space-y-4 text-lg text-text-secondary leading-relaxed">
              <p>
                Our ultimate goal is your successful placement. We leverage our extensive network of hiring partners to bring you direct interview opportunities that bypass the standard, crowded application queues.
              </p>
              <p>
                We help you build an ATS-friendly resume, optimize your LinkedIn profile, and thoroughly prepare you for both technical and behavioral interview rounds. We are deeply invested in your success.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] overflow-hidden shadow-2xl h-[450px] border border-border"
          >
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1741&q=80" 
              alt="Team success" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>
      </section>

      {/* Feature 4: Classroom Experience */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] overflow-hidden shadow-2xl h-[450px] border border-border lg:order-1 order-2"
          >
            <img 
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" 
              alt="Interactive classroom session" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 lg:order-2 order-1"
          >
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-500 px-4 py-2 rounded-full font-bold text-sm">
              <BookOpen className="w-4 h-4" />
              <span>Immersive Learning</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary">
              Interactive Classroom Experience
            </h2>
            <div className="space-y-4 text-lg text-text-secondary leading-relaxed">
              <p>
                We believe that learning shouldn't happen in isolation. Our vibrant, tech-enabled classrooms are designed to foster collaboration and active participation.
              </p>
              <p>
                Whether joining online or in-person, you'll be part of an engaging environment where concepts are broken down interactively. You'll engage in live problem-solving, group discussions, and whiteboard architecture sessions that mimic real engineering teams.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Impact / Test Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-24 border-t border-border/50 bg-surface/30">
        <div className="max-w-[90rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-text-primary">Our Commitment & Impact</h2>
            <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">
              We dedicate our effort to creating tangible value for every stakeholder in the tech education ecosystem.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">For Students</h3>
              <p className="text-text-secondary leading-relaxed">
                We put in the hard work to provide personalized mentorship, practical coding experience, and placement preparation. Our effort ensures that every student transforms into a confident, job-ready professional.
              </p>
            </motion.div>

            {/* College */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">For Colleges</h3>
              <p className="text-text-secondary leading-relaxed">
                We partner with academic institutions to modernize their curriculum. We provide the tools, instructor panels, and corporate insights needed to elevate institutional standards and boost campus placements.
              </p>
            </motion.div>

            {/* Corporate */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-orange-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">For Corporates</h3>
              <p className="text-text-secondary leading-relaxed">
                We save companies time and resources by providing pre-vetted, highly skilled candidates. Our rigorous training ensures our graduates can contribute to corporate projects from day one.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-[90rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-text-primary">More Reasons to Join</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Industry-Vetted Curriculum</h3>
              <p className="text-text-secondary leading-relaxed">
                Our syllabus is constantly updated to match exactly what modern tech companies are looking for. No outdated frameworks, just cutting-edge technologies.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Competitive Edge</h3>
              <p className="text-text-secondary leading-relaxed">
                Participate in weekly coding contests, hackathons, and comprehensive test series to sharpen your problem-solving skills and stay ahead of the curve.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Integrated Tools</h3>
              <p className="text-text-secondary leading-relaxed">
                Practice coding instantly with our built-in online compiler. Switch languages, run test cases, and evaluate your code seamlessly without leaving the platform.
              </p>
            </motion.div>
          </div>
          
          <div className="mt-20 text-center">
            <Link to="/courses-training?category=all" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25 group">
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

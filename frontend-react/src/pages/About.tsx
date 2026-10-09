import React, { useEffect, useRef } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import { Search, Code2, User, Building2, Target, ArrowRight, GraduationCap, Briefcase } from 'lucide-react';

function AnimatedCounter({ from, to, suffix = "", duration = 2 }: { from: number, to: number, suffix?: string, duration?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (inView && nodeRef.current) {
      const controls = animate(from, to, {
        duration: duration,
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.round(value) + suffix;
          }
        }
      });
      return () => controls.stop();
    }
  }, [from, to, suffix, duration, inView]);

  return <span ref={nodeRef}>{from}{suffix}</span>;
}

interface AboutProps {
  hideHeader?: boolean;
}

export default function About({ hideHeader = false }: AboutProps = {}) {
  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-300">
      {!hideHeader && (
        <div className="w-full text-center py-16 px-4 bg-surface border-b border-border mb-8 overflow-hidden">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight max-w-6xl mx-auto leading-tight relative z-10">
            <span className="text-primary block mb-2 lg:mb-4">CodeSkill</span>
            <span className="text-text-primary">Turning Learners Into Leaders.</span>
          </h1>
          
          <motion.div 
            initial={{ rotateX: 45, rotateY: -15, scale: 0.5, opacity: 0 }}
            animate={{ rotateX: 0, rotateY: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, duration: 1.5 }}
            className="flex justify-center mt-16 perspective-1000 relative z-10"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotateY: [0, 5, -5, 0],
                rotateX: [0, 5, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative group cursor-pointer"
            >
              {/* Shadow effect */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/20 dark:bg-black/50 blur-xl rounded-full" />
              
              <img 
                src="/favicon.svg" 
                alt="CodeSkill Logo" 
                className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-[0_20px_30px_rgba(0,168,107,0.4)]"
              />
            </motion.div>
          </motion.div>
        </div>
      )}
      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-[90rem] mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="w-12 h-1.5 bg-primary rounded-full mb-8"></div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-text-primary">
              Transforming <span className="text-primary">Tech Education</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary leading-relaxed max-w-2xl">
              We are an educational platform dedicated to connecting passionate, driven students with seasoned industry experts. Our goal is to bridge the gap between academic learning and real-world tech requirements, empowering you to fulfill your career dreams.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[2rem] p-8 md:p-12 shadow-xl grid grid-cols-2 gap-y-12 gap-x-8"
          >
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-black text-primary"><AnimatedCounter from={0} to={30} suffix="K+" /></div>
              <div className="text-sm font-bold text-text-secondary uppercase tracking-wider">Students Empowered</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-black text-primary"><AnimatedCounter from={0} to={25} suffix="K+" /></div>
              <div className="text-sm font-bold text-text-secondary uppercase tracking-wider">Certifications</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-black text-primary"><AnimatedCounter from={0} to={450} suffix="K+" /></div>
              <div className="text-sm font-bold text-text-secondary uppercase tracking-wider">Minutes Streamed</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-black text-primary"><AnimatedCounter from={0} to={50} suffix="+" /></div>
              <div className="text-sm font-bold text-text-secondary uppercase tracking-wider">Industry Experts</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-surface border-y border-border transition-colors duration-300">
        <div className="max-w-[90rem] mx-auto space-y-16">
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-text-primary">Our Approach</h2>
            <p className="text-text-secondary text-xl leading-relaxed">
              We provide a comprehensive ecosystem designed for students and professionals to master software engineering, build practical portfolios, and land top-tier tech jobs.
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
          >
            {/* Connecting Path Line (Desktop only) */}
            <div className="hidden lg:block absolute top-[68px] left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-slate-300 dark:border-slate-700 z-0 opacity-50"></div>

            {/* Step 1 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
              }}
              whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.2 } }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl group cursor-pointer relative z-10"
            >
              <div className="hidden lg:flex absolute -right-6 top-14 w-8 h-8 bg-surface rounded-full border border-border items-center justify-center z-20 text-slate-400">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex justify-end items-start mb-8">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Step</span>
                  <span className="text-xl font-black text-primary">01</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-text-primary">Immersive Bootcamps</h3>
              <p className="text-text-secondary text-lg leading-relaxed">
                Industry-curated curriculum focusing on Full Stack, DSA, and Data Science. Learn by building production-grade applications.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
              }}
              whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.2 } }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group cursor-pointer relative z-10"
            >
              <div className="hidden lg:flex absolute -right-6 top-14 w-8 h-8 bg-surface rounded-full border border-border items-center justify-center z-20 text-slate-400">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex justify-end items-start mb-8">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Step</span>
                  <span className="text-xl font-black text-blue-500">02</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-text-primary">Expert Mentorship</h3>
              <p className="text-text-secondary text-lg leading-relaxed">
                Get one-on-one guidance, code reviews, and career advice directly from seasoned engineers at top global tech companies.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
              }}
              whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.2 } }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group cursor-pointer relative z-10"
            >
              <div className="hidden lg:flex absolute -right-6 top-14 w-8 h-8 bg-surface rounded-full border border-border items-center justify-center z-20 text-slate-400">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex justify-end items-start mb-8">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Step</span>
                  <span className="text-xl font-black text-emerald-500">03</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-text-primary">Campus Integration</h3>
              <p className="text-text-secondary text-lg leading-relaxed">
                We collaborate with educational institutions to embed modern tech training into their ecosystem, ensuring students graduate ready for the workforce.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
              }}
              whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.2 } }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-rose-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group cursor-pointer relative z-10"
            >
              <div className="flex justify-end items-start mb-8">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Goal</span>
                  <span className="text-xl font-black text-rose-500">04</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-text-primary">Career Acceleration</h3>
              <p className="text-text-secondary text-lg leading-relaxed">
                Comprehensive placement support including ATS-friendly resume building, mock interviews, and access to direct hiring drives.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative w-full h-[500px]">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80')" }}
        >
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"></div>
        </div>
        
        {/* Content Box */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background/95 dark:bg-background/90 backdrop-blur-md px-8 py-16 md:px-16 text-center flex flex-col items-center justify-center max-w-2xl w-[90%] md:w-full rounded-3xl border border-border shadow-2xl"
          >
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">
              Behind the Scenes
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-text-primary mb-6 tracking-tight">
              Meet the Team
            </h2>
            <p className="text-text-secondary text-lg mb-10 leading-relaxed max-w-lg">
              We are a collective of educators, engineers, and designers passionate about democratizing tech education and shaping the next generation of builders.
            </p>
            <button className="bg-primary text-text-inverse font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25">
              Explore Open Roles <Search size={18} className="stroke-[2.5]" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28 max-w-[90rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-2xl h-[400px] border border-border"
          >
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" 
              alt="Our Vision" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-text-primary">
              Our Vision
            </h2>
            <p className="text-xl md:text-2xl text-text-secondary leading-relaxed max-w-2xl">
              We envision a world where high-quality technical education is accessible to everyone, regardless of their background or location. We aspire to become the definitive platform that empowers global learners to transform their aspirations into tangible achievements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bridge Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-primary/5 dark:bg-primary/10 border-y border-primary/20 overflow-hidden">
        <div className="max-w-[90rem] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-text-primary mb-6">
              Bridging the Knowledge Gap
            </h2>
            <p className="text-xl md:text-2xl text-text-secondary leading-relaxed max-w-4xl mx-auto">
              Traditional college curriculums often struggle to keep pace with rapid technological advancements. We serve as the essential bridge, transforming academic foundational knowledge into production-ready industry expertise.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4 relative mt-12">
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-[40%] left-[15%] right-[15%] h-1 bg-gradient-to-r from-blue-500/20 via-primary/50 to-emerald-500/20 -translate-y-1/2 z-0"></div>
            
            {/* College Side */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-background border border-border p-8 rounded-3xl w-full lg:w-1/3 relative z-10 shadow-lg"
            >
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-text-primary">College Theory</h3>
              <ul className="text-left space-y-4 text-text-secondary text-lg">
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> Academic Fundamentals</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> Standard Algorithms</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> Basic Syntax & Logic</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> Conceptual Understanding</li>
              </ul>
            </motion.div>

            {/* The Bridge (CodeSkill) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-primary text-white p-8 rounded-3xl w-full lg:w-1/3 relative z-10 shadow-2xl shadow-primary/30 transform lg:scale-110"
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black mb-6">CodeSkill Bridge</h3>
              <ul className="text-left space-y-4 text-white/90 font-medium text-lg">
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div> Real-world Projects</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div> Modern Tech Stacks</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div> System Architecture</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div> Agile Workflows (CI/CD)</li>
              </ul>
            </motion.div>

            {/* Industry Side */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-background border border-border p-8 rounded-3xl w-full lg:w-1/3 relative z-10 shadow-lg"
            >
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-text-primary">Industry Reality</h3>
              <ul className="text-left space-y-4 text-text-secondary text-lg">
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> Production-Ready Code</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> Scalable Applications</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> Performance Optimization</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> Cross-functional Collab</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-24 lg:pb-32 bg-surface pt-20 lg:pt-28 border-t border-border">
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 lg:order-1 order-2"
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-text-primary">
              Our Mission
            </h2>
            <p className="text-xl md:text-2xl text-text-secondary leading-relaxed max-w-2xl">
              Our mission is to empower individuals by providing rigorous, accessible, and practical tech education. We strive to completely bridge the gap between academic theory and industry demands, ensuring that our learners are highly capable and job-ready from day one.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-2xl h-[400px] border border-border lg:order-2 order-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1741&q=80" 
              alt="Our Mission" 
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Code2, User, Building2, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-300">
      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
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
            <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
              We are an educational platform dedicated to connecting passionate, driven students with seasoned industry experts. Our goal is to bridge the gap between academic learning and real-world tech requirements, empowering you to fulfill your career dreams.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[2rem] p-8 md:p-12 shadow-xl grid grid-cols-2 gap-y-12 gap-x-8"
          >
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-black text-primary">30K+</div>
              <div className="text-sm font-bold text-text-secondary uppercase tracking-wider">Students Empowered</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-black text-primary">25K+</div>
              <div className="text-sm font-bold text-text-secondary uppercase tracking-wider">Certifications</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-black text-primary">450K+</div>
              <div className="text-sm font-bold text-text-secondary uppercase tracking-wider">Minutes Streamed</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-black text-primary">50+</div>
              <div className="text-sm font-bold text-text-secondary uppercase tracking-wider">Industry Experts</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-surface border-y border-border transition-colors duration-300">
        <div className="max-w-[90rem] mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary">Our Approach</h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              We provide a comprehensive ecosystem designed for students and professionals to master software engineering, build practical portfolios, and land top-tier tech jobs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Code2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Immersive Bootcamps</h3>
              <p className="text-text-secondary text-base leading-relaxed">
                Industry-curated curriculum focusing on Full Stack, DSA, and Data Science. Learn by building production-grade applications.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <User className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Expert Mentorship</h3>
              <p className="text-text-secondary text-base leading-relaxed">
                Get one-on-one guidance, code reviews, and career advice directly from seasoned engineers at top global tech companies.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Campus Integration</h3>
              <p className="text-text-secondary text-base leading-relaxed">
                We collaborate with educational institutions to embed modern tech training into their ecosystem, ensuring students graduate ready for the workforce.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-background p-8 rounded-3xl border border-border hover:border-rose-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Career Acceleration</h3>
              <p className="text-text-secondary text-base leading-relaxed">
                Comprehensive placement support including ATS-friendly resume building, mock interviews, and access to direct hiring drives.
              </p>
            </motion.div>
          </div>
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
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-text-primary">
              Our Vision
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
              We envision a world where high-quality technical education is accessible to everyone, regardless of their background or location. We aspire to become the definitive platform that empowers global learners to transform their aspirations into tangible achievements.
            </p>
          </motion.div>
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
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-text-primary">
              Our Mission
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
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

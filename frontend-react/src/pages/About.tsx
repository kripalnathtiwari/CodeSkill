import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#0B1121] text-text-inverse">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="w-12 h-1 bg-slate-600 mb-8"></div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              About Us
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
              CodeSkill is a bootstrapped educational video streaming platform in India that is connecting passionate unskilled students to skilled Industry experts to fulfill their career dreams.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#FBA718] p-8 md:p-12 lg:p-16 shadow-xl grid grid-cols-2 gap-y-12 gap-x-8"
          >
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-text-inverse">30K+</div>
              <div className="text-sm font-medium text-text-inverse/90">Students</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-text-inverse">25K+</div>
              <div className="text-sm font-medium text-text-inverse/90">Certificate<br/>Delivered</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-text-inverse">450K+</div>
              <div className="text-sm font-medium text-text-inverse/90">Streamed<br/>Minutes</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-text-inverse">50K+</div>
              <div className="text-sm font-medium text-text-inverse/90">Creators</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative w-full h-[400px] md:h-[500px]">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80')" }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        {/* Content Box */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#0B1121] px-12 py-16 text-center flex flex-col items-center justify-center max-w-lg w-full"
          >
            <p className="text-[#FBA718] font-bold text-sm uppercase tracking-wider mb-4">
              KNOW ABOUT US &
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-text-inverse mb-10 tracking-tight">
              OUR TEAM
            </h2>
            <button className="bg-surface text-[#FBA718] font-bold px-8 py-3 rounded-full flex items-center gap-2 hover:bg-surface-secondary transition-colors shadow-lg">
              CODESKILL <Search size={20} className="text-primary stroke-[3]" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-2xl h-[400px]"
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
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Our Vision
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
              Envision a world where high-quality online learning is readily accessible to everyone, regardless of their location. At our core, we aspire to transform this vision into a tangible reality by becoming the go-to platform for anyone seeking online learning experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 lg:order-1 order-2"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Our Mission
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
              To empower individuals by providing affordable, accessible, and high-quality technical education. We aim to bridge the gap between academic learning and industry requirements, ensuring our students are job-ready from day one.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-2xl h-[400px] lg:order-2 order-1"
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

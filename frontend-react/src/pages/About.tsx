import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-200 p-8 md:p-12 lg:p-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            About us
          </h1>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
              About TeachSkill:
            </h2>
            <h3 className="text-lg md:text-xl font-semibold text-emerald-600 dark:text-emerald-500">
              1. Company Profile and Brand:
            </h3>
          </div>

          <div className="space-y-6 text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            <p>
              TeachSkill is a comprehensive educational platform that empowers learners across domains—spanning computer science, essential software engineering tools, and providing them with top-notch interview preparation services. With a mission to bridge the gap between academic learning and industry demands, TeachSkill provides a vast and growing collection of coding challenges, practice problems, real-world projects, and structured courses, catering to both academic and professional needs.
            </p>

            <p>
              We're especially known for our in-depth resources on interview preparation, helping thousands land roles at top tech companies with our curated content, real-world scenarios, and company-wise problem sets.
            </p>

            <p>
              Our courses and learning paths for high-demand technologies like DSA, System Design, Web Development, and Machine Learning are ideal for professionals aiming to level up or switch domains. Our official certifications ensure to add credibility and enhance our learners' career prospects.
            </p>

            <p>
              Our content is created and curated by top mentors from renowned institutions and tech organizations, ensuring quality and relevance. With a focus on clarity, accessibility, and impact, we help students and professionals alike turn curiosity into expertise. TeachSkill has become a trusted name in tech education—offering well-structured tutorials, hands-on practice problems, and guided project-based courses.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

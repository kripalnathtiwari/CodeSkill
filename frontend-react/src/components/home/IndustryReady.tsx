import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Target, Briefcase } from 'lucide-react';
import industryImg from "../../assets/industry-ready.jpg";

const features = [
  {
    title: "Real-world Projects",
    description: "Work on enterprise-level architectures and case studies.",
    icon: Briefcase,
  },
  {
    title: "Mentorship by Experts",
    description: "Learn directly from senior engineers actively working in tech.",
    icon: Target,
  },
  {
    title: "Industry Standard Tools",
    description: "Master Git, Docker, CI/CD, and agile workflows used by top firms.",
    icon: TrendingUp,
  },
  {
    title: "Interview Readiness",
    description: "Mock interviews, resume reviews, and portfolio building.",
    icon: CheckCircle2,
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function IndustryReady() {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-surface-secondary dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-text-primary mb-4"
          >
            How We Build <span className="text-primary">Industry-Ready</span> Engineers
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary text-lg max-w-2xl mx-auto"
          >
            Bridge the gap between academic learning and industry expectations with our proven training methodology.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border border-border group"
          >
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
            <img 
              src={industryImg} 
              alt="Industry Ready Training" 
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          {/* Content Side */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div key={idx} variants={itemVariants} className="flex gap-4 p-4 rounded-xl hover:bg-surface dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-border hover:shadow-sm">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">{feature.title}</h3>
                    <p className="text-text-secondary">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

      </div>
    </section>
  );
}

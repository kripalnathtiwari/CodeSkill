import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Award, ArrowRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const FeaturedCourses = lazy(() => import("../components/home/FeaturedCourses"));
const CampusDrives = lazy(() => import("../components/home/CampusDrives"));
const EngineSection = lazy(() => import("../components/home/EngineSection"));
const TrainerReviews = lazy(() => import("../components/home/TrainerReviews"));
const CareerTools = lazy(() => import("../components/home/CareerTools"));
const FeaturesGrid = lazy(() => import("../components/home/FeaturesGrid"));

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

// A simple fallback skeleton for lazy loaded sections
const SectionSkeleton = () => (
  <div className="py-20 px-6 max-w-7xl mx-auto w-full flex flex-col items-center justify-center space-y-6 animate-pulse opacity-50">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64 mb-4"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full max-w-2xl"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full max-w-xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="flex-grow flex flex-col justify-center items-center relative overflow-hidden bg-background dark:bg-background">

      {/* Dynamic Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-600/20 rounded-full blur-[120px]"
      />

      {/* Hero section */}
      <section className="text-center py-24 px-6 max-w-5xl mx-auto space-y-8 z-10 relative">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 flex flex-col items-center">

          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/30 px-5 py-2 rounded-full text-sm font-semibold text-primary dark:text-primary backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Award className="h-4 w-4" />
            <span>CodeSkill Assessment Suite v2.0</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-text-primary dark:text-text-primary">
            One Platform for Training, <br />
            <span className="text-primary drop-shadow-sm">
              Certifications & Career Growth.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-base sm:text-lg text-text-secondary dark:text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
            Create, edit, compile, and execute code solutions dynamically in 10+ programming languages. Backed by highly scalable, interactive environments.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 w-full sm:w-auto">
            <Link to="/problems" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-text-inverse font-semibold text-sm sm:text-base px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 w-full justify-center border border-primary/50"
              >
                <span>Practice Playground</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>

            <Link to="/dashboard" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center space-x-2 bg-surface dark:bg-background/80 backdrop-blur-md border border-border dark:border-border text-text-primary dark:text-text-inverse hover:bg-background dark:hover:bg-slate-800 font-semibold text-sm sm:text-base px-6 py-3 rounded-xl transition-colors w-full justify-center shadow-sm dark:shadow-none"
              >
                <span>View Dashboard</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Lazy Loaded Below-the-fold Sections */}
      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedCourses />
        <CampusDrives />
        <EngineSection />
        <TrainerReviews />
        <CareerTools />
        <FeaturesGrid />
      </Suspense>

      {/* Floating Chat Button */}
      <Link to="/contact">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 z-50 bg-primary text-text-inverse p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer flex items-center justify-center group"
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

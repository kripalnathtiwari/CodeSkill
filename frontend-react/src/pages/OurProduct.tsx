import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Zap, Layout, MonitorPlay, Sparkles, Brain, FileText, Users, Briefcase } from 'lucide-react';
import WeeklyTestSection from '../components/home/WeeklyTestSection';
import CodingFeaturesSection from '../components/home/CodingFeaturesSection';

const sliderImages = [
  "https://res.cloudinary.com/zihn8u4b/image/upload/v1789487013/course.png",
  "https://res.cloudinary.com/zihn8u4b/image/upload/v1789486991/company_place.png",
  "https://res.cloudinary.com/zihn8u4b/image/upload/v1789486941/career_2.png",
  "https://res.cloudinary.com/zihn8u4b/image/upload/v1789486956/cvmaking.png",
  "https://res.cloudinary.com/zihn8u4b/image/upload/v1789486976/other.png",
  "https://res.cloudinary.com/zihn8u4b/image/upload/v1789487036/atscheking.png"
];

export default function OurProduct() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-background relative pt-24 pb-20 overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />

      {/* Background Gradient Blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] -z-10" />

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Campus Placement Training Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full mx-auto mb-32">
          {/* Left Text Content */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-text-primary dark:text-text-inverse tracking-tight">
              Crack Your Campus Placement with <span className="text-primary">CodeSkill</span>
            </h2>
            <p className="text-xl text-text-secondary dark:text-text-muted leading-relaxed">
              Prepare for your dream placement with structured training designed around real hiring requirements. Build the skills, confidence, and interview readiness you need to stand out.
            </p>
            <ul className="space-y-4 mt-8">
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-semibold text-text-primary dark:text-text-inverse">Aptitude & Reasoning</h4>
                  <p className="text-text-secondary dark:text-text-muted text-sm mt-1">Master placement-focused aptitude questions.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Code2 className="w-4 h-4 text-accent" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-semibold text-text-primary dark:text-text-inverse">Coding & DSA</h4>
                  <p className="text-text-secondary dark:text-text-muted text-sm mt-1">Practice coding problems based on real interview patterns.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-info" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-semibold text-text-primary dark:text-text-inverse">Resume Building</h4>
                  <p className="text-text-secondary dark:text-text-muted text-sm mt-1">Create a professional, job-ready resume.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-semibold text-text-primary dark:text-text-inverse">Mock Interviews</h4>
                  <p className="text-text-secondary dark:text-text-muted text-sm mt-1">Experience realistic technical and HR interviews.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-semibold text-text-primary dark:text-text-inverse">Placement Preparation</h4>
                  <p className="text-text-secondary dark:text-text-muted text-sm mt-1">Follow a structured path from learning to getting placed.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Image Section (Right Side) */}
          <div className="lg:col-span-7 relative mx-auto w-full h-[400px] lg:h-[450px] rounded-2xl overflow-hidden glass-card hover-scale-premium duration-500 group hover:shadow-[0_0_40px_-15px_rgba(var(--primary),0.3)]">
            <div className="absolute inset-0 bg-gradient-premium opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative w-full h-full z-10">
              <img 
                src="https://res.cloudinary.com/zihn8u4b/image/upload/v1789482217/placement.png" 
                alt="Campus Placement Training" 
                className="w-full h-full object-cover transform transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-1"
                loading="lazy"
              />
              {/* Subtle hover overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay" />
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent-light px-4 py-2 rounded-full mb-6 font-medium text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Learning Environment</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary dark:text-text-inverse mb-6 tracking-tight">
            Master Coding with <br className="hidden sm:block" />
            <span className="text-gradient-premium">Real-Time Feedback</span>
          </h1>
        </div>

        {/* Dashboard Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full mx-auto">
          {/* Left Text Content */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-text-inverse">
              Your Complete Coding Workspace
            </h2>
            <p className="text-xl text-text-secondary dark:text-text-muted leading-relaxed">
              Dive into our immersive coding interface designed for maximum productivity. Practice DSA, build projects, and prepare for product-based company interviews all in one place.
            </p>
            <ul className="space-y-6 mt-8">
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-text-primary dark:text-text-inverse">Lightning Fast Compiler</h4>
                  <p className="text-text-secondary dark:text-text-muted text-base mt-1">Execute your code across multiple languages with near-zero latency.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Layout className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-text-primary dark:text-text-inverse">Intuitive Dashboard</h4>
                  <p className="text-text-secondary dark:text-text-muted text-base mt-1">Track your progress, manage courses, and monitor test performance effortlessly.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Main Product Image Section (Right Side) */}
          <div className="lg:col-span-8 relative mx-auto w-full rounded-2xl overflow-hidden glass-card p-2 md:p-4 hover-scale-premium duration-500 group">
            <div className="absolute inset-0 bg-gradient-premium opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
            
            {/* Top Bar for realistic editor look */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-t-xl px-4 py-3 flex items-center justify-between border-b border-white/10 relative z-20">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-error" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                  <Code2 className="w-4 h-4" />
                  <span>codesklii-environment</span>
                </div>
              </div>
            </div>
            
            <div className="relative w-full rounded-b-xl overflow-hidden shadow-2xl border border-white/5 bg-slate-900/50 z-10">
              {sliderImages.map((img, idx) => (
                <img 
                  key={img}
                  src={img} 
                  alt={`CodeSklii Interactive Environment ${idx + 1}`} 
                  className={`w-full h-auto transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0'}`}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Demo Button */}
        <div className="mt-16 mb-20 flex justify-center w-full">
          <Link to="/contact">
            <button className="bg-primary hover:bg-primary/90 text-text-inverse font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-1 flex items-center space-x-2">
              <span>Ask for Demo LMS</span>
            </button>
          </Link>
        </div>

        {/* Features Grid below image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          
          <div className="glass-card p-6 rounded-2xl text-center md:text-left hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
              <MonitorPlay className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-text-inverse mb-2">Live Execution</h3>
            <p className="text-text-secondary dark:text-text-muted text-sm">
              Write, compile, and run your code instantly within the browser. No complex setups required.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center md:text-left hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
              <Layout className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-text-inverse mb-2">Split-Pane Layout</h3>
            <p className="text-text-secondary dark:text-text-muted text-sm">
              Read problem descriptions and code side-by-side with our optimized dual-pane interface.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center md:text-left hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
              <Zap className="w-6 h-6 text-info" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-text-inverse mb-2">Instant Feedback</h3>
            <p className="text-text-secondary dark:text-text-muted text-sm">
              Get immediate evaluation on your test cases to debug faster and improve problem-solving speed.
            </p>
          </div>

        </div>
      </div>
      <WeeklyTestSection />
      <CodingFeaturesSection />
    </div>
  );
}

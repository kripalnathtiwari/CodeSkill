import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Zap, Layout, MonitorPlay, Sparkles, Brain, FileText, Users, Briefcase, GraduationCap, BookOpen, BarChart2, Target, Rocket, Code, Monitor, Award, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background dark:bg-background relative pb-20 overflow-hidden">
      {/* Top Banner Image */}
      <div className="w-full relative mb-16 md:mb-24">
        <img 
          src="https://res.cloudinary.com/zihn8u4b/image/upload/v1789538527/back2.png" 
          alt="Placement Journey Hero"
          className="w-full h-auto object-cover"
        />
      </div>

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
              Comprehensive Subject Practice
            </h2>
            <p className="text-xl text-text-secondary dark:text-text-muted leading-relaxed">
              Master core computer science subjects with our structured practice modules. Dive deep into DBMS, DSA, and other essential topics to build a solid foundation for your technical interviews.
            </p>
            <ul className="space-y-6 mt-8">
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-text-primary dark:text-text-inverse">Targeted Preparation</h4>
                  <p className="text-text-secondary dark:text-text-muted text-base mt-1">Focus your learning with topic-wise questions designed to strengthen specific concepts and improve retention.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-text-primary dark:text-text-inverse">Custom Question Banks</h4>
                  <p className="text-text-secondary dark:text-text-muted text-base mt-1">Practice with hand-picked, industry-relevant problems that simulate real product-based company interviews.</p>
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

      {/* What We Provide Section */}
      <div className="mt-32 mb-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary dark:text-text-inverse">
            What We Provide
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-center relative">
          
          {/* Left Column */}
          <div className="space-y-12">
            {/* Item 1 */}
            <div className="flex flex-row-reverse lg:flex-row items-center justify-start lg:justify-end text-left lg:text-right space-x-4 space-x-reverse lg:space-x-4 lg:space-x-reverse-0">
              <div className="flex-1 lg:flex-none">
                <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse mb-2">Industry-Aligned Curriculum</h3>
                <p className="text-text-secondary dark:text-text-muted text-sm">
                  Our parallel syllabus integrates seamlessly with your academic schedule, covering DSA, Full Stack, AI/ML, and Cloud.
                </p>
              </div>
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-md">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {/* Item 2 */}
            <div className="flex flex-row-reverse lg:flex-row items-center justify-start lg:justify-end text-left lg:text-right space-x-4 space-x-reverse lg:space-x-4 lg:space-x-reverse-0">
              <div className="flex-1 lg:flex-none">
                <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse mb-2">Expert Industry Mentors</h3>
                <p className="text-text-secondary dark:text-text-muted text-sm">
                  Live sessions and mock interviews conducted by professionals from Google, Microsoft, Amazon, and top startups.
                </p>
              </div>
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {/* Item 3 */}
            <div className="flex flex-row-reverse lg:flex-row items-center justify-start lg:justify-end text-left lg:text-right space-x-4 space-x-reverse lg:space-x-4 lg:space-x-reverse-0">
              <div className="flex-1 lg:flex-none">
                <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse mb-2">Zero Infrastructure Cost</h3>
                <p className="text-text-secondary dark:text-text-muted text-sm">
                  We run the entire program inside your existing labs and classrooms — no new hardware or facility investment required.
                </p>
              </div>
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-md">
                <Monitor className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Center Column (Video) */}
          <div className="relative flex justify-center items-center py-10 lg:py-0">
            {/* Decorative circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[300px] rounded-full border border-blue-100 dark:border-slate-800 absolute animate-ping opacity-20"></div>
              <div className="w-[400px] h-[400px] rounded-full border border-blue-50 dark:border-slate-800/50 absolute"></div>
            </div>
            
            <div className="relative z-10 w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center">
              <video 
                src="https://res.cloudinary.com/zihn8u4b/video/upload/v1791087571/new_vedio_1.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-12">
            {/* Item 1 */}
            <div className="flex items-center text-left space-x-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-md">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse mb-2">Global Certifications</h3>
                <p className="text-text-secondary dark:text-text-muted text-sm">
                  Students earn industry-recognized certifications in AI, Cloud, and System Design, validated by our hiring partners.
                </p>
              </div>
            </div>
            {/* Item 2 */}
            <div className="flex items-center text-left space-x-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-md">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse mb-2">Guaranteed Placement Support</h3>
                <p className="text-text-secondary dark:text-text-muted text-sm">
                  Dedicated placement cells, mock hiring drives, and direct referrals to our 100+ active hiring partners.
                </p>
              </div>
            </div>
            {/* Item 3 */}
            <div className="flex items-center text-left space-x-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse mb-2">100% placement record for our Batch Students</h3>
                <p className="text-text-secondary dark:text-text-muted text-sm">
                  Proven track record of successful placements for all enrolled cohorts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <WeeklyTestSection />
      <CodingFeaturesSection />
    </div>
  );
}

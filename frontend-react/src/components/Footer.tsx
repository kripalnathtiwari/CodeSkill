import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Code2, MapPin, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

const Linkedin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Instagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Facebook = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Youtube = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

export default function Footer() {
  const location = useLocation();
  const hideOnPaths = ['/sandbox', '/solve'];

  if (hideOnPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#0a0a0a] text-slate-300 py-10 px-6 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-[90rem] mx-auto flex flex-col xl:flex-row gap-16 xl:gap-12 justify-between relative z-10">

        {/* Brand & Address Section */}
        <div className="w-full xl:w-1/4 space-y-6">
          <Link to="/" className="flex items-center space-x-2 mb-4 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transform rotate-12 transition-transform group-hover:rotate-0">
              <Code2 className="w-6 h-6 text-text-inverse" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-text-inverse">Code<span className="text-primary">Skill</span></span>
              <p className="text-[10px] text-text-muted uppercase tracking-widest leading-none">Education Private Limited</p>
            </div>
          </Link>

          <p className="text-sm text-slate-300 leading-relaxed mb-6 pr-4">
            CodeSkill is an advanced interactive learning platform designed to empower developers. We bridge the gap between academic learning and industry requirements with real-world projects, guided courses, and practical coding challenges.
          </p>

          {/* Social Icons */}
          <div className="flex items-center space-x-3 pb-4">
            <Link to="#" className="w-9 h-9 rounded-full bg-[#0A66C2]/10 border border-[#0A66C2]/20 flex items-center justify-center text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all shadow-sm">
              <Linkedin className="w-4 h-4" />
            </Link>
            <Link to="#" className="w-9 h-9 rounded-full bg-[#E1306C]/10 border border-[#E1306C]/20 flex items-center justify-center text-[#E1306C] hover:bg-[#E1306C] hover:text-white transition-all shadow-sm">
              <Instagram className="w-4 h-4" />
            </Link>
            <Link to="#" className="w-9 h-9 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all shadow-sm">
              <Facebook className="w-4 h-4" />
            </Link>
            <Link to="#" className="w-9 h-9 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all shadow-sm">
              <Youtube className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Links Section */}
        <div className="w-full xl:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">

          <div className="space-y-5">
            <h4 className="text-primary font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="text-slate-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-300 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/college-request-session" className="text-slate-300 hover:text-white transition-colors">Campus Training Program</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-primary font-bold text-lg mb-4">Courses</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/course/st-1" className="text-slate-300 hover:text-white transition-colors">Full Stack Web Dev Bootcamp</Link></li>
              <li><Link to="/course/st-2" className="text-slate-300 hover:text-white transition-colors">Data Science & AI Program</Link></li>
              <li><Link to="/course/c-1" className="text-slate-300 hover:text-white transition-colors">Data Science & Machine Learning</Link></li>
              <li><Link to="/course/c-2" className="text-slate-300 hover:text-white transition-colors">Full Stack Web Development</Link></li>
              <li><Link to="/course/c-3" className="text-slate-300 hover:text-white transition-colors">Cloud Architecture & System Design</Link></li>
              <li><Link to="/course/dsa-1" className="text-slate-300 hover:text-white transition-colors">Advanced DSA</Link></li>
              <li><Link to="/course/sd-1" className="text-slate-300 hover:text-white transition-colors">System Design Masterclass</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-primary font-bold text-lg mb-4">Learning & Tools</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/courses-training" className="text-slate-300 hover:text-white transition-colors">Upskill Courses</Link></li>
              <li><Link to="/test-series" className="text-slate-300 hover:text-white transition-colors">Test Series</Link></li>
              <li><Link to="/sandbox" className="text-slate-300 hover:text-white transition-colors">Online Compiler</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* MIDDLE: Big Brand Name with Addresses Flanking */}
      <div className="relative w-full max-w-[90rem] mx-auto py-12 md:py-16 my-12 border-t border-b border-white/10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
        
        {/* Left: Corporate Address */}
        <div className="w-full md:w-1/4 flex items-start justify-center md:justify-start space-x-3 text-sm z-10">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-slate-300">
            <p className="font-semibold text-white mb-1">Corporate Address:</p>
            <p>1st Floor, Tech Park, Phase 1</p>
            <p>Electronic City, Bangalore</p>
            <p>Karnataka 560100, India</p>
          </div>
        </div>

        {/* Center: Big Brand Name */}
        <div className="w-full md:w-1/2 flex justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative text-[14vw] md:text-[10vw] lg:text-[8rem] xl:text-[10rem] font-black tracking-tighter leading-none select-none"
          >
            {/* Base text (dim) */}
            <span className="text-white/5">
              CodeSkill
            </span>
            
            {/* Shining gradient overlay */}
            <span 
              className="absolute inset-0 bg-clip-text text-transparent bg-[length:200%_100%] animate-shine"
              style={{
                backgroundImage: "linear-gradient(110deg, transparent 40%, rgba(16,185,129,0.9) 50%, transparent 60%)"
              }}
            >
              CodeSkill
            </span>
          </motion.h1>
        </div>

        {/* Right: Registered Address */}
        <div className="w-full md:w-1/4 flex items-start justify-center md:justify-end space-x-3 text-sm z-10 text-left md:text-right">
          <div className="text-slate-300 order-2 md:order-1 md:pr-3 pl-3 md:pl-0">
            <p className="font-semibold text-white mb-1">Registered Address:</p>
            <p>42, Innovation Hub, Sector 5</p>
            <p>Salt Lake City, Kolkata</p>
            <p>West Bengal 700091, India</p>
          </div>
          <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 order-1 md:order-2" />
        </div>
      </div>

      {/* BOTTOM: Copyright & Legal Links */}
      <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-4 relative z-10">
        <p className="text-sm text-slate-400 text-center md:text-left">
          © {new Date().getFullYear()} CodeSkill | All Rights Reserved
        </p>
        
        <div className="flex items-center gap-6">
          <Link to="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
            Terms & Condition
          </Link>
          <Link to="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="/refund" className="text-sm text-slate-400 hover:text-white transition-colors">
            Cancellation & Refund Policy
          </Link>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="fixed bottom-24 right-8 z-40 w-12 h-12 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center hover:bg-primary/90 transition-colors"
        title="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>

      {/* Shine Animation Keyframes */}
      <style>{`
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-shine {
          animation: shine 4s linear infinite;
        }
      `}</style>
    </footer>
  );
}

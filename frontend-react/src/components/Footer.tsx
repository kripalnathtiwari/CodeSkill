import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Code2, MapPin, Globe, Share2, MessageCircle, Video } from "lucide-react";

export default function Footer() {
  const location = useLocation();
  const hideOnPaths = ['/sandbox', '/solve'];

  if (hideOnPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  return (
    <footer className="bg-[#111111] dark:bg-[#0a0a0a] text-slate-300 py-16 px-6 border-t border-slate-800">
      <div className="max-w-[90rem] mx-auto flex flex-col xl:flex-row gap-16 xl:gap-12 justify-between">

        {/* Brand & Address Section */}
        <div className="w-full xl:w-1/4 space-y-6">
          <Link to="/" className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center transform rotate-12 transition-transform group-hover:rotate-0">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">Code<span className="text-emerald-500">Skill</span></span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none">Education Private Limited</p>
            </div>
          </Link>

          <p className="text-sm text-slate-400 leading-relaxed mb-6 pr-4">
            CodeSkill is an advanced interactive learning platform designed to empower developers. We bridge the gap between academic learning and industry requirements with real-world projects, guided courses, and practical coding challenges.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">Corporate Address:</p>
                <p>1st Floor, Tech Park, Phase 1</p>
                <p>Electronic City, Bangalore</p>
                <p>Karnataka 560100, India</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">Registered Address:</p>
                <p>42, Innovation Hub, Sector 5</p>
                <p>Salt Lake City, Kolkata</p>
                <p>West Bengal 700091, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="w-full xl:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12">

          <div className="space-y-5">
            <h4 className="text-emerald-500 font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Legal</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Corporate Solution</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Campus Training Program</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-emerald-500 font-bold text-lg mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/problems" className="hover:text-white transition-colors">POTD</Link></li>
              <li><Link to="/problems" className="hover:text-white transition-colors">Practice Problems</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Blogs</Link></li>
              <li><Link to="/courses-training" className="hover:text-white transition-colors">Upskill Courses</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Connect</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-emerald-500 font-bold text-lg mb-4">Tutorials</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Programming Languages</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">DSA</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Web Technology</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">AI, ML & Data Science</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">DevOps</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">CS Core Subjects</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">GATE</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">School Subjects</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Software and Tools</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-emerald-500 font-bold text-lg mb-4">Courses</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/course/st-1" className="hover:text-white transition-colors">Full Stack Bootcamp</Link></li>
              <li><Link to="/course/st-2" className="hover:text-white transition-colors">Data Science & AI</Link></li>
              <li><Link to="/course/f-1" className="hover:text-white transition-colors">Data Science & ML</Link></li>
              <li><Link to="/course/f-2" className="hover:text-white transition-colors">Full Stack Web Dev</Link></li>
              <li><Link to="/course/f-3" className="hover:text-white transition-colors">Cloud Architecture</Link></li>
              <li><Link to="/course/c-1" className="hover:text-white transition-colors">Advanced DSA</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-emerald-500 font-bold text-lg mb-4">Preparation Corner</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/company-problems" className="hover:text-white transition-colors">Interview Corner</Link></li>
              <li><Link to="/problems" className="hover:text-white transition-colors">Aptitude</Link></li>
              <li><Link to="/problems" className="hover:text-white transition-colors">Puzzles</Link></li>
              <li><Link to="/courses-training" className="hover:text-white transition-colors">CS 160</Link></li>
              <li><Link to="/courses-training" className="hover:text-white transition-colors">System Design</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}

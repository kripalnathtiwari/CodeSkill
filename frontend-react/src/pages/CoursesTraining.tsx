import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GraduationCap, Calendar, Clock, ChevronRight, Users, CheckCircle2, Search } from "lucide-react";
import Fuse from "fuse.js";
import { COURSES_DATA } from "../data/coursesData";

const CATEGORIES = [
  { id: "all", label: "All Programs" },
  { id: "summer", label: "Summer Internship" },
  { id: "featured", label: "Coding" },
  { id: "standard", label: "Self-Paced Courses" }
];

export default function CoursesTraining() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [courses, setCourses] = useState<any[]>(Object.values(COURSES_DATA));

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
    else setActiveCategory("all");

    const search = searchParams.get("search");
    if (search) setSearchQuery(search);
    else setSearchQuery("");
  }, [searchParams]);

  useEffect(() => {
    const saved = localStorage.getItem("admin_custom_courses");
    if (saved) {
      setCourses([...Object.values(COURSES_DATA), ...JSON.parse(saved)]);
    }
  }, []);

  const filteredCourses = React.useMemo(() => {
    let processed = courses;

    if (searchQuery.trim()) {
      const fuse = new Fuse(processed, {
        keys: ['title', 'description', 'tags'],
        threshold: 0.4
      });
      processed = fuse.search(searchQuery).map(res => res.item);
    }

    return processed.filter(c => activeCategory === "all" || c.category === activeCategory);
  }, [courses, searchQuery, activeCategory]);

  return (
    <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full space-y-12">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-10 flex flex-col md:flex-row md:items-center justify-between border border-slate-200 dark:border-slate-800/60 shadow-sm">
        <div className="space-y-4 max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <GraduationCap className="h-4 w-4" />
            <span>Elevate Your Career</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Premium Courses & <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Training</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Fast-track your tech career with industry-relevant training programs, live bootcamps, and comprehensive self-paced courses.
          </p>
        </div>
      </div>

      {/* Category & Search Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchParams({ category: cat.id });
                }}
                className={`px-5 py-2.5 rounded-full font-bold transition-all text-sm ${
                  activeCategory === cat.id 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105" 
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, skills, or topics..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course: any) => (
            <div key={course.id} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-emerald-500/50 hover:shadow-xl transition-all group flex flex-col">
              
              {/* Course Image */}
              <div className="w-full h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                {course.image ? (
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${course.color} opacity-80`} />
                )}
                
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                    course.category === 'summer' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {course.category === 'summer' ? 'Internship' : 'Course'}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                   <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                     <course.icon className="w-5 h-5 text-white" />
                   </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1 line-clamp-3">
                  {course.description}
                </p>
                
                <div className="space-y-4 mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {course.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-1 rounded-md uppercase font-semibold tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-100 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>{course.price}</span>
                    </div>
                  </div>
                  
                  <Link to={`/course/${course.id}`} className="block pt-2">
                    <button className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-colors flex items-center justify-center space-x-2">
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCourses.length === 0 && (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            No courses found in this category.
          </div>
        )}
      </div>

    </div>
  );
}

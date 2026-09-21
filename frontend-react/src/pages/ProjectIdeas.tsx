import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Code2, ArrowRight, Loader2, Server, Smartphone, Globe, BrainCircuit } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: string;
  techStack: string[];
  imageUrl?: string | null;
}

export default function ProjectIdeas() {
  const [projects, setProjects] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Assuming public or authenticated access (use token if required)
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${API_BASE_URL}/api/v1/projects`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        setProjects(res.data);
      } catch (err) {
        console.error('Error fetching project ideas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const domains = ['All', ...Array.from(new Set(projects.map(p => p.domain)))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredProjects = projects.filter(p => {
    if (selectedDomain !== 'All' && p.domain !== selectedDomain) return false;
    if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const getDomainIcon = (domain: string) => {
    const d = domain.toLowerCase();
    if (d.includes('web') || d.includes('frontend')) return <Globe className="w-5 h-5" />;
    if (d.includes('mobile') || d.includes('app')) return <Smartphone className="w-5 h-5" />;
    if (d.includes('backend') || d.includes('server') || d.includes('api')) return <Server className="w-5 h-5" />;
    if (d.includes('ai') || d.includes('ml') || d.includes('machine learning')) return <BrainCircuit className="w-5 h-5" />;
    return <Code2 className="w-5 h-5" />;
  };

  return (
    <div className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8 relative">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-indigo-500/5 p-8 md:p-12 rounded-[2rem] border border-primary/20 shadow-sm">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold tracking-wide uppercase mb-6">
              <Lightbulb className="w-4 h-4" />
              <span>Inspiration Hub</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">CodeSkill</span> Project Ideas
            </h1>
            
            <p className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-2xl">
              Explore and get inspired by hand-picked project ideas for your portfolio. Build these real-world applications to master your skills and stand out to top recruiters.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center relative w-56 h-56 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-[2rem] transform rotate-6 animate-pulse"></div>
            <div className="absolute inset-0 bg-surface dark:bg-slate-800 rounded-[2rem] border border-border shadow-xl transform -rotate-3 flex items-center justify-center p-6 transition-transform hover:rotate-0 duration-500">
              <Code2 className="w-20 h-20 text-primary/80" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-secondary/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-border/60">
          <Lightbulb className="w-16 h-16 text-text-muted/30 mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">Coming Soon</h3>
          <p className="text-text-muted max-w-md">We are currently gathering an awesome list of project ideas across different domains. Check back later!</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-surface dark:bg-slate-800 p-5 md:px-8 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto hide-scrollbar">
              <span className="text-sm font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Domain</span>
              <div className="flex gap-2">
                {domains.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDomain(d)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      selectedDomain === d 
                        ? 'bg-primary text-white shadow-md shadow-primary/20 -translate-y-0.5' 
                        : 'bg-slate-100 dark:bg-slate-700/50 text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-px h-px md:h-8 bg-border dark:bg-border/50 shrink-0"></div>

            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto hide-scrollbar">
              <span className="text-sm font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Difficulty</span>
              <div className="flex gap-2">
                {difficulties.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      selectedDifficulty === d 
                        ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md -translate-y-0.5' 
                        : 'bg-slate-100 dark:bg-slate-700/50 text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full py-12 text-center text-text-muted">
                No projects found matching your filters.
              </div>
            ) : (
              filteredProjects.map(project => (
                <div 
                  key={project.id} 
                  onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  className="group flex flex-col bg-surface dark:bg-slate-800 rounded-3xl border border-border dark:border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {project.imageUrl && (
                    <div className="w-full h-48 overflow-hidden">
                      <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                        {getDomainIcon(project.domain)}
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                        project.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        project.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {project.difficulty}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    
                    <p className="text-text-secondary text-sm mb-6 line-clamp-3 flex-1">
                      {project.description}
                    </p>

                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack.map((tech, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 text-text-primary text-xs font-medium rounded-lg">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

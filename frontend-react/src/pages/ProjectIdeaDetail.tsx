import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Globe, BrainCircuit, Code2 } from 'lucide-react';
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

export default function ProjectIdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${API_BASE_URL}/api/v1/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProject(res.data);
      } catch (err: any) {
        console.error('Error fetching project idea:', err);
        setError('Failed to fetch project idea. It may have been deleted.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-text-muted text-lg mb-4">{error || 'Project not found'}</p>
        <button 
          onClick={() => navigate('/dashboard/projects')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Projects
        </button>
      </div>
    );
  }

  const getDomainIcon = (domain: string) => {
    if (domain.toLowerCase().includes('web') || domain.toLowerCase().includes('frontend') || domain.toLowerCase().includes('backend')) {
      return <Globe className="w-4 h-4" />;
    }
    if (domain.toLowerCase().includes('ai') || domain.toLowerCase().includes('ml') || domain.toLowerCase().includes('data')) {
      return <BrainCircuit className="w-4 h-4" />;
    }
    return <Code2 className="w-4 h-4" />;
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/dashboard/projects')}
        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors w-fit group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Projects</span>
      </button>

      <div className="bg-surface dark:bg-slate-900 rounded-2xl shadow-sm border border-border dark:border-border overflow-hidden">
        {/* Cover Image */}
        {project.imageUrl && (
          <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}

        <div className="p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Header section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-semibold uppercase tracking-wider">
                {getDomainIcon(project.domain)}
                {project.domain}
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold uppercase tracking-wider ${
                project.difficulty === 'Beginner' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                project.difficulty === 'Intermediate' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}>
                {project.difficulty}
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight">
              {project.title}
            </h1>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech, idx) => (
                <span 
                  key={idx} 
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-text-primary text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-border dark:bg-border my-8" />

          {/* Description / Content */}
          <div>
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {project.description}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

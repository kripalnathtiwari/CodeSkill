import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  Globe, 
  BrainCircuit, 
  Code2, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Terminal, 
  FolderGit2, 
  Clock, 
  Flame,
  FileCode2,
  Copy,
  Check
} from 'lucide-react';
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${API_BASE_URL}/api/v1/projects/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-[70vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-text-muted font-medium text-sm animate-pulse">Loading project blueprint...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <FileCode2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Project Not Found</h2>
        <p className="text-text-muted max-w-md mb-6">{error || 'This project guide might have been removed or renamed.'}</p>
        <button 
          onClick={() => navigate('/dashboard/projects')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
      </div>
    );
  }

  const getDomainIcon = (domain: string) => {
    const d = domain.toLowerCase();
    if (d.includes('web') || d.includes('frontend') || d.includes('backend') || d.includes('full')) {
      return <Globe className="w-4 h-4" />;
    }
    if (d.includes('ai') || d.includes('ml') || d.includes('data')) {
      return <BrainCircuit className="w-4 h-4" />;
    }
    return <Code2 className="w-4 h-4" />;
  };

  return (
    <div className="w-full space-y-8 pb-16 text-xs">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard/projects')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border dark:border-border text-text-secondary dark:text-text-muted hover:text-primary hover:border-primary/40 bg-surface dark:bg-slate-900 transition-all font-semibold text-sm group shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>All Project Ideas</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Interactive Student Guide</span>
        </div>
      </div>

      {/* Main Hero Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-primary/5 dark:from-slate-900 dark:via-slate-900 dark:to-primary/10 rounded-3xl border border-border dark:border-border shadow-sm p-6 sm:p-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                {getDomainIcon(project.domain)}
                {project.domain}
              </span>

              <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase ${
                project.difficulty.toLowerCase().includes('beg') 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                  : project.difficulty.toLowerCase().includes('med') || project.difficulty.toLowerCase().includes('inter')
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {project.difficulty}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-text-muted">
                <Clock className="w-3 h-3" />
                Self-Paced Guide
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary dark:text-white tracking-tight leading-tight">
              {project.title}
            </h1>

            {/* Tech Stack Pills */}
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>Tech Stack & Tools</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1.5 bg-background dark:bg-slate-800 text-text-primary dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-border dark:border-slate-700 shadow-2xs hover:border-primary/50 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick stats or project summary box */}
          <div className="lg:w-80 shrink-0 bg-background/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-border dark:border-slate-700/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary dark:text-white">Hands-on Mastery</h4>
                <p className="text-xs text-text-muted">Production-grade portfolio item</p>
              </div>
            </div>

            <ul className="text-xs text-text-secondary dark:text-slate-300 space-y-2 border-t border-border dark:border-slate-700/60 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Complete incremental development roadmap</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Best coding patterns & clean architecture</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Resume & portfolio ready project</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hero Image if present */}
      {project.imageUrl && (
        <div className="w-full h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden border border-border dark:border-border shadow-md bg-slate-100 dark:bg-slate-900">
          <img 
            src={project.imageUrl} 
            alt={project.title} 
            className="w-full h-full object-cover" 
          />
        </div>
      )}

      {/* Guide & Content Section */}
      <div className="bg-surface dark:bg-slate-900 rounded-3xl border border-border dark:border-border shadow-sm p-6 sm:p-10 lg:p-12">
        <div className="flex items-center justify-between border-b border-border/80 pb-5 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-text-primary dark:text-white">
                Project Implementation Blueprint
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                Follow the step-by-step instructions below to build, test, and polish your project.
              </p>
            </div>
          </div>
        </div>

        {/* Formatted Markdown Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-text-secondary dark:text-slate-300 leading-relaxed
          prose-headings:text-text-primary dark:prose-headings:text-white prose-headings:font-black tracking-tight
          prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:border-b prose-h1:border-border/60 prose-h1:pb-3 prose-h1:mt-8
          prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:text-primary dark:prose-h2:text-primary prose-h2:mt-8 prose-h2:mb-3
          prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-base sm:prose-p:text-[17px] prose-p:leading-8 prose-p:mb-4
          prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1.5
          prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-2 prose-li:leading-relaxed
          prose-strong:text-text-primary dark:prose-strong:text-white prose-strong:font-bold
          prose-code:text-primary dark:prose-code:text-emerald-400 prose-code:bg-primary/5 dark:prose-code:bg-slate-800/80 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
          prose-pre:bg-slate-900 dark:prose-pre:bg-black/80 prose-pre:text-slate-100 prose-pre:rounded-2xl prose-pre:p-5 prose-pre:border prose-pre:border-slate-800 prose-pre:shadow-md
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl prose-blockquote:italic
        ">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom rendering for pre / code blocks with copy button
              pre: ({ node, children, ...props }) => {
                return (
                  <div className="relative group my-6">
                    <pre {...props} className="overflow-x-auto rounded-2xl bg-slate-950 p-5 text-slate-100 border border-slate-800 text-sm font-mono leading-relaxed">
                      {children}
                    </pre>
                  </div>
                );
              },
              // Enhanced ordered list with step numbers styling
              ol: ({ node, children, ...props }) => (
                <ol className="space-y-4 my-6 list-none counter-reset-item pl-0" {...props}>
                  {children}
                </ol>
              ),
              // Enhanced list items
              li: ({ node, children, ...props }) => (
                <li className="flex items-start gap-3 text-base sm:text-[17px] leading-relaxed text-text-secondary dark:text-slate-300" {...props}>
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2.5" />
                  <div className="flex-1">{children}</div>
                </li>
              ),
              // Callout / Blockquote styling
              blockquote: ({ node, children, ...props }) => (
                <div className="my-6 p-5 rounded-2xl bg-primary/5 dark:bg-primary/10 border-l-4 border-primary text-text-primary dark:text-slate-200">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1 font-medium">{children}</div>
                  </div>
                </div>
              ),
              // Tables
              table: ({ node, children, ...props }) => (
                <div className="overflow-x-auto my-6 rounded-2xl border border-border">
                  <table className="w-full text-left text-sm" {...props}>
                    {children}
                  </table>
                </div>
              ),
              th: ({ node, children, ...props }) => (
                <th className="p-3 bg-slate-100 dark:bg-slate-800 font-bold border-b border-border text-text-primary dark:text-white" {...props}>
                  {children}
                </th>
              ),
              td: ({ node, children, ...props }) => (
                <td className="p-3 border-b border-border/50 text-text-secondary dark:text-slate-300" {...props}>
                  {children}
                </td>
              )
            }}
          >
            {project.description}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

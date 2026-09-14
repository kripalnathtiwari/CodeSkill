import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';
import { Loader2, Code2, ArrowUpRight, Bookmark, CheckCircle2, Layers, Cpu, Database, Binary, Hash, GitBranch } from 'lucide-react';

export default function Problems() {
  const [loading, setLoading] = useState(true);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getApiUrl('/api/v1/questions/metadata/aggregates?type=CODING'));
      const counts: Record<string, number> = res.data.tagCounts || {};

      // Also load custom problems created in the admin panel
      try {
        const savedCustom = localStorage.getItem("admin_custom_problems");
        if (savedCustom) {
          const parsedCustom = JSON.parse(savedCustom);
          parsedCustom.forEach((p: any) => {
            const tags = p.topicTags ? p.topicTags.map((t: any) => t.name || t) : (p.tags || []);
            const finalTags = tags.length > 0 ? tags : ['Uncategorized'];
            finalTags.forEach((tag: string) => {
              counts[tag] = (counts[tag] || 0) + 1;
            });
          });
        }
      } catch (e) {
        console.warn("Could not load custom problems from local storage", e);
      }
      
      setTagCounts(counts);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
      setError('Failed to load practice categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getTagIcon = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('array') || t.includes('list')) return <Layers className="w-8 h-8 text-text-inverse" />;
    if (t.includes('tree') || t.includes('graph')) return <GitBranch className="w-8 h-8 text-text-inverse" />;
    if (t.includes('dp') || t.includes('dynamic')) return <Cpu className="w-8 h-8 text-text-inverse" />;
    if (t.includes('hash')) return <Hash className="w-8 h-8 text-text-inverse" />;
    if (t.includes('database') || t.includes('sql')) return <Database className="w-8 h-8 text-text-inverse" />;
    if (t.includes('bit') || t.includes('math')) return <Binary className="w-8 h-8 text-text-inverse" />;
    return <Code2 className="w-8 h-8 text-text-inverse" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background dark:bg-black flex items-center justify-center p-6">
        <div className="text-center bg-surface dark:bg-[#1e2327] p-8 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-900/50 max-w-md w-full">
           <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-2">Error Loading Categories</h2>
           <p className="text-text-secondary dark:text-text-muted">{error}</p>
        </div>
      </div>
    );
  }

  const tags = Object.keys(tagCounts).sort();

  return (
    <div className="min-h-screen bg-background dark:bg-black py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-extrabold text-text-primary dark:text-text-primary tracking-tight mb-3">
            DSA Topic <span className="text-primary">Preparation</span>
          </h1>
          <p className="text-base text-text-secondary dark:text-text-muted leading-relaxed">
            Select a topic category to start practicing. Master core concepts through tailored algorithmic challenges.
          </p>
        </div>

        {tags.length === 0 ? (
          <div className="text-center bg-surface dark:bg-[#1e2327] shadow-sm rounded-2xl border border-border dark:border-border p-12">
            <p className="text-text-muted dark:text-text-muted text-lg">No practice categories found. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tags.map((tag) => (
              <div key={tag} className="bg-surface dark:bg-[#151a23] shadow-md dark:shadow-none rounded-2xl border border-border dark:border-border/80 overflow-hidden flex flex-col hover:border-border dark:hover:border-border transition-colors">
                
                {/* Main Content Area */}
                <div className="p-5 flex gap-5">
                  {/* Left Colored Box */}
                  <div className="w-2/5 bg-amber-500 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 shrink-0 shadow-inner">
                    <h2 className="text-lg font-black text-text-primary leading-tight">{tag}</h2>
                    <div className="text-[9px] font-bold text-text-primary/80 uppercase tracking-widest">
                      Preparation
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary border-4 border-white dark:border-[#151a23] flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                      {getTagIcon(tag)}
                    </div>
                  </div>
                  
                  {/* Right Details List */}
                  <div className="w-3/5 py-1 flex flex-col justify-center">
                    <h3 className="text-text-primary dark:text-text-primary font-bold text-base mb-3 truncate" title={tag}>{tag}</h3>
                    <div className="text-[9px] font-bold text-text-muted dark:text-text-muted uppercase tracking-wider mb-2">
                      Preparation Includes:
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs text-text-secondary dark:text-text-secondary font-medium">Coding Assessments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs text-text-secondary dark:text-text-secondary font-medium">Algorithmic Logic</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs text-text-secondary dark:text-text-secondary font-medium">{tagCounts[tag]} Questions</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-4 border-t border-slate-100 dark:border-border/80 flex items-center justify-between bg-background dark:bg-[#1a202c]">
                  <button className="w-10 h-10 rounded-lg border border-border dark:border-border flex items-center justify-center text-primary bg-surface dark:bg-transparent hover:bg-surface-secondary dark:hover:bg-slate-800 transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate(isDashboardRoute ? `/dashboard/practice/${encodeURIComponent(tag)}` : `/problems/${encodeURIComponent(tag)}`)}
                    className="flex-1 ml-4 bg-primary hover:bg-primary text-text-inverse font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Start Preparing</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
                
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}

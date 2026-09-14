import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';
import { Loader2, ArrowLeft, Search, Code2, Trophy, Target, Flame } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: string;
  tags: string[];
}

export default function TagProblems() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    fetchTagQuestions(false);
  }, [tag, selectedDifficulty, searchQuery]); // Re-fetch when filters change

  const fetchTagQuestions = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const decodedTag = tag ? decodeURIComponent(tag) : '';
      let url = `/api/v1/questions?limit=20&type=CODING&tag=${encodeURIComponent(decodedTag)}`;
      
      if (selectedDifficulty) {
        url += `&difficulty=${selectedDifficulty}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (isLoadMore && nextCursor) {
        url += `&cursor=${nextCursor}`;
      }

      const res = await axios.get(getApiUrl(url));
      let fetchedQuestions: Question[] = res.data.questions || [];

      // Still check local custom questions if not loading more and no strict filters applied
      if (!isLoadMore && !searchQuery) {
        try {
          const savedCustom = localStorage.getItem("admin_custom_problems");
          if (savedCustom) {
            const parsedCustom = JSON.parse(savedCustom);
            let customFormatted: Question[] = parsedCustom.map((p: any) => ({
              id: p._id || p.id,
              title: p.title,
              slug: p.slug || (p.title ? p.title.toLowerCase().replace(/\s+/g, '-') : 'custom-problem'),
              difficulty: p.difficulty?.toUpperCase() || "EASY",
              type: p.type || "CODING",
              tags: p.topicTags ? p.topicTags.map((t: any) => t.name || t) : (p.tags || []),
            }));
            
            // Filter custom ones by tag and difficulty
            customFormatted = customFormatted.filter(q => q.tags.includes(decodedTag));
            if (selectedDifficulty) {
              customFormatted = customFormatted.filter(q => q.difficulty === selectedDifficulty);
            }
            
            fetchedQuestions = [...customFormatted, ...fetchedQuestions];
          }
        } catch (e) {
          console.warn("Could not load custom problems from local storage", e);
        }
      }

      if (isLoadMore) {
        setQuestions(prev => [...prev, ...fetchedQuestions]);
      } else {
        setQuestions(fetchedQuestions);
      }

      setHasMore(res.data.hasMore);
      setNextCursor(res.data.nextCursor);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch tag questions:', err);
      setError('Failed to load problems for this category. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case 'EASY': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'HARD': return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      default: return 'bg-slate-800 text-text-muted border-border';
    }
  };

  // Use questions directly since server handles filtering
  const filteredQuestions = questions;

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
           <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-2">Error</h2>
           <p className="text-text-secondary dark:text-text-muted">{error}</p>
           <button onClick={() => navigate(isDashboardRoute ? '/dashboard/practice' : '/problems')} className="mt-6 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-text-primary dark:text-text-primary rounded-lg transition-colors">
             Go Back
           </button>
        </div>
      </div>
    );
  }

  const decodedTag = tag ? decodeURIComponent(tag) : '';

  return (
    <div className="min-h-screen bg-background dark:bg-black py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Navigation */}
        <button 
          onClick={() => navigate(isDashboardRoute ? '/dashboard/practice' : '/problems')}
          className="flex items-center text-text-secondary dark:text-text-muted hover:text-text-primary dark:hover:text-text-inverse transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-extrabold text-text-primary dark:text-text-primary tracking-tight flex items-center justify-center gap-2">
            {decodedTag} <span className="text-primary">Challenges</span>
          </h1>
          <p className="text-base text-text-secondary dark:text-text-muted mt-3 leading-relaxed">
            Select a difficulty level below to filter the {decodedTag.toLowerCase()} problems and begin your preparation.
          </p>
        </div>

        {/* Three Big Boxes for Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Easy Box */}
          <button 
            onClick={() => setSelectedDifficulty(selectedDifficulty === 'EASY' ? null : 'EASY')}
            className={`relative overflow-hidden group p-5 rounded-3xl border-2 transition-all duration-300 text-left ${selectedDifficulty === 'EASY' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-border dark:border-border bg-surface dark:bg-[#151a23] hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 shadow-sm dark:shadow-none'}`}
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
                <Target className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-emerald-500/10 dark:text-emerald-500/20 group-hover:text-emerald-500/30 dark:group-hover:text-emerald-500/40 transition-colors">01</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary dark:text-text-primary mb-1">Easy</h3>
            <p className="text-text-secondary dark:text-text-muted text-xs mb-4 line-clamp-2">Master the fundamentals and build a strong foundation in {decodedTag.toLowerCase()}.</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-500">Explore Easy</span>
              {selectedDifficulty === 'EASY' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
            </div>
          </button>

          {/* Medium Box */}
          <button 
            onClick={() => setSelectedDifficulty(selectedDifficulty === 'MEDIUM' ? null : 'MEDIUM')}
            className={`relative overflow-hidden group p-5 rounded-3xl border-2 transition-all duration-300 text-left ${selectedDifficulty === 'MEDIUM' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-border dark:border-border bg-surface dark:bg-[#151a23] hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-500/5 shadow-sm dark:shadow-none'}`}
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center border border-amber-200 dark:border-amber-500/30">
                <Flame className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              </div>
              <span className="text-2xl font-black text-amber-500/10 dark:text-amber-500/20 group-hover:text-amber-500/30 dark:group-hover:text-amber-500/40 transition-colors">02</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary dark:text-text-primary mb-1">Medium</h3>
            <p className="text-text-secondary dark:text-text-muted text-xs mb-4 line-clamp-2">Challenge yourself with intermediate problems commonly asked in interviews.</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">Explore Medium</span>
              {selectedDifficulty === 'MEDIUM' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
            </div>
          </button>

          {/* Hard Box */}
          <button 
            onClick={() => setSelectedDifficulty(selectedDifficulty === 'HARD' ? null : 'HARD')}
            className={`relative overflow-hidden group p-5 rounded-3xl border-2 transition-all duration-300 text-left ${selectedDifficulty === 'HARD' ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 shadow-[0_0_20px_rgba(225,29,72,0.2)]' : 'border-border dark:border-border bg-surface dark:bg-[#151a23] hover:border-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-500/5 shadow-sm dark:shadow-none'}`}
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center border border-rose-200 dark:border-rose-500/30">
                <Trophy className="w-5 h-5 text-rose-600 dark:text-rose-500" />
              </div>
              <span className="text-2xl font-black text-rose-500/10 dark:text-rose-500/20 group-hover:text-rose-500/30 dark:group-hover:text-rose-500/40 transition-colors">03</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary dark:text-text-primary mb-1">Hard</h3>
            <p className="text-text-secondary dark:text-text-muted text-xs mb-4 line-clamp-2">Tackle complex algorithmic puzzles to prepare for top-tier tech companies.</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-500">Explore Hard</span>
              {selectedDifficulty === 'HARD' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
            </div>
          </button>
          
        </div>

        {/* Search and Question List */}
        <div className="space-y-6 pt-4 border-t border-border dark:border-border/80">
          
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary">
                {selectedDifficulty ? `${selectedDifficulty.charAt(0) + selectedDifficulty.slice(1).toLowerCase()} Problems` : 'All Problems'}
              </h2>
              <p className="text-text-secondary dark:text-text-muted text-sm mt-1">Showing {filteredQuestions.length} questions</p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface dark:bg-[#151a23] border border-border dark:border-border rounded-xl pl-10 pr-4 py-2.5 text-text-primary dark:text-text-primary placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors shadow-sm dark:shadow-none"
              />
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16 bg-surface dark:bg-[#151a23] rounded-2xl border border-border dark:border-border shadow-sm dark:shadow-none">
              <p className="text-text-muted dark:text-text-muted text-lg">No questions match your current filters.</p>
              {(selectedDifficulty || searchQuery) && (
                <button onClick={() => { setSelectedDifficulty(null); setSearchQuery(""); }} className="mt-4 text-primary dark:text-primary hover:text-blue-700 dark:hover:text-primary font-medium">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-surface dark:bg-[#151a23] rounded-2xl border border-border dark:border-border overflow-hidden shadow-sm dark:shadow-xl">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredQuestions.map((q, idx) => (
                  <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-background dark:hover:bg-slate-800/40 transition-colors group">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="w-10 h-10 rounded-lg bg-background dark:bg-[#0b0f19] border border-border dark:border-border flex items-center justify-center shrink-0 group-hover:border-border dark:group-hover:border-slate-600 transition-colors">
                        <Code2 className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-text-primary dark:text-text-primary font-semibold text-lg group-hover:text-primary dark:group-hover:text-primary transition-colors">
                          {q.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`px-2.5 py-0.5 text-[10px] uppercase font-black tracking-wider rounded border ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      to={window.location.pathname.startsWith('/dashboard') ? `/dashboard/solve/${q.id}` : `/solve/${q.id}`}
                      className="sm:ml-4 flex items-center justify-center px-6 py-2.5 bg-blue-50 dark:bg-primary/10 hover:bg-primary text-primary dark:text-primary hover:text-text-inverse border border-blue-200 dark:border-primary/20 hover:border-primary font-bold rounded-lg transition-all shadow-sm dark:shadow-none"
                    >
                      Solve Challenge
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => fetchTagQuestions(true)}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-surface dark:bg-[#151a23] hover:bg-slate-100 dark:hover:bg-slate-800 text-text-primary dark:text-text-primary border border-border dark:border-border font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loadingMore ? 'Loading...' : 'Load More Questions'}
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

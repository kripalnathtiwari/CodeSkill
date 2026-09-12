import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Search, BrainCircuit, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { getApiUrl } from "../utils/apiConfig";

export default function AptitudeTopic() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { topic } = useParams();
  
  const [aptitudeQuestions, setAptitudeQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchAptitude = async (cursor?: string) => {
    try {
      let url = getApiUrl(`/api/v1/aptitude-problems?limit=20&topic=${encodeURIComponent(topic || "")}`);
      if (cursor) {
        url += `&cursor=${cursor}`;
      }
      
      const response = await axios.get(url);
      
      const parsedProblems = (response.data.data || []).map((p: any) => {
        return {
          ...p,
          _id: p.id,
        };
      });

      if (cursor) {
        setAptitudeQuestions(prev => [...prev, ...parsedProblems]);
      } else {
        setAptitudeQuestions(parsedProblems);
      }
      
      setHasMore(response.data.pagination?.hasMore || false);
      setNextCursor(response.data.pagination?.nextCursor || null);
    } catch (error) {
      console.error("Error fetching aptitude questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAptitude();
    
    // Fetch Solved Status
    if (user?.email) {
      try {
        const key = `aptitude_analytics_${user.email.toLowerCase()}`;
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        const solved = new Set<string>();
        saved.forEach((q: any) => {
          if (q.correct) solved.add(String(q.id));
        });
        setSolvedIds(solved);
      } catch (e) {
        console.error("[Aptitude Debug] Error reading analytics", e);
      }
    }
  }, [user]);

  const decodedTopic = decodeURIComponent(topic || "");
  const topicQuestions = aptitudeQuestions;

  return (
    <div className="flex flex-col w-full p-4 md:p-8 gap-8">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        
        {/* Header Area */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate('/aptitude')}
            className="flex items-center text-text-muted hover:text-primary transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Topics
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-text-primary dark:text-text-inverse flex items-center gap-2">
              <BrainCircuit className="w-8 h-8 text-primary" />
              {decodedTopic} Questions
            </h1>
          </div>
        </div>

        {/* Problem List */}
        {isLoading ? (
          <div className="p-12 text-center text-text-muted flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Loading questions...</span>
          </div>
        ) : (
          <div className="space-y-0 border border-border dark:border-border rounded-xl bg-surface dark:bg-background overflow-hidden shadow-sm flex flex-col">
            {topicQuestions.map((q, idx) => (
              <div
                key={q._id || q.id || idx}
                className={`flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-background dark:hover:bg-slate-900/50 transition-colors ${
                  idx !== topicQuestions.length - 1 ? 'border-b border-slate-100 dark:border-border/60' : ''
                }`}
              >
                <div className="flex items-start space-x-4 mb-4 md:mb-0">
                  <div className="mt-1 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-text-secondary dark:text-text-muted flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-text-inverse hover:text-primary dark:hover:text-primary cursor-pointer transition-colors"
                        onClick={() => {
                          if (user) {
                            sessionStorage.setItem('current_aptitude_list', JSON.stringify(topicQuestions));
                            sessionStorage.setItem('current_aptitude', JSON.stringify(q));
                            navigate(`/aptitude/${q._id || q.id}`);
                          }
                        }}>
                      {q.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-text-muted dark:text-text-muted">
                      <span className={(!q.difficulty || q.difficulty === "Easy") ? "text-emerald-500 dark:text-emerald-400" : q.difficulty === "Medium" ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"}>
                        {q.difficulty || "Easy"}
                      </span>
                      {q.company && (
                        <>
                          <span>•</span>
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-primary border border-blue-200 dark:border-blue-800/50 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            {q.company}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>Multiple Choice</span>
                    </div>
                  </div>
                </div>

                <div>
                  {!user ? (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full md:w-auto flex items-center justify-center space-x-1 font-semibold text-sm px-6 py-2 rounded-lg transition-colors border bg-surface-secondary dark:bg-slate-800 text-text-muted border-border dark:border-border hover:text-primary hover:border-primary"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Login to Solve</span>
                    </button>
                  ) : solvedIds.has(String(q._id || q.id)) ? (
                    <button
                      onClick={() => {
                        sessionStorage.setItem('current_aptitude_list', JSON.stringify(topicQuestions));
                        sessionStorage.setItem('current_aptitude', JSON.stringify(q));
                        navigate(`/aptitude/${q._id || q.id}`);
                      }}
                      className="w-full md:w-auto flex items-center justify-center space-x-1 font-semibold text-sm px-6 py-2 rounded-lg transition-colors border bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      <span>Solved</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sessionStorage.setItem('current_aptitude_list', JSON.stringify(topicQuestions));
                        sessionStorage.setItem('current_aptitude', JSON.stringify(q));
                        navigate(`/aptitude/${q._id || q.id}`);
                      }}
                      className="w-full md:w-auto flex items-center justify-center space-x-1 font-semibold text-sm px-6 py-2 rounded-lg transition-colors border bg-surface-secondary dark:bg-slate-800 text-text-primary dark:text-text-secondary border-border dark:border-border hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary"
                    >
                      <span>Solve Question</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {topicQuestions.length === 0 && (
              <div className="p-12 text-center text-text-muted">
                No aptitude questions found for this topic.
              </div>
            )}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => fetchAptitude(nextCursor || undefined)}
              className="px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 font-semibold rounded-xl transition-colors shadow-sm"
            >
              Load More Problems
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

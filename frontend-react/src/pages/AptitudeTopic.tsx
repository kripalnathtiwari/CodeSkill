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

  useEffect(() => {
    const fetchAptitude = async () => {
      try {
        const response = await axios.get(getApiUrl("/api/v1/aptitude-problems"));
        
        const parsedProblems = response.data.map((p: any) => {
          let opts = p.options;
          try {
            while (typeof opts === 'string') {
              const parsed = JSON.parse(opts);
              if (parsed === opts || typeof parsed !== 'string' && typeof parsed !== 'object') break;
              opts = parsed;
            }
          } catch(e) {}
          
          return {
            ...p,
            _id: p.id,
            options: opts,
            correctOption: p.correctAnswer || p.correctOption
          };
        });
        setAptitudeQuestions(parsedProblems);
      } catch (error) {
        console.error("Error fetching aptitude questions:", error);
      } finally {
        setIsLoading(false);
      }
    };

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
  const topicQuestions = aptitudeQuestions.filter(q => (q.topic || "Uncategorized") === decodedTopic);

  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 gap-8">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        
        {/* Header Area */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate('/aptitude')}
            className="flex items-center text-slate-500 hover:text-purple-600 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Topics
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BrainCircuit className="w-8 h-8 text-purple-500" />
              {decodedTopic} Questions
            </h1>
          </div>
        </div>

        {/* Problem List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading questions...</span>
          </div>
        ) : (
          <div className="space-y-0 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-sm flex flex-col">
            {topicQuestions.map((q, idx) => (
              <div
                key={q._id || q.id || idx}
                className={`flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                  idx !== topicQuestions.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/60' : ''
                }`}
              >
                <div className="flex items-start space-x-4 mb-4 md:mb-0">
                  <div className="mt-1 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
                        onClick={() => {
                          if (user) {
                            sessionStorage.setItem('current_aptitude_list', JSON.stringify(topicQuestions));
                            sessionStorage.setItem('current_aptitude', JSON.stringify(q));
                            navigate(`/aptitude/${q._id || q.id}`);
                          }
                        }}>
                      {q.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className={q.difficulty === "Easy" ? "text-emerald-500" : q.difficulty === "Medium" ? "text-amber-500" : "text-rose-500"}>
                        {q.difficulty || "Easy"}
                      </span>
                      {q.company && (
                        <>
                          <span>•</span>
                          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
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
                      className="w-full md:w-auto flex items-center justify-center space-x-1 font-semibold text-sm px-6 py-2 rounded-lg transition-colors border bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-purple-500 hover:border-purple-500"
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
                      className="w-full md:w-auto flex items-center justify-center space-x-1 font-semibold text-sm px-6 py-2 rounded-lg transition-colors border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
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
                      className="w-full md:w-auto flex items-center justify-center space-x-1 font-semibold text-sm px-6 py-2 rounded-lg transition-colors border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      <span>Solve Question</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {topicQuestions.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                No aptitude questions found for this topic.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

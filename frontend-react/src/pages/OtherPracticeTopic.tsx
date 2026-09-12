import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Search, BrainCircuit, ArrowLeft, Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function OtherPracticeTopic() {
  const { topic } = useParams<{ topic: string }>();
  const decodedTopic = decodeURIComponent(topic || "");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const data = localStorage.getItem("admin_other_practice_data");
      if (data) {
        const allQuestions = JSON.parse(data);
        setQuestions(allQuestions.filter((q: any) => q.topic?.trim() === decodedTopic));
      }
    } catch (e) {
      console.error(e);
    }

    if (user?.email) {
      try {
        const key = `other_practice_analytics_${user.email.toLowerCase()}`;
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        const solved = new Set<string>();
        saved.forEach((q: any) => {
          if (q.correct) solved.add(String(q.id));
        });
        setSolvedIds(solved);
      } catch (e) {
        console.error(e);
      }
    }
  }, [decodedTopic, user]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => (q.title || "").toLowerCase().includes(searchQuery.toLowerCase()));
  }, [questions, searchQuery]);

  return (
    <div className="flex flex-col w-full p-4 md:p-8 gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
          <Link to="/other-practice" className="inline-flex items-center text-text-muted hover:text-text-primary dark:hover:text-text-inverse mb-4 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Topics
          </Link>
          <h1 className="text-3xl font-black text-text-primary dark:text-text-inverse flex items-center gap-3">
            <Target className="w-8 h-8 text-rose-500" />
            {decodedTopic} Practice
          </h1>
          <p className="text-text-secondary mt-2">Solve questions to master {decodedTopic}.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface dark:bg-[#111827] border border-border rounded-xl pl-12 pr-4 py-3 text-text-primary dark:text-text-inverse focus:outline-none focus:border-rose-500 transition-colors shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuestions.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-surface dark:bg-[#111827] rounded-full flex items-center justify-center mb-4 border border-border shadow-sm">
              <BrainCircuit className="w-10 h-10 text-text-muted" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-inverse mb-2">No questions found</h2>
            <p className="text-text-secondary dark:text-text-muted max-w-md">
              There are no practice questions available for this topic yet.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, index) => {
            const isSolved = solvedIds.has(String(q._id));
            
            return (
              <div key={q._id} className="bg-surface dark:bg-[#111827] rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-surface border border-border text-text-secondary text-xs font-bold uppercase tracking-wide">
                      Q {index + 1}
                    </span>
                    {q.difficulty && (
                      <span className={(!q.difficulty || q.difficulty === "Easy") ? "text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20" : q.difficulty === "Medium" ? "text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20" : "text-rose-500 dark:text-rose-400 text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20"}>
                        {q.difficulty || "Easy"}
                      </span>
                    )}
                  </div>
                  {q.company && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-200 dark:border-rose-500/20">
                      {q.company}
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-text-primary dark:text-text-inverse mb-6 line-clamp-3 leading-snug flex-1">
                  {q.title}
                </h3>
                
                <div className="mt-auto">
                  {isSolved ? (
                    <button
                      onClick={() => {
                        sessionStorage.setItem('current_other_practice_list', JSON.stringify(questions));
                        navigate(`/other-practice/solve/${q._id}`);
                      }}
                      className="w-full py-2.5 rounded-xl font-bold transition-all text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex justify-center items-center gap-2"
                    >
                      Solved
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sessionStorage.setItem('current_other_practice_list', JSON.stringify(questions));
                        navigate(`/other-practice/solve/${q._id}`);
                      }}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl font-bold transition-all shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30"
                    >
                      Solve Challenge
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

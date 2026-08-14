import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Target, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function OtherPractice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const data = localStorage.getItem("admin_other_practice_data");
      if (data) {
        setQuestions(JSON.parse(data));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uniqueTopics = useMemo(() => {
    const topics = new Set<string>();
    questions.forEach(q => {
      if (q.topic) {
        topics.add(q.topic.trim());
      }
    });
    return Array.from(topics).sort();
  }, [questions]);

  const filteredTopics = useMemo(() => {
    return uniqueTopics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [uniqueTopics, searchQuery]);

  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-black text-text-primary dark:text-text-inverse flex items-center gap-3">
          <Target className="w-10 h-10 text-rose-500" />
          Other Practice
        </h1>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface dark:bg-[#111827] border border-border rounded-xl pl-12 pr-4 py-3 text-text-primary dark:text-text-inverse focus:outline-none focus:border-rose-500 transition-colors shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-surface dark:bg-[#111827] rounded-full flex items-center justify-center mb-4 border border-border shadow-sm">
                <Target className="w-10 h-10 text-text-muted" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-inverse mb-2">No topics found</h2>
              <p className="text-text-secondary dark:text-text-muted max-w-md">
                We couldn't find any practice topics matching your search. Try different keywords or contact an administrator to add more topics.
              </p>
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const topicQuestions = questions.filter(q => q.topic?.trim() === topic);
              return (
                <div key={topic} className="group flex flex-col bg-surface dark:bg-[#111827] rounded-2xl border-2 border-border dark:border-border hover:border-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-500/5 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-[0_0_30px_rgba(225,29,72,0.1)] relative text-left">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
                  
                  <div className="p-6 flex-1 flex flex-col z-10 relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center border border-rose-200 dark:border-rose-500/30 flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-rose-500" />
                      </div>
                      <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse line-clamp-2">{topic}</h3>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-sm font-bold uppercase tracking-wider text-rose-500">{topicQuestions.length} Questions</span>
                      
                      <Link 
                        to={`/other-practice/topic/${encodeURIComponent(topic)}`}
                        className="px-4 py-2 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition-colors shadow-md text-sm"
                      >
                        Start Practice
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

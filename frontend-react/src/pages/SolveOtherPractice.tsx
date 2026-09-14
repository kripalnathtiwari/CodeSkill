import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, BrainCircuit, ChevronLeft, ChevronRight, Award } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { getApiUrl } from "../utils/apiConfig";
import PracticeTimer from "../components/PracticeTimer";
import { recordDailyProgress } from "../utils/progressTracker";

export default function SolveOtherPractice() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Reset state for new question
    setSelectedOption(null);
    setIsSubmitted(false);

    const loadQuestion = async () => {
      let parsedAll: any[] = [];
      const storedList = sessionStorage.getItem("current_other_practice_list");
      
      if (storedList) {
        const list = JSON.parse(storedList);
        parsedAll = list.map((p: any) => {
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
            options: opts,
            correctOption: p.correctAnswer || p.correctOption
          };
        });
      } else {
        // Fetch from localStorage as fallback
        try {
          const data = localStorage.getItem("admin_other_practice_data");
          if (data) {
            parsedAll = JSON.parse(data).map((p: any) => {
              let opts = p.options;
              try {
                while (typeof opts === 'string') {
                  const parsed = JSON.parse(opts);
                  if (parsed === opts || typeof opts !== 'string' && typeof opts !== 'object') break;
                  opts = parsed;
                }
              } catch(e) {}
              
              return {
                ...p,
                options: opts,
                correctOption: p.correctAnswer || p.correctOption
              };
            });
          }
        } catch (err) {
          console.error(err);
        }
      }

      if (parsedAll.length > 0) {
        setAllQuestions(parsedAll);
        const index = parsedAll.findIndex((q: any) => String(q._id) === String(id) || String(q.id) === String(id));
        if (index !== -1) {
          setCurrentIndex(index);
          setQuestion(parsedAll[index]);
        } else {
          // Fallback if not found in list but present in session
          const stored = sessionStorage.getItem("current_other_practice");
          if (stored) {
            const parsed = JSON.parse(stored);
            let opts = parsed.options;
            try {
              while (typeof opts === 'string') {
                const innerParsed = JSON.parse(opts);
                if (innerParsed === opts || typeof innerParsed !== 'string' && typeof innerParsed !== 'object') break;
                opts = innerParsed;
              }
            } catch(e) {}
            parsed.options = opts;
            parsed.correctOption = parsed.correctAnswer || parsed.correctOption;
            if (String(parsed._id) === String(id) || String(parsed.id) === String(id)) {
              setQuestion(parsed);
              return;
            }
          }
          alert("Question not found!");
          navigate("/other-practice");
        }
      } else {
        navigate("/other-practice");
      }
    };

    loadQuestion();
  }, [id, navigate]);

  if (!question) {
    return (
      <div className="min-h-screen bg-background dark:bg-background text-text-primary dark:text-text-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);

    if (user?.email) {
      const isCorrect = selectedOption?.trim().toUpperCase() === question.correctOption?.trim().toUpperCase();
      const key = `other_practice_analytics_${user.email.toLowerCase()}`;
      const saved = JSON.parse(localStorage.getItem(key) || "[]");

      const questionId = question._id || question.id;
      const recordIndex = saved.findIndex((q: any) => String(q.id) === String(questionId));
      if (recordIndex === -1) {
        saved.push({ id: questionId, difficulty: question.difficulty, correct: isCorrect });
      } else {
        if (isCorrect) saved[recordIndex].correct = true;
      }
      localStorage.setItem(key, JSON.stringify(saved));

      if (isCorrect) {
        const token = localStorage.getItem("accessToken");
        if (token) {
          axios.post(getApiUrl("/api/v1/auth/log-activity"), {
            action: `OTHER_PRACTICE_SOLVED_${questionId}`
          }, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => console.error("Failed to log aptitude", err));
        }
        
        // Track real progress
        recordDailyProgress(user?.email, 1, 5);
      }
    }
  };

  const isCorrect = selectedOption?.trim().toUpperCase() === question.correctOption?.trim().toUpperCase();
  const prevQuestion = currentIndex > 0 ? allQuestions[currentIndex - 1] : null;
  const nextQuestion = currentIndex >= 0 && currentIndex < allQuestions.length - 1 ? allQuestions[currentIndex + 1] : null;

  const handleNavigateQuestion = (targetQ: any, index: number) => {
    if (!targetQ) {
      navigate(`/other-practice/topic/${encodeURIComponent(question?.topic || "Uncategorized")}`);
      return;
    }
    sessionStorage.setItem("current_other_practice", JSON.stringify(targetQ));
    setCurrentIndex(index);
    setQuestion(targetQ);
    setSelectedOption(null);
    setIsSubmitted(false);
    navigate(`/other-practice/solve/${targetQ._id || targetQ.id}`);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background text-text-primary dark:text-text-secondary font-sans flex flex-col transition-colors selection:bg-primary/30">
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 mt-16 flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 z-10 relative">
          <Link 
            to={`/other-practice/topic/${encodeURIComponent(question?.topic || "Uncategorized")}`} 
            className="group flex items-center text-sm font-semibold text-text-muted dark:text-text-muted hover:text-text-primary dark:hover:text-text-inverse transition-all bg-surface dark:bg-slate-800/80 px-5 py-2.5 rounded-full border border-border dark:border-border shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Practice
          </Link>
          <div className="bg-surface dark:bg-slate-800/80 rounded-full shadow-sm border border-border dark:border-border p-1">
            <PracticeTimer storageKey={`solve_aptitude_${question?.id || "default"}`} defaultMode="stopwatch" className="!border-0 !bg-transparent !shadow-none" />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-surface dark:bg-[#1e293b] border border-border/80 dark:border-border/80 rounded-[2.5rem] p-6 sm:p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex-1 mb-12 relative overflow-hidden flex flex-col">
          
          {/* Subtle Background Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          {/* Card Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-8 border-b border-slate-100 dark:border-border/50 relative z-10 gap-6">
            <div className="flex items-center space-x-5">
              <div className="p-4 bg-blue-50 dark:bg-primary/10 text-primary dark:text-primary rounded-2xl shadow-sm border border-blue-100 dark:border-primary/20">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-text-primary tracking-tight mb-2">
                  {question.topic || "Aptitude Question"}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 text-xs font-bold bg-surface-secondary dark:bg-slate-800/80 text-text-secondary dark:text-text-secondary rounded-md border border-border dark:border-border">
                    Question {currentIndex + 1} of {allQuestions.length || 1}
                  </span>
                  <span className={`px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider border ${
                    question.difficulty === "Easy" ? "bg-blue-50 dark:bg-primary/10 text-primary dark:text-primary border-blue-200 dark:border-primary/20" :
                    question.difficulty === "Medium" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" :
                    "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                  }`}>
                    {question.difficulty}
                  </span>
                  {question.company && (
                    <span className="px-3 py-1 rounded-md text-xs font-bold text-text-secondary dark:text-text-muted bg-surface-secondary dark:bg-slate-800/80 border border-border dark:border-border">
                      🏢 {question.company}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-12 text-text-primary dark:text-text-secondary text-xl sm:text-2xl font-medium leading-relaxed whitespace-pre-wrap relative z-10">
            {question.description || question.title}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 flex-1">
            {['A', 'B', 'C', 'D'].map((opt, idx) => {
              const optionText = question.options?.[opt];
              if (!optionText) return null;

              const isSelected = selectedOption === opt;
              const isCorrectOpt = question.correctOption === opt;

              let wrapperClass = "border-border dark:border-border hover:border-border dark:hover:border-slate-600 hover:shadow-md bg-surface dark:bg-slate-800/50 hover:bg-background dark:hover:bg-slate-800";
              let labelClass = "bg-surface-secondary dark:bg-slate-700 text-text-secondary dark:text-text-secondary border-border dark:border-slate-600";
              let textClass = "text-text-primary dark:text-text-secondary";

              if (isSelected && !isSubmitted) {
                wrapperClass = "border-primary bg-blue-50/50 dark:bg-blue-900/20 shadow-[0_4px_20px_rgba(16,185,129,0.1)] ring-1 ring-blue-500";
                labelClass = "bg-primary text-text-inverse border-primary shadow-md shadow-blue-500/30";
                textClass = "text-blue-900 dark:text-blue-100 font-semibold";
              }

              if (isSubmitted) {
                if (isCorrectOpt) {
                  wrapperClass = "border-primary bg-blue-50 dark:bg-blue-900/30 shadow-[0_4px_20px_rgba(16,185,129,0.15)] ring-1 ring-blue-500";
                  labelClass = "bg-primary text-text-inverse border-primary shadow-md shadow-blue-500/30";
                  textClass = "text-blue-900 dark:text-blue-100 font-bold";
                } else if (isSelected) {
                  wrapperClass = "border-rose-500 bg-rose-50 dark:bg-rose-900/30 ring-1 ring-rose-500";
                  labelClass = "bg-rose-500 text-text-inverse border-rose-500 shadow-md shadow-rose-500/30";
                  textClass = "text-rose-900 dark:text-rose-100 font-bold";
                } else {
                  wrapperClass = "border-border dark:border-border opacity-50 bg-background dark:bg-background/50";
                  labelClass = "bg-slate-200 dark:bg-slate-800 text-text-muted border-border dark:border-border";
                  textClass = "text-text-muted";
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => !isSubmitted && setSelectedOption(opt)}
                  className={`group flex items-center text-left p-4 rounded-xl border transition-all duration-300 ${wrapperClass}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 shrink-0 transition-all duration-300 border ${!isSubmitted && 'group-hover:scale-105'} ${labelClass}`}>
                    {opt}
                  </div>
                  <span className={`text-base flex-1 transition-colors duration-300 ${textClass}`}>{optionText}</span>

                  {!isSubmitted && (
                    <div className={`w-5 h-5 rounded-full border-2 ml-4 flex items-center justify-center ${isSelected ? "border-blue-500" : "border-slate-300 dark:border-slate-600"}`}>
                       {isSelected && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                    </div>
                  )}
                  {isSubmitted && isCorrectOpt && (
                    <CheckCircle2 className="w-6 h-6 text-primary ml-auto drop-shadow-sm shrink-0" />
                  )}
                  {isSubmitted && isSelected && !isCorrectOpt && (
                    <XCircle className="w-6 h-6 text-rose-500 ml-auto drop-shadow-sm shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Submission Result */}
          {isSubmitted && (
            <div className={`mt-10 p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative z-10 animate-in slide-in-from-bottom-4 duration-500 ${
              isCorrect
                ? "bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-500/10 dark:to-teal-500/10 border-emerald-200 dark:border-emerald-500/40"
                : "bg-rose-50 dark:bg-gradient-to-r dark:from-rose-500/10 dark:to-pink-500/10 border-rose-200 dark:border-rose-500/40"
            }`}>
              <div className="flex items-start sm:items-center space-x-5">
                <div className={`p-4 rounded-full shrink-0 shadow-sm ${isCorrect ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-rose-100 dark:bg-rose-500/20"}`}>
                  {isCorrect ? <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />}
                </div>
                <div>
                  <h4 className={`text-xl font-black ${isCorrect ? 'text-emerald-900 dark:text-emerald-300' : 'text-rose-900 dark:text-rose-300'}`}>
                    {isCorrect ? "Correct Answer! Exceptional reasoning." : `Incorrect — The correct answer was Option ${question.correctOption}.`}
                  </h4>
                  <p className={`text-sm mt-1.5 ${isCorrect ? 'text-emerald-700 dark:text-emerald-400/80' : 'text-rose-700 dark:text-rose-400/80'}`}>
                    {isCorrect ? "Your response has been verified and recorded to your practice analytics." : "Review the question logic and try the next question in this topic."}
                  </p>
                </div>
              </div>
              
              {/* Only show "Topic Directory" button here on mobile, otherwise it's handled in the bottom bar */}
              <div className="w-full md:w-auto md:hidden">
                <button
                  onClick={() => navigate(`/other-practice/topic/${encodeURIComponent(question?.topic || "Uncategorized")}`)}
                  className="w-full px-6 py-3 rounded-xl bg-surface dark:bg-slate-800 text-text-primary dark:text-text-secondary border border-border dark:border-border text-sm font-bold shadow-sm"
                >
                  Topic Directory
                </button>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <button
              onClick={() => handleNavigateQuestion(prevQuestion, currentIndex - 1)}
              disabled={!prevQuestion}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 bg-background dark:bg-slate-800/80 hover:bg-surface-secondary dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-text-inverse rounded-xl text-sm font-bold transition-all border border-border dark:border-border/80"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous Question</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-4">
              {isSubmitted && (
                 <button
                 onClick={() => navigate(`/other-practice/topic/${encodeURIComponent(question?.topic || "Uncategorized")}`)}
                 className="hidden md:block px-6 py-3.5 rounded-xl bg-surface dark:bg-slate-800 hover:bg-background dark:hover:bg-slate-700 text-text-primary dark:text-text-secondary border border-border dark:border-border text-sm font-bold transition-colors shadow-sm"
               >
                 Topic Directory
               </button>
              )}

              {!isSubmitted ? (
                <button
                  onClick={() => handleNavigateQuestion(nextQuestion, currentIndex + 1)}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 bg-surface dark:bg-slate-800/80 hover:bg-background dark:hover:bg-slate-700 text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-text-inverse rounded-xl text-sm font-bold transition-all border border-border dark:border-border/80 shadow-sm"
                >
                  <span>Skip / Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : null}

              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className="w-full sm:w-auto bg-primary hover:bg-primary disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-text-muted disabled:cursor-not-allowed text-text-inverse px-10 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:shadow-none text-base"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={() => handleNavigateQuestion(nextQuestion, currentIndex + 1)}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary hover:bg-primary text-text-inverse px-8 py-3.5 rounded-xl font-bold transition-all text-base shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <span>{nextQuestion ? "Next Question" : "Finish Practice"}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

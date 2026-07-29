import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, BrainCircuit, ChevronLeft, ChevronRight, Award } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { getApiUrl } from "../utils/apiConfig";
import PracticeTimer from "../components/PracticeTimer";

export default function SolveAptitude() {
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
      const storedList = sessionStorage.getItem("current_aptitude_list");
      
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
        // Fetch from API as fallback
        try {
          const response = await axios.get(getApiUrl("/api/v1/aptitude-problems"));
          parsedAll = response.data.map((p: any) => {
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
          // Fallback if not found in list but present in session (rare, but just in case)
          const stored = sessionStorage.getItem("current_aptitude");
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
          navigate("/aptitude");
        }
      } else {
        navigate("/aptitude");
      }
    };

    loadQuestion();
  }, [id, navigate]);

  if (!question) {
    return (
      <div className="min-h-screen bg-[#0a1128] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);

    // Track aptitude analytics
    if (user?.email) {
      const isCorrect = selectedOption?.trim().toUpperCase() === question.correctOption?.trim().toUpperCase();
      const key = `aptitude_analytics_${user.email.toLowerCase()}`;
      const saved = JSON.parse(localStorage.getItem(key) || "[]");

      const questionId = question._id || question.id;
      const recordIndex = saved.findIndex((q: any) => String(q.id) === String(questionId));
      if (recordIndex === -1) {
        saved.push({ id: questionId, difficulty: question.difficulty, correct: isCorrect });
      } else {
        // If they attempt again and get it right, update the record
        if (isCorrect) saved[recordIndex].correct = true;
      }
      localStorage.setItem(key, JSON.stringify(saved));

      if (isCorrect) {
        const token = localStorage.getItem("accessToken");
        if (token) {
          axios.post(getApiUrl("/api/v1/auth/log-activity"), {
            action: `APTITUDE_SOLVED_${questionId}`
          }, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => console.error("Failed to log aptitude", err));
        }
      }
    }
  };

  const isCorrect = selectedOption?.trim().toUpperCase() === question.correctOption?.trim().toUpperCase();

  const prevQuestion = currentIndex > 0 ? allQuestions[currentIndex - 1] : null;
  const nextQuestion = currentIndex >= 0 && currentIndex < allQuestions.length - 1 ? allQuestions[currentIndex + 1] : null;

  const handleNavigateQuestion = (targetQ: any, index: number) => {
    if (!targetQ) {
      navigate(`/aptitude/topic/${encodeURIComponent(question?.topic || "Uncategorized")}`);
      return;
    }
    sessionStorage.setItem("current_aptitude", JSON.stringify(targetQ));
    setCurrentIndex(index);
    setQuestion(targetQ);
    setSelectedOption(null);
    setIsSubmitted(false);
    navigate(`/aptitude/${targetQ._id || targetQ.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0a1128] text-slate-200 font-sans flex flex-col">

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 mt-16 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <Link to={`/aptitude/topic/${encodeURIComponent(question?.topic || "Uncategorized")}`} className="flex items-center text-slate-400 hover:text-white transition-colors w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Practice
          </Link>
          <PracticeTimer storageKey={`solve_aptitude_${question?.id || "default"}`} defaultMode="stopwatch" />
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl flex-1 mb-12">

          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl shadow-inner">
                <BrainCircuit className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">{question.topic || "Aptitude Question"}</h1>
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                    Q#{currentIndex + 1} of {allQuestions.length || 1}
                  </span>
                </div>
                <div className="flex items-center mt-2 space-x-3">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
                    question.difficulty === "Easy" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                    question.difficulty === "Medium" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                    "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  }`}>
                    {question.difficulty}
                  </span>
                  {question.company && (
                    <span className="text-xs text-slate-400 font-semibold bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                      🏢 {question.company}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 text-slate-200 text-xl font-medium leading-relaxed whitespace-pre-wrap">
            {question.description || question.title}
          </div>

          <div className="space-y-4">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optionText = question.options?.[opt];
              if (!optionText) return null;

              let borderClass = "border-slate-700 hover:border-purple-500 hover:bg-slate-800";
              let bgClass = "bg-[#1a2333]";
              let textClass = "text-slate-300";

              if (selectedOption === opt) {
                borderClass = "border-purple-500";
                bgClass = "bg-purple-500/10";
              }

              if (isSubmitted) {
                if (opt === question.correctOption) {
                  borderClass = "border-emerald-500";
                  bgClass = "bg-emerald-500/10";
                } else if (selectedOption === opt) {
                  borderClass = "border-rose-500";
                  bgClass = "bg-rose-500/10";
                } else {
                  borderClass = "border-slate-800 opacity-50";
                  bgClass = "bg-slate-900";
                }
              }

              return (
                <div
                  key={opt}
                  onClick={() => !isSubmitted && setSelectedOption(opt)}
                  className={`flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer ${borderClass} ${bgClass}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-4 transition-colors ${isSubmitted && opt === question.correctOption ? "bg-emerald-500 text-white" :
                      isSubmitted && selectedOption === opt ? "bg-rose-500 text-white" :
                        selectedOption === opt ? "bg-purple-500 text-white" : "bg-slate-700 text-slate-300"
                    }`}>
                    {opt}
                  </div>
                  <span className={`text-lg font-medium ${textClass}`}>{optionText}</span>

                  {isSubmitted && opt === question.correctOption && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 ml-auto" />
                  )}
                  {isSubmitted && selectedOption === opt && opt !== question.correctOption && (
                    <XCircle className="w-6 h-6 text-rose-500 ml-auto" />
                  )}
                </div>
              );
            })}
          </div>

          {isSubmitted && (
            <div className={`mt-8 p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
              isCorrect
                ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/40 text-emerald-300"
                : "bg-gradient-to-r from-rose-500/10 to-pink-500/10 border-rose-500/40 text-rose-300"
            }`}>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${isCorrect ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                  {isCorrect ? <Award className="w-7 h-7 text-emerald-400" /> : <XCircle className="w-7 h-7 text-rose-400" />}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {isCorrect ? "Correct Answer! Exceptional reasoning." : `Incorrect — The correct answer was Option ${question.correctOption}.`}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isCorrect ? "Your response has been verified and recorded to your practice analytics." : "Review the question logic and try the next question in this topic."}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => navigate(`/aptitude/topic/${encodeURIComponent(question?.topic || "Uncategorized")}`)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold transition-colors"
                >
                  Topic Directory
                </button>
                {nextQuestion && (
                  <button
                    onClick={() => handleNavigateQuestion(nextQuestion, currentIndex + 1)}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg transition-transform hover:scale-105"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleNavigateQuestion(prevQuestion, currentIndex - 1)}
                disabled={!prevQuestion}
                className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all border border-slate-700/80"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Question</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleNavigateQuestion(nextQuestion, currentIndex + 1)}
                className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all border border-slate-700/80"
              >
                <span>{nextQuestion ? "Next Question" : "Finish Practice"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_25px_rgba(147,51,234,0.3)] text-base"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/aptitude/topic/${encodeURIComponent(question?.topic || "Uncategorized")}`)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all text-sm shadow-lg shadow-emerald-500/20"
                >
                  Continue Practice
                </button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

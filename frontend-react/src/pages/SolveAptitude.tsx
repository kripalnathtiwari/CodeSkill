import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, BrainCircuit } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function SolveAptitude() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Attempt to load from session storage (passed from Problems page)
    const stored = sessionStorage.getItem("current_aptitude");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed._id === id || parsed.id === id) {
        setQuestion(parsed);
        return;
      }
    }

    // Fallback: lookup in localStorage
    const saved = localStorage.getItem("admin_aptitude_problems");
    if (saved) {
      const allQuestions = JSON.parse(saved);
      const found = allQuestions.find((q: any) => q._id === id || q.id === id);
      if (found) {
        setQuestion(found);
      } else {
        alert("Question not found!");
        navigate("/aptitude");
      }
    } else {
      navigate("/aptitude");
    }
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
    }
  };

  const isCorrect = selectedOption?.trim().toUpperCase() === question.correctOption?.trim().toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a1128] text-slate-200 font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 mt-16 flex flex-col">
        <button 
          onClick={() => navigate('/aptitude')}
          className="flex items-center text-slate-400 hover:text-emerald-400 transition-colors w-fit mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Practice
        </button>

        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl flex-1 mb-12">
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <BrainCircuit className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{question.title}</h1>
              <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                question.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                question.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                "bg-rose-500/10 text-rose-500"
              }`}>
                {question.difficulty}
              </span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-10 text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
            {question.description}
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
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-4 transition-colors ${
                    isSubmitted && opt === question.correctOption ? "bg-emerald-500 text-white" :
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

          <div className="mt-12 flex justify-end">
            {!isSubmitted ? (
              <button 
                onClick={handleSubmit}
                disabled={!selectedOption}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] text-lg"
              >
                Submit Answer
              </button>
            ) : (
              <button 
                onClick={() => navigate('/aptitude')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all text-lg"
              >
                Continue Practice
              </button>
            )}
          </div>
          
          {isSubmitted && (
            <div className={`mt-6 p-4 rounded-xl text-center font-bold text-lg border ${
              isCorrect ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-rose-500/10 border-rose-500/50 text-rose-400"
            }`}>
              {isCorrect ? "Awesome! That is the correct answer." : `Incorrect. The correct answer was Option ${question.correctOption}.`}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

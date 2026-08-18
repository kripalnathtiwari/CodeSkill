import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, BrainCircuit, ChevronLeft, ChevronRight, Award, LogOut, Info, AlertTriangle, Clock, Heart, CheckSquare, Save, HelpCircle, CloudUpload, Check, Maximize } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { getApiUrl } from "../utils/apiConfig";

export default function SolveAptitude() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Test State
  const [answered, setAnswered] = useState<Record<number, string>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({});
  const [reviewStatus, setReviewStatus] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes mock timer
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
  
  // Temporary selection before saving
  // Removed in favor of direct auto-save to `answered` state

  useEffect(() => {
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
        try {
          const response = await axios.get(getApiUrl(`/api/v1/aptitude-problems/${id}`));
          let p = response.data;
          let opts = p.options;
          try {
            while (typeof opts === 'string') {
              const parsed = JSON.parse(opts);
              if (parsed === opts || typeof opts !== 'string' && typeof opts !== 'object') break;
              opts = parsed;
            }
          } catch(e) {}
          
          parsedAll = [{
            ...p,
            _id: p.id,
            options: opts,
            correctOption: p.correctAnswer || p.correctOption
          }];
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
          setVisited(prev => ({ ...prev, [index]: true }));
        } else {
          navigate("/aptitude");
        }
      } else {
        navigate("/aptitude");
      }
    };

    loadQuestion();
  }, [id, navigate]);

  // Timer Effect
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < allQuestions.length) {
      setCurrentIndex(index);
      setQuestion(allQuestions[index]);
      setVisited(prev => ({ ...prev, [index]: true }));
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleCheckSolution = () => {
    setShowSolution(prev => ({ ...prev, [currentIndex]: true }));
  };

  const handleSubmitTest = () => {
    // Log activity for all correctly answered questions
    if (user?.email) {
      const token = localStorage.getItem("accessToken");
      let correctCount = 0;
      
      allQuestions.forEach((q, idx) => {
        const isCorrect = answered[idx]?.trim().toUpperCase() === q.correctOption?.trim().toUpperCase();
        if (isCorrect) {
          correctCount++;
          if (token) {
            axios.post(getApiUrl("/api/v1/auth/log-activity"), {
              action: `APTITUDE_SOLVED_${q._id || q.id}`
            }, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(err => console.error("Failed to log aptitude", err));
          }
        }
      });
      alert(`Test Submitted! You scored ${correctCount} out of ${allQuestions.length}.`);
    }
    navigate(`/aptitude/topic/${encodeURIComponent(question?.topic || "Uncategorized")}`);
  };

  // Helper to determine button color and shape in grid
  const getGridButtonClass = (idx: number) => {
    let classes = "";
    if (currentIndex === idx) {
      classes = "border-blue-500 bg-blue-50 text-blue-700 font-bold border-2 rounded-full"; // Current
    } else if (reviewStatus[idx]) {
      classes = "bg-purple-500 text-white border-transparent rounded-full"; // Review
    } else if (answered[idx]) {
      classes = "bg-green-500 text-white border-transparent rounded-t-[16px] rounded-b-[4px]"; // Answered
    } else if (visited[idx] && !answered[idx]) {
      classes = "bg-red-500 text-white border-transparent rounded-t-[16px] rounded-b-[4px]"; // Not Attempted
    } else {
      classes = "bg-white border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full border"; // Not visited
    }
    return classes;
  };

  // Calculate stats
  const answeredCount = Object.keys(answered).length;
  const reviewCount = Object.values(reviewStatus).filter(Boolean).length;
  const visitedCount = Object.keys(visited).length;
  const notAttemptedCount = visitedCount - answeredCount;
  const notVisitedCount = allQuestions.length - visitedCount;

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#f8f9fa] font-sans flex flex-col text-gray-800">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded text-white">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">Aptitude [{question.topic || "All Topics"}] - Set</h1>
        </div>
        <button 
          onClick={() => navigate("/aptitude")}
          className="flex items-center gap-2 px-4 py-1.5 text-red-500 border border-red-500 hover:bg-red-50 rounded font-semibold text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Exit Mock
        </button>
      </header>

      {/* Sub Header (Action Bar) */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleFullScreen}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition-colors"
          >
            <Maximize className="w-4 h-4" />
            Full Screen Mode
          </button>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Time Left:</span>
          <span className="text-sm font-bold text-blue-600 tracking-wider font-mono">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Pane (Question Area) */}
        <div className="flex-1 flex flex-col bg-white m-4 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="inline-block bg-blue-50 text-blue-600 font-bold text-xs px-3 py-1 rounded-full border border-blue-200 mb-4">
              QUESTION {currentIndex + 1}
            </div>
            
            <div className="text-lg text-gray-800 font-medium whitespace-pre-wrap mb-8">
              {question.description || question.title}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optionText = question.options?.[opt];
                if (!optionText) return null;

                const isSelected = answered[currentIndex] === opt;
                const isCorrect = showSolution[currentIndex] && question.correctOption === opt;
                const isWrong = showSolution[currentIndex] && isSelected && question.correctOption !== opt;

                let borderClass = "border-gray-200 hover:border-gray-300";
                let bgClass = "bg-white";
                
                if (isSelected) {
                  borderClass = "border-blue-400";
                  bgClass = "bg-blue-50/50";
                }
                
                if (isCorrect) {
                  borderClass = "border-green-500";
                  bgClass = "bg-green-50";
                } else if (isWrong) {
                  borderClass = "border-red-500";
                  bgClass = "bg-red-50";
                }

                return (
                  <label 
                    key={opt}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${borderClass} ${bgClass}`}
                    onClick={() => {
                      if (!showSolution[currentIndex]) {
                        setAnswered(prev => ({ ...prev, [currentIndex]: opt }));
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border
                        ${isSelected ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 text-gray-600 border-gray-300'}
                        ${isCorrect ? '!bg-green-500 !text-white !border-green-500' : ''}
                        ${isWrong ? '!bg-red-500 !text-white !border-red-500' : ''}
                      `}>
                        {opt}
                      </div>
                      <span className={`text-base font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                        {optionText}
                      </span>
                    </div>
                    
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                      ${isSelected ? 'border-blue-500' : 'border-gray-300'}
                      ${isCorrect ? '!border-green-500' : ''}
                      ${isWrong ? '!border-red-500' : ''}
                    `}>
                      {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${isCorrect ? 'bg-green-500' : isWrong ? 'bg-red-500' : 'bg-blue-500'}`} />}
                    </div>
                  </label>
                );
              })}
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-sm text-gray-500 font-medium">
              <HelpCircle className="w-4 h-4" />
              Choose Any 1 Option(s).
            </div>
          </div>

          {/* Left Pane Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Removed Mark for Review and Save & Next buttons */}
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigateToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button 
                onClick={() => navigateToQuestion(currentIndex + 1)}
                disabled={currentIndex === allQuestions.length - 1}
                className="flex items-center gap-1 px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleCheckSolution}
                className="flex items-center gap-2 px-4 py-2 text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded font-semibold text-sm transition-colors ml-2"
              >
                <Check className="w-4 h-4" />
                Check Solution
              </button>

              <button 
                onClick={handleSubmitTest}
                className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded font-bold text-sm transition-colors shadow-sm ml-4"
              >
                <CloudUpload className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane (Grid & Legend) */}
        <div className="w-80 bg-white m-4 ml-0 rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          
          {/* Legend */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-700">1</div>
                <span className="text-xs font-medium text-gray-600">Current</span>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded-t-[10px] rounded-b-[2px] bg-green-500 flex items-center justify-center text-[10px] font-bold text-white">{answeredCount}</div>
                <span className="text-xs font-medium text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white">{reviewCount}</div>
                <span className="text-xs font-medium text-gray-600">Review</span>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded-full border border-gray-300 bg-white flex items-center justify-center text-[10px] font-bold text-gray-500">{notVisitedCount}</div>
                <span className="text-xs font-medium text-gray-600">Not Visited</span>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded-t-[10px] rounded-b-[2px] bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">{notAttemptedCount}</div>
                <span className="text-xs font-medium text-gray-600">Not Attempted</span>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded border border-cyan-300 bg-cyan-100 flex items-center justify-center text-[10px] font-bold text-cyan-600">0</div>
                <span className="text-xs font-medium text-gray-600">Unsaved</span>
              </div>
            </div>
            <div className="mt-2 w-full flex items-center border border-gray-200 rounded px-3 py-2 bg-white text-xs font-medium text-gray-700">
              <div className="w-5 h-5 rounded border-2 border-gray-800 flex items-center justify-center text-gray-800 font-bold text-[10px] mr-2">i</div>
              Full Screen Exit
            </div>
          </div>

          {/* Grid */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Question Grid</h3>
            <div className="grid grid-cols-5 gap-3">
              {allQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => navigateToQuestion(idx)}
                  className={`w-10 h-10 flex items-center justify-center text-sm transition-all shadow-sm
                    ${getGridButtonClass(idx)}
                  `}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Removed Pagination Mock Footer */}
        </div>

      </div>
    </div>
  );
}

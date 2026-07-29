import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { recordContribution } from "../utils/contributions";
import { getApiUrl } from "../utils/apiConfig";
import { AlertTriangle, Clock, CheckCircle, ShieldAlert, Award, ChevronLeft, ChevronRight, Trophy, Minus, XCircle } from "lucide-react";

// Mock Python Questions
const PYTHON_QUESTIONS = [
  { id: 1, text: "Which of the following is a mutable data type in Python?", options: ["Tuple", "List", "String", "Integer"], answer: "List" },
  { id: 2, text: "How do you start a function in Python?", options: ["function myFunction():", "def myFunction():", "create myFunction():", "func myFunction() {"], answer: "def myFunction():" },
  { id: 3, text: "Which keyword is used to handle exceptions in Python?", options: ["catch", "except", "handle", "throw"], answer: "except" },
  { id: 4, text: "What is the output of `print(2 ** 3)`?", options: ["6", "8", "9", "Error"], answer: "8" },
  { id: 5, text: "What does the `len()` function do?", options: ["Finds the length of an object", "Returns the last element", "Sorts a list", "None of the above"], answer: "Finds the length of an object" },
  { id: 6, text: "Which of these is not a core data type in Python?", options: ["Lists", "Dictionary", "Tuples", "Class"], answer: "Class" },
  { id: 7, text: "How do you insert comments in Python code?", options: ["// This is a comment", "/* This is a comment */", "# This is a comment", "-- This is a comment"], answer: "# This is a comment" },
  { id: 8, text: "What is the correct extension for Python files?", options: [".python", ".pyth", ".pt", ".py"], answer: ".py" },
  { id: 9, text: "What will `type([])` return?", options: ["<class 'tuple'>", "<class 'list'>", "<class 'dict'>", "<class 'set'>"], answer: "<class 'list'>" },
  { id: 10, text: "Which method can be used to remove any whitespace from both the beginning and the end of a string?", options: ["trim()", "strip()", "len()", "replace()"], answer: "strip()" }
];

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const testQuestions = React.useMemo(() => {
    const saved = localStorage.getItem("admin_custom_tests");
    if (saved && id) {
      const tests = JSON.parse(saved);
      const customTest = tests.find((t: any) => String(t.id) === String(id));
      if (customTest && customTest.questions) {
        return customTest.questions;
      }
    }
    return PYTHON_QUESTIONS;
  }, [id]);
  
  // Test State
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  
  // Anti-Cheat State
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(5);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  
  // Score State
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState(0);

  // Webcam State
  const [webcamPermission, setWebcamPermission] = useState<boolean | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const testContainerRef = useRef<HTMLDivElement>(null);

  const storageKey = `testResult_${user?.email || 'guest'}_${id}`;

  // Check if test was already taken by THIS user
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedAnswers(parsed.selectedAnswers);
      setScore(parsed.score);
      setRank(parsed.rank);
      setIsFinished(true);
      setHasStarted(true);
    }
  }, [id]);

  // Auto-submit logic when finished
  useEffect(() => {
    // Only calculate and save if we haven't already!
    if (isFinished && !localStorage.getItem(storageKey)) {
      const processSubmission = async () => {
        // Calculate Score
        let calculatedScore = 0;
        testQuestions.forEach((q: any) => {
          if (selectedAnswers[q.id] === q.answer) calculatedScore += 1;
        });
        setScore(calculatedScore);
        
        // --- ACTUAL RANK CALCULATION ---
        const existingScores = JSON.parse(localStorage.getItem("all_student_scores") || "[]");
        const sameTestScores = existingScores.filter((s: any) => String(s.testId) === String(id));
        
        let higherScorers = 0;
        sameTestScores.forEach((s: any) => {
          if (s.score > calculatedScore) {
            higherScorers++;
          }
        });
        
        const actualRank = higherScorers + 1;
        setRank(actualRank);

        // Save to localStorage to prevent retakes for this user
        localStorage.setItem(storageKey, JSON.stringify({
          score: calculatedScore,
          rank: actualRank,
          selectedAnswers
        }));
        
        // Record contribution
        recordContribution(user?.email);

        // --- ADMIN SCORE TRACKING ---
        let testName = `Test ${id}`;
        let testAssignedCollegeId: string | null = null;
        let testAssignedSection: string | null = null;

        const savedTests = localStorage.getItem("admin_custom_tests");
        if (savedTests) {
          const tests = JSON.parse(savedTests);
          const t = tests.find((x: any) => String(x.id) === String(id));
          if (t) {
            if (t.title) testName = t.title;
            if (t.collegeId) testAssignedCollegeId = t.collegeId;
            if (t.section) testAssignedSection = t.section;
          }
        }
        
        const studentName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email || "Anonymous Student";
        
        // --- RESOLVE COLLEGE AND SECTION ---
        const passedState = location.state as any || {};
        let resolvedCollegeName = "Global / Not Selected";
        let resolvedSection = "N/A";
        
        let allColleges: any[] = [];
        try {
          const response = await axios.get(getApiUrl("/api/v1/college-management"), {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          });
          allColleges = response.data;
        } catch (error) {
          console.error("Failed to fetch colleges for score tracking", error);
        }
        
        // Prioritize the test's assigned college, fallback to student selection
        const targetCollegeId = testAssignedCollegeId || (passedState.collegeId !== "all" ? passedState.collegeId : null);
        if (targetCollegeId) {
          const found = allColleges.find((c: any) => String(c.id) === String(targetCollegeId));
          if (found) resolvedCollegeName = found.name;
        }

        // Prioritize the test's assigned section, fallback to student selection
        if (testAssignedSection) {
          resolvedSection = testAssignedSection;
        } else if (passedState.section && passedState.section !== "all") {
          resolvedSection = passedState.section;
        }

        const newScoreRecord = {
          testId: id,
          testName: testName,
          studentName: studentName,
          studentEmail: user?.email || "Unknown",
          collegeName: resolvedCollegeName,
          sectionName: resolvedSection,
          score: calculatedScore,
          totalQuestions: testQuestions.length,
          date: new Date().toLocaleString()
        };
        
        existingScores.push(newScoreRecord);
        localStorage.setItem("all_student_scores", JSON.stringify(existingScores));

        // Exit fullscreen if active
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(console.error);
        }
      };
      
      processSubmission();
    }
  }, [isFinished, selectedAnswers, id, testQuestions, user, location.state]);

  // Anti-cheat Listeners
  useEffect(() => {
    if (!hasStarted || isFinished) return;

    const handleViolation = () => {
      if (showWarningModal) return; 

      const newCount = tabSwitchCount + 1;
      setTabSwitchCount(newCount);

      if (newCount >= 3) {
        setIsFinished(true);
        setShowWarningModal(false);
      } else {
        setShowWarningModal(true);
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("CodeSkill Security Alert", {
              body: `Strike ${newCount}/3! You have left the test environment. Return immediately!`,
            });
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        handleViolation();
      }
    };

    const handleBlur = () => {
      // Fires when window loses focus (clicking another program, alt-tabbing, etc)
      handleViolation();
    };

    const handleFullscreenChange = () => {
      // If user exits fullscreen, treat it as a violation
      if (!document.fullscreenElement) {
        handleViolation();
      }
    };

    // Aggressive polling to catch OS-level overlays (Win+Tab, Start Menu) that swallow blur events
    const focusInterval = setInterval(() => {
      if (!document.hasFocus()) {
        handleViolation();
      }
    }, 500);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      clearInterval(focusInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [hasStarted, isFinished, showWarningModal, tabSwitchCount]);

  // Auto-dismiss warning modal after 5 seconds
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (showWarningModal) {
      setWarningCountdown(5);
      timer = setInterval(() => {
        // PAUSE THE TIMER if the user is not looking at the screen!
        // This guarantees they will see the warning when they return.
        if (!document.hasFocus()) return;

        setWarningCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowWarningModal(false);
            
            if (!document.fullscreenElement && testContainerRef.current) {
              testContainerRef.current.requestFullscreen().catch(() => {
                setShowFullscreenPrompt(true);
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showWarningModal]);

  const startTest = async () => {
    try {
      // 1. Request webcam permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setMediaStream(stream);
      setWebcamPermission(true);

      // 2. Request Notification Permission for OS-level anti-cheat popups
      if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        await Notification.requestPermission();
      }

      if (testContainerRef.current) {
        await testContainerRef.current.requestFullscreen();
      }
      setHasStarted(true);
    } catch (err: any) {
      console.warn("Permission or Fullscreen request failed.", err);
      
      // If the error is related to webcam permission
      if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
        setWebcamPermission(false);
        alert("Webcam permission is required to start the test. Please allow camera access and try again.");
        return; // Prevent test from starting
      } else {
        // If it's just fullscreen failing, proceed anyway
        setShowFullscreenPrompt(true);
        setHasStarted(true);
      }
    }
  };

  // Snapshot Capture Interval
  useEffect(() => {
    if (!hasStarted || isFinished || !webcamPermission) return;

    const captureSnapshot = async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageUrl = canvas.toDataURL("image/jpeg", 0.7);
          
          try {
            await axios.post(
              getApiUrl("/api/v1/tests/snapshots"),
              { testId: id, imageUrl },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error("Failed to save snapshot", err);
          }
        }
      }
    };

    // Capture immediately, then every 5 minutes
    captureSnapshot();
    const interval = setInterval(captureSnapshot, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [hasStarted, isFinished, webcamPermission, id, token]);

  // Attach stream when videoRef is available
  useEffect(() => {
    if (hasStarted && videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(e => console.warn("Auto-play prevented", e));
    }
  }, [hasStarted, mediaStream]);

  // Cleanup webcam stream when test finishes or on unmount
  useEffect(() => {
    if (isFinished && mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream, isFinished]);

  const handleSelectAnswer = (ans: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [testQuestions[currentQuestionIndex].id]: ans
    });
  };

  const handleFinalSubmit = () => {
    const attempted = Object.keys(selectedAnswers).length;
    const total = testQuestions.length;
    
    let confirmMsg = `You have answered all ${total} questions. Ready to submit?`;
    if (attempted < total) {
      confirmMsg = `You still have unanswered questions (${total - attempted} remaining)! Are you absolutely sure you want to submit?`;
    }
    
    if (window.confirm(confirmMsg)) {
      setIsFinished(true);
    }
  };

  // 1. Result Screen
  if (isFinished) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 min-h-screen z-[300] overflow-y-auto">
        <div className={`glass-card max-w-4xl w-full p-10 rounded-3xl text-center space-y-6 animate-in zoom-in duration-500 shadow-2xl ${showDetailedResults ? 'my-10' : ''}`}>
          {!showDetailedResults ? (
            <>
              <div className="w-24 h-24 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                <Trophy className="h-12 w-12" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">Test Completed!</h2>
              {tabSwitchCount >= 3 && (
                <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl mb-6 inline-flex items-center">
                  <ShieldAlert className="h-5 w-5 mr-2" />
                  <span>Test auto-submitted due to multiple tab switches.</span>
                </div>
              )}
              <div className="flex justify-center gap-4">
                <div className="bg-slate-100 dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Your Score</div>
                  <div className="text-4xl font-black text-emerald-500">{score}<span className="text-2xl text-slate-400">/10</span></div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Global Rank</div>
                  <div className="text-4xl font-black text-amber-500">#{rank}</div>
                </div>
              </div>
              
              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowDetailedResults(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-xl shadow-emerald-500/20"
                >
                  Cross-check Results
                </button>
                <button
                  onClick={() => navigate('/contests')}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 px-8 rounded-xl hover:scale-[1.02] transition-transform"
                >
                  Return to Dashboard
                </button>
              </div>
            </>
          ) : (
            <div className="text-left space-y-8 animate-in slide-in-from-bottom-10 duration-500">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white">Detailed Cross-check</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Review your answers against the correct ones.</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-emerald-500">{score}/10</div>
                  <div className="text-sm font-bold text-slate-400">Total Score</div>
                </div>
              </div>

              <div className="space-y-6">
                {testQuestions.map((q: any, index: number) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.answer;
                  const isUnanswered = !userAnswer;

                  return (
                    <div key={q.id} className={`p-6 rounded-2xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : isUnanswered ? 'bg-slate-500/5 border-slate-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-emerald-500/20 text-emerald-500' : isUnanswered ? 'bg-slate-500/20 text-slate-500' : 'bg-rose-500/20 text-rose-500'}`}>
                          {isCorrect ? <CheckCircle className="w-5 h-5" /> : isUnanswered ? <Minus className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{index + 1}. {q.text}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Answer</span>
                              <div className={`p-3 rounded-xl border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : isUnanswered ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'} font-medium`}>
                                {userAnswer || "Not Attempted"}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correct Answer</span>
                              <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium">
                                {q.answer}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => navigate('/contests')}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 px-8 rounded-xl hover:scale-[1.02] transition-transform"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Pre-Test Screen
  if (!hasStarted) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 min-h-screen">
        <div className="glass-card rounded-3xl p-10 max-w-lg w-full text-center border border-slate-200 dark:border-slate-800 shadow-xl">
          <ShieldAlert className="h-16 w-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ready to Start?</h1>
          <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-left mb-8 text-sm space-y-2 border border-amber-500/20">
            <p className="font-bold flex items-center text-lg"><AlertTriangle className="h-5 w-5 mr-2" /> Anti-Cheat Enforced</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Test will open in Full Screen mode.</li>
              <li>Do not switch tabs or minimize the browser.</li>
              <li>Switching tabs more than 2 times will result in auto-submission.</li>
            </ul>
          </div>
          <button 
            onClick={startTest}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/30"
          >
            I Understand, Start Test
          </button>
        </div>
        <div ref={testContainerRef} className="hidden" /> {/* Hidden container to trigger fullscreen */}
      </div>
    );
  }

  const currentQ = testQuestions[currentQuestionIndex];

  // 3. Active Test Screen
  return (
    <div ref={testContainerRef} className="bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col w-full absolute inset-0 z-50">
      
      {/* Test Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-full flex items-center text-sm font-bold animate-pulse border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-500 mr-2" /> Live Protected Session
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-mono text-sm border-l border-slate-200 dark:border-slate-700 pl-4">
            Strikes: <span className={tabSwitchCount > 0 ? "text-rose-500 font-bold" : "font-bold text-emerald-500"}>{tabSwitchCount}/3</span>
          </span>
        </div>
        <div className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
          <Clock className="h-5 w-5 mr-2 text-emerald-500" />
          Test in Progress
        </div>
        <button 
          onClick={handleFinalSubmit}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-500/20"
        >
          Submit Test
        </button>
      </div>

      {/* Main Content Area: Split into Left (Question) and Right (Sidebar) */}
      <div className="flex-1 w-full flex flex-col md:flex-row gap-8 p-6 md:p-8 overflow-hidden">
        
        {/* Left Side: Question */}
        <div className="flex-1 flex flex-col justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm overflow-y-auto">
          <div className="mb-8">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase text-sm mb-3 block">
              Question {currentQuestionIndex + 1} of {testQuestions.length}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {currentQuestionIndex + 1}. {currentQ.text}
            </h2>
          </div>

          <div className="space-y-4 flex-1">
            {currentQ.options.map((opt: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(opt)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center ${
                  selectedAnswers[currentQ.id] === opt
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-md"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${
                  selectedAnswers[currentQ.id] === opt 
                    ? "border-emerald-500" 
                    : "border-slate-300 dark:border-slate-600"
                }`}>
                  {selectedAnswers[currentQ.id] === opt && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
                </div>
                <span className={`text-xl ${selectedAnswers[currentQ.id] === opt ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-700 dark:text-slate-300 font-medium"}`}>
                  {opt}
                </span>
              </button>
            ))}
          </div>

          {/* Navigation Footer */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            
            {currentQuestionIndex === testQuestions.length - 1 ? (
              <button
                onClick={handleFinalSubmit}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                <span>Submit Test</span>
                <CheckCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(testQuestions.length - 1, currentQuestionIndex + 1))}
                className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Question Navigator */}
        <div className="w-full md:w-80 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Test Navigator
          </h3>
          <div className="grid grid-cols-5 gap-3 flex-1 content-start">
            {testQuestions.map((q: any, idx: number) => {
              const isAnswered = !!selectedAnswers[q.id];
              const isCurrent = idx === currentQuestionIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-full aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                    isCurrent
                      ? "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 scale-110 shadow-sm"
                      : isAnswered
                        ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <div className="w-4 h-4 rounded bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                <span>Answered ({Object.keys(selectedAnswers).length})</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"></div>
                <span>Unanswered ({testQuestions.length - Object.keys(selectedAnswers).length})</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <div className="w-4 h-4 rounded border-2 border-emerald-500"></div>
                <span>Current</span>
              </div>
            </div>

            <button
              onClick={handleFinalSubmit}
              className="w-full bg-white dark:bg-slate-900 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold py-4 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors shadow-sm"
            >
              Submit Full Test
            </button>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-md w-full shadow-2xl border-2 border-rose-500 text-center animate-bounce shadow-rose-500/20">
            <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">DON'T SWITCH TAB!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
              You have switched tabs <span className="font-bold text-rose-500 text-lg">{tabSwitchCount}</span> time(s). If you switch tabs 3 times, your test will be <span className="font-bold underline text-rose-500">automatically submitted</span>.
            </p>
            <button
              onClick={() => {
                setShowWarningModal(false);
                if (!document.fullscreenElement && testContainerRef.current) {
                  testContainerRef.current.requestFullscreen().catch(() => {
                    setShowFullscreenPrompt(true);
                  });
                }
              }}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-xl shadow-rose-500/30 text-lg uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              <span>Return to Test ({warningCountdown}s)</span>
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Prompt Overlay */}
      {showFullscreenPrompt && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-md cursor-pointer"
          onClick={() => {
            if (testContainerRef.current) {
              testContainerRef.current.requestFullscreen().then(() => {
                setShowFullscreenPrompt(false);
              }).catch(console.error);
            }
          }}
        >
          <div className="text-center animate-pulse">
            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Resume Fullscreen</h2>
            <p className="text-slate-300 text-lg">Click anywhere to return to fullscreen mode</p>
          </div>
        </div>
      )}

      {/* Hidden elements for webcam capture */}
      <video ref={videoRef} autoPlay playsInline muted style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '640px', height: '480px' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

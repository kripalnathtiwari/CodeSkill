import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { recordContribution } from "../utils/contributions";
import { getApiUrl } from "../utils/apiConfig";
import { AlertTriangle, Clock, CheckCircle, ShieldAlert, Award, ChevronLeft, ChevronRight, Trophy, Minus, XCircle, LogOut, Info, AlertOctagon, Bookmark, Maximize } from "lucide-react";

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
    // 1. Try to fetch from old Test Management logic
    const saved = localStorage.getItem("admin_custom_tests");
    if (saved && id) {
      const tests = JSON.parse(saved);
      const customTest = tests.find((t: any) => String(t.id) === String(id));
      if (customTest && customTest.questions) {
        return customTest.questions;
      }
    }

    // 2. Try to fetch from new Test Series logic
    const testSeriesRaw = localStorage.getItem("admin_custom_interview_problems");
    if (testSeriesRaw && id) {
      const allProblems = JSON.parse(testSeriesRaw);
      const matched = allProblems.filter((q: any) => {
        const tags = q.testSeriesTags || q.testSeries || [];
        const isMatch = tags.some((t: any) => (t.name || t).toLowerCase() === id.toLowerCase());
        const isMcq = q.questionType === "MCQ" || q.type === "MCQ";
        return isMatch && isMcq;
      });
      if (matched.length > 0) {
        return matched.map((q: any) => ({
          id: q._id || q.id || Math.random().toString(),
          text: q.title || q.statement,
          options: [q.options?.A, q.options?.B, q.options?.C, q.options?.D].filter(Boolean),
          answer: q.options?.[q.correctOption] || q.options?.A
        }));
      }
    }

    // 3. Fallback
    return PYTHON_QUESTIONS;
  }, [id]);
  
  // Test State
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  
  // Advanced tracking
  const [visited, setVisited] = useState<Record<number, boolean>>({ 0: true });
  const [reviewStatus, setReviewStatus] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  
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

  // Timer Effect
  useEffect(() => {
    let timerId: ReturnType<typeof setInterval>;
    if (hasStarted && !isFinished) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            setIsFinished(true); // Auto submit when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [hasStarted, isFinished]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
        let testAssignedCategory: string | null = null;

        const savedTests = localStorage.getItem("admin_custom_tests");
        if (savedTests) {
          const tests = JSON.parse(savedTests);
          const t = tests.find((x: any) => String(x.id) === String(id));
          if (t) {
            if (t.title) testName = t.title;
            if (t.collegeId) testAssignedCollegeId = t.collegeId;
            if (t.section) testAssignedSection = t.section;
            if (t.category) testAssignedCategory = t.category;
          }
        }
        
        const studentName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email || "Anonymous Student";
        
        // --- RESOLVE COLLEGE, CATEGORY AND SECTION ---
        const passedState = location.state as any || {};
        let resolvedCollegeName = "Global / Not Selected";
        let resolvedSection = "All Sections";
        
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

        // Prioritize the test's assigned category, fallback to student selection
        const resolvedCategory = testAssignedCategory || (passedState.category && passedState.category !== "all" ? passedState.category : null) || "General Course";

        // Prioritize the test's assigned section, fallback to student selection
        if (testAssignedSection && testAssignedSection !== "all") {
          resolvedSection = testAssignedSection;
        } else if (passedState.section && passedState.section !== "all") {
          resolvedSection = passedState.section;
        } else {
          resolvedSection = "All Sections";
        }

        const newScoreRecord = {
          testId: id,
          testName: testName,
          studentName: studentName,
          studentEmail: user?.email || "Unknown",
          collegeName: resolvedCollegeName,
          courseCategory: resolvedCategory,
          courseName: resolvedCategory,
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

  const handleMarkForReview = () => {
    const qId = testQuestions[currentQuestionIndex].id;
    setReviewStatus(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleClearResponse = () => {
    const qId = testQuestions[currentQuestionIndex].id;
    const newAnswers = { ...selectedAnswers };
    delete newAnswers[qId];
    setSelectedAnswers(newAnswers);
  };

  const navigateToQuestion = (idx: number) => {
    setVisited(prev => ({ ...prev, [idx]: true }));
    setCurrentQuestionIndex(idx);
  };

  const handleNext = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  const handleSaveAndNext = () => {
    handleNext();
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(currentQuestionIndex - 1);
    }
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

  // Get status for a specific question index
  const getQuestionStatus = (idx: number) => {
    const qId = testQuestions[idx].id;
    const isAnswered = !!selectedAnswers[qId];
    const isReviewed = !!reviewStatus[qId];
    const isVisited = !!visited[idx];
    const isCurrent = idx === currentQuestionIndex;

    if (isCurrent) return 'current';
    if (isReviewed) return 'review';
    if (isAnswered) return 'answered';
    if (!isVisited) return 'not_visited';
    return 'not_attempted';
  };

  // 1. Result Screen
  if (isFinished) {
    return (
      <div className="flex-1 bg-background dark:bg-background flex flex-col items-center justify-center p-6 min-h-screen z-[300] overflow-y-auto">
        <div className={`glass-card max-w-4xl w-full p-10 rounded-3xl text-center space-y-6 animate-in zoom-in duration-500 shadow-2xl ${showDetailedResults ? 'my-10' : ''}`}>
          {!showDetailedResults ? (
            <>
              <div className="w-24 h-24 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                <Trophy className="h-12 w-12" />
              </div>
              <h2 className="text-3xl font-black text-text-primary dark:text-text-primary">Test Completed!</h2>
              {tabSwitchCount >= 3 && (
                <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl mb-6 inline-flex items-center">
                  <ShieldAlert className="h-5 w-5 mr-2" />
                  <span>Test auto-submitted due to multiple tab switches.</span>
                </div>
              )}
              <div className="flex justify-center gap-4">
                <div className="bg-surface-secondary dark:bg-background px-6 py-4 rounded-2xl border border-border dark:border-border">
                  <div className="text-sm text-text-muted dark:text-text-muted font-medium mb-1">Your Score</div>
                  <div className="text-4xl font-black text-primary">{score}<span className="text-2xl text-text-muted">/{testQuestions.length}</span></div>
                </div>
                <div className="bg-surface-secondary dark:bg-background px-6 py-4 rounded-2xl border border-border dark:border-border">
                  <div className="text-sm text-text-muted dark:text-text-muted font-medium mb-1">Global Rank</div>
                  <div className="text-4xl font-black text-amber-500">#{rank}</div>
                </div>
              </div>
              
              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowDetailedResults(true)}
                  className="bg-primary hover:bg-primary text-text-inverse font-bold py-4 px-8 rounded-xl transition-all shadow-xl shadow-blue-500/20"
                >
                  Cross-check Results
                </button>
                <button
                  onClick={() => navigate('/contests')}
                  className="bg-slate-900 dark:bg-surface text-text-inverse dark:text-text-primary font-bold py-4 px-8 rounded-xl hover:scale-[1.02] transition-transform"
                >
                  Return to Dashboard
                </button>
              </div>
            </>
          ) : (
            <div className="text-left space-y-8 animate-in slide-in-from-bottom-10 duration-500">
              <div className="flex items-center justify-between border-b border-border dark:border-border pb-6">
                <div>
                  <h2 className="text-3xl font-black text-text-primary dark:text-text-primary">Detailed Cross-check</h2>
                  <p className="text-text-muted dark:text-text-muted mt-2">Review your answers against the correct ones.</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-primary">{score}/{testQuestions.length}</div>
                  <div className="text-sm font-bold text-text-muted">Total Score</div>
                </div>
              </div>

              <div className="space-y-6">
                {testQuestions.map((q: any, index: number) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.answer;
                  const isUnanswered = !userAnswer;

                  return (
                    <div key={q.id} className={`p-6 rounded-2xl border ${isCorrect ? 'bg-primary/5 border-primary/20' : isUnanswered ? 'bg-background0/5 border-slate-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-primary/20 text-primary' : isUnanswered ? 'bg-background0/20 text-text-muted' : 'bg-rose-500/20 text-rose-500'}`}>
                          {isCorrect ? <CheckCircle className="w-5 h-5" /> : isUnanswered ? <Minus className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-text-primary dark:text-text-primary mb-4">{index + 1}. {q.text}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Your Answer</span>
                              <div className={`p-3 rounded-xl border ${isCorrect ? 'bg-primary/10 border-primary/30 text-primary dark:text-primary' : isUnanswered ? 'bg-surface-secondary dark:bg-slate-800 border-border dark:border-border text-text-muted' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'} font-medium`}>
                                {userAnswer || "Not Attempted"}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Correct Answer</span>
                              <div className="p-3 rounded-xl border bg-primary/10 border-primary/30 text-primary dark:text-primary font-medium">
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

              <div className="pt-6 border-t border-border dark:border-border flex justify-end">
                <button
                  onClick={() => navigate('/contests')}
                  className="bg-slate-900 dark:bg-surface text-text-inverse dark:text-text-primary font-bold py-4 px-8 rounded-xl hover:scale-[1.02] transition-transform"
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
      <div className="flex-1 bg-background dark:bg-background flex flex-col items-center justify-center p-6 min-h-screen">
        <div className="glass-card rounded-3xl p-10 max-w-lg w-full text-center border border-border dark:border-border shadow-xl">
          <ShieldAlert className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary mb-4">Ready to Start?</h1>
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
            className="w-full bg-primary hover:bg-primary text-text-inverse py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/30"
          >
            I Understand, Start Test
          </button>
        </div>
        <div ref={testContainerRef} className="hidden" /> {/* Hidden container to trigger fullscreen */}
      </div>
    );
  }

  const currentQ = testQuestions[currentQuestionIndex];
  
  // Calculate stats for sidebar
  const stats = {
    answered: 0,
    notAttempted: 0,
    review: 0,
    notVisited: 0
  };
  
  testQuestions.forEach((_: any, idx: number) => {
    const status = getQuestionStatus(idx);
    if (status === 'answered' || status === 'current') {
       if (selectedAnswers[testQuestions[idx].id]) stats.answered++;
       else if (status !== 'current') stats.notAttempted++;
    }
    if (status === 'not_attempted') stats.notAttempted++;
    if (status === 'review') stats.review++;
    if (status === 'not_visited') stats.notVisited++;
  });

  // 3. Active Test Screen - Redesigned CBT Layout
  return (
    <div ref={testContainerRef} className="bg-slate-50 h-screen max-h-screen overflow-hidden flex flex-col w-full absolute inset-0 z-50 font-sans text-slate-800">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 text-blue-600">
             <svg fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.5L17.5 9H13V4.5zM6 20V4h5v6h6v10H6z" /></svg>
          </div>
          <h1 className="font-bold text-lg text-slate-800">Aptitude [All Topics] - Set 2</h1>
        </div>
        
        <button onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen().catch(console.error);
            navigate(-1);
          }} 
          className="flex items-center space-x-2 text-rose-500 border border-rose-200 hover:bg-rose-50 font-semibold px-4 py-1.5 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Mock</span>
        </button>
      </div>

      {/* Sub Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex justify-between items-center text-sm shadow-sm z-10">
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                  console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
              } else {
                document.exitFullscreen();
              }
            }}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium border border-slate-200 transition-colors"
          >
            <Maximize className="w-4 h-4" />
            <span>Full Screen Mode</span>
          </button>
        </div>
        <div className="flex items-center space-x-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 font-bold text-slate-700">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Time Left: {formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-row overflow-hidden bg-white">
        
        {/* Left Side: Question Area */}
        <div className="flex-1 flex flex-col border-r border-slate-200 relative">
          
          <div className="flex-1 overflow-y-auto p-8 pb-24">
            <div className="inline-block bg-blue-50 text-blue-700 font-bold text-xs px-3 py-1 rounded-full mb-6 uppercase tracking-widest border border-blue-100">
              Question {currentQuestionIndex + 1}
            </div>
            
            <h2 className="text-xl font-medium text-slate-800 leading-relaxed mb-8">
              {currentQ.text}
            </h2>

            {/* 2x2 Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQ.options.map((opt: string, idx: number) => {
                const isSelected = selectedAnswers[currentQ.id] === opt;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(opt)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center transition-all ${
                      isSelected
                        ? "border-blue-400 bg-blue-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    {/* Circle selector */}
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 text-sm font-bold ${
                      isSelected 
                        ? "border-blue-500 bg-blue-500 text-white" 
                        : "border-slate-300 text-slate-500 bg-slate-100"
                    }`}>
                      {letter}
                    </div>
                    <span className={`text-base flex-1 ${isSelected ? "text-blue-800 font-medium" : "text-slate-700"}`}>
                      {opt}
                    </span>
                    {/* Checkbox indicator on right */}
                    <div className={`w-5 h-5 rounded-full border-2 ml-4 flex items-center justify-center ${isSelected ? "border-blue-500" : "border-slate-300"}`}>
                       {isSelected && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 text-sm text-slate-500 font-medium flex items-center">
              <Info className="w-4 h-4 mr-1.5" />
              Choose Any 1 Option(s).
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
             <div className="flex space-x-3">
               {/* Removed Mark for Review, Clear, and Save & Next buttons */}
             </div>

             <div className="flex space-x-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center space-x-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 border border-slate-200 font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === testQuestions.length - 1}
                  className="flex items-center space-x-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 border border-slate-200 font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={handleFinalSubmit}
                  className="ml-4 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  <span>Submit</span>
                  <CheckCircle className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>

        {/* Right Side: Status Sidebar */}
        <div className="w-[320px] flex flex-col bg-slate-50">
          
          {/* Status Legends Grid */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-700">1</div>
                <span className="text-xs font-medium text-gray-600">Current</span>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded-t-[10px] rounded-b-[2px] bg-green-500 flex items-center justify-center text-[10px] font-bold text-white">{stats.answered}</div>
                <span className="text-xs font-medium text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white">{stats.review}</div>
                <span className="text-xs font-medium text-gray-600">Review</span>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded-full border border-gray-300 bg-white flex items-center justify-center text-[10px] font-bold text-gray-500">{stats.notVisited}</div>
                <span className="text-xs font-medium text-gray-600">Not Visited</span>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded-t-[10px] rounded-b-[2px] bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">{stats.notAttempted}</div>
                <span className="text-xs font-medium text-gray-600">Not Attempted</span>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white">
                <div className="w-5 h-5 rounded border border-cyan-300 bg-cyan-100 flex items-center justify-center text-[10px] font-bold text-cyan-600">0</div>
                <span className="text-xs font-medium text-gray-600">Unsaved</span>
              </div>
            </div>
            
            <div className="mt-2 w-full flex items-center border border-slate-200 rounded px-3 py-2 bg-white text-xs font-medium text-slate-700">
              <div className="w-5 h-5 rounded border-2 border-slate-800 flex items-center justify-center text-slate-800 font-bold text-[10px] mr-2">i</div>
              Full Screen Exit
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Question Grid</h3>
            <div className="grid grid-cols-5 gap-3">
              {testQuestions.map((q: any, idx: number) => {
                const status = getQuestionStatus(idx);
                let badgeStyle = "";
                let shapeClass = "";

                if (status === 'current') {
                  badgeStyle = "border-blue-500 bg-blue-50 text-blue-700 font-bold border-2";
                  shapeClass = "rounded-full";
                } else if (status === 'answered') {
                  badgeStyle = "bg-green-500 text-white border-transparent";
                  shapeClass = "rounded-t-[16px] rounded-b-[4px]";
                } else if (status === 'review') {
                  badgeStyle = "bg-purple-500 text-white border-transparent";
                  shapeClass = "rounded-full";
                } else if (status === 'not_attempted') {
                  badgeStyle = "bg-red-500 text-white border-transparent";
                  shapeClass = "rounded-t-[16px] rounded-b-[4px]";
                } else {
                  badgeStyle = "bg-white text-slate-600 border-slate-300 hover:bg-slate-50";
                  shapeClass = "rounded-full";
                }
                
                return (
                  <button
                    key={q.id}
                    onClick={() => navigateToQuestion(idx)}
                    className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-all border ${badgeStyle} ${shapeClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border-2 border-rose-500 text-center animate-bounce shadow-rose-500/20">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3">DON'T SWITCH TAB!</h2>
            <p className="text-slate-600 mb-8 font-medium">
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
            <div className="w-24 h-24 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
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

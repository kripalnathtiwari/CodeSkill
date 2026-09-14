import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Play, Check, ChevronLeft, ChevronRight, Terminal, AlertTriangle, Code2, Clock, Cpu, Zap, CheckCircle2, XCircle } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { recordContribution } from "../utils/contributions";
import { getApiUrl } from "../utils/apiConfig";
import { recordDailyProgress } from "../utils/progressTracker";
import PracticeTimer from "../components/PracticeTimer";

// Helper: parse JSON string fields into arrays safely
const parseField = (val: any) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
  return [];
};

const normalizeProblem = (p: any) => {
  const starterCode = (typeof p.starterCode === 'string' ? JSON.parse(p.starterCode || '{}') : null)
    || (typeof p.starterCodes === 'string' ? JSON.parse(p.starterCodes || '{}') : null)
    || p.starterCode || p.starterCodes || {};
  return {
    ...p,
    id: p.id || p._id || p.slug,
    constraints: parseField(p.constraints),
    examples: parseField(p.examples),
    inputFormat: parseField(p.inputFormat),
    outputFormat: parseField(p.outputFormat),
    tags: parseField(p.tags),
    starterCode
  };
};

// Helper to format input strings nicely if they are JSON objects
const formatInputContent = (inputStr: any) => {
  if (!inputStr) return '(none)';
  if (typeof inputStr !== 'string') inputStr = String(inputStr);
  try {
    const parsed = JSON.parse(inputStr);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.entries(parsed)
        .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
        .join('\n');
    }
  } catch (e) {
    // Fallback to original string if not JSON object
  }
  return inputStr;
};

// Provide some mock questions data to fall back on if backend is missing
const MOCK_QUESTIONS: Record<string, any> = {};


const LANGUAGES = [
  { id: "cpp", name: "C++ (17)", defaultCode: "class Solution {\npublic:\n    // write your solution here\n};" },
  { id: "java", name: "Java", defaultCode: "class Solution {\n    public static void main(String[] args) {\n        // write your code here\n    }\n}" },
  { id: "python", name: "Python", defaultCode: "# write your code here" },
  { id: "javascript", name: "JavaScript", defaultCode: "// write your code here" }
];

export default function SolveProblem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [problem, setProblem] = useState<any>(null);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [problemList, setProblemList] = useState<any[]>(Object.values(MOCK_QUESTIONS));

  useEffect(() => {
    const applyProblemAndCode = (norm: any) => {
      setProblem(norm);
      // Restore last used language
      const lastLangId = localStorage.getItem(`codeSklii_last_lang_${norm.id}`);
      let currentLang = language;
      if (lastLangId) {
        const found = LANGUAGES.find(l => l.id === lastLangId);
        if (found) {
          currentLang = found;
          setLanguage(found);
        }
      }
      // Restore code
      const savedCode = localStorage.getItem(`codeSklii_saved_code_${norm.id}_${currentLang.id}`);
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(norm.starterCode?.[currentLang.id === "cpp" ? "cpp" : currentLang.id] || norm.defaultCode || currentLang.defaultCode);
      }
    };

    const loadProblem = async () => {
      if (!id) return;

      // check if it's a UUID (database) or slug (remote/mock)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      const isSlug = !isUUID;

      // 0. Attempt to load from sessionStorage (if redirected from dashboard/admin)
      const sessionData = sessionStorage.getItem('current_problem');
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          const ids = [parsed._id, parsed.id, parsed.slug].filter(Boolean).map(String);
          if (ids.includes(String(id))) {
            const norm = normalizeProblem(parsed);
            applyProblemAndCode(norm);
            sessionStorage.removeItem('current_problem');
            return;
          }
        } catch (e) { /* ignore */ }
      }

      // 1. Attempt to load from custom problems (admin_custom_problems)
      const saved = localStorage.getItem("admin_custom_problems");
      if (saved) {
        const customProblems = JSON.parse(saved);
        const found = customProblems.find((p: any) => p._id === id || p.id === id || p.slug === id);
        
        if (found) {
          const norm = normalizeProblem(found);
          applyProblemAndCode(norm);
          return;
        }
      }

      // 2. Attempt to fetch from backend (works for both UUIDs and slugs)
      try {
        const res = await axios.get(getApiUrl(`/api/v1/questions/${id}`));
        const fetched = res.data.question || res.data;
        if (fetched && (fetched.id || fetched._id || fetched.title)) {
          const norm = normalizeProblem(fetched);
          applyProblemAndCode(norm);
          return;
        }
      } catch (err) {
        console.error("Backend fetch failed, trying mock fallback", err);
      }

      // 3. Fallback to mock questions
      if (id && MOCK_QUESTIONS[id]) {
        const norm = normalizeProblem(MOCK_QUESTIONS[id]);
        applyProblemAndCode(norm);
      } else {
        // 4. Generic fallback
        const norm = normalizeProblem({
          id,
          title: "Coding Challenge",
          difficulty: "Medium",
          statement: "Solve the given algorithmic challenge using optimized data structures.",
          defaultCode: LANGUAGES[0].defaultCode
        });
        applyProblemAndCode(norm);
      }

      try {
        const res = await axios.get(getApiUrl("/api/v1/questions?limit=100&type=CODING"));
        if (res.data?.questions?.length > 0) {
          setProblemList(res.data.questions);
        } else {
          setProblemList(Object.values(MOCK_QUESTIONS));
        }
      } catch {
        setProblemList(Object.values(MOCK_QUESTIONS));
      }
    };

    loadProblem();
  }, [id]);

  const currentProblemIndex = problemList.findIndex((p: any) => 
    String(p.id) === String(id) || 
    String(p._id) === String(id) || 
    String(p.slug) === String(id) ||
    String(p.title?.toLowerCase().replace(/\s+/g, '-')) === String(id?.toLowerCase()) ||
    (id === "two-sum" && (p.id === "p1" || p._id === "p1")) ||
    (id === "add-two-numbers" && (p.id === "p2" || p._id === "p2"))
  );
  const prevProblem = currentProblemIndex > 0 ? problemList[currentProblemIndex - 1] : null;
  const nextProblem = currentProblemIndex >= 0 && currentProblemIndex < problemList.length - 1 ? problemList[currentProblemIndex + 1] : null;

  const handleNavigateProblem = (targetP: any) => {
    if (!targetP) return;
    setTestResults([]);
    setActiveTestTab(0);
    setTestStatus("idle");
    setOutput("");
    navigate(`/solve/${targetP.id || targetP._id || targetP.slug}`);
  };

  const [testResults, setTestResults] = useState<any[]>([]);
  const [activeTestTab, setActiveTestTab] = useState(0);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = LANGUAGES.find((l) => l.id === e.target.value);
    if (selected) {
      setLanguage(selected);
      if (problem) {
        localStorage.setItem(`codeSklii_last_lang_${problem.id}`, selected.id);
        const savedCode = localStorage.getItem(`codeSklii_saved_code_${problem.id}_${selected.id}`);
        if (savedCode) {
          setCode(savedCode);
        } else {
          const problemCode = problem?.starterCode?.[selected.id === "cpp" ? "cpp" : selected.id];
          setCode(problemCode || selected.defaultCode);
        }
      }
    }
  };

  // Check if code is essentially unchanged from a starter template
  const isUnchangedStarter = (userCode: string): boolean => {
    const stripped = userCode.replace(/\/\/.*$/mg, '').replace(/\s/g, '').toLowerCase();
    return stripped.length < 10;
  };

  // Simulate running code against a test case
  const simulateTestCase = (testCase: any, idx: number): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let actualOutput = '';
        let passed = false;
        const expectedOutput = (testCase.expectedOutput || testCase.output || '').toString().trim();

        try {
          if (language.id === 'javascript') {
            // Actually execute JavaScript in sandboxed Function scope
            const logs: string[] = [];
            const mockConsole = { log: (...args: any[]) => logs.push(args.map(String).join(' ')) };
            const callCode = getCallCode(problem, testCase);
            if (!callCode) {
              // No harness: can't evaluate, show backend required
              actualOutput = '[Backend required to run]';
              passed = false;
            } else {
              const fn = new Function('console', code + '\n' + callCode);
              fn(mockConsole);
              actualOutput = logs.join('\n').trim();
              passed = actualOutput === expectedOutput;
            }
          } else {
            // C++, Java, Python: cannot run in browser
            // Detect if user has not written anything meaningful
            if (isUnchangedStarter(code)) {
              actualOutput = '(no output â€” code is empty or unchanged)';
              passed = false;
            } else {
              // User has written code but we can't verify without backend
              actualOutput = '[Backend required to evaluate ' + language.name + ' code]';
              passed = false;
            }
          }
        } catch (e: any) {
          actualOutput = `Runtime Error: ${e.message}`;
          passed = false;
        }

        resolve({
          idx,
          input: testCase.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed,
          hidden: testCase.hidden || testCase.isHidden || false
        });
      }, 150 * (idx + 1));
    });
  };

  const getCallCode = (prob: any, tc: any) => {
    const title = prob?.title?.toLowerCase() || '';
    const input = tc?.input || '';
    const lines = input.split('\n');

    if (title.includes('two sum')) {
      const nums = (lines[1] || '').trim().split(' ').map(Number);
      const target = parseInt(lines[2] || '0');
      return `
const result = twoSum([${nums.join(',')}], ${target});
if (Array.isArray(result)) console.log(result.join(' '));
`;
    }
    // For unknown problems: can't construct a harness
    return '';
  };

  const handleRun = async () => {
    setIsExecuting(true);
    setTestStatus('running');
    setTestResults([]);

    // Collect test cases from problem
    const allTestCases: any[] = [
      ...(problem?.testCases || []),
      ...(problem?.examples?.map((ex: any) => ({ input: ex.input, output: ex.output, hidden: false })) || [])
    ];

    // Deduplicate by input
    const seen = new Set();
    const testCases = allTestCases.filter(tc => {
      if (seen.has(tc.input)) return false;
      seen.add(tc.input);
      return true;
    });

    // If no test cases, create a generic one
    if (testCases.length === 0) {
      testCases.push({ input: '', output: '', hidden: false });
    }

    try {
      // Try real backend first
      const results = [];
      for (let idx = 0; idx < testCases.length; idx++) {
        const tc = testCases[idx];
        try {
          const res = await axios.post(getApiUrl('/api/v1/submissions/run'), {
            code,
            language: language.id,
            input: tc.input
          });
          const out = (res.data.error || res.data.output || res.data.stdout || '').trim();
          const expected = (tc.expectedOutput || tc.output || '').trim();
          results.push({
            idx,
            input: tc.input,
            expected,
            actual: out,
            passed: out === expected,
            hidden: tc.hidden || tc.isHidden || false
          });
          // Local execution is very fast and has no rate limits
          // Removed the 1200ms delay
        } catch {
          results.push(null);
        }
      }

      const validResults = results.filter(Boolean);
      if (validResults.length > 0) {
        setTestResults(validResults as any[]);
        const firstVisibleIdx = (validResults as any[]).findIndex(r => !r.hidden);
        if (firstVisibleIdx >= 0) setActiveTestTab(firstVisibleIdx);
        const allPassed = (validResults as any[]).every(r => r.passed);
        setTestStatus(allPassed ? 'passed' : 'failed');
        if (allPassed) {
          const solvedStr = localStorage.getItem(`solved_problems_progress_${user?.email || "guest"}`) || '[]';
          const solvedArr = JSON.parse(solvedStr);
          if (id && !solvedArr.includes(id)) { 
            solvedArr.push(id); 
            localStorage.setItem(`solved_problems_progress_${user?.email || "guest"}`, JSON.stringify(solvedArr)); 
            recordContribution(user?.email);
            recordDailyProgress(user?.email, 1, 20);
          }
        }
        setIsExecuting(false);
        return;
      }
    } catch { /* fallthrough to simulation */ }

    // Frontend simulation
    const simResults = await Promise.all(testCases.map((tc, idx) => simulateTestCase(tc, idx)));
    setTestResults(simResults);
    const firstVisibleIdx = simResults.findIndex(r => !r.hidden);
    if (firstVisibleIdx >= 0) setActiveTestTab(firstVisibleIdx);
    const allPassed = simResults.every(r => r.passed);
    setTestStatus(allPassed ? 'passed' : 'failed');
    if (allPassed) {
      const solvedStr = localStorage.getItem(`solved_problems_progress_${user?.email || "guest"}`) || '[]';
      const solvedArr = JSON.parse(solvedStr);
      if (id && !solvedArr.includes(id)) { 
        solvedArr.push(id); 
        localStorage.setItem(`solved_problems_progress_${user?.email || "guest"}`, JSON.stringify(solvedArr)); 
        recordContribution(user?.email);
        recordDailyProgress(user?.email, 1, 20);
      }
    }
    setIsExecuting(false);
  };


  if (!problem) return <div className="p-10 text-text-inverse">Loading...</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] bg-[#0B0F19] text-text-inverse font-sans w-full overflow-y-auto lg:overflow-hidden">
      
      {/* Left Pane: Description */}
      <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-r lg:border-b-0 border-border bg-[#0f172a] h-auto lg:h-full overflow-y-visible lg:overflow-y-auto shrink-0">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-900/50 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-text-muted hover:text-text-inverse transition-colors" title="Back">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <Code2 className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-text-inverse tracking-wide">Problem Description</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleNavigateProblem(prevProblem)}
              disabled={!prevProblem}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary hover:text-text-inverse rounded-lg text-xs font-bold transition-all"
              title="Previous Problem"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              onClick={() => handleNavigateProblem(nextProblem)}
              disabled={!nextProblem}
              className="flex items-center space-x-1 px-3 py-1.5 bg-primary hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-text-inverse rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Next Problem"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-text-inverse mb-4">{problem.title}</h1>
            <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest ${
              problem.difficulty === "Easy" ? "bg-primary/20 text-primary border border-primary/30" :
              problem.difficulty === "Medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
              "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}>
              {problem.difficulty}
            </span>
          </div>

          <div className="prose prose-invert prose-blue max-w-none">
            <div className="whitespace-pre-wrap font-sans text-text-secondary leading-relaxed bg-transparent p-0 text-base">
              {/* Fallback for simple description/content */}
              {(problem.description || problem.content) && (
                <div className="mb-6">{problem.description || problem.content}</div>
              )}
              
              {/* Detailed Breakdown for JSON structured problems */}
              {problem.statement && (
                <div className="mb-6">{problem.statement}</div>
              )}

              {problem.inputFormat && problem.inputFormat.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-text-inverse mb-2">Input Format</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {problem.inputFormat.map((item: string, i: number) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}

              {problem.outputFormat && problem.outputFormat.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-text-inverse mb-2">Output Format</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {problem.outputFormat.map((item: string, i: number) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}

              {problem.constraints && problem.constraints.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-text-inverse mb-2">Constraints</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {problem.constraints.map((item: string, i: number) => <li key={i}><code>{item}</code></li>)}
                  </ul>
                </div>
              )}

              {((problem.examples && problem.examples.length > 0) || (problem.testCases && problem.testCases.filter((t: any) => !t.isHidden && !t.hidden).length > 0)) && (
                <div className="space-y-4">
                  {(problem.examples && problem.examples.length > 0 ? problem.examples : problem.testCases.filter((t: any) => !t.isHidden && !t.hidden)).map((ex: any, i: number) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-border/50">
                      <p className="font-bold text-text-inverse mb-2">Example {i + 1}:</p>
                      <div className="font-mono text-sm space-y-2">
                        <div><span className="text-primary font-bold">Input:</span><br/><pre className="whitespace-pre-wrap m-0 bg-transparent p-0 font-mono text-text-secondary">{formatInputContent(ex.input)}</pre></div>
                        <div><span className="text-primary font-bold">Output:</span><br/>{ex.output}</div>
                        {ex.explanation && <div><span className="text-text-muted font-bold">Explanation:</span><br/>{ex.explanation}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Editor & Output */}
      <div className="w-full lg:w-[55%] flex flex-col h-[700px] lg:h-full bg-[#1e1e1e] shrink-0">
        {/* Editor Toolbar */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-[#252526]">
          <div className="flex items-center space-x-3">
            <select 
              value={language.id}
              onChange={handleLanguageChange}
              className="bg-[#3c3c3c] border-none text-text-secondary text-sm rounded-md focus:ring-1 focus:ring-blue-500 px-3 py-1.5 outline-none font-medium cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
            <PracticeTimer storageKey={`solve_problem_${id || "default"}`} defaultMode="stopwatch" />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleRun}
              disabled={isExecuting}
              className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-text-inverse px-5 py-2 rounded-md text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isExecuting ? <Terminal className="w-4 h-4 animate-bounce" /> : <Play className="w-4 h-4" />}
              <span>Compile & Run</span>
            </button>
            <button
              onClick={handleRun}
              disabled={isExecuting}
              className="flex items-center space-x-2 bg-primary hover:bg-primary text-text-inverse px-6 py-2 rounded-md text-sm font-bold transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <Check className="w-4 h-4" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative border-b border-border">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language.id === "cpp" ? "cpp" : language.id}
            value={code}
            onChange={(val) => {
              const newCode = val || "";
              setCode(newCode);
              if (problem?.id) {
                localStorage.setItem(`codeSklii_saved_code_${problem.id}_${language.id}`, newCode);
              }
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 24, bottom: 24 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste: true,
              lineHeight: 1.6
            }}
          />
        </div>

        {/* Test Cases Panel - Professional Console */}
        <div className="h-80 bg-[#141824] flex flex-col flex-shrink-0 border-t border-border/80 shadow-2xl">
          <div className="px-4 py-2.5 border-b border-border/80 bg-[#1a2032] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-text-secondary tracking-wide">Test Suite Console</span>
              </div>
              {testStatus === 'running' && (
                <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-semibold animate-pulse">
                  Executing...
                </span>
              )}
              {testStatus === 'passed' && (
                <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-3 py-0.5 rounded-full font-bold flex items-center shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  All Test Cases Passed
                </span>
              )}
              {testStatus === 'failed' && (
                <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-0.5 rounded-full font-bold flex items-center shadow-sm">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Test Suite Failed
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {testResults.length > 0 && (
                <span className="text-xs font-mono bg-slate-800/80 text-text-secondary px-2.5 py-1 rounded-md border border-border/60">
                  {testResults.filter(r => r.passed).length} / {testResults.length} Passed
                </span>
              )}

              {(testResults.length > 1 || (testResults.length === 0 && (problem?.examples?.length || 0) > 1)) && (
                <div className="flex items-center space-x-1 border-l border-border pl-3">
                  <button
                    onClick={() => setActiveTestTab(prev => Math.max(0, prev - 1))}
                    disabled={activeTestTab === 0}
                    className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Previous Test Case"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-text-muted px-1">
                    Case {activeTestTab + 1}
                  </span>
                  <button
                    onClick={() => setActiveTestTab(prev => Math.min((testResults.length > 0 ? testResults.length : (problem?.examples?.length || 1)) - 1, prev + 1))}
                    disabled={activeTestTab === (testResults.length > 0 ? testResults.length : (problem?.examples?.length || 1)) - 1}
                    className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Next Test Case"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {testResults.length > 0 ? (
            <div className="flex flex-col flex-1 overflow-hidden bg-[#121622]">
              {/* Modern Tab Bar */}
              <div className="flex overflow-x-auto border-b border-border/80 bg-[#161b29] px-3 pt-2 space-x-2 scrollbar-hide">
                {testResults.map((r, i) => !r.hidden && (
                  <button
                    key={i}
                    onClick={() => setActiveTestTab(i)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTestTab === i
                        ? 'bg-[#121622] text-text-inverse border-t-2 border-primary shadow-sm'
                        : 'text-text-muted hover:text-text-secondary hover:bg-[#1a2032]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${r.passed ? 'bg-primary' : 'bg-rose-500'}`} />
                    <span>Case {i + 1}</span>
                    {r.passed ? (
                      <CheckCircle2 className="w-3 h-3 text-primary ml-1" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-400 ml-1" />
                    )}
                  </button>
                ))}
              </div>

              {/* Active Test Case Details */}
              {testResults[activeTestTab] && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm font-mono">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <div className={`flex items-center space-x-2 font-bold ${
                      testResults[activeTestTab].passed ? 'text-primary' : 'text-rose-400'
                    }`}>
                      {testResults[activeTestTab].passed
                        ? <><CheckCircle2 className="w-4 h-4" /> <span>Test Case #{activeTestTab + 1} Passed</span></>
                        : <><XCircle className="w-4 h-4" /> <span>Test Case #{activeTestTab + 1} Failed</span></>
                      }
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-text-muted">
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-primary" /> ~3 ms</span>
                      <span className="flex items-center"><Cpu className="w-3.5 h-3.5 mr-1 text-sky-500" /> 12.8 MB</span>
                    </div>
                  </div>

                  {!testResults[activeTestTab].hidden && (
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-[#1a2032] border border-border/80 rounded-xl p-3 shadow-inner">
                        <div className="text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-amber-400" /> Input Parameters
                        </div>
                        <pre className="text-text-secondary text-xs whitespace-pre-wrap font-mono bg-slate-900/60 p-2.5 rounded-lg border border-border">{formatInputContent(testResults[activeTestTab].input)}</pre>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-[#1a2032] border border-primary/20 rounded-xl p-3 shadow-inner">
                          <div className="text-primary text-[11px] font-bold uppercase tracking-wider mb-1.5">Expected Output</div>
                          <pre className="text-blue-300 text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg border border-primary/20">{testResults[activeTestTab].expected || '(empty)'}</pre>
                        </div>
                        <div className={`bg-[#1a2032] border rounded-xl p-3 shadow-inner ${testResults[activeTestTab].passed ? 'border-primary/20' : 'border-rose-500/30'}`}>
                          <div className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 ${testResults[activeTestTab].passed ? 'text-primary' : 'text-rose-400'}`}>Your Actual Output</div>
                          <pre className={`text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg border ${testResults[activeTestTab].passed ? 'text-blue-300 border-primary/20' : 'text-rose-300 border-rose-500/20'}`}>{testResults[activeTestTab].actual || '(no output)'}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {testResults[activeTestTab].hidden && (
                    <div className="bg-[#1a2032] border border-border/80 rounded-xl p-6 text-center">
                      <p className="text-text-muted text-xs font-sans">
                        ðŸ”’ <span className="font-bold text-text-secondary">Secret Evaluation Test Case</span> â€” Inputs and expected outputs are hidden for fair assessment.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : problem?.examples?.length > 0 ? (
            <div className="flex flex-col flex-1 overflow-hidden bg-[#121622]">
              <div className="flex overflow-x-auto border-b border-border/80 bg-[#161b29] px-3 pt-2 space-x-2 scrollbar-hide">
                {problem.examples.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestTab(i)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTestTab === i
                        ? 'bg-[#121622] text-text-inverse border-t-2 border-purple-500 shadow-sm'
                        : 'text-text-muted hover:text-text-secondary hover:bg-[#1a2032]'
                    }`}
                  >
                    <span>Example {i + 1}</span>
                  </button>
                ))}
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {problem.examples[activeTestTab] && (
                  <>
                    <div>
                      <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Input</div>
                      <pre className="text-text-secondary text-xs whitespace-pre-wrap font-mono bg-slate-900/60 p-3 rounded-lg border border-border">
                        {problem.examples[activeTestTab].input}
                      </pre>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Expected Output</div>
                      <pre className="text-blue-300 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-primary/20">
                        {problem.examples[activeTestTab].output}
                      </pre>
                    </div>
                    {problem.examples[activeTestTab].explanation && (
                      <div>
                        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Explanation</div>
                        <div className="text-text-secondary text-xs bg-slate-900/40 p-3 rounded-lg border border-border/60">
                          {problem.examples[activeTestTab].explanation}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-text-muted bg-[#121622]">
              <Terminal className="w-8 h-8 opacity-20" />
              <span className="text-sm">Click "Compile & Run" to test your code against all test cases.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Play, Check, ChevronLeft, Terminal, AlertTriangle, Code2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { recordContribution } from "../utils/contributions";

// Helper: parse JSON string fields into arrays safely
const parseField = (val: any) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
  return [];
};

// Normalize a fetched problem so all array fields are actually arrays
const normalizeProblem = (p: any) => {
  const starterCode = (typeof p.starterCode === 'string' ? JSON.parse(p.starterCode || '{}') : null)
    || (typeof p.starterCodes === 'string' ? JSON.parse(p.starterCodes || '{}') : null)
    || p.starterCode || p.starterCodes || {};
  return {
    ...p,
    constraints: parseField(p.constraints),
    examples: parseField(p.examples),
    inputFormat: parseField(p.inputFormat),
    outputFormat: parseField(p.outputFormat),
    tags: parseField(p.tags),
    starterCode
  };
};

// Provide some mock questions data to fall back on if backend is missing
const MOCK_QUESTIONS: Record<string, any> = {
  "p1": { 
    id: "p1",
    title: "Two Sum",
    difficulty: "Easy",
    statement: "Given an integer array nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice. Return the answer in any order.",
    inputFormat: [
      "The first line contains an integer n (size of array).",
      "The second line contains n space-separated integers.",
      "The third line contains the target integer."
    ],
    outputFormat: ["Print the indices of the two numbers separated by a space."],
    constraints: [
      "2 <= n <= 100000",
      "-1000000000 <= nums[i] <= 1000000000",
      "Exactly one valid answer exists."
    ],
    examples: [
      { input: "4\n2 7 11 15\n9", output: "0 1", explanation: "nums[0] + nums[1] = 9" },
      { input: "3\n3 2 4\n6", output: "1 2", explanation: "nums[1] + nums[2] = 6" }
    ],
    starterCode: {
      cpp: "#include <vector>\n#include <unordered_map>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // write your code here\n        return {};\n    }\n};",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // write your code here\n        return new int[]{};\n    }\n}",
      python: "class Solution:\n    def twoSum(self, nums, target):\n        # write your code here\n        pass",
      javascript: "function twoSum(nums, target) {\n    // write your code here\n    return [];\n}"
    }
  },
  "p2": {
    id: "p2",
    title: "Add Two Numbers",
    difficulty: "Medium",
    statement: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
    examples: [
      { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", explanation: "342 + 465 = 807" }
    ],
    starterCode: {
      javascript: "function addTwoNumbers(l1, l2) {\n  // write your code here\n};",
      python: "def addTwoNumbers(l1, l2):\n    pass",
      java: "class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        return null;\n    }\n}",
      cpp: "class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        return nullptr;\n    }\n};"
    }
  }
};

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

  useEffect(() => {
    const loadProblem = async () => {
      // 0. Check sessionStorage first (set when clicking Solve in Problems page)
      const sessionData = sessionStorage.getItem('current_problem');
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          const ids = [parsed._id, parsed.id, parsed.slug].filter(Boolean).map(String);
          if (ids.includes(String(id))) {
            const norm = normalizeProblem(parsed);
            setProblem(norm);
            const starterObj = norm.starterCode || {};
            setCode(starterObj[language.id === 'cpp' ? 'cpp' : language.id] || norm.defaultCode || LANGUAGES[0].defaultCode);
            sessionStorage.removeItem('current_problem');
            return;
          }
        } catch (e) { /* ignore */ }
      }

      // 1. Attempt to load from custom problems (admin_custom_problems)
      const saved = localStorage.getItem("admin_custom_problems");
      let found = null;
      if (saved) {
        const parsed = JSON.parse(saved);
        found = parsed.find((p: any) => p._id === id || p.id === id || p.slug === id);
      }
      
      if (found) {
        const norm = normalizeProblem(found);
        setProblem(norm);
        setCode(norm.starterCode?.[language.id === "cpp" ? "cpp" : language.id] || norm.defaultCode || LANGUAGES[0].defaultCode);
        return;
      }

      // 2. Attempt to fetch from backend by slug (if it looks like a slug, not a UUID)
      const isSlug = !id?.includes('-') || id?.split('-').length <= 3;
      if (isSlug) {
        try {
          const res = await axios.get(`http://localhost:5000/api/v1/questions/${id}`);
          const fetched = res.data.question || res.data;
          if (fetched && (fetched.id || fetched._id || fetched.title)) {
            const norm = normalizeProblem(fetched);
            setProblem(norm);
            setCode(norm.starterCode?.[language.id === "cpp" ? "cpp" : language.id] || norm.defaultCode || LANGUAGES[0].defaultCode);
            return;
          }
        } catch (err) {
          console.error("Backend fetch failed, trying mock fallback", err);
        }
      }

      // 3. Fallback to mock questions
      if (id && MOCK_QUESTIONS[id]) {
        const norm = normalizeProblem(MOCK_QUESTIONS[id]);
        setProblem(norm);
        const starterObj = norm.starterCode || {};
        setCode(starterObj[language.id === 'cpp' ? 'cpp' : language.id] || norm.defaultCode || LANGUAGES[0].defaultCode);
      } else {
        // 4. Generic fallback
        setProblem(normalizeProblem({
          id,
          title: "Coding Challenge",
          difficulty: "Medium",
          statement: "Solve the given algorithmic challenge using optimized data structures.",
          defaultCode: LANGUAGES[0].defaultCode
        }));
        setCode(LANGUAGES[0].defaultCode);
      }
    };

    loadProblem();
  }, [id]);

  const [testResults, setTestResults] = useState<any[]>([]);
  const [activeTestTab, setActiveTestTab] = useState(0);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = LANGUAGES.find((l) => l.id === e.target.value);
    if (selected) {
      setLanguage(selected);
      const problemCode = problem?.starterCode?.[selected.id === "cpp" ? "cpp" : selected.id];
      setCode(problemCode || selected.defaultCode);
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
              actualOutput = '(no output — code is empty or unchanged)';
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
      const results = await Promise.all(
        testCases.map(async (tc, idx) => {
          try {
            const res = await axios.post('http://localhost:5000/api/v1/submissions/run', {
              code,
              language: language.id,
              input: tc.input
            });
            const out = (res.data.error || res.data.output || res.data.stdout || '').trim();
            const expected = (tc.expectedOutput || tc.output || '').trim();
            return {
              idx,
              input: tc.input,
              expected,
              actual: out,
              passed: out === expected,
              hidden: tc.hidden || tc.isHidden || false
            };
          } catch {
            return null;
          }
        })
      );

      const validResults = results.filter(Boolean);
      if (validResults.length > 0) {
        setTestResults(validResults as any[]);
        const allPassed = (validResults as any[]).every(r => r.passed);
        setTestStatus(allPassed ? 'passed' : 'failed');
        if (allPassed) {
          const solvedStr = localStorage.getItem(`solved_problems_progress_${user?.email || "guest"}`) || '[]';
          const solvedArr = JSON.parse(solvedStr);
          if (id && !solvedArr.includes(id)) { 
            solvedArr.push(id); 
            localStorage.setItem(`solved_problems_progress_${user?.email || "guest"}`, JSON.stringify(solvedArr)); 
            recordContribution(user?.email);
          }
        }
        setIsExecuting(false);
        return;
      }
    } catch { /* fallthrough to simulation */ }

    // Frontend simulation
    const simResults = await Promise.all(testCases.map((tc, idx) => simulateTestCase(tc, idx)));
    setTestResults(simResults);
    const allPassed = simResults.every(r => r.passed);
    setTestStatus(allPassed ? 'passed' : 'failed');
    if (allPassed) {
      const solvedStr = localStorage.getItem(`solved_problems_progress_${user?.email || "guest"}`) || '[]';
      const solvedArr = JSON.parse(solvedStr);
      if (id && !solvedArr.includes(id)) { 
        solvedArr.push(id); 
        localStorage.setItem(`solved_problems_progress_${user?.email || "guest"}`, JSON.stringify(solvedArr)); 
        recordContribution(user?.email);
      }
    }
    setIsExecuting(false);
  };


  if (!problem) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-[#0a1128] text-slate-100 font-sans w-full overflow-hidden">
      
      {/* Left Pane: Description */}
      <div className="w-full lg:w-[45%] flex flex-col border-r border-slate-800 bg-[#0f172a] h-full overflow-y-auto">
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-900/50 sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <Code2 className="w-6 h-6 text-emerald-500" />
          <h2 className="text-lg font-bold text-white tracking-wide">Problem Description</h2>
        </div>
        
        <div className="p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-4">{problem.title}</h1>
            <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest ${
              problem.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
              problem.difficulty === "Medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
              "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}>
              {problem.difficulty}
            </span>
          </div>

          <div className="prose prose-invert prose-emerald max-w-none">
            <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed bg-transparent p-0 text-base">
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
                  <h3 className="text-lg font-bold text-white mb-2">Input Format</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {problem.inputFormat.map((item: string, i: number) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}

              {problem.outputFormat && problem.outputFormat.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Output Format</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {problem.outputFormat.map((item: string, i: number) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}

              {problem.constraints && problem.constraints.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Constraints</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {problem.constraints.map((item: string, i: number) => <li key={i}><code>{item}</code></li>)}
                  </ul>
                </div>
              )}

              {((problem.examples && problem.examples.length > 0) || (problem.testCases && problem.testCases.filter((t: any) => !t.isHidden && !t.hidden).length > 0)) && (
                <div className="space-y-4">
                  {(problem.examples && problem.examples.length > 0 ? problem.examples : problem.testCases.filter((t: any) => !t.isHidden && !t.hidden)).map((ex: any, i: number) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                      <p className="font-bold text-white mb-2">Example {i + 1}:</p>
                      <div className="font-mono text-sm space-y-2">
                        <div><span className="text-emerald-400 font-bold">Input:</span><br/>{ex.input}</div>
                        <div><span className="text-emerald-400 font-bold">Output:</span><br/>{ex.output}</div>
                        {ex.explanation && <div><span className="text-slate-400 font-bold">Explanation:</span><br/>{ex.explanation}</div>}
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
      <div className="w-full lg:w-[55%] flex flex-col h-full bg-[#1e1e1e]">
        {/* Editor Toolbar */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-[#252526]">
          <select 
            value={language.id}
            onChange={handleLanguageChange}
            className="bg-[#3c3c3c] border-none text-slate-200 text-sm rounded-md focus:ring-1 focus:ring-emerald-500 px-3 py-1.5 outline-none font-medium cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
          
          <div className="flex space-x-3">
            <button
              onClick={handleRun}
              disabled={isExecuting}
              className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-md text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isExecuting ? <Terminal className="w-4 h-4 animate-bounce" /> : <Play className="w-4 h-4" />}
              <span>Compile & Run</span>
            </button>
            <button
              onClick={handleRun}
              disabled={isExecuting}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-md text-sm font-bold transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <Check className="w-4 h-4" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative border-b border-slate-800">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language.id === "cpp" ? "cpp" : language.id}
            value={code}
            onChange={(val) => setCode(val || "")}
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

        {/* Test Cases Panel */}
        <div className="h-80 bg-[#1e1e1e] flex flex-col flex-shrink-0 border-t border-slate-800">
          <div className="px-4 py-2.5 border-b border-slate-800 bg-[#252526] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-300 uppercase tracking-wide">Test Cases</span>
              {testStatus === 'running' && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full animate-pulse">Running...</span>}
              {testStatus === 'passed' && <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-3 py-0.5 rounded-full font-bold flex items-center"><Check className="w-3 h-3 mr-1"/>All Passed</span>}
              {testStatus === 'failed' && <span className="ml-2 text-xs bg-rose-500/20 text-rose-400 px-3 py-0.5 rounded-full font-bold flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/>Some Failed</span>}
            </div>
            {testResults.length > 0 && (
              <span className="text-xs text-slate-500">{testResults.filter(r => r.passed).length}/{testResults.length} passed</span>
            )}
          </div>

          {testResults.length > 0 ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Tab bar */}
              <div className="flex overflow-x-auto border-b border-slate-800 bg-[#1e1e1e] px-2 pt-1 space-x-1 scrollbar-hide">
                {testResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestTab(i)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t text-xs font-medium whitespace-nowrap transition-colors ${
                      activeTestTab === i
                        ? 'bg-[#2d2d2d] text-white border-b-2 border-emerald-500'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${r.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>Case {i + 1}{r.hidden ? ' 🔒' : ''}</span>
                  </button>
                ))}
              </div>

              {/* Active test case detail */}
              {testResults[activeTestTab] && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm font-mono">
                  <div className={`flex items-center space-x-2 font-bold ${
                    testResults[activeTestTab].passed ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {testResults[activeTestTab].passed
                      ? <><Check className="w-4 h-4" /> Passed</>
                      : <><AlertTriangle className="w-4 h-4" /> Wrong Answer</>
                    }
                  </div>

                  {!testResults[activeTestTab].hidden && (
                    <div className="grid grid-cols-1 gap-2">
                      <div className="bg-slate-800/60 rounded p-2">
                        <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Input</div>
                        <pre className="text-slate-300 text-xs whitespace-pre-wrap">{testResults[activeTestTab].input || '(none)'}</pre>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-800/60 rounded p-2">
                          <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Expected Output</div>
                          <pre className="text-emerald-400 text-xs">{testResults[activeTestTab].expected || '(empty)'}</pre>
                        </div>
                        <div className="bg-slate-800/60 rounded p-2">
                          <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Your Output</div>
                          <pre className={`text-xs ${testResults[activeTestTab].passed ? 'text-emerald-400' : 'text-rose-400'}`}>{testResults[activeTestTab].actual || '(no output)'}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {testResults[activeTestTab].hidden && (
                    <div className="text-slate-500 text-xs italic">
                      🔒 This is a hidden test case. Input and expected output are not shown.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-slate-600">
              <Terminal className="w-8 h-8 opacity-20" />
              <span className="text-sm">Click "Compile & Run" to test your code against all test cases.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

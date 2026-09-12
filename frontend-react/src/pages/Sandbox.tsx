import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Terminal, Loader2, AlertTriangle, CheckCircle, Clock, Cpu, Maximize2, Minimize2, Sun, Moon, Code2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../utils/apiConfig";
import PracticeTimer from "../components/PracticeTimer";

const LANGUAGES = [
  { id: "python", name: "Python", defaultCode: "print('Hello, CodeSkill!')" },
  { id: "javascript", name: "JavaScript", defaultCode: "console.log('Hello, CodeSkill!');" },
  { id: "typescript", name: "TypeScript", defaultCode: "const msg: string = 'Hello, CodeSkill!';\nconsole.log(msg);" },
  { id: "java", name: "Java", defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeSkill!");\n    }\n}' },
  { id: "cpp", name: "C++", defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, CodeSkill!" << std::endl;\n    return 0;\n}' },
  { id: "c", name: "C", defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello, CodeSkill!\\n");\n    return 0;\n}' },
  { id: "go", name: "Go", defaultCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, CodeSkill!")\n}' },
  { id: "rust", name: "Rust", defaultCode: 'fn main() {\n    println!("Hello, CodeSkill!");\n}' },
];

export default function SandboxPage() {
  const { user } = useAuth();
  
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(language.defaultCode);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    status?: string;
    runtime?: number;
    memory?: number;
    error?: string;
  } | null>(null);

  const [isEditorDark, setIsEditorDark] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ioTab, setIoTab] = useState<"input" | "output">("input");

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = LANGUAGES.find((l) => l.id === e.target.value);
    if (selected) {
      setLanguage(selected);
      setCode(selected.defaultCode);
    }
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setOutput("");
    setExecutionResult(null);
    setIoTab("output"); // Switch to output tab when running code

    try {
      const headers = user ? { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } : {};
      
      const res = await axios.post(getApiUrl("/api/v1/submissions/run"), {
        code,
        language: language.id,
        input,
      }, { headers });

      const { status, output: stdout, error, runtime, memory } = res.data;
      
      setExecutionResult({ status, runtime, memory, error });
      
      if (status === "ACCEPTED") {
        setOutput(stdout || "Execution completed with no output.");
      } else {
        setOutput(error || stdout || "Execution failed.");
      }
    } catch (err: any) {
      setExecutionResult({ status: "RUNTIME_ERROR", error: "Internal Server Error or network issue." });
      setOutput(err.response?.data?.error || err.message || "Failed to execute code.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] w-full bg-slate-50 dark:bg-[#0f111a] overflow-hidden font-sans">
      {/* Slim Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#1a1d27] border-b border-slate-200 dark:border-[#2d313f] shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              CodeSkill Compiler
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Interactive Workspace</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100 dark:bg-[#0f111a] rounded-md border border-slate-200 dark:border-[#2d313f] overflow-hidden">
            <select 
              value={language.id}
              onChange={handleLanguageChange}
              className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-semibold focus:ring-0 focus:outline-none block w-32 px-3 py-1.5 cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-white dark:bg-slate-800">{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block">
            <PracticeTimer storageKey="sandbox_general" defaultMode="stopwatch" />
          </div>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm"
          >
            {isExecuting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>{isExecuting ? "Running..." : "Run Code"}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Editor vs I/O */}
      <div className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-slate-50 dark:bg-[#0f111a] flex flex-col lg:flex-row w-full h-full overflow-hidden"
          : "flex-1 flex flex-col lg:flex-row w-full overflow-hidden"
      }>
        
        {/* Editor Pane */}
        <div className="flex-[3] flex flex-col border-r border-slate-200 dark:border-[#2d313f] bg-white dark:bg-[#1e2230] relative min-h-[50vh] lg:min-h-0">
          <div className="flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-[#1a1d27] border-b border-slate-200 dark:border-[#2d313f] text-xs font-mono">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 bg-white dark:bg-[#1e2230] px-3 py-1.5 rounded-t-md border-t border-l border-r border-slate-200 dark:border-[#2d313f] text-slate-800 dark:text-slate-200 shadow-sm translate-y-[1px] z-10">
                <Code2 className="w-3.5 h-3.5 text-primary" />
                <span>main.{language.id === "javascript" ? "js" : language.id === "typescript" ? "ts" : language.id}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
              <button 
                onClick={() => setIsEditorDark(!isEditorDark)}
                className="hover:text-primary transition-colors flex items-center space-x-1"
                title="Toggle Editor Theme"
              >
                {isEditorDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hover:text-primary transition-colors flex items-center space-x-1"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            <Editor
              height="100%"
              language={language.id === "c" || language.id === "cpp" ? "cpp" : language.id}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme={isEditorDark ? "vs-dark" : "light"}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontWeight: "500",
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                lineHeight: 26,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
                roundedSelection: false,
                renderLineHighlight: "all",
              }}
              loading={<div className="flex items-center justify-center h-full text-sm text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2"/> Loading Editor...</div>}
            />
          </div>
        </div>

        {/* Input/Output Pane (Tabbed) */}
        <div className="flex-[2] flex flex-col bg-white dark:bg-[#1e2230] min-h-[40vh] lg:min-h-0">
          <div className="flex justify-between items-end px-4 pt-2 bg-slate-50 dark:bg-[#1a1d27] border-b border-slate-200 dark:border-[#2d313f] text-xs font-mono">
            <div className="flex space-x-4">
              <button 
                onClick={() => setIoTab("input")}
                className={`pb-2 px-2 border-b-2 transition-all ${ioTab === "input" ? "border-primary text-slate-900 dark:text-slate-100 font-bold" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                STDIN
              </button>
              <button 
                onClick={() => setIoTab("output")}
                className={`pb-2 px-2 border-b-2 transition-all flex items-center ${ioTab === "output" ? "border-primary text-slate-900 dark:text-slate-100 font-bold" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                STDOUT
                {executionResult && <span className={`ml-1.5 w-1.5 h-1.5 rounded-full ${executionResult.status === "ACCEPTED" ? "bg-primary" : "bg-rose-500"}`}></span>}
              </button>
            </div>
            
            {ioTab === "output" && executionResult && (
              <div className="flex space-x-3 text-slate-500 pb-2">
                {executionResult.runtime !== undefined && (
                  <span className="flex items-center" title="Execution Time">
                    <Clock className="h-3 w-3 mr-1" /> {executionResult.runtime}ms
                  </span>
                )}
                {executionResult.memory !== undefined && (
                  <span className="flex items-center" title="Memory Used">
                    <Cpu className="h-3 w-3 mr-1" /> {executionResult.memory}KB
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-black/10">
            {ioTab === "input" ? (
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 w-full bg-transparent border-none resize-none p-4 text-sm font-mono text-slate-800 dark:text-slate-300 focus:ring-0 outline-none placeholder-slate-400 dark:placeholder-slate-600"
                placeholder="Enter standard input here..."
                spellCheck="false"
              />
            ) : (
              <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                {!output && !executionResult && (
                  <div className="text-slate-400 dark:text-slate-600 h-full flex flex-col items-center justify-center space-y-2">
                    <Terminal className="w-8 h-8 opacity-20" />
                    <span className="italic">Run your code to see the output</span>
                  </div>
                )}
                
                {executionResult?.status && executionResult.status !== "ACCEPTED" && (
                  <div className="mb-4 inline-flex items-center px-2.5 py-1.5 rounded bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-wide uppercase">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    {executionResult.status.replace(/_/g, ' ')}
                  </div>
                )}

                {executionResult?.status === "ACCEPTED" && (
                  <div className="mb-4 inline-flex items-center px-2.5 py-1.5 rounded bg-emerald-50 dark:bg-primary/10 border border-emerald-200 dark:border-primary/20 text-emerald-600 dark:text-primary text-xs font-bold tracking-wide uppercase">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    SUCCESS
                  </div>
                )}

                <pre className={`whitespace-pre-wrap break-words ${executionResult?.status === "ACCEPTED" ? "text-slate-800 dark:text-slate-300" : "text-rose-600 dark:text-rose-400"}`}>
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

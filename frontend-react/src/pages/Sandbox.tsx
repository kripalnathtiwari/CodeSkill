import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Terminal, Loader2, AlertTriangle, CheckCircle, Clock, Cpu, Maximize2, Minimize2, Sun, Moon } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const LANGUAGES = [
  { id: "python", name: "Python", defaultCode: "print('Hello, TeachSkill!')" },
  { id: "javascript", name: "JavaScript", defaultCode: "console.log('Hello, TeachSkill!');" },
  { id: "typescript", name: "TypeScript", defaultCode: "const msg: string = 'Hello, TeachSkill!';\nconsole.log(msg);" },
  { id: "java", name: "Java", defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, TeachSkill!");\n    }\n}' },
  { id: "cpp", name: "C++", defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, TeachSkill!" << std::endl;\n    return 0;\n}' },
  { id: "c", name: "C", defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello, TeachSkill!\\n");\n    return 0;\n}' },
  { id: "go", name: "Go", defaultCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, TeachSkill!")\n}' },
  { id: "rust", name: "Rust", defaultCode: 'fn main() {\n    println!("Hello, TeachSkill!");\n}' },
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
      
      const res = await axios.post("http://localhost:5000/api/v1/submissions/run", {
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
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 max-w-[1600px] mx-auto w-full gap-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-slate-50 flex items-center">
            <Terminal className="mr-2 text-emerald-400 h-6 w-6" />
            TeachSkill Compiler
          </h1>
          <p className="text-slate-700 dark:text-slate-400 text-sm mt-1">Write, compile, and run your code instantly.</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select 
            value={language.id}
            onChange={handleLanguageChange}
            className="bg-white dark:bg-slate-900 border border-slate-700 text-slate-950 dark:text-slate-100 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 outline-none transition-colors"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-emerald-900/20 whitespace-nowrap"
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            <span>{isExecuting ? "Running..." : "Run Code"}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Editor vs I/O */}
      <div className={
        isFullscreen
          ? "fixed inset-0 z-50 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row gap-4 w-full h-full overflow-hidden"
          : "flex-1 flex flex-col lg:flex-row gap-4 min-h-0 w-full overflow-hidden"
      }>
        
        {/* Editor Pane (Resizable) */}
        <div className="flex-[2] glass-card rounded-xl border border-slate-200 dark:border-slate-800/60 overflow-hidden flex flex-col resize-x min-w-[300px] max-w-[80vw]">
          <div className="bg-white dark:bg-slate-900/80 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-700 dark:text-slate-400 font-mono">
            <div className="flex items-center space-x-4">
              <span>main.{language.id === "javascript" ? "js" : language.id === "typescript" ? "ts" : language.id}</span>
              
              {isFullscreen && (
                <div className="flex items-center space-x-2 ml-2 border-l border-slate-300 dark:border-slate-700 pl-4">
                  <select 
                    value={language.id}
                    onChange={handleLanguageChange}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-slate-100 text-xs rounded focus:ring-emerald-500 focus:border-emerald-500 block p-1.5 outline-none transition-colors"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleRunCode}
                    disabled={isExecuting}
                    className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-semibold transition-all"
                  >
                    {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
                    <span>{isExecuting ? "Running" : "Run"}</span>
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsEditorDark(!isEditorDark)}
                className="hover:text-emerald-500 transition-colors flex items-center space-x-1.5"
                title="Toggle Editor Theme"
              >
                {isEditorDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="hidden sm:inline font-semibold">{isEditorDark ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hover:text-emerald-500 transition-colors flex items-center space-x-1.5"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span className="hidden sm:inline font-semibold">{isFullscreen ? "Minimize" : "Maximize"}</span>
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
                fontSize: 18,
                fontWeight: "600",
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                lineHeight: 30,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
              }}
            />
          </div>
        </div>

        {/* Input/Output Pane (Tabbed) */}
        <div className="flex-1 flex flex-col min-w-[300px] glass-card rounded-xl border border-slate-200 dark:border-slate-800/60 overflow-hidden relative">
          <div className="bg-white dark:bg-slate-900/80 px-4 pt-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-end text-xs font-mono">
            <div className="flex space-x-6">
              <button 
                onClick={() => setIoTab("input")}
                className={`pb-2 border-b-2 transition-colors ${ioTab === "input" ? "border-emerald-500 text-emerald-500 font-bold" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Standard Input
              </button>
              <button 
                onClick={() => setIoTab("output")}
                className={`pb-2 border-b-2 transition-colors flex items-center ${ioTab === "output" ? "border-emerald-500 text-emerald-500 font-bold" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Execution Output
                {executionResult && <span className={`ml-2 w-2 h-2 rounded-full ${executionResult.status === "ACCEPTED" ? "bg-emerald-500" : "bg-rose-500"}`}></span>}
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

          <div className="flex-1 overflow-hidden flex flex-col bg-black/5 dark:bg-black/20">
            {ioTab === "input" ? (
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 w-full bg-transparent border-none resize-none p-4 text-sm font-mono text-slate-900 dark:text-slate-200 focus:ring-0 outline-none placeholder-slate-400 dark:placeholder-slate-600"
                placeholder="Enter custom input here..."
                spellCheck="false"
              />
            ) : (
              <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                {!output && !executionResult && (
                  <div className="text-slate-500 h-full flex items-center justify-center italic">
                    Run your code to see the output here.
                  </div>
                )}
                
                {executionResult?.status && executionResult.status !== "ACCEPTED" && (
                  <div className="mb-3 inline-flex items-center px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-bold tracking-wide uppercase">
                    <AlertTriangle className="h-3 w-3 mr-1.5" />
                    {executionResult.status.replace(/_/g, ' ')}
                  </div>
                )}

                {executionResult?.status === "ACCEPTED" && (
                  <div className="mb-3 inline-flex items-center px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
                    <CheckCircle className="h-3 w-3 mr-1.5" />
                    SUCCESS
                  </div>
                )}

                <pre className={`whitespace-pre-wrap break-words ${executionResult?.status === "ACCEPTED" ? "text-slate-900 dark:text-slate-200" : "text-rose-500 dark:text-rose-400"}`}>
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

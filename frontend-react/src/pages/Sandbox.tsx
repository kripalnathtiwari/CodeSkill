import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2, RefreshCw, Share2, Save, Download, Maximize, Circle } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../utils/apiConfig";

const LANGUAGES = [
  { id: "c", name: "C", ext: "c", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg", defaultCode: '#include <stdio.h>\n\nint main() {\n    // Online Free C compiler to run C program online\n    printf("Welcome to CodeSkill Compiler");\n    return 0;\n}' },
  { id: "cpp", name: "C++", ext: "cpp", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg", defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Welcome to CodeSkill Compiler" << std::endl;\n    return 0;\n}' },
  { id: "java", name: "Java", ext: "java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg", defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Welcome to CodeSkill Compiler");\n    }\n}' },
  { id: "python", name: "Python", ext: "py", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", defaultCode: 'print("Welcome to CodeSkill Compiler")' },
  { id: "javascript", name: "JavaScript", ext: "js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", defaultCode: 'console.log("Welcome to CodeSkill Compiler");' },
  { id: "typescript", name: "TypeScript", ext: "ts", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg", defaultCode: 'const msg: string = "Welcome to CodeSkill Compiler";\nconsole.log(msg);' },
  { id: "go", name: "Go", ext: "go", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg", defaultCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Welcome to CodeSkill Compiler")\n}' },
  { id: "rust", name: "Rust", ext: "rs", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg", defaultCode: 'fn main() {\n    println!("Welcome to CodeSkill Compiler");\n}' },
];

export default function SandboxPage() {
  const { user } = useAuth();
  
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(language.defaultCode);
  const [input, setInput] = useState("1");
  const [output, setOutput] = useState("Welcome to CodeSkill Compiler\nHappy Coding! 🎉");
  const [isExecuting, setIsExecuting] = useState(false);

  const handleLanguageChange = (lang: any) => {
    setLanguage(lang);
    setCode(lang.defaultCode);
    setOutput("");
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setOutput("Compiling...");

    try {
      const headers = user ? { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } : {};
      
      const res = await axios.post(getApiUrl("/api/v1/submissions/run"), {
        code,
        language: language.id,
        input,
      }, { headers });

      const { status, output: stdout, error } = res.data;
      
      if (status === "ACCEPTED") {
        setOutput(stdout || "Execution completed with no output.");
      } else {
        setOutput(error || stdout || "Execution failed.");
      }
    } catch (err: any) {
      setOutput(err.response?.data?.error || err.message || "Failed to execute code.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#f8f9fa] overflow-hidden font-sans">
      {/* Top Navbar */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
            <span className="text-orange-500 font-bold text-lg">C</span>
          </div>
          <span className="font-bold text-lg text-slate-800 ml-1">CodeSkill</span>
          <span className="text-gray-500 text-sm ml-2 mt-1">{language.name} Compiler</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar for Languages */}
        <div className="w-16 flex flex-col items-center py-4 space-y-4 bg-[#f8f9fa] border-r border-gray-200 shrink-0 overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                language.id === lang.id
                  ? "bg-[#FFE4CC] border-2 border-orange-200"
                  : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
              title={lang.name}
            >
              <img src={lang.icon} alt={lang.name} className="w-7 h-7" />
            </button>
          ))}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Editor Header Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 px-3 py-1.5 border-b-2 border-orange-500 text-sm font-medium text-slate-700 bg-white translate-y-[1px]">
                <span>main.{language.ext}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              </div>
              <button className="ml-2 w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
                +
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-gray-200 rounded hover:bg-gray-50">
                Files
              </button>
              
              <div className="flex items-center space-x-2 text-gray-500">
                <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><RefreshCw className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Share2 className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Save className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Download className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Maximize className="w-4 h-4" /></button>
              </div>

              <button
                onClick={handleRunCode}
                disabled={isExecuting}
                className="ml-2 flex items-center space-x-1.5 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-70 text-white px-5 py-2 rounded font-semibold text-sm transition-colors shadow-sm"
              >
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
                <span>Compile</span>
              </button>
            </div>
          </div>
          
          {/* Monaco Editor Container */}
          <div className="flex-1 w-full bg-[#FFFdf0]">
            <Editor
              height="100%"
              language={language.id === "c" || language.id === "cpp" ? "cpp" : language.id}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Consolas', 'Courier New', monospace",
                lineHeight: 22,
                scrollBeyondLastLine: false,
                renderLineHighlight: "none",
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                scrollbar: {
                  useShadows: false,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                  vertical: "visible",
                  horizontal: "visible"
                }
              }}
            />
          </div>
        </div>

        {/* Right I/O Split Pane */}
        <div className="w-[300px] lg:w-[400px] flex flex-col bg-[#f8f9fa] border-l border-gray-200 shrink-0">
          
          {/* Input Section */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-gray-200">
            <div className="px-4 py-2.5 bg-white border-b border-gray-200 flex items-center rounded-tl-md">
              <span className="text-[15px] text-slate-800">Input</span>
              <span className="text-gray-400 text-xs ml-2">[Please input, b...</span>
            </div>
            <div className="flex-1 bg-white p-2 overflow-hidden">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full bg-[#FCFAEF] border-none resize-none p-3 text-sm font-mono text-[#000080] focus:ring-0 outline-none"
                spellCheck="false"
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2.5 bg-white border-b border-gray-200 border-t-8 border-[#f8f9fa]">
              <span className="text-[15px] text-slate-800">Output</span>
            </div>
            <div className="flex-1 bg-white p-4 overflow-y-auto">
              <pre className="font-mono text-sm whitespace-pre-wrap break-words text-slate-700">
                {output}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

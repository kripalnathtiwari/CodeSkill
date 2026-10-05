import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2, RefreshCw, Save, Download, Maximize, Minimize, Circle, Sun, Moon, X } from "lucide-react";
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
  const [tabs, setTabs] = useState([{ id: "1", name: `main.${LANGUAGES[0].ext}`, code: LANGUAGES[0].defaultCode }]);
  const [activeTabId, setActiveTabId] = useState("1");
  const [input, setInput] = useState("1");
  
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const code = activeTab.code;

  const setCode = (newCode: string) => {
    setTabs(tabs.map(t => t.id === activeTabId ? { ...t, code: newCode } : t));
  };
  const [output, setOutput] = useState("Welcome to CodeSkill Compiler\nHappy Coding! 🎉");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isEditorDark, setIsEditorDark] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Check initial dark mode from document
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsEditorDark(true);
    }
    
    // Optional: observe class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsEditorDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleLanguageChange = (lang: any) => {
    setLanguage(lang);
    setTabs([{ id: "1", name: `main.${lang.ext}`, code: lang.defaultCode }]);
    setActiveTabId("1");
    setOutput("");
  };

  const handleAddTab = () => {
    const newId = Date.now().toString();
    const newName = `file${tabs.length + 1}.${language.ext}`;
    setTabs([...tabs, { id: newId, name: newName, code: "" }]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // don't close last tab
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
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

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `main.${language.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    if (window.confirm("Are you sure you want to reset the code to default?")) {
      setCode(language.defaultCode);
      setOutput("");
    }
  };

  return (
    <div className={`flex flex-col w-full bg-[#f8f9fa] dark:bg-[#0f111a] overflow-hidden font-sans transition-all ${
      isMaximized ? "fixed inset-0 z-[100] h-screen" : "h-[calc(100vh-64px)]"
    }`}>
      {/* Top Navbar */}
      <div className="flex items-center px-4 py-3 bg-white dark:bg-[#1a1d27] border-b border-gray-200 dark:border-[#2d313f] transition-colors">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="CodeSkill Logo" className="h-8 w-8 object-contain" />
          <span className="font-bold text-lg text-slate-800 dark:text-slate-100 ml-1">Code<span className="text-primary">Skill</span></span>
          <span className="text-gray-500 dark:text-slate-400 text-sm ml-2 mt-1 hidden sm:block">{language.name} Compiler</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar for Languages */}
        <div className="w-16 flex flex-col items-center py-4 space-y-4 bg-[#f8f9fa] dark:bg-[#0f111a] border-r border-gray-200 dark:border-[#2d313f] shrink-0 overflow-y-auto transition-colors">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                language.id === lang.id
                  ? "bg-[#FFE4CC] dark:bg-orange-500/20 border-2 border-orange-200 dark:border-orange-500/50"
                  : "bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-[#2d313f] hover:bg-gray-50 dark:hover:bg-slate-800"
              }`}
              title={lang.name}
            >
              <img src={lang.icon} alt={lang.name} className="w-7 h-7" />
            </button>
          ))}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#1e2230] transition-colors">
          {/* Editor Header Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-[#2d313f] bg-white dark:bg-[#1a1d27]">
            <div className="flex items-center overflow-x-auto max-w-[60vw] hide-scrollbar">
              {tabs.map(tab => (
                <div 
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 border-b-2 text-sm font-medium cursor-pointer translate-y-[1px] transition-colors shrink-0 ${
                    activeTabId === tab.id 
                      ? "border-orange-500 text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1e2230]" 
                      : "border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{tab.name}</span>
                  {activeTabId === tab.id && <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500"></span>}
                  {tabs.length > 1 && (
                    <button 
                      onClick={(e) => handleCloseTab(e, tab.id)}
                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={handleAddTab}
                title="New File"
                className="ml-2 w-7 h-7 shrink-0 flex items-center justify-center bg-white dark:bg-[#1e2230] border border-gray-200 dark:border-[#2d313f] rounded text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                +
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1e2230] border border-gray-200 dark:border-[#2d313f] rounded hover:bg-gray-50 dark:hover:bg-slate-800">
                Files
              </button>
              
              <div className="flex items-center space-x-2 text-gray-500 dark:text-slate-400">
                <button onClick={handleRefresh} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors" title="Reset Code"><RefreshCw className="w-4 h-4" /></button>
                <button onClick={handleDownload} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors" title="Download Code"><Download className="w-4 h-4" /></button>
                <button 
                  onClick={() => setIsEditorDark(!isEditorDark)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title="Toggle Editor Theme"
                >
                  {isEditorDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title={isMaximized ? "Minimize" : "Maximize"}
                >
                  {isMaximized ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={handleRunCode}
                disabled={isExecuting}
                className="ml-2 flex items-center space-x-1.5 bg-primary hover:bg-primary/90 disabled:opacity-70 text-white px-5 py-2 rounded font-semibold text-sm transition-colors shadow-sm"
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
          <div className="flex-1 w-full bg-[#FFFdf0] dark:bg-[#1e2230]">
            <Editor
              height="100%"
              language={language.id === "c" || language.id === "cpp" ? "cpp" : language.id}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme={isEditorDark ? "vs-dark" : "light"}
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
        <div className="w-[300px] lg:w-[400px] flex flex-col bg-[#f8f9fa] dark:bg-[#0f111a] border-l border-gray-200 dark:border-[#2d313f] shrink-0 transition-colors">
          
          {/* Input Section */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-gray-200 dark:border-[#2d313f]">
            <div className="px-4 py-2.5 bg-white dark:bg-[#1a1d27] border-b border-gray-200 dark:border-[#2d313f] flex items-center rounded-tl-md">
              <span className="text-[15px] text-slate-800 dark:text-slate-200">Input</span>
              <span className="text-gray-400 dark:text-slate-500 text-xs ml-2">[Please input, b...</span>
            </div>
            <div className="flex-1 bg-white dark:bg-[#1e2230] p-2 overflow-hidden">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full bg-[#FCFAEF] dark:bg-[#1e2230] border-none resize-none p-3 text-sm font-mono text-[#000080] dark:text-slate-300 focus:ring-0 outline-none"
                spellCheck="false"
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2.5 bg-white dark:bg-[#1a1d27] border-b border-gray-200 dark:border-[#2d313f] border-t-8 border-[#f8f9fa] dark:border-t-[#0f111a]">
              <span className="text-[15px] text-slate-800 dark:text-slate-200">Output</span>
            </div>
            <div className="flex-1 bg-white dark:bg-[#1e2230] p-4 overflow-y-auto">
              <pre className="font-mono text-sm whitespace-pre-wrap break-words text-slate-700 dark:text-slate-300">
                {output}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

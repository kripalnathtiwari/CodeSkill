import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../../utils/apiConfig";
import {
  Plus, Edit, Trash2, Search, Code2, Wand2, Loader2,
  X, Save, ArrowLeft, Lock, AlertTriangle, Upload, FileJson, FileText
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function ProblemManagement() {
  const [problems, setProblems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // AI Generator State
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [genTopic, setGenTopic] = useState("Arrays");
  const [genDifficulty, setGenDifficulty] = useState("Medium");
  const [genCount, setGenCount] = useState("5");
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        const text = await file.text();
        const rawParsed = JSON.parse(text);
        const parsed = Array.isArray(rawParsed) ? rawParsed[0] : rawParsed;
        
        if (!parsed) {
          alert("Empty or invalid JSON file!");
          setIsUploading(false);
          return;
        }

        // Extract root data or nested question data
        const qData = parsed.question || parsed.problem || parsed;

        // Pre-fill the form with the parsed JSON data for cross-checking
        setTitle(qData.title || qData.name || "");
        setDifficulty(qData.difficulty || qData.level || "Easy");
        setDescription(qData.content || qData.description || qData.statement || qData.problemStatement || qData.problem_statement || qData.body || qData.text || "");
        
        const tags = qData.topicTags || qData.tags || [];
        setTopics(Array.isArray(tags) ? tags.map((t: any) => t.name || t).join(", ") : (typeof tags === "string" ? tags : ""));
        
        const co = qData.companyTags || qData.companies || [];
        setCompanies(Array.isArray(co) ? co.map((t: any) => t.name || t).join(", ") : (typeof co === "string" ? co : ""));
        
        const sc = qData.starterCode || qData.defaultCode || qData.boilerPlate || {};
        setStarterCodes({
          javascript: sc.javascript || sc.js || "",
          cpp: sc.cpp || sc["c++"] || "",
          python: sc.python || sc.py || sc.python3 || "",
          java: sc.java || ""
        });
        
        // Extract and aggregate all test cases
        const allTestCases: {input: string, output: string, isHidden: boolean}[] = [];
        
        const mapTC = (arr: any[], defaultHidden: boolean) => {
          if (!Array.isArray(arr)) return;
          arr.forEach(t => {
             let inp = t.input ?? t.in ?? "";
             let out = t.output ?? t.out ?? t.expected ?? "";
             
             if (typeof t !== "object") {
                inp = String(t);
                out = "";
             } else {
                if (typeof inp !== "string") inp = JSON.stringify(inp);
                if (typeof out !== "string") out = JSON.stringify(out);
             }
             
             // Only add if there is at least some input or output
             if (inp || out) {
               allTestCases.push({
                 input: inp,
                 output: out,
                 isHidden: t.isHidden !== undefined ? Boolean(t.isHidden) : defaultHidden
               });
             }
          });
        };

        // Standard/mixed array
        mapTC(parsed.testCases || parsed.tests || qData.testCases || qData.tests, false);
        
        // Explicitly public/examples
        mapTC(parsed.examples || parsed.publicTestCases || parsed.public_testcases || qData.examples || qData.publicTestCases || qData.public_testcases, false);
        
        // Explicitly hidden
        mapTC(parsed.hiddenTestCases || parsed.hidden_testcases || parsed.privateTestCases || qData.hiddenTestCases || qData.hidden_testcases || qData.privateTestCases, true);
        
        setTestCases(allTestCases);
        
        setEditingProblem(null);
        setIsCreating(true);
        setShowUploadModal(false);
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        if (!apiKey) {
          alert("Please provide a Gemini API Key to parse PDF files into structured questions.");
          setIsUploading(false);
          return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
        }

        const prompt = `Extract DSA (Data Structures and Algorithms) coding problems from the following text and format them as a JSON array. 
        Each object must have exactly these fields: {title, difficulty (Easy/Medium/Hard), content (Markdown description), topicTags:[{name}], companyTags:[{name}], defaultCode}. 
        Here is the text:\n\n${fullText.substring(0, 15000)}`;
        
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          contents: [{ parts: [{ text: prompt }] }]
        });
        
        const textResponse = response.data.candidates[0].content.parts[0].text;
        const cleaned = textResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned).map((p: any) => ({
          ...p,
          _id: "custom-uploaded-pdf-" + Date.now() + Math.random().toString(36).substr(2, 9),
          acRate: 0, status: "Unsolved",
          starterCode: { javascript: p.defaultCode || "// write here", cpp: "// write here", python: "# write here", java: "// write here" }
        }));
        
        const saved = localStorage.getItem("admin_custom_problems");
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem("admin_custom_problems", JSON.stringify([...existing, ...parsed]));
        setProblems(prev => [...prev, ...parsed]);
        setShowUploadModal(false);
        alert(`Successfully parsed and imported ${parsed.length} problems from PDF!`);
      } else {
        alert("Unsupported file format. Please upload a JSON or PDF file.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error processing file. " + (e.message || ""));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  // Form State
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState("");
  const [companies, setCompanies] = useState("");
  const [starterCodes, setStarterCodes] = useState<{ [key: string]: string }>({
    javascript: "",
    cpp: "",
    python: "",
    java: ""
  });
  const [testCases, setTestCases] = useState<{input: string, output: string, isHidden: boolean}[]>([]);

  const MOCK_PROBLEMS = [
    {
      _id: "p1", title: "Two Sum", slug: "two-sum", difficulty: "Easy",
      topicTags: [{ name: "Array" }, { name: "HashMap" }],
      content: "Given an integer array nums and an integer target, return the indices of the two numbers such that they add up to target.",
      starterCode: { javascript: "function twoSum(nums, target) {\n    return [];\n}", cpp: "#include <vector>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target){ return {}; }", python: "def twoSum(nums, target):\n    pass", java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}" },
    },
    { _id: "p2", title: "Add Two Numbers", difficulty: "Medium", topicTags: [{ name: "Linked List" }, { name: "Math" }] },
    { _id: "p3", title: "Median of Two Sorted Arrays", difficulty: "Hard", topicTags: [{ name: "Array" }, { name: "Binary Search" }] },
    { _id: "p4", title: "Longest Palindromic Substring", difficulty: "Medium", topicTags: [{ name: "String" }, { name: "DP" }] },
  ];

  useEffect(() => {
    axios.get(getApiUrl("/api/v1/questions?limit=50"))
      .then(res => {
        const fetched = res.data.questions || [];
        const saved = localStorage.getItem("admin_custom_problems");
        setProblems(saved ? [...fetched, ...JSON.parse(saved)] : fetched);
        setLoading(false);
      })
      .catch(() => {
        const saved = localStorage.getItem("admin_custom_problems");
        setProblems(saved ? [...MOCK_PROBLEMS, ...JSON.parse(saved)] : MOCK_PROBLEMS);
        setLoading(false);
      });
  }, []);

  const isCustomProblem = (id: string) => id?.toString().startsWith("custom-");

  const resetForm = () => {
    setTitle(""); setDifficulty("Easy"); setDescription("");
    setTopics(""); setCompanies("");
    setStarterCodes({ javascript: "", cpp: "", python: "", java: "" });
    setTestCases([]);
  };

  const openCreate = () => {
    resetForm();
    setEditingProblem(null);
    setIsCreating(true);
  };

  const openEdit = (problem: any) => {
    setTitle(problem.title || "");
    setDifficulty(problem.difficulty || "Easy");
    setDescription(problem.content || problem.description || problem.statement || "");
    const tags = problem.topicTags || problem.tags || [];
    setTopics(Array.isArray(tags) ? tags.map((t: any) => t.name || t).join(", ") : tags);
    const co = problem.companyTags || [];
    setCompanies(Array.isArray(co) ? co.map((t: any) => t.name || t).join(", ") : co);
    const sc = problem.starterCode || {};
    setStarterCodes({
      javascript: sc.javascript || sc.js || "",
      cpp: sc.cpp || "",
      python: sc.python || sc.py || "",
      java: sc.java || "",
      ...sc
    });
    const tc = problem.testCases || problem.tests || problem.examples || [];
    setTestCases(Array.isArray(tc) ? tc.map((t: any) => ({
      input: t.input || "",
      output: t.output || "",
      isHidden: t.isHidden || false
    })) : []);
    setEditingProblem(problem);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!title || !description) return alert("Title and description are required!");

    const updatedProblem = {
      title, difficulty, content: description,
      topicTags: topics.split(",").map(t => ({ name: t.trim() })).filter(t => t.name),
      companyTags: companies.split(",").map(t => ({ name: t.trim() })).filter(t => t.name),
      starterCode: starterCodes,
      testCases: testCases.filter(t => t.input && t.output)
    };

    if (editingProblem) {
      // UPDATE: works for both custom AND default problems (store override in localStorage)
      const savedCustom = localStorage.getItem("admin_custom_problems");
      const existing: any[] = savedCustom ? JSON.parse(savedCustom) : [];
      const idx = existing.findIndex((p: any) => p._id === editingProblem._id);
      if (idx >= 0) {
        // Already in custom list — update it
        existing[idx] = { ...existing[idx], ...updatedProblem };
      } else {
        // Default/backend problem — save as override with same ID
        existing.push({ ...editingProblem, ...updatedProblem, _id: editingProblem._id });
      }
      localStorage.setItem("admin_custom_problems", JSON.stringify(existing));
      setProblems(prev => prev.map(p => p._id === editingProblem._id ? { ...p, ...updatedProblem } : p));
    } else {
      // CREATE new problem
      const newProblem = {
        _id: "custom-" + Date.now(),
        ...updatedProblem,
        acRate: 0, status: "Unsolved",
      };
      const savedCustom = localStorage.getItem("admin_custom_problems");
      const existing = savedCustom ? JSON.parse(savedCustom) : [];
      const updated = [...existing, newProblem];
      localStorage.setItem("admin_custom_problems", JSON.stringify(updated));
      setProblems(prev => [...prev, newProblem]);
    }

    setIsCreating(false);
    setEditingProblem(null);
    resetForm();
  };


  const handleCancel = () => {
    setIsCreating(false);
    setEditingProblem(null);
    resetForm();
  };

  const filtered = problems.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    if (isCustomProblem(deleteConfirmId)) {
      const saved = localStorage.getItem("admin_custom_problems");
      if (saved) {
        const updated = JSON.parse(saved).filter((p: any) => p._id !== deleteConfirmId);
        localStorage.setItem("admin_custom_problems", JSON.stringify(updated));
        setProblems(prev => prev.filter(p => p._id !== deleteConfirmId));
      }
    }
    setDeleteConfirmId(null);
  };

  const handleGenerate = async () => {
    if (!genTopic || !genCount) return alert("Topic and Count are required!");
    setIsGenerating(true);

    if (!apiKey) {
      setTimeout(() => {
        const mockGenerated = Array.from({ length: Math.min(Number(genCount), 10) }).map((_, i) => ({
          _id: "custom-ai-mock-" + Date.now() + i,
          title: `${genDifficulty} ${genTopic} Challenge ${i + 1}`,
          difficulty: genDifficulty,
          content: `This is an AI-generated problem about **${genTopic}**.`,
          topicTags: [{ name: genTopic }],
          companyTags: [{ name: "Google" }],
          starterCode: { javascript: "// write your solution here", cpp: "// write your solution here", python: "# write your solution here" },
          acRate: 0, status: "Unsolved",
        }));
        const saved = localStorage.getItem("admin_custom_problems");
        const existing = saved ? JSON.parse(saved) : [];
        const updated = [...existing, ...mockGenerated];
        localStorage.setItem("admin_custom_problems", JSON.stringify(updated));
        setProblems(prev => [...prev, ...mockGenerated]);
        setShowGeneratorModal(false);
        setIsGenerating(false);
        alert(`Generated ${mockGenerated.length} mock problems! (Add Gemini API Key for real ones)`);
      }, 2000);
      return;
    }

    try {
      const prompt = `Generate ${genCount} unique coding problems about "${genTopic}" at "${genDifficulty}" difficulty. Return raw JSON array. Each object: {title, difficulty, content, topicTags:[{name}], companyTags:[{name}], defaultCode, testCases: [{input: "string", output: "string", isHidden: boolean}]}`;
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        contents: [{ parts: [{ text: prompt }] }]
      });
      const text = response.data.candidates[0].content.parts[0].text;
      const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned).map((p: any) => ({
        ...p,
        _id: "custom-ai-" + Date.now() + Math.random().toString(36).substr(2, 9),
        acRate: 0, status: "Unsolved",
        starterCode: { javascript: p.defaultCode || "// write here", cpp: "// write here", python: "# write here" },
        testCases: p.testCases || []
      }));
      const saved = localStorage.getItem("admin_custom_problems");
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem("admin_custom_problems", JSON.stringify([...existing, ...parsed]));
      setProblems(prev => [...prev, ...parsed]);
      setShowGeneratorModal(false);
      alert(`Successfully generated ${parsed.length} problems!`);
    } catch (e) {
      alert("Failed to generate. Check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Editor / Create View ────────────────────────────────────────────────
  if (isCreating) {
    const isEditMode = !!editingProblem;

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button onClick={handleCancel} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEditMode ? "Edit Problem" : "Add New Problem"}
              </h2>
              <p className="text-slate-400 text-sm">
                {isEditMode ? "Update the problem details and save." : "Fill in the fields to create a new problem."}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleCancel} className="px-5 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-colors">
              <Save className="w-4 h-4" />
              <span>{isEditMode ? "Save Changes" : "Create Problem"}</span>
            </button>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-[#111827] rounded-3xl p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Problem Title *</label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Merge K Sorted Lists"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Difficulty</label>
              <select
                value={difficulty} onChange={e => setDifficulty(e.target.value)}
                className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Problem Description * (Markdown supported)</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              rows={6}
              className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm resize-none"
              placeholder="Write the problem statement, input/output format, constraints, and examples..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Topic Tags (comma separated)</label>
              <input
                type="text" value={topics} onChange={e => setTopics(e.target.value)}
                className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                placeholder="Array, Dynamic Programming"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Company Tags (comma separated)</label>
              <input
                type="text" value={companies} onChange={e => setCompanies(e.target.value)}
                className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                placeholder="Google, Amazon, Meta"
              />
            </div>
          </div>

          {/* Starter Code Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Starter Code</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const lang = prompt("Enter new language name (e.g., java, ruby, go):");
                    if (lang && lang.trim()) {
                      const formattedLang = lang.trim().toLowerCase();
                      if (!starterCodes[formattedLang]) {
                        setStarterCodes(prev => ({ ...prev, [formattedLang]: "" }));
                      } else {
                        alert("Language already exists!");
                      }
                    }
                  }}
                  className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Language</span>
                </button>
                <button
                  onClick={async () => {
                    if (!title) return alert("Please enter a Problem Title first!");
                    
                    let currentKey = apiKey;
                    if (!currentKey) {
                        currentKey = window.prompt("Please enter your Gemini API Key to generate starter code:") || "";
                        if (!currentKey) return;
                        setApiKey(currentKey);
                    }

                    setIsGenerating(true);
                    try {
                      const prompt = `Generate starter code templates for a DSA problem titled "${title}". 
                      ${description ? `Problem Description: ${description.substring(0, 500)}` : ""}
                      Return ONLY a JSON object with keys as languages (e.g., "javascript", "cpp", "python", "java"). The values should be the raw starter code for the problem. Do not wrap the JSON in markdown blocks.`;
                      
                      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentKey}`, {
                        contents: [{ parts: [{ text: prompt }] }]
                      });
                      
                      const textResponse = response.data.candidates[0].content.parts[0].text;
                      const cleaned = textResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
                      const parsed = JSON.parse(cleaned);
                      
                      if (parsed && typeof parsed === "object") {
                        setStarterCodes(prev => ({ ...prev, ...parsed }));
                      }
                      
                    } catch (e) {
                      alert("Failed to generate starter code. Check API key or try again.");
                      console.error(e);
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  disabled={isGenerating}
                  className="flex items-center space-x-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  <span>Auto Generate Code</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(starterCodes).map(([lang, code]) => (
                <div key={lang} className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-500 capitalize">{lang}</label>
                    <button 
                      onClick={() => {
                        const newCodes = { ...starterCodes };
                        delete newCodes[lang];
                        setStarterCodes(newCodes);
                      }}
                      className="text-slate-500 hover:text-rose-500 transition-colors"
                      title="Remove language"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={code} onChange={e => setStarterCodes(prev => ({ ...prev, [lang]: e.target.value }))}
                    rows={5}
                    className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs resize-none"
                    placeholder={`Write starter code for ${lang}...`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Test Cases Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Test Cases</h3>
              <button
                onClick={() => setTestCases([...testCases, { input: "", output: "", isHidden: false }])}
                className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test Case</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div key={idx} className="bg-[#1a2333] border border-slate-700 rounded-xl p-4 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Case {idx + 1}</span>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={e => {
                            const newTc = [...testCases];
                            newTc[idx].isHidden = e.target.checked;
                            setTestCases(newTc);
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-800"
                        />
                        <span>Hidden Test</span>
                      </label>
                      <button 
                        onClick={() => {
                          const newTc = [...testCases];
                          newTc.splice(idx, 1);
                          setTestCases(newTc);
                        }}
                        className="text-slate-500 hover:text-rose-500 transition-colors p-1"
                        title="Remove Test Case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Input</label>
                      <textarea
                        value={tc.input}
                        onChange={e => {
                          const newTc = [...testCases];
                          newTc[idx].input = e.target.value;
                          setTestCases(newTc);
                        }}
                        rows={2}
                        className="w-full bg-[#0a1128] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm resize-y min-h-[60px]"
                        placeholder="e.g. nums = [2,7,11,15], target = 9"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Expected Output</label>
                      <textarea
                        value={tc.output}
                        onChange={e => {
                          const newTc = [...testCases];
                          newTc[idx].output = e.target.value;
                          setTestCases(newTc);
                        }}
                        rows={2}
                        className="w-full bg-[#0a1128] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm resize-y min-h-[60px]"
                        placeholder="e.g. [0,1]"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {testCases.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-800 rounded-xl">
                  <p className="text-sm text-slate-500">No test cases added yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Uploaded test cases will appear here, or you can add them manually.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── List View ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Coding Problems</h2>
          <p className="text-slate-400">Manage sandbox coding challenges and their test cases.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all custom uploaded and generated problems?")) {
                localStorage.removeItem("admin_custom_problems");
                setProblems(problems.filter(p => !isCustomProblem(p._id || p.id)));
              }
            }}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)]"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear Custom</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Questions</span>
          </button>
          <button
            onClick={() => setShowGeneratorModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <Wand2 className="w-5 h-5" />
            <span>AI Auto-Generator</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-5 h-5" />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="relative w-80">
            <input
              type="text" placeholder="Search problems..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1a2333] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          <span className="text-sm font-medium text-slate-400">Total: {filtered.length} problems</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1a2333] text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading problems...</td></tr>
              ) : filtered.map((problem, idx) => (
                <tr key={problem._id || problem.id || `fallback-key-${idx}`} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex items-center space-x-3">
                      <Code2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="line-clamp-1">{problem.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      problem.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                      problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                      "bg-rose-500/10 text-rose-500"
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {(problem.topicTags || []).slice(0, 2).map((tag: any, idx: number) => (
                        <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-md uppercase tracking-wider">
                          {tag.name || tag}
                        </span>
                      ))}
                      {(problem.topicTags?.length > 2) && <span className="text-xs text-slate-500">+{problem.topicTags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isCustomProblem(problem._id || problem.id)
                      ? <span className="text-xs px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-medium">Custom</span>
                      : <span className="text-xs px-2 py-1 rounded-md bg-slate-700 text-slate-400 font-medium">Default</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openEdit(problem)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title={isCustomProblem(problem._id || problem.id) ? "Edit Problem" : "View Problem (read-only)"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(problem._id || problem.id)}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Problem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No problems found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <button onClick={() => setDeleteConfirmId(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>

            {!isCustomProblem(deleteConfirmId) ? (
              <>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Protected Problem</h3>
                    <p className="mt-1 text-sm text-slate-400">This is a <span className="text-amber-400 font-semibold">default/backend problem</span> and cannot be deleted. Only custom problems you've created can be removed.</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Close</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Delete Problem?</h3>
                    <p className="mt-1 text-sm text-slate-400">This action is <span className="text-rose-400 font-semibold">permanent</span>. The problem will be removed immediately.</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                  <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-2 shadow-lg shadow-rose-500/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Problem</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload Questions Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Upload Questions</h3>
                  <p className="text-xs text-blue-300">Import PDF or JSON file</p>
                </div>
              </div>
              <button onClick={() => setShowUploadModal(false)} disabled={isUploading} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
               <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Gemini API Key (Required for PDF)</label>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="AIzaSy..." disabled={isUploading} />
              </div>
              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden">
                <input 
                  type="file" 
                  accept=".json,.pdf" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-slate-300 font-medium text-sm">Processing file...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex space-x-4 mb-4">
                      <FileJson className="w-10 h-10 text-amber-500 group-hover:scale-110 transition-transform" />
                      <FileText className="w-10 h-10 text-rose-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h4 className="text-white font-bold mb-1">Click or drag file to upload</h4>
                    <p className="text-xs text-slate-400 max-w-[200px]">Supports structured JSON files or unstructured PDF documents</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Problem Generator</h3>
                  <p className="text-xs text-indigo-300">Generate 100s of problems instantly</p>
                </div>
              </div>
              <button onClick={() => setShowGeneratorModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Topic</label>
                <input type="text" value={genTopic} onChange={e => setGenTopic(e.target.value)} className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Arrays, Dynamic Programming" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Difficulty</label>
                  <select value={genDifficulty} onChange={e => setGenDifficulty(e.target.value)} className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Count</label>
                  <input type="number" min="1" max="100" value={genCount} onChange={e => setGenCount(e.target.value)} className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Gemini API Key</label>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full bg-[#0a1128] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="AIzaSy..." />
                <p className="text-xs text-slate-500 mt-2">Your API key is used only locally in your browser.</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 bg-[#0a1128]/50 flex justify-end space-x-3">
              <button onClick={() => setShowGeneratorModal(false)} disabled={isGenerating} className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleGenerate} disabled={isGenerating} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all">
                {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><Wand2 className="w-5 h-5 mr-2" /> Generate Now</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

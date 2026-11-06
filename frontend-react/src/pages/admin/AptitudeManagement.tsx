import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL as API_URL } from "../../utils/apiConfig";
import {
  Plus, Edit, Trash2, Search, BrainCircuit, X, Save, ArrowLeft, AlertTriangle, Upload, FileJson, FileText, Lock, Loader2,
  Copy, Layers, CheckCircle2, FileUp, ListPlus, ChevronDown, ChevronRight, Minimize2, Maximize2
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Helper: robust local parser for extracting MCQs from raw text or PDFs
function parseQuestionsFromText(text: string, defaultTopic: string = "General Aptitude") {
  const cleanText = text.replace(/\r\n/g, "\n");
  const lines = cleanText.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  const questions: any[] = [];
  let currentQ: any = null;

  const isQuestionStart = (line: string) => {
    return /^(?:(?:Q|Question|Qns|Prob|Problem)\s*#?\s*\d*|\d+)[\.\)\-:]\s*(.+)/i.test(line);
  };

  const getQuestionText = (line: string) => {
    const m = line.match(/^(?:(?:Q|Question|Qns|Prob|Problem)\s*#?\s*\d*|\d+)[\.\)\-:]\s*(.+)/i);
    return m ? m[1].trim() : line;
  };

  const optionRegex = /^(?:[\(\[]?([A-Da-d1-4])[\)\]\.\-:]|\b([A-Da-d])\))\s*(.+)/;
  const answerRegex = /^(?:answer|ans|correct\s*(?:option|answer)?|solution)[\s:\-]*\(?([A-Da-d1-4])\)?/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isQuestionStart(line)) {
      if (currentQ && (currentQ.description || currentQ.title)) {
        questions.push(currentQ);
      }
      const qText = getQuestionText(line);
      currentQ = {
        _id: "apt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 7),
        title: qText.length > 70 ? qText.substring(0, 67) + "..." : qText,
        description: qText,
        difficulty: "Easy",
        topic: defaultTopic || "General Aptitude",
        options: { A: "", B: "", C: "", D: "" },
        correctOption: "",
        company: ""
      };
      continue;
    }

    if (!currentQ) {
      currentQ = {
        _id: "apt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 7),
        title: line.length > 70 ? line.substring(0, 67) + "..." : line,
        description: line,
        difficulty: "Easy",
        topic: defaultTopic || "General Aptitude",
        options: { A: "", B: "", C: "", D: "" },
        correctOption: "",
        company: ""
      };
      continue;
    }

    // Check for inline options like: A) 10  B) 20  C) 30  D) 40
    const inlineMatch = line.match(/(?:^|\s+)(?:[\(\[]?([A-Da-d])[\)\]\.\-:])\s*([^A-Da-d\(\)\[\]\n]+)/g);
    if (inlineMatch && inlineMatch.length >= 2) {
      inlineMatch.forEach(chunk => {
        const single = chunk.trim().match(/^[(\[]?([A-Da-d])[)\]\.\-:]\s*(.+)/);
        if (single) {
          const letter = single[1].toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(letter)) {
            currentQ.options[letter] = single[2].trim();
          }
        }
      });
      continue;
    }

    // Check for single option
    const optMatch = line.match(optionRegex);
    if (optMatch) {
      let letter = (optMatch[1] || optMatch[2]).toUpperCase();
      if (letter === '1') letter = 'A';
      if (letter === '2') letter = 'B';
      if (letter === '3') letter = 'C';
      if (letter === '4') letter = 'D';
      if (['A', 'B', 'C', 'D'].includes(letter)) {
        currentQ.options[letter] = optMatch[3].trim();
        continue;
      }
    }

    // Check for answer
    const ansMatch = line.match(answerRegex);
    if (ansMatch) {
      let letter = ansMatch[1].toUpperCase();
      if (letter === '1') letter = 'A';
      if (letter === '2') letter = 'B';
      if (letter === '3') letter = 'C';
      if (letter === '4') letter = 'D';
      if (['A', 'B', 'C', 'D'].includes(letter)) {
        currentQ.correctOption = letter;
        continue;
      }
    }

    // Otherwise, append to description if options haven't started
    if (!currentQ.options.A && !currentQ.options.B) {
      currentQ.description += " " + line;
      if (currentQ.title.endsWith("...")) {
        currentQ.title = currentQ.description.length > 70 ? currentQ.description.substring(0, 67) + "..." : currentQ.description;
      }
    }
  }

  if (currentQ && (currentQ.description || currentQ.title)) {
    questions.push(currentQ);
  }

  return questions;
}

export default function AptitudeManagement() {
  const [problems, setProblems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [creationTab, setCreationTab] = useState<"single" | "multiple" | "paste" | "upload">("single");
  const [editingProblem, setEditingProblem] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Bulk Review State
  const [isReviewingBulk, setIsReviewingBulk] = useState(false);
  const [pendingBulkQuestions, setPendingBulkQuestions] = useState<any[]>([]);
  const [bulkApplyTopic, setBulkApplyTopic] = useState("");

  // Topic Collapse / Minimize State
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  const toggleCollapse = (topicName: string) => {
    setCollapsedTopics(prev => ({
      ...prev,
      [topicName]: !prev[topicName]
    }));
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    Object.keys(groupedByTopic).forEach(t => {
      allCollapsed[t] = true;
    });
    setCollapsedTopics(allCollapsed);
  };

  const expandAll = () => {
    setCollapsedTopics({});
  };

  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTargetTopic, setUploadTargetTopic] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [pastedText, setPastedText] = useState("");

  // Single Form State
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [description, setDescription] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState("");

  // Multi-question Form State
  const [multiQuestions, setMultiQuestions] = useState<any[]>([
    {
      id: "q-1",
      title: "",
      difficulty: "Easy",
      description: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      company: "",
      topic: ""
    }
  ]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/aptitude-problems?limit=500`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const dataToMap = response.data.data || response.data;
      const parsedProblems = dataToMap.map((p: any) => {
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
          _id: p.id,
          options: opts,
          correctOption: p.correctAnswer || p.correctOption
        };
      });
      setProblems(parsedProblems);
    } catch (error) {
      console.error('Error fetching aptitude problems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, topicOverride?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const assignedTopic = topicOverride || uploadTargetTopic || topic || "General Aptitude";

    try {
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        const text = await file.text();
        const parsed = JSON.parse(text).map((p: any) => ({
          ...p,
          _id: "aptitude-" + Date.now() + Math.random().toString(36).substr(2, 9),
          topic: p.topic || assignedTopic,
          type: "MCQ",
          correctOption: p.correctOption || p.correctAnswer || ""
        }));
        
        setPendingBulkQuestions(parsed);
        setBulkApplyTopic(assignedTopic);
        setIsReviewingBulk(true);
        setShowUploadModal(false);
        setIsCreating(false);
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim() !== "");
        const parsed: any[] = [];
        const startIdx = lines[0].toLowerCase().includes("title") ? 1 : 0;
        for (let i = startIdx; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 7) {
            parsed.push({
              _id: "aptitude-" + Date.now() + Math.random().toString(36).substr(2, 9),
              title: cols[0],
              difficulty: cols[1] || "Easy",
              description: cols[2] || cols[0],
              options: {
                A: cols[3] || "",
                B: cols[4] || "",
                C: cols[5] || "",
                D: cols[6] || ""
              },
              correctOption: cols[7] ? cols[7].toUpperCase() : "",
              company: cols[8] || "",
              topic: cols[9] || assignedTopic,
              type: "MCQ"
            });
          }
        }
        setPendingBulkQuestions(parsed);
        setBulkApplyTopic(assignedTopic);
        setIsReviewingBulk(true);
        setShowUploadModal(false);
        setIsCreating(false);
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
        }

        if (!fullText.trim()) {
          alert("Could not extract any text from the PDF. It may be a scanned or image-only PDF.");
          setIsUploading(false);
          return;
        }

        let parsed: any[] = [];

        // If Gemini API Key provided, attempt AI parsing first
        if (apiKey.trim()) {
          try {
            const prompt = `Extract multiple choice aptitude/reasoning questions from the following text and format them as a JSON array. 
            Each object must have exactly these fields: {title, difficulty (Easy/Medium/Hard), description (string), options: {A, B, C, D}, correctOption (A/B/C/D), company (string, if mentioned, else empty string)}. 
            Here is the text:\n\n${fullText.substring(0, 15000)}`;
            
            const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
              contents: [{ parts: [{ text: prompt }] }]
            });
            
            const textResponse = response.data.candidates[0].content.parts[0].text;
            const cleaned = textResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
            parsed = JSON.parse(cleaned).map((p: any) => ({
              ...p,
              _id: "aptitude-pdf-" + Date.now() + Math.random().toString(36).substr(2, 9),
              topic: assignedTopic,
              type: "MCQ",
              correctOption: p.correctOption || ""
            }));
          } catch (aiErr: any) {
            console.warn("Gemini parsing failed, falling back to local regex parser:", aiErr);
            parsed = parseQuestionsFromText(fullText, assignedTopic);
          }
        } else {
          // Robust local regex parser (No API Key Required!)
          parsed = parseQuestionsFromText(fullText, assignedTopic);
        }

        if (parsed.length === 0) {
          alert("Could not automatically identify individual questions in this PDF. Try using the 'Paste Questions' tab to paste the text directly.");
          setIsUploading(false);
          return;
        }

        setPendingBulkQuestions(parsed);
        setBulkApplyTopic(assignedTopic);
        setIsReviewingBulk(true);
        setShowUploadModal(false);
        setIsCreating(false);
      } else {
        alert("Unsupported file format. Please upload a PDF, JSON, or CSV file.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error processing file: " + (e.message || ""));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      return alert("Please paste questions text first.");
    }

    const currentTopic = topic || uploadTargetTopic || "General Aptitude";
    const parsed = parseQuestionsFromText(pastedText, currentTopic);

    if (parsed.length === 0) {
      return alert("Could not detect any questions. Please check that each question has options (A, B, C, D) and optionally 'Answer: X'.");
    }

    setPendingBulkQuestions(parsed);
    setBulkApplyTopic(currentTopic);
    setIsReviewingBulk(true);
    setIsCreating(false);
    setPastedText("");
  };

  const resetForm = () => {
    setTitle(""); 
    setDifficulty("Easy"); 
    setDescription("");
    setOptionA(""); setOptionB(""); setOptionC(""); setOptionD("");
    setCorrectOption("A");
    setCompany("");
    setTopic("");
  };

  const openCreate = (defaultTopic: string | React.MouseEvent = "") => {
    resetForm();
    const assigned = typeof defaultTopic === "string" && defaultTopic && defaultTopic !== "Uncategorized" ? defaultTopic : "";
    setTopic(assigned);
    setUploadTargetTopic(assigned);
    setMultiQuestions([
      {
        id: "q-" + Date.now(),
        title: "",
        difficulty: "Easy",
        description: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "A",
        company: "",
        topic: assigned
      }
    ]);
    setCreationTab("single");
    setIsCreating(true);
  };

  const handleOpenEditProblem = async (prob: any) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/aptitude-problems/${prob._id || prob.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const fullProb = response.data;
      
      let opts = fullProb.options;
      try {
        while (typeof opts === 'string') {
          const parsed = JSON.parse(opts);
          if (parsed === opts || typeof parsed !== 'string' && typeof parsed !== 'object') break;
          opts = parsed;
        }
      } catch(e) {}

      setEditingProblem({ ...fullProb, _id: fullProb.id, options: opts, correctOption: fullProb.correctAnswer });
      setTitle(fullProb.title || "");
      setDifficulty(fullProb.difficulty || "Easy");
      setDescription(fullProb.description || "");
      
      if (Array.isArray(opts)) {
        setOptionA(opts[0] || "");
        setOptionB(opts[1] || "");
        setOptionC(opts[2] || "");
        setOptionD(opts[3] || "");
      } else if (opts) {
        setOptionA(opts.A || opts[0] || "");
        setOptionB(opts.B || opts[1] || "");
        setOptionC(opts.C || opts[2] || "");
        setOptionD(opts.D || opts[3] || "");
      }

      setCorrectOption(fullProb.correctAnswer || fullProb.correctOption || "A");
      setCompany(fullProb.company || "");
      setTopic(fullProb.topic || "");
      setCreationTab("single");
      setIsCreating(true);
    } catch (err) {
      console.error("Failed to fetch problem details for editing", err);
    }
  };

  const handleSaveSingle = async () => {
    if (!title || !description || !optionA || !optionB || !optionC || !optionD) {
      return alert("All fields are required!");
    }

    const payload = {
      title, 
      topic: topic.trim() || "General Aptitude",
      difficulty, 
      description,
      options: JSON.stringify({
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD
      }),
      correctAnswer: correctOption,
      company,
    };

    try {
      if (editingProblem) {
        await axios.put(`${API_URL}/api/v1/aptitude-problems/${editingProblem._id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
      } else {
        await axios.post(`${API_URL}/api/v1/aptitude-problems`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
      }
      
      fetchProblems();
      setIsCreating(false);
      setEditingProblem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving problem:', error);
      alert('Failed to save aptitude problem');
    }
  };

  const handleSaveMultiForm = async () => {
    for (let i = 0; i < multiQuestions.length; i++) {
      const q = multiQuestions[i];
      if (!q.title?.trim() || !q.description?.trim()) {
        return alert(`Question #${i + 1} is missing a title or description.`);
      }
      if (!q.optionA?.trim() || !q.optionB?.trim() || !q.optionC?.trim() || !q.optionD?.trim()) {
        return alert(`Question #${i + 1} must have all options (A, B, C, D) filled.`);
      }
      if (!q.correctOption) {
        return alert(`Question #${i + 1} does not have a correct answer selected.`);
      }
    }

    const formatted = multiQuestions.map(q => ({
      title: q.title.trim(),
      description: q.description.trim(),
      topic: (q.topic || topic || "General Aptitude").trim(),
      difficulty: q.difficulty || "Easy",
      options: JSON.stringify({
        A: q.optionA.trim(),
        B: q.optionB.trim(),
        C: q.optionC.trim(),
        D: q.optionD.trim()
      }),
      correctAnswer: q.correctOption,
      company: q.company || ""
    }));

    try {
      try {
        await axios.post(`${API_URL}/api/v1/aptitude-problems/bulk`, { problems: formatted }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
      } catch (bulkErr) {
        // Fallback to sequential/parallel individual calls if bulk endpoint is not yet restarted
        await Promise.all(formatted.map(item =>
          axios.post(`${API_URL}/api/v1/aptitude-problems`, item, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          })
        ));
      }

      fetchProblems();
      setIsCreating(false);
      resetForm();
      alert(`Successfully added ${formatted.length} questions!`);
    } catch (err) {
      console.error("Error saving multiple questions:", err);
      alert("Failed to save some or all questions.");
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingProblem(null);
    resetForm();
  };

  const filtered = problems.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));

  const groupedByTopic = filtered.reduce((acc: any, problem: any) => {
    const t = problem.topic?.trim() || "Uncategorized";
    if (!acc[t]) acc[t] = [];
    acc[t].push(problem);
    return acc;
  }, {});

  const existingTopics = Array.from(new Set(problems.map(p => p.topic?.trim()).filter(Boolean)));

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await axios.delete(`${API_URL}/api/v1/aptitude-problems/${deleteConfirmId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      fetchProblems();
    } catch (error) {
      console.error('Error deleting problem:', error);
      alert('Failed to delete aptitude problem');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSaveBulk = async () => {
    const missingOption = pendingBulkQuestions.find(q => !q.correctOption);
    if (missingOption) {
      return alert("Please select a correct answer (A, B, C, or D) for all questions before saving.");
    }
    
    try {
      const formatted = pendingBulkQuestions.map(q => ({
        title: q.title || "Aptitude Question",
        topic: q.topic || bulkApplyTopic || topic || "General Aptitude",
        difficulty: q.difficulty || "Easy",
        description: q.description || q.title || "",
        options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options || {}),
        correctAnswer: q.correctOption,
        company: q.company || ""
      }));

      try {
        await axios.post(`${API_URL}/api/v1/aptitude-problems/bulk`, { problems: formatted }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
      } catch (bulkErr) {
        await Promise.all(formatted.map(item =>
          axios.post(`${API_URL}/api/v1/aptitude-problems`, item, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          })
        ));
      }

      fetchProblems();
      setPendingBulkQuestions([]);
      setIsReviewingBulk(false);
      alert(`Successfully saved ${pendingBulkQuestions.length} questions!`);
    } catch (error) {
      console.error('Error saving bulk questions:', error);
      alert('Failed to save some or all questions.');
    }
  };

  const handleApplyTopicToAll = () => {
    if (!bulkApplyTopic.trim()) return;
    const updated = pendingBulkQuestions.map(q => ({
      ...q,
      topic: bulkApplyTopic.trim()
    }));
    setPendingBulkQuestions(updated);
  };

  // ──────────────── Bulk Review View ──────────────────────────────────────────
  if (isReviewingBulk) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface dark:bg-[#111827] p-6 rounded-3xl border border-border shadow-xl">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Review Questions ({pendingBulkQuestions.length})</h2>
            <p className="text-text-muted text-sm mt-1">Verify extracted questions, assign correct answers, and save them.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const newQ = {
                  _id: "apt-" + Date.now() + Math.random().toString(36).substr(2, 6),
                  title: "New Question",
                  description: "",
                  difficulty: "Easy",
                  topic: bulkApplyTopic || topic || "General Aptitude",
                  options: { A: "", B: "", C: "", D: "" },
                  correctOption: "A"
                };
                setPendingBulkQuestions([newQ, ...pendingBulkQuestions]);
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-sm bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
            <button 
              onClick={() => { setIsReviewingBulk(false); setPendingBulkQuestions([]); }} 
              className="px-4 py-2.5 rounded-xl font-semibold text-text-muted hover:text-text-primary border border-border transition-colors text-sm"
            >
              Discard
            </button>
            <button 
              onClick={handleSaveBulk} 
              className="bg-primary hover:bg-primary text-text-inverse px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save All Questions</span>
            </button>
          </div>
        </div>

        {/* Global Batch Controls */}
        <div className="bg-surface dark:bg-[#111827] p-5 rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-bold text-text-muted shrink-0">Batch Assign Topic:</span>
            <input
              type="text"
              value={bulkApplyTopic}
              onChange={(e) => setBulkApplyTopic(e.target.value)}
              placeholder="e.g. Percentages, Time & Work"
              className="bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary w-full sm:w-64"
            />
            <button
              onClick={handleApplyTopicToAll}
              className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl text-xs font-bold shrink-0 transition-colors"
            >
              Apply to All
            </button>
          </div>

          <div className="text-xs text-text-muted">
            Click on <span className="text-primary font-bold">A, B, C, or D</span> on each card to set its correct answer.
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {pendingBulkQuestions.map((q, idx) => (
            <div key={q._id || idx} className="bg-surface dark:bg-[#111827] rounded-3xl p-6 border border-border shadow-xl space-y-4 relative group">
              <button
                onClick={() => {
                  const filtered = pendingBulkQuestions.filter((_, i) => i !== idx);
                  setPendingBulkQuestions(filtered);
                }}
                className="absolute top-5 right-5 p-2 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Remove question"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex flex-wrap items-center gap-3 pr-10">
                <span className="text-sm font-black text-primary px-2.5 py-1 rounded-lg bg-primary/10">
                  Q{idx + 1}
                </span>

                <input
                  type="text"
                  value={q.title || ""}
                  onChange={(e) => {
                    const newQs = [...pendingBulkQuestions];
                    newQs[idx].title = e.target.value;
                    setPendingBulkQuestions(newQs);
                  }}
                  className="font-bold text-text-primary bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-1.5 text-base flex-1 min-w-[200px] focus:outline-none focus:border-primary"
                  placeholder="Question title..."
                />

                <select
                  value={q.difficulty || "Easy"}
                  onChange={(e) => {
                    const newQs = [...pendingBulkQuestions];
                    newQs[idx].difficulty = e.target.value;
                    setPendingBulkQuestions(newQs);
                  }}
                  className="bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <input
                  type="text"
                  value={q.topic || ""}
                  onChange={(e) => {
                    const newQs = [...pendingBulkQuestions];
                    newQs[idx].topic = e.target.value;
                    setPendingBulkQuestions(newQs);
                  }}
                  className="bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary w-36 focus:outline-none focus:border-primary"
                  placeholder="Topic"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">Question Statement</label>
                <textarea
                  value={q.description || ""}
                  onChange={(e) => {
                    const newQs = [...pendingBulkQuestions];
                    newQs[idx].description = e.target.value;
                    setPendingBulkQuestions(newQs);
                  }}
                  rows={2}
                  className="w-full text-text-secondary text-sm bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary resize-none"
                  placeholder="Full question statement..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div 
                    key={opt} 
                    className={`p-3 border-2 rounded-xl flex items-center space-x-3 transition-all ${
                      q.correctOption === opt 
                        ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                        : 'bg-background dark:bg-[#0B0F19] border-border'
                    }`} 
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const newQs = [...pendingBulkQuestions];
                        newQs[idx].correctOption = opt;
                        setPendingBulkQuestions(newQs);
                      }}
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 font-bold text-xs transition-colors cursor-pointer ${
                        q.correctOption === opt 
                          ? 'border-primary bg-primary text-white shadow' 
                          : 'border-slate-500 text-text-muted hover:border-primary hover:text-primary'
                      }`}
                      title={`Mark ${opt} as correct answer`}
                    >
                      {opt}
                    </button>
                    <input
                      type="text"
                      value={q.options?.[opt] || ""}
                      onChange={(e) => {
                        const newQs = [...pendingBulkQuestions];
                        if (!newQs[idx].options) newQs[idx].options = {};
                        newQs[idx].options[opt] = e.target.value;
                        setPendingBulkQuestions(newQs);
                      }}
                      className="bg-transparent border-0 text-sm text-text-primary focus:outline-none w-full"
                      placeholder={`Option ${opt} text...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ──────────────── Editor / Create View ───────────────────────────────────────
  if (isCreating) {
    const isEditMode = !!editingProblem;

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-[#111827] p-6 rounded-3xl border border-border shadow-xl">
          <div className="flex items-center space-x-3">
            <button onClick={handleCancel} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {isEditMode ? "Edit Aptitude Question" : "Add Aptitude Questions"}
              </h2>
              <p className="text-text-muted text-sm">
                {isEditMode 
                  ? "Update the question details and save." 
                  : topic ? `Adding to Topic: "${topic}"` : "Add single or multiple questions at once."}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleCancel} className="px-5 py-2.5 rounded-xl font-semibold text-text-muted hover:text-text-primary border border-border hover:border-slate-500 transition-colors text-sm">
              Cancel
            </button>
            <button 
              onClick={creationTab === "multiple" ? handleSaveMultiForm : handleSaveSingle} 
              className="bg-primary hover:bg-primary text-text-inverse px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isEditMode ? "Save Changes" : creationTab === "multiple" ? `Save All (${multiQuestions.length}) Questions` : "Create Question"}</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs (only shown when not editing an existing problem) */}
        {!isEditMode && (
          <div className="flex flex-wrap gap-2 p-1.5 bg-surface dark:bg-[#111827] border border-border rounded-2xl">
            <button
              onClick={() => setCreationTab("single")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                creationTab === "single"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-text-muted hover:text-text-primary hover:bg-background dark:hover:bg-slate-800/60"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Single Question</span>
            </button>

            <button
              onClick={() => setCreationTab("multiple")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                creationTab === "multiple"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-text-muted hover:text-text-primary hover:bg-background dark:hover:bg-slate-800/60"
              }`}
            >
              <ListPlus className="w-4 h-4" />
              <span>Add Multiple Questions ({multiQuestions.length})</span>
            </button>

            <button
              onClick={() => setCreationTab("paste")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                creationTab === "paste"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-text-muted hover:text-text-primary hover:bg-background dark:hover:bg-slate-800/60"
              }`}
            >
              <Copy className="w-4 h-4" />
              <span>Paste Text Questions</span>
            </button>

            <button
              onClick={() => setCreationTab("upload")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                creationTab === "upload"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-text-muted hover:text-text-primary hover:bg-background dark:hover:bg-slate-800/60"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF / File</span>
            </button>
          </div>
        )}

        {/* TAB 1: SINGLE QUESTION FORM */}
        {(creationTab === "single" || isEditMode) && (
          <div className="bg-surface dark:bg-[#111827] rounded-3xl p-8 border border-border shadow-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Question Title *</label>
                <input
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary text-sm"
                  placeholder="e.g. Percentage Problem 1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Difficulty</label>
                <select
                  value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary text-sm font-bold"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Topic</label>
                <input
                  type="text" value={topic} onChange={e => setTopic(e.target.value)}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary text-sm"
                  placeholder="e.g. Percentages, Algebra"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Company (Optional)</label>
                <input
                  type="text" value={company} onChange={e => setCompany(e.target.value)}
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary text-sm"
                  placeholder="e.g. TCS, Infosys"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Question Description *</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary text-sm resize-none"
                placeholder="Write the full question statement..."
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest border-b border-border pb-2">Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Option A</label>
                  <input
                    type="text" value={optionA} onChange={e => setOptionA(e.target.value)}
                    className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm"
                    placeholder="e.g. 15%"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Option B</label>
                  <input
                    type="text" value={optionB} onChange={e => setOptionB(e.target.value)}
                    className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm"
                    placeholder="e.g. 20%"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Option C</label>
                  <input
                    type="text" value={optionC} onChange={e => setOptionC(e.target.value)}
                    className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm"
                    placeholder="e.g. 25%"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Option D</label>
                  <input
                    type="text" value={optionD} onChange={e => setOptionD(e.target.value)}
                    className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm"
                    placeholder="e.g. 30%"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-bold text-text-muted mb-2">Correct Option</label>
                <select
                  value={correctOption} onChange={e => setCorrectOption(e.target.value)}
                  className="w-full md:w-64 bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary font-bold text-sm"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTIPLE QUESTIONS FORM */}
        {creationTab === "multiple" && !isEditMode && (
          <div className="space-y-6">
            <div className="bg-surface dark:bg-[#111827] p-5 rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm font-bold text-text-muted shrink-0">Default Topic:</span>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => {
                    const newTopic = e.target.value;
                    setTopic(newTopic);
                    setMultiQuestions(multiQuestions.map(q => ({ ...q, topic: newTopic })));
                  }}
                  placeholder="e.g. Percentages"
                  className="bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary w-full sm:w-64"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setMultiQuestions([
                    ...multiQuestions,
                    {
                      id: "q-" + Date.now() + Math.random().toString(36).substr(2, 5),
                      title: "",
                      difficulty: "Easy",
                      description: "",
                      optionA: "",
                      optionB: "",
                      optionC: "",
                      optionD: "",
                      correctOption: "A",
                      company: "",
                      topic: topic || ""
                    }
                  ]);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Question</span>
              </button>
            </div>

            {multiQuestions.map((q, idx) => (
              <div key={q.id || idx} className="bg-surface dark:bg-[#111827] rounded-3xl p-6 border border-border shadow-xl space-y-4 relative">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-text-primary text-base">Question #{idx + 1}</h3>
                  </div>
                  {multiQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setMultiQuestions(multiQuestions.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-text-muted mb-1">Question Title *</label>
                    <input
                      type="text"
                      value={q.title}
                      onChange={(e) => {
                        const updated = [...multiQuestions];
                        updated[idx].title = e.target.value;
                        setMultiQuestions(updated);
                      }}
                      className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                      placeholder="e.g. Find the percentage increase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">Difficulty</label>
                    <select
                      value={q.difficulty}
                      onChange={(e) => {
                        const updated = [...multiQuestions];
                        updated[idx].difficulty = e.target.value;
                        setMultiQuestions(updated);
                      }}
                      className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2 text-sm font-bold text-text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">Question Description *</label>
                  <textarea
                    value={q.description}
                    onChange={(e) => {
                      const updated = [...multiQuestions];
                      updated[idx].description = e.target.value;
                      setMultiQuestions(updated);
                    }}
                    rows={2}
                    className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
                    placeholder="Full statement of question..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map(opt => (
                    <div key={opt}>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">Option {opt} *</label>
                      <input
                        type="text"
                        value={q[`option${opt}` as keyof typeof q]}
                        onChange={(e) => {
                          const updated = [...multiQuestions];
                          (updated[idx] as any)[`option${opt}`] = e.target.value;
                          setMultiQuestions(updated);
                        }}
                        className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                        placeholder={`Option ${opt}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">Correct Answer</label>
                    <select
                      value={q.correctOption}
                      onChange={(e) => {
                        const updated = [...multiQuestions];
                        updated[idx].correctOption = e.target.value;
                        setMultiQuestions(updated);
                      }}
                      className="bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">Topic</label>
                    <input
                      type="text"
                      value={q.topic}
                      onChange={(e) => {
                        const updated = [...multiQuestions];
                        updated[idx].topic = e.target.value;
                        setMultiQuestions(updated);
                      }}
                      className="bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary w-48"
                      placeholder="Topic (defaults to main topic)"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMultiQuestions([
                    ...multiQuestions,
                    {
                      id: "q-" + Date.now() + Math.random().toString(36).substr(2, 5),
                      title: "",
                      difficulty: "Easy",
                      description: "",
                      optionA: "",
                      optionB: "",
                      optionC: "",
                      optionD: "",
                      correctOption: "A",
                      company: "",
                      topic: topic || ""
                    }
                  ]);
                }}
                className="px-6 py-3 bg-surface dark:bg-[#111827] hover:bg-slate-200 dark:hover:bg-slate-800 text-text-primary border border-border rounded-2xl text-sm font-bold flex items-center gap-2 shadow transition-all"
              >
                <Plus className="w-5 h-5 text-primary" />
                <span>+ Add Another Question</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PASTE TEXT QUESTIONS */}
        {creationTab === "paste" && !isEditMode && (
          <div className="bg-surface dark:bg-[#111827] rounded-3xl p-8 border border-border shadow-xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary">Paste Questions in Bulk</h3>
                <p className="text-text-muted text-sm mt-1">
                  Copy and paste multiple questions from any document, PDF or webpage. The parser will automatically extract questions, options (A, B, C, D) and answers.
                </p>
              </div>
              <div className="w-64">
                <label className="block text-xs font-bold text-text-muted mb-1">Target Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Percentages"
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <textarea
              rows={12}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={`Example Format:

1. What is 20% of 150?
A) 25
B) 30
C) 35
D) 40
Answer: B

2. If a train travels 60 km in 45 minutes, what is its speed in km/h?
A) 75
B) 80
C) 85
D) 90
Answer: B`}
              className="w-full font-mono text-xs bg-background dark:bg-[#0B0F19] border border-border rounded-2xl p-4 text-text-primary focus:outline-none focus:border-primary resize-y"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">
                Tip: Works with standard formats: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">1. ... A) ... B) ... Answer: X</code>
              </span>
              <button
                type="button"
                onClick={handleParsePastedText}
                className="bg-primary hover:bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 text-sm"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Parse Questions & Review</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: UPLOAD PDF / FILE */}
        {creationTab === "upload" && !isEditMode && (
          <div className="bg-surface dark:bg-[#111827] rounded-3xl p-8 border border-border shadow-xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary">Upload PDF, JSON, or CSV File</h3>
                <p className="text-text-muted text-sm mt-1">
                  Upload an aptitude question paper or test paper in PDF, JSON, or CSV format. Questions will be extracted automatically for topic: <span className="text-primary font-bold">{topic || "General Aptitude"}</span>.
                </p>
              </div>
              <div className="w-64">
                <label className="block text-xs font-bold text-text-muted mb-1">Target Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Percentages"
                  className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PDF Upload Card */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-purple-500/60 transition-all flex flex-col items-center justify-center text-center space-y-4 bg-background/50 dark:bg-[#0B0F19]/50">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-base">PDF Question Paper</h4>
                  <p className="text-xs text-text-muted mt-1 max-w-xs">
                    Upload any PDF test paper or assignment. Smart text extraction will automatically read questions & options.
                  </p>
                </div>
                <label className="cursor-pointer inline-flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-600/20 transition-all">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Select PDF File
                  <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, topic)} disabled={isUploading} />
                </label>
              </div>

              {/* JSON / CSV Upload Card */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/60 transition-all flex flex-col items-center justify-center text-center space-y-4 bg-background/50 dark:bg-[#0B0F19]/50">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileJson className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-base">JSON / CSV File</h4>
                  <p className="text-xs text-text-muted mt-1 max-w-xs">
                    Import structured datasets with columns or fields: title, description, options, correctOption.
                  </p>
                </div>
                <label className="cursor-pointer inline-flex items-center px-5 py-2.5 bg-primary hover:bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Select JSON or CSV
                  <input type="file" accept=".json,.csv,application/json,text/csv" className="hidden" onChange={(e) => handleFileUpload(e, topic)} disabled={isUploading} />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──────────────── List View ──────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-1">Aptitude Questions</h2>
          <p className="text-text-muted text-sm">Manage multiple-choice aptitude, reasoning, and topic questions.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              if (window.confirm("Are you sure you want to clear all aptitude problems? This action is permanent!")) {
                if (problems.length === 0) return alert("No questions to clear.");
                try {
                  setLoading(true);
                  await Promise.all(problems.map(p => 
                    axios.delete(`${API_URL}/api/v1/aptitude-problems/${p._id || p.id}`, {
                      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                    })
                  ));
                  fetchProblems();
                  alert("All aptitude problems have been cleared.");
                } catch (e) {
                  console.error(e);
                  alert("Failed to clear some problems.");
                } finally {
                  setLoading(false);
                }
              }
            }}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-text-inverse px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
          <button
            onClick={() => {
              setUploadTargetTopic("");
              setShowUploadModal(true);
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primary text-text-inverse px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] text-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Questions</span>
          </button>
          <button
            onClick={() => openCreate()}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-text-inverse px-4 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Topic / Question</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface dark:bg-[#111827] border border-border rounded-2xl p-4 shadow-xl">
        <div className="relative w-80">
          <input
            type="text" placeholder="Search questions..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#1a2333] border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-sm font-medium text-text-muted">Total: {filtered.length} questions</span>
          <div className="flex items-center gap-1.5 border-l border-border pl-3">
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="Minimize all topic sections"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Collapse All</span>
            </button>
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="Expand all topic sections"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expand All</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span>Loading questions...</span>
          </div>
        ) : Object.keys(groupedByTopic).length === 0 ? (
          <div className="p-16 text-center text-text-muted bg-surface dark:bg-[#111827] border border-border rounded-3xl space-y-4">
            <BrainCircuit className="w-12 h-12 text-text-muted mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-text-primary">No aptitude questions found</h3>
            <p className="text-sm max-w-md mx-auto">Create a topic or upload questions from a PDF to get started.</p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => openCreate()}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow"
              >
                + Add Question
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-5 py-2.5 bg-surface dark:bg-slate-800 border border-border text-text-primary rounded-xl text-sm font-bold shadow"
              >
                Upload PDF
              </button>
            </div>
          </div>
        ) : (
          Object.keys(groupedByTopic).sort().map(topicName => (
            <div key={topicName} className="bg-surface dark:bg-[#111827] border border-border rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/80 dark:bg-slate-900/80">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-500" />
                  {topicName}
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-text-muted px-2 py-1 rounded-full font-medium ml-2">
                    {groupedByTopic[topicName].length} {groupedByTopic[topicName].length === 1 ? 'question' : 'questions'}
                  </span>
                </h3>
                
                {/* Per-topic Action Buttons */}
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  {/* Topic Upload PDF / File */}
                  <label 
                    className="flex items-center space-x-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer shadow-sm"
                    title={`Upload PDF directly to ${topicName}`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload PDF</span>
                    <input
                      type="file"
                      accept=".pdf,.json,.csv"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, topicName)}
                    />
                  </label>

                  {/* Add Question to this topic */}
                  <button
                    onClick={() => openCreate(topicName)}
                    className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                  </button>

                  {/* Minimize / Expand Button */}
                  <button
                    onClick={() => toggleCollapse(topicName)}
                    className="p-1.5 text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold border border-border"
                    title={collapsedTopics[topicName] ? "Expand Topic" : "Minimize Topic"}
                  >
                    {collapsedTopics[topicName] ? (
                      <>
                        <ChevronRight className="w-4 h-4 text-primary" />
                        <span className="hidden sm:inline text-primary">Expand</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                        <span className="hidden sm:inline">Minimize</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {!collapsedTopics[topicName] && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-text-secondary">
                    <thead className="bg-white dark:bg-[#1a2333] text-text-muted uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Difficulty</th>
                        <th className="px-6 py-4">Company</th>
                        <th className="px-6 py-4">Answer</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {groupedByTopic[topicName].map((problem: any, idx: number) => (
                        <tr key={problem._id || `fallback-key-${idx}`} className="hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-text-primary">
                            <span className="line-clamp-1">{problem.title}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              problem.difficulty === "Easy" ? "bg-primary/10 text-primary" :
                              problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                              "bg-rose-500/10 text-rose-500"
                            }`}>
                              {problem.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {problem.company ? (
                              <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-text-secondary font-medium">
                                {problem.company}
                              </span>
                            ) : (
                              <span className="text-xs text-text-muted">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider">
                              Option {problem.correctOption || problem.correctAnswer || "A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => handleOpenEditProblem(problem)}
                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Edit Question"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(problem._id)}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Delete Question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <button onClick={() => setDeleteConfirmId(null)} className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-inverse hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Delete Question?</h3>
                <p className="mt-1 text-sm text-text-muted">This action is <span className="text-rose-400 font-semibold">permanent</span>. The question will be removed immediately.</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-border text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-text-inverse flex items-center space-x-2 shadow-lg shadow-rose-500/20 transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Delete Question</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUploading && setShowUploadModal(false)} />
          <div className="relative bg-surface dark:bg-[#111827] border border-border rounded-3xl shadow-2xl p-6 w-full max-w-lg">
            <button onClick={() => setShowUploadModal(false)} disabled={isUploading} className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Questions
            </h3>
            <p className="text-sm text-text-muted mb-4">Import questions into a topic via PDF, JSON, or CSV.</p>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-text-muted mb-1.5">Target Topic</label>
              <input
                type="text"
                value={uploadTargetTopic}
                onChange={(e) => setUploadTargetTopic(e.target.value)}
                placeholder="e.g. Percentages, Logical Reasoning"
                className="w-full bg-background dark:bg-[#0B0F19] border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-[#1a2333] p-4 rounded-xl border border-border">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="w-full">
                    <h4 className="font-semibold text-text-primary">PDF Test Paper</h4>
                    <p className="text-xs text-text-muted mt-1 mb-3">Upload any PDF with MCQs. Automatic parsing runs directly in your browser.</p>
                    
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium text-white transition-colors shadow">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Select PDF File
                      <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e)} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a2333] p-4 rounded-xl border border-border">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                    <FileJson className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">JSON / CSV Upload</h4>
                    <p className="text-xs text-text-muted mt-1 mb-3">Upload a properly formatted JSON or CSV file to instantly add questions.</p>
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-text-inverse transition-colors">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Select JSON or CSV
                      <input type="file" accept=".json,.csv,application/json,text/csv" className="hidden" onChange={(e) => handleFileUpload(e)} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

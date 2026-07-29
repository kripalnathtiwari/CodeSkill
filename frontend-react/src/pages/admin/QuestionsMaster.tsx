import React, { useState } from "react";
import { Code, Building2, BrainCircuit } from "lucide-react";
import ProblemManagement from "./ProblemManagement";
import InterviewManagement from "./InterviewManagement";
import AptitudeManagement from "./AptitudeManagement";

export default function QuestionsMaster() {
  const [activeTab, setActiveTab] = useState("dsa");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center space-x-4 border-b border-slate-800 pb-4 mb-4 flex-shrink-0">
        <button
          onClick={() => setActiveTab("dsa")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "dsa"
              ? "bg-rose-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <Code className="w-5 h-5" />
          <span>DSA Questions</span>
        </button>

        <button
          onClick={() => setActiveTab("interview")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "interview"
              ? "bg-rose-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span>Company Interview Questions</span>
        </button>

        <button
          onClick={() => setActiveTab("aptitude")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "aptitude"
              ? "bg-rose-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <BrainCircuit className="w-5 h-5" />
          <span>Aptitude Questions</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 hide-scrollbar pb-10">
        {activeTab === "dsa" && <ProblemManagement />}
        {activeTab === "interview" && <InterviewManagement />}
        {activeTab === "aptitude" && <AptitudeManagement />}
      </div>
    </div>
  );
}

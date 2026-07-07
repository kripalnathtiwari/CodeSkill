import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Search, ChevronRight, CheckCircle, Flame } from "lucide-react";

const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple"];
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

// Generate mock data for companies
const generateCompanyQuestions = () => {
  const data: Record<string, Record<string, any[]>> = {};
  
  COMPANIES.forEach(company => {
    data[company] = {
      EASY: Array.from({ length: 10 }).map((_, i) => ({
        id: `${company}-EASY-${i+1}`,
        title: `${company} Prep: Arrays & Hashing #${i+1}`,
        slug: `${company.toLowerCase()}-easy-${i+1}`,
        acceptanceRate: (Math.random() * 30 + 60).toFixed(1),
        likes: Math.floor(Math.random() * 500) + 50
      })),
      MEDIUM: Array.from({ length: 10 }).map((_, i) => ({
        id: `${company}-MEDIUM-${i+1}`,
        title: `${company} Prep: Two Pointers & Trees #${i+1}`,
        slug: `${company.toLowerCase()}-medium-${i+1}`,
        acceptanceRate: (Math.random() * 30 + 30).toFixed(1),
        likes: Math.floor(Math.random() * 1000) + 100
      })),
      HARD: Array.from({ length: 10 }).map((_, i) => ({
        id: `${company}-HARD-${i+1}`,
        title: `${company} Prep: DP & Graphs #${i+1}`,
        slug: `${company.toLowerCase()}-hard-${i+1}`,
        acceptanceRate: (Math.random() * 20 + 10).toFixed(1),
        likes: Math.floor(Math.random() * 2000) + 200
      })),
    };
  });
  return data;
};

const COMPANY_DATA = generateCompanyQuestions();

export default function CompanyProblems() {
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("EASY");
  const [searchQuery, setSearchQuery] = useState("");

  const activeQuestions = COMPANY_DATA[selectedCompany][selectedDifficulty].filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden glass-card p-8 flex flex-col md:flex-row md:items-center justify-between border border-slate-200 dark:border-slate-800/40">
        <div className="space-y-2 max-w-xl">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
            <Building2 className="h-8 w-8 mr-3 text-emerald-500" />
            Company Interview Prep
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
            Targeted problem sets asked in recent interviews by top tech giants. Master these exactly as they appeared to guarantee your success.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Company List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-slate-950 dark:text-slate-100 uppercase tracking-wider pl-2">Top Companies</h3>
          <div className="flex flex-col space-y-2">
            {COMPANIES.map(company => (
              <button
                key={company}
                onClick={() => setSelectedCompany(company)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm border ${
                  selectedCompany === company 
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-emerald-500/50 hover:text-emerald-500"
                }`}
              >
                <span>{company}</span>
                <ChevronRight className={`h-4 w-4 ${selectedCompany === company ? "opacity-100" : "opacity-0"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Section: Problems */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Difficulty Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full overflow-x-auto">
            {DIFFICULTIES.map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-all ${
                  selectedDifficulty === diff 
                  ? (diff === "EASY" ? "bg-emerald-500 text-white shadow-md" : diff === "MEDIUM" ? "bg-amber-500 text-white shadow-md" : "bg-rose-500 text-white shadow-md")
                  : "text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {diff} (10)
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${selectedCompany} ${selectedDifficulty.toLowerCase()} questions...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-emerald-500 transition-all text-slate-950 dark:text-slate-100"
            />
          </div>

          {/* Questions List */}
          <div className="glass rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 pl-6">Problem</th>
                  <th className="p-4">Acceptance</th>
                  <th className="p-4">Frequency</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {activeQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-950 dark:text-slate-100">
                      {q.title}
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                      {q.acceptanceRate}%
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-amber-500">
                        <Flame className="h-4 w-4" />
                        <span className="text-slate-800 dark:text-slate-300">{q.likes}</span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link
                        to={`/problems/${q.slug}`}
                        className="inline-flex items-center justify-center space-x-1 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 px-3.5 py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-white transition-all duration-200"
                      >
                        <span>Solve</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {activeQuestions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-700 text-sm">
                      No matching questions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

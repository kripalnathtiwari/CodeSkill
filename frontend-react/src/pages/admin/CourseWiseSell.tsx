import React, { useState, useEffect } from "react";
import { Download, BookOpen, TrendingUp, Users, Search, Receipt, Trash2 } from "lucide-react";

export default function CourseWiseSell() {
  const [sales, setSales] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [courseSettings, setCourseSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    const existingStr = localStorage.getItem("enrolledCourses");
    if (existingStr) {
      try {
        setSales(JSON.parse(existingStr));
      } catch (e) {}
    }
    const settingsStr = localStorage.getItem("courseSettings");
    if (settingsStr) {
      try {
        setCourseSettings(JSON.parse(settingsStr));
      } catch (e) {}
    }
  }, []);

  const handlePublishCertificates = (courseName: string, publish: boolean) => {
    const newSettings = { ...courseSettings };
    if (!newSettings[courseName]) newSettings[courseName] = {};
    newSettings[courseName].certificatePublished = publish;
    setCourseSettings(newSettings);
    localStorage.setItem("courseSettings", JSON.stringify(newSettings));
  };

  const handleUploadDemoCertificate = (courseName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSettings = { ...courseSettings };
        if (!newSettings[courseName]) newSettings[courseName] = {};
        newSettings[courseName].templateImage = reader.result;
        setCourseSettings(newSettings);
        localStorage.setItem("courseSettings", JSON.stringify(newSettings));
      };
      reader.readAsDataURL(file);
    }
  };

  const paidSales = sales.filter(s => s.status === "PAID" || s.status === "active" || s.status === "Success" || !s.status);

  const salesByCourse = paidSales.reduce((acc: any, sale: any) => {
    if (!acc[sale.courseName]) acc[sale.courseName] = [];
    acc[sale.courseName].push(sale);
    return acc;
  }, {});

  const courseNames = Object.keys(salesByCourse);

  const downloadCSV = (courseName: string, courseSales: any[]) => {
    const headers = "Student Name,Email,Phone,Course Name,Amount,Status,Date,Certificate Generated\n";
    const rows = courseSales.map(sale => {
      const date = new Date(sale.dateRegistered).toLocaleDateString();
      const statusText = sale.status === "UNPAID" ? "Unpaid" : "Success";
      const formattedPhone = sale.phone ? `="${sale.phone}"` : "N/A";
      const certGenerated = sale.certificateId ? "Yes" : "No";
      return `"${sale.fullName}","${sale.email}",${formattedPhone},"${sale.courseName}",3999,${statusText},${date},${certGenerated}`;
    }).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${courseName.replace(/\s+/g, '_')}_sales.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteRecord = (saleToDelete: any) => {
    if (window.confirm("Are you sure you want to delete this enrollment record?")) {
      const updatedSales = sales.filter(s => s !== saleToDelete);
      setSales(updatedSales);
      localStorage.setItem("enrolledCourses", JSON.stringify(updatedSales));
    }
  };

  // Prepare data for the table if a specific course is selected
  const activeCourseSales = activeTab !== "ALL" ? salesByCourse[activeTab] || [] : [];
  const filteredActiveSales = activeCourseSales.filter((s: any) => 
    s.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-1">Course Wise Sell</h2>
          <p className="text-text-muted">Track revenue and enrollments for each course.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-surface dark:bg-[#111827] rounded-xl border border-border overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <button
              onClick={() => { setActiveTab("ALL"); setSearch(""); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "ALL" 
                  ? "bg-primary text-text-inverse" 
                  : "bg-slate-800 text-text-muted hover:bg-slate-700 hover:text-text-inverse"
              }`}
            >
              All Courses
            </button>
            {courseNames.map(courseName => (
              <button
                key={courseName}
                onClick={() => { setActiveTab(courseName); setSearch(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === courseName 
                    ? "bg-primary text-text-inverse" 
                    : "bg-slate-800 text-text-muted hover:bg-slate-700 hover:text-text-inverse"
                }`}
              >
                {courseName}
              </button>
            ))}
          </div>
          
          {activeTab !== "ALL" && (
            <div className="relative w-full md:w-80">
              <input 
                type="text" 
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-border rounded-lg pl-10 pr-4 py-2 text-text-inverse focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <Search className="absolute left-3 top-2.5 text-text-muted w-4 h-4" />
            </div>
          )}
        </div>
        
        <div className="p-6">
          {activeTab === "ALL" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseNames.map(courseName => {
                const courseSales = salesByCourse[courseName];
                const revenue = courseSales.length * 3999; 
                
                return (
                  <div key={courseName} className="bg-slate-900/50 border border-border rounded-2xl overflow-hidden flex flex-col hover:border-border transition-colors">
                    <div className="p-6 flex-1 cursor-pointer group" onClick={() => setActiveTab(courseName)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-2" title={courseName}>{courseName}</h3>
                      <div className="space-y-4 mt-6">
                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-text-muted" />
                            <span className="text-sm text-text-secondary">Enrollments</span>
                          </div>
                          <span className="font-bold text-text-primary">{courseSales.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <span className="text-sm text-primary/80">Revenue</span>
                          </div>
                          <span className="font-bold text-primary">₹{revenue.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-border bg-slate-800/30 space-y-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); downloadCSV(courseName, courseSales); }}
                        className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-text-inverse px-4 py-2.5 rounded-xl font-semibold transition-all text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Sales Report</span>
                      </button>
                      <div className="flex gap-2">
                        <label
                          className="w-full flex items-center justify-center bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-xl font-semibold transition-all text-sm cursor-pointer border border-primary/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Upload Demo Cert</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadDemoCertificate(courseName, e)} />
                        </label>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePublishCertificates(courseName, !courseSettings[courseName]?.certificatePublished); }}
                          className={`w-full flex items-center justify-center px-4 py-2 rounded-xl font-semibold transition-all text-sm ${courseSettings[courseName]?.certificatePublished ? 'bg-primary hover:bg-blue-700 text-text-inverse' : 'bg-slate-700 hover:bg-slate-600 text-text-secondary'}`}
                        >
                          <span>{courseSettings[courseName]?.certificatePublished ? 'Hide Certs' : 'Show Certs'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {courseNames.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-muted">
                  <BookOpen className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <p>No course sales found.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-border">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary">{activeTab}</h3>
                  <div className="flex flex-wrap gap-4 md:gap-6 mt-3">
                     <div className="flex items-center gap-2 text-text-secondary bg-slate-800/50 px-3 py-1.5 rounded-lg border border-border/50">
                       <Users className="w-4 h-4 text-primary" />
                       <span className="font-medium text-sm">{activeCourseSales.length} Enrollments</span>
                     </div>
                     <div className="flex items-center gap-2 text-text-secondary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                       <TrendingUp className="w-4 h-4 text-primary" />
                       <span className="font-medium text-sm text-primary">₹{(activeCourseSales.length * 3999).toLocaleString('en-IN')} Revenue</span>
                     </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-4 shrink-0">
                  <label className="flex items-center space-x-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer text-sm">
                    <span>Upload Demo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadDemoCertificate(activeTab, e)} />
                  </label>
                  <button
                    onClick={() => handlePublishCertificates(activeTab, !courseSettings[activeTab]?.certificatePublished)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all text-sm shrink-0 ${courseSettings[activeTab]?.certificatePublished ? 'bg-primary hover:bg-blue-700 text-text-inverse' : 'bg-slate-700 hover:bg-slate-600 text-text-secondary'}`}
                  >
                    <span>{courseSettings[activeTab]?.certificatePublished ? 'Hide Certificates' : 'Show Certificates'}</span>
                  </button>
                  <button
                    onClick={() => downloadCSV(activeTab, activeCourseSales)}
                    className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-xl font-semibold transition-all shrink-0 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm text-text-secondary">
                  <thead className="bg-[#1a2333] text-text-muted uppercase text-xs font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Transaction Details</th>
                      <th className="px-6 py-4">Student Info</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-center">Certificate</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredActiveSales.slice().reverse().map((sale: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Receipt className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-text-primary line-clamp-1">{sale.courseName}</div>
                              <div className="text-xs text-text-muted uppercase tracking-wider">TXN-{Math.random().toString(36).substr(2, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-text-secondary">{sale.fullName}</div>
                          <div className="text-xs text-text-muted">{sale.email}</div>
                          {sale.phone && <div className="text-xs text-text-muted">{sale.phone}</div>}
                        </td>
                        <td className="px-6 py-4 font-mono text-primary font-medium">₹3,999</td>
                        <td className="px-6 py-4">
                          {sale.status === "UNPAID" ? (
                            <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Unpaid</span>
                          ) : (
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase">Success</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-text-muted">
                          {new Date(sale.dateRegistered).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {sale.certificateId ? (
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase">Generated</span>
                          ) : (
                            <span className="bg-background0/10 text-text-muted px-2 py-1 rounded text-[10px] font-bold uppercase">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteRecord(sale)}
                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredActiveSales.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">No students found for this course.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Search, Receipt, TrendingUp, Download } from "lucide-react";

export default function SalesManagement() {
  const [sales, setSales] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const existingStr = localStorage.getItem("enrolledCourses");
    if (existingStr) {
      try {
        setSales(JSON.parse(existingStr));
      } catch (e) {}
    }
  }, []);

  const paidSales = sales.filter(s => s.status === "PAID" || s.status === "active" || s.status === "Success" || !s.status);
  const unpaidSales = sales.filter(s => s.status === "UNPAID");

  const filtered = sales.filter(s => 
    s.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    s.courseName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = paidSales.length * 3999; // Mock base price

  const downloadCSV = (courseName: string, courseSales: any[]) => {
    const headers = "Student Name,Email,Phone,Course Name,Amount,Status,Date\n";
    const rows = courseSales.map(sale => {
      const date = new Date(sale.dateRegistered).toLocaleDateString();
      const statusText = sale.status === "UNPAID" ? "Unpaid" : "Success";
      const formattedPhone = sale.phone ? `="${sale.phone}"` : "N/A";
      // Ensure names and emails don't break CSV format by wrapping in quotes
      return `"${sale.fullName}","${sale.email}",${formattedPhone},"${sale.courseName}",3999,${statusText},${date}`;
    }).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${courseName.replace(/\s+/g, '_')}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllCSV = () => {
    downloadCSV("All", filtered);
  };

  // Group sales by course (PAID)
  const salesByCourse = paidSales.reduce((acc: any, sale: any) => {
    if (!acc[sale.courseName]) acc[sale.courseName] = [];
    acc[sale.courseName].push(sale);
    return acc;
  }, {});

  // Group unpaid by course
  const unpaidByCourse = unpaidSales.reduce((acc: any, sale: any) => {
    if (!acc[sale.courseName]) acc[sale.courseName] = [];
    acc[sale.courseName].push(sale);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Sales & Enrollments</h2>
          <p className="text-slate-400">Track course purchases and student registrations.</p>
        </div>
        <button 
          onClick={downloadAllCSV}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold transition-all"
        >
          <Download className="w-5 h-5" />
          <span>Export All CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-400 mb-1">Total Enrollments</p>
          <h3 className="text-3xl font-bold text-white">{sales.length}</h3>
        </div>
        <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-400 mb-1">Gross Revenue</p>
          <h3 className="text-3xl font-bold text-emerald-400 flex items-center">
            ₹{totalRevenue.toLocaleString('en-IN')}
            <TrendingUp className="w-5 h-5 ml-2 text-emerald-500" />
          </h3>
        </div>
        <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-400 mb-1">Recent Activity</p>
          <h3 className="text-xl font-bold text-white flex items-center h-full">
            + {sales.filter(s => new Date(s.dateRegistered) > new Date(Date.now() - 86400000)).length} today
          </h3>
        </div>
      </div>

      {/* Course-wise Registrations Section */}
      <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">Course-wise Registrations</h3>
        {Object.keys(salesByCourse).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(salesByCourse).map(courseName => (
              <div key={courseName} className="bg-[#1a2333] border border-slate-700 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white line-clamp-1" title={courseName}>{courseName}</h4>
                  <p className="text-sm text-slate-400 mt-1">{salesByCourse[courseName].length} Student(s)</p>
                </div>
                <button
                  onClick={() => downloadCSV(courseName, salesByCourse[courseName])}
                  className="mt-4 flex items-center justify-center space-x-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 px-3 py-2 rounded-lg font-semibold transition-colors w-full"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No course registrations found.</p>
        )}
      </div>

      {/* Registered but Not Paid Section */}
      <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">Registered but Not Paid</h3>
        {Object.keys(unpaidByCourse).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(unpaidByCourse).map(courseName => (
              <div key={courseName} className="bg-[#1a2333] border border-slate-700 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white line-clamp-1" title={courseName}>{courseName}</h4>
                  <p className="text-sm text-slate-400 mt-1">{unpaidByCourse[courseName].length} Student(s)</p>
                </div>
                <button
                  onClick={() => downloadCSV(`${courseName}_unpaid`, unpaidByCourse[courseName])}
                  className="mt-4 flex items-center justify-center space-x-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-3 py-2 rounded-lg font-semibold transition-colors w-full"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Unpaid CSV</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No pending unpaid registrations.</p>
        )}
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Search by student or course..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1a2333] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1a2333] text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.slice().reverse().map((sale, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white line-clamp-1">{sale.courseName}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">TXN-{Math.random().toString(36).substr(2, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{sale.fullName}</div>
                    <div className="text-xs text-slate-500">{sale.email}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-emerald-400 font-medium">₹3,999</td>
                  <td className="px-6 py-4">
                    {sale.status === "UNPAID" ? (
                      <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Unpaid</span>
                    ) : (
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-[10px] font-bold uppercase">Success</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">
                    {new Date(sale.dateRegistered).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

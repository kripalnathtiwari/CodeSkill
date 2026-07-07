import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  ShieldAlert, 
  Users, 
  LayoutDashboard, 
  BookOpen, 
  Code, 
  CreditCard,
  Menu,
  X,
  LogOut,
  Activity,
  Building2,
  BrainCircuit
} from "lucide-react";

import DashboardOverview from "./admin/DashboardOverview";
import CourseManagement from "./admin/CourseManagement";
import UserManagement from "./admin/UserManagement";
import ProblemManagement from "./admin/ProblemManagement";
import SalesManagement from "./admin/SalesManagement";
import TestManagement from "./admin/TestManagement";
import ActivityLogs from "./admin/ActivityLogs";
import CollegeManagement from "./admin/CollegeManagement";
import CollegeCollection from "./admin/CollegeCollection";
import AptitudeManagement from "./admin/AptitudeManagement";

export default function AdminDashboard() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.role === "INSTRUCTOR" ? "tests" : (user?.role === "COLLEGE_ADMIN" ? "college_collection" : "dashboard"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Filter Nav Items based on Role
  let NAV_ITEMS = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard, roles: ["ADMIN"] },
    { id: "courses", label: "Courses", icon: BookOpen, roles: ["ADMIN"] },
    { id: "users", label: "Users", icon: Users, roles: ["ADMIN"] },
    { id: "problems", label: "Problems", icon: Code, roles: ["ADMIN"] },
    { id: "aptitude", label: "Aptitude Questions", icon: BrainCircuit, roles: ["ADMIN"] },
    { id: "tests", label: "Tests & Contests", icon: ShieldAlert, roles: ["ADMIN", "INSTRUCTOR"] },
    { id: "sales", label: "Sales & Enrollments", icon: CreditCard, roles: ["ADMIN"] },
    { id: "colleges", label: "Colleges", icon: Building2, roles: ["ADMIN"] },
    { id: "college_collection", label: "College Collection", icon: Users, roles: ["COLLEGE_ADMIN"] },
    { id: "activity", label: "Activity Logs", icon: Activity, roles: ["ADMIN"] },
  ];

  NAV_ITEMS = NAV_ITEMS.filter(item => item.roles.includes(user?.role || "ADMIN"));

  return (
    <div className="flex h-screen bg-[#0a1128] text-slate-100 overflow-hidden font-sans pt-16">
      
      {/* Sidebar Navigation */}
      <aside 
        className={`${isSidebarOpen ? "w-64" : "w-20"} flex-shrink-0 bg-[#111827] border-r border-slate-800 transition-all duration-300 flex flex-col h-full`}
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center h-16">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2 text-rose-500 font-bold text-lg tracking-wider">
              <ShieldAlert className="w-6 h-6" />
              <span className="truncate max-w-[150px]">{user?.role === "INSTRUCTOR" ? "INSTRUCTOR" : (user?.role === "COLLEGE_ADMIN" ? "COLLEGE ADMIN" : "ADMIN")}</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6 mx-auto" />}
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto hide-scrollbar">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              } ${!isSidebarOpen && "justify-center"}`}
              title={!isSidebarOpen ? item.label : ""}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-semibold">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button 
              onClick={() => { logout(); navigate("/"); }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all ${!isSidebarOpen && "justify-center"}`}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="font-semibold">Exit Admin</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0a1128] p-8 h-full">
        {activeTab === "dashboard" && <DashboardOverview />}
        {activeTab === "courses" && <CourseManagement />}
        { activeTab === "users" && <UserManagement />}
        { activeTab === "problems" && <ProblemManagement /> }
        { activeTab === "aptitude" && <AptitudeManagement /> }
        { activeTab === "tests" && <TestManagement /> }
        { activeTab === "sales" && <SalesManagement /> }
        { activeTab === "colleges" && <CollegeManagement /> }
        { activeTab === "college_collection" && <CollegeCollection /> }
        { activeTab === "activity" && <ActivityLogs /> }
      </main>

    </div>
  );
}

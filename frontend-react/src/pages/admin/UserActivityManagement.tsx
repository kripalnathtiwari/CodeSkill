import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Activity, BookOpen, Code, Trophy, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL as API_URL } from "../../utils/apiConfig";

interface UserActivity {
  id: string;
  name: string;
  email: string;
  dsa: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  };
  aptitude: {
    total: number;
  };
  courses: {
    registered: number;
    completed: number;
  };
}

export default function UserActivityManagement() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserActivity();
  }, []);

  const fetchUserActivity = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_URL}/api/v1/admin/user-activity`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setActivities(response.data.data);
      } else {
        setError("Failed to fetch user activity.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Error fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = activities.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">User Activity Stats</h2>
          <p className="text-slate-400">Track DSA solving progress, courses registered and completed by users.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchUserActivity}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-bold transition-all"
          >
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="relative w-96">
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1a2333] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          <span className="text-sm font-medium text-slate-400">Showing {filtered.length} users</span>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg m-4 flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#1a2333] text-slate-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">DSA Progress</th>
                  <th className="px-6 py-4">Aptitude Solved</th>
                  <th className="px-6 py-4">Courses (Reg/Comp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(activity => (
                  <tr key={activity.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{activity.name}</div>
                      <div className="text-xs text-slate-500">{activity.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 font-bold text-white">
                           <Code className="w-4 h-4 text-emerald-400" /> 
                           <span>{activity.dsa.total} Total</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs mt-1">
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Easy: {activity.dsa.easy}</span>
                          <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Medium: {activity.dsa.medium}</span>
                          <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Hard: {activity.dsa.hard}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-purple-400 font-bold bg-purple-500/10 px-3 py-1.5 rounded-lg w-fit">
                        <Trophy className="w-4 h-4" />
                        <span>{activity.aptitude.total} Solved</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center text-blue-400">
                          <BookOpen className="w-4 h-4 mr-2" />
                          <span>{activity.courses.registered} Registered</span>
                        </div>
                        <div className="flex items-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          <span>{activity.courses.completed} Completed</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No user activity found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

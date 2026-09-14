import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Generate mock data for the last 7 days
const generateMockData = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    data.push({
      name: days[d.getDay()],
      questionsSolved: Math.floor(Math.random() * 5) + 1, // Random 1-5
      pointsEarned: Math.floor(Math.random() * 50) + 10,  // Random 10-60
    });
  }
  
  // Make it "growing" towards the end for the visual effect requested
  data[5].questionsSolved += 2;
  data[6].questionsSolved += 4;
  data[5].pointsEarned += 20;
  data[6].pointsEarned += 40;

  return data;
};

export default function PracticeStatistics() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setData(generateMockData());
  }, []);

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Practice Statistics</h3>
        </div>
        <button className="flex items-center space-x-2 text-sm font-semibold text-text-secondary bg-background px-3 py-1.5 rounded-lg border border-border hover:bg-slate-100 transition-colors">
          <Calendar className="w-4 h-4" />
          <span>Weekly Report</span>
        </button>
      </div>

      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="square" wrapperStyle={{ paddingTop: '20px' }} />
            <Area 
              type="monotone" 
              dataKey="questionsSolved" 
              name="Question Solved" 
              stroke="#f59e0b" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorQuestions)" 
            />
            <Area 
              type="monotone" 
              dataKey="pointsEarned" 
              name="Point Earned" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPoints)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

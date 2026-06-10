"use client";

import { useEffect, useState } from "react";

export default function SuperadminDashboard() {
  const [stats, setStats] = useState<any>({ 
    mentors: 0, students: 0, presentToday: 0,
    mentorsTrend: [], studentsTrend: [], attendanceTrend: [] 
  });
  const [loading, setLoading] = useState(true);

  // Smooth Curved Line Chart Component
  const MiniLineChart = ({ data, colorClass }: { data: number[], colorClass: string }) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min;
    
    // Create objects with x and y coordinates
    const pointObjects = data.map((val, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = range === 0 ? 35 : 40 - ((val - min) / range) * 35;
      return { x, y };
    });

    // Generate smooth bezier curve path
    let d = "";
    if (pointObjects.length > 0) {
      d = `M ${pointObjects[0].x},${pointObjects[0].y}`;
      for (let i = 0; i < pointObjects.length - 1; i++) {
        const p1 = pointObjects[i];
        const p2 = pointObjects[i + 1];
        // Horizontal control points for a smooth curve
        const cp1x = p1.x + (p2.x - p1.x) / 2;
        const cp1y = p1.y;
        const cp2x = p1.x + (p2.x - p1.x) / 2;
        const cp2y = p2.y;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
    }

    return (
      <svg viewBox="0 0 100 40" className="w-full h-16 overflow-visible" preserveAspectRatio="none">
        {/* Glow effect filter for premium look */}
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <path 
          d={d} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={colorClass}
          filter="url(#glow)"
        />
      </svg>
    );
  };

  useEffect(() => {
    fetch("/api/superadmin/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-950">Dashboard</h1>
          <p className="text-emerald-700">Selamat datang di Panel Superadmin PPA.</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-24 bg-emerald-200 rounded-2xl"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart 1: Total Mentor */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Mentor</h3>
                <p className="text-3xl font-black text-emerald-900">{stats.mentors}</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
            </div>
            <MiniLineChart data={stats.mentorsTrend} colorClass="text-emerald-500" />
            <p className="text-[10px] font-bold text-slate-400 mt-2 text-right uppercase">7 Hari Terakhir</p>
          </div>

          {/* Chart 2: Total Siswa */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-teal-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Siswa</h3>
                <p className="text-3xl font-black text-teal-900">{stats.students}</p>
              </div>
              <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
            </div>
            <MiniLineChart data={stats.studentsTrend} colorClass="text-teal-500" />
            <p className="text-[10px] font-bold text-slate-400 mt-2 text-right uppercase">7 Hari Terakhir</p>
          </div>

          {/* Chart 3: Hadir Hari Ini */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Kehadiran Harian</h3>
                <p className="text-3xl font-black text-blue-900">{stats.presentToday}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              </div>
            </div>
            <MiniLineChart data={stats.attendanceTrend} colorClass="text-blue-500" />
            <p className="text-[10px] font-bold text-slate-400 mt-2 text-right uppercase">7 Hari Terakhir</p>
          </div>
        </div>
      )}
    </div>
  );
}

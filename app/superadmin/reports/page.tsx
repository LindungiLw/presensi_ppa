"use client";

import { useState, useEffect, useRef } from "react";

// Custom Dropdown Component to override native OS styling
const CustomSelect = ({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="w-full h-[46px] px-4 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-emerald-900" : "text-emerald-700 font-bold"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className={`w-4 h-4 text-emerald-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-emerald-100 rounded-xl shadow-xl overflow-hidden">
          <div 
            className="px-4 py-3 bg-emerald-700 text-white font-bold cursor-pointer hover:bg-emerald-800 transition-colors"
            onClick={() => { onChange("all"); setIsOpen(false); }}
          >
            {placeholder}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {options.map(o => (
              <div 
                key={o.value} 
                className="px-4 py-3 hover:bg-emerald-50 cursor-pointer text-emerald-900 font-medium border-t border-emerald-50 transition-colors"
                onClick={() => { onChange(o.value); setIsOpen(false); }}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mentorId, setMentorId] = useState("all");
  const [mentors, setMentors] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/superadmin/mentors")
      .then(res => res.json())
      .then(data => {
        if (data.success) setMentors(data.mentors);
      });
  }, []);

  const handleDownload = () => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (mentorId) params.append("mentorId", mentorId);
    window.open(`/api/reports/export?${params.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-emerald-950">Pusat Laporan</h1>
        <p className="text-emerald-700 mt-1">Kelola dan unduh semua jenis laporan absensi PPA.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-xs font-bold text-emerald-700 mb-1 uppercase tracking-wider">Pilih Mentor</label>
          <CustomSelect 
            value={mentorId} 
            onChange={setMentorId} 
            options={mentors.map(m => ({ value: m.id, label: m.nama }))}
            placeholder="-- Semua Mentor --" 
          />
        </div>
        
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-xs font-bold text-emerald-700 mb-1 uppercase tracking-wider">Mulai Tanggal</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-[46px] bg-white border border-emerald-200 rounded-xl px-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm font-medium text-emerald-900" 
          />
        </div>

        <div className="flex-1 w-full md:w-auto">
          <label className="block text-xs font-bold text-emerald-700 mb-1 uppercase tracking-wider">Sampai Tanggal</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full h-[46px] bg-white border border-emerald-200 rounded-xl px-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm font-medium text-emerald-900" 
          />
        </div>

        <button 
          onClick={handleDownload}
          className="w-full md:w-auto h-[46px] flex items-center justify-center gap-2 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Unduh Excel
        </button>
      </div>

      {(!startDate && !endDate) && (
        <p className="text-sm text-emerald-600 mt-2 font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-100 inline-block">
          💡 Karena Anda tidak memilih rentang tanggal, file yang diunduh akan berisi riwayat absensi <strong>keseluruhan (All-Time)</strong>.
        </p>
      )}
    </div>
  );
}

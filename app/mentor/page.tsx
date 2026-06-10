"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function MentorDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [localAttendance, setLocalAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/mentor/students?date=${selectedDate}`);
    const data = await res.json();
    if (data.success) {
      setStudents(data.students);
      
      const initialAttendance: Record<string, string> = {};
      data.students.forEach((s: any) => {
        if (s.absensi && s.absensi.length > 0) {
          initialAttendance[s.id_siswa] = s.absensi[0].status;
        }
      });
      setLocalAttendance(initialAttendance);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleAttendanceChange = (id_siswa: string, status: string) => {
    setLocalAttendance(prev => ({ ...prev, [id_siswa]: status }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const updates = Object.entries(localAttendance).map(([id_siswa, status]) => ({ id_siswa, status }));
    
    const res = await fetch("/api/mentor/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates, date: selectedDate })
    });
    
    if (res.ok) {
      toast.success(`Seluruh absensi tanggal ${selectedDate} berhasil disimpan!`);
      fetchData(); // Refresh to sync exactly with database
    } else {
      toast.error("Gagal menyimpan absensi. Silakan coba lagi.");
    }
    setIsSaving(false);
  };

  const getStatusColor = (status: string, currentStatus?: string | null) => {
    const isSelected = status === currentStatus;
    if (!isSelected) return "bg-gray-100 text-gray-500 hover:bg-gray-200 border-transparent";
    
    switch (status) {
      case "Hadir": return "bg-emerald-100 text-emerald-800 border-emerald-400 font-bold ring-2 ring-emerald-200";
      case "Izin": return "bg-blue-100 text-blue-800 border-blue-400 font-bold ring-2 ring-blue-200";
      case "Sakit": return "bg-amber-100 text-amber-800 border-amber-400 font-bold ring-2 ring-amber-200";
      case "Alpa": return "bg-rose-100 text-rose-800 border-rose-400 font-bold ring-2 ring-rose-200";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">Checklist Absensi</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-emerald-700 font-medium">Tanggal:</span>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-emerald-200 rounded-lg px-3 py-1 text-emerald-900 focus:ring-2 focus:ring-emerald-500 font-bold"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="text-sm font-bold text-emerald-600 bg-emerald-100 px-4 py-2 rounded-lg hover:bg-emerald-200 transition-colors">
            Refresh
          </button>
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="text-sm font-bold text-white bg-teal-600 px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Unduh Laporan
          </button>
        </div>
      </div>

      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-emerald-900">Pilih Rentang Tanggal</h2>
            <p className="text-sm text-slate-500">Tentukan rentang tanggal untuk mengekspor rekap absensi. Jika dikosongkan, semua riwayat absensi sejak awal akan diekspor.</p>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">Mulai Tanggal</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  const params = new URLSearchParams();
                  if (startDate) params.append("startDate", startDate);
                  if (endDate) params.append("endDate", endDate);
                  window.open(`/api/reports/export?${params.toString()}`, "_blank");
                  setIsExportModalOpen(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-emerald-200 rounded-2xl w-full"></div>
          <div className="h-20 bg-emerald-200 rounded-2xl w-full"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-3xl shadow-sm border border-emerald-100">
          <p className="text-emerald-600">Belum ada siswa yang ditugaskan kepada Anda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-emerald-50 text-emerald-800 text-sm">
                  <th className="p-4 font-bold border-b border-emerald-100 w-32">ID Siswa</th>
                  <th className="p-4 font-bold border-b border-emerald-100 min-w-[200px]">Nama Siswa</th>
                  <th className="p-4 font-bold border-b border-emerald-100">Kelas</th>
                  <th className="p-4 font-bold border-b border-emerald-100 text-center">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const currentStatus = localAttendance[student.id_siswa] || null;
                  return (
                    <tr key={student.id_siswa} className="border-b border-emerald-50 hover:bg-emerald-50/30">
                      <td className="p-4 text-sm text-emerald-900 font-medium">{student.id_siswa}</td>
                      <td className="p-4 text-sm text-emerald-900">{student.nama}</td>
                      <td className="p-4 text-sm text-emerald-600">{student.nama_class}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-center min-w-[140px] sm:min-w-0">
                          {["Hadir", "Izin", "Sakit", "Alpa"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleAttendanceChange(student.id_siswa, opt)}
                              className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${getStatusColor(opt, currentStatus)}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-emerald-100 bg-emerald-50/50 flex justify-end">
            <button 
              onClick={handleSaveAll}
              disabled={isSaving || Object.keys(localAttendance).length === 0}
              className="px-6 py-2.5 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold rounded-xl shadow-sm transition-colors"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Simpan Absensi
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

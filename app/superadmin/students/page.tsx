"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

// Custom Dropdown Component to override native OS styling
const CustomSelect = ({ value, onChange, options, placeholder, isSmall = false, isLoading = false }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], placeholder: string, isSmall?: boolean, isLoading?: boolean }) => {
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
        className={`${isSmall ? 'px-2 py-1.5 text-xs rounded-lg' : 'w-full h-[46px] px-4 rounded-xl'} border ${isLoading ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-white'} focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-between cursor-pointer transition-colors`}
        onClick={() => !isLoading && setIsOpen(!isOpen)}
      >
        <span className={isLoading ? "text-amber-700 font-bold" : (selectedOption ? "text-emerald-900 font-bold" : (isSmall ? "text-emerald-800" : "text-emerald-700"))}>
          {isLoading ? "Menyimpan..." : (selectedOption ? selectedOption.label : placeholder)}
        </span>
        {!isLoading && (
          <svg className={`w-4 h-4 text-emerald-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        )}
      </div>
      {isOpen && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-emerald-100 rounded-xl shadow-xl overflow-hidden">
          <div 
            className={`${isSmall ? 'px-3 py-2 text-xs' : 'px-4 py-3'} bg-emerald-700 text-white font-bold cursor-pointer hover:bg-emerald-800 transition-colors`}
            onClick={() => { onChange(""); setIsOpen(false); }}
          >
            {placeholder}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {options.map(o => (
              <div 
                key={o.value} 
                className={`${isSmall ? 'px-3 py-2 text-xs' : 'px-4 py-3'} hover:bg-emerald-50 cursor-pointer text-emerald-900 font-medium border-t border-emerald-50 transition-colors`}
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

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingMentorId, setSavingMentorId] = useState<string | null>(null);
  const [successMentorId, setSuccessMentorId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [idSiswa, setIdSiswa] = useState("");
  const [nama, setNama] = useState("");
  const [namaClass, setNamaClass] = useState("");
  const [mentorId, setMentorId] = useState("");

  const fetchData = async (page = 1) => {
    const [resStud, resMent] = await Promise.all([
      fetch(`/api/superadmin/students?page=${page}&limit=25`),
      fetch("/api/superadmin/mentors")
    ]);
    const dStud = await resStud.json();
    const dMent = await resMent.json();
    
    if (dStud.success) {
      setStudents(dStud.students);
      if (dStud.pagination) {
        setCurrentPage(dStud.pagination.page);
        setTotalPages(dStud.pagination.totalPages || 1);
      }
    }
    if (dMent.success) setMentors(dMent.mentors);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/superadmin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_siswa: idSiswa, nama, nama_class: namaClass, mentor_id: mentorId }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Siswa berhasil ditambahkan!");
      setIdSiswa(""); setNama(""); setNamaClass(""); setMentorId("");
      fetchData(currentPage);
    } else {
      toast.error(data.error || "Gagal menambahkan siswa.");
    }
    setLoading(false);
  };

  const handleAssignMentor = async (studentId: string, newMentorId: string) => {
    setSavingMentorId(studentId);
    const res = await fetch("/api/superadmin/students", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_siswa: studentId, mentor_id: newMentorId }),
    });
    if (res.ok) {
      await fetchData(currentPage);
      setSavingMentorId(null);
      setSuccessMentorId(studentId);
      setTimeout(() => setSuccessMentorId(null), 2000);
    } else {
      setSavingMentorId(null);
      toast.error("Gagal mengupdate mentor.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950">Manajemen Siswa</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
          <h2 className="text-lg font-bold text-emerald-800 mb-4">Tambah Siswa Baru</h2>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">ID / NIM Siswa</label>
              <input type="text" value={idSiswa} onChange={(e) => setIdSiswa(e.target.value)} required className="w-full h-[46px] px-4 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">Nama Lengkap</label>
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full h-[46px] px-4 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">Kelas / Angkatan</label>
              <input type="text" value={namaClass} onChange={(e) => setNamaClass(e.target.value)} required className="w-full h-[46px] px-4 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">Assign ke Mentor (Opsional)</label>
              <CustomSelect 
                value={mentorId} 
                onChange={setMentorId} 
                options={mentors.map(m => ({ value: m.id, label: m.nama }))}
                placeholder="-- Pilih Mentor --" 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
              {loading ? "Menambahkan..." : "Tambah Siswa"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-4 border-b border-emerald-100 bg-emerald-50/50">
            <h2 className="text-lg font-bold text-emerald-800">Daftar Siswa</h2>
          </div>
          {/* Prevent clipping dropdowns by allowing vertical overflow */}
          <div className="overflow-x-auto overflow-y-visible pb-24">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50 text-emerald-800 text-sm">
                  <th className="p-4 font-bold border-b border-emerald-100">ID</th>
                  <th className="p-4 font-bold border-b border-emerald-100">Nama</th>
                  <th className="p-4 font-bold border-b border-emerald-100">Kelas</th>
                  <th className="p-4 font-bold border-b border-emerald-100">Hadir (Bulan Ini)</th>
                  <th className="p-4 font-bold border-b border-emerald-100">Mentor</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-emerald-600">Belum ada siswa.</td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id_siswa} className="border-b border-emerald-50 hover:bg-emerald-50/30">
                      <td className="p-4 text-sm text-emerald-900 font-medium">{s.id_siswa}</td>
                      <td className="p-4 text-sm text-emerald-900">{s.nama}</td>
                      <td className="p-4 text-sm text-emerald-600">{s.nama_class}</td>
                      <td className="p-4 text-sm text-emerald-600 font-bold">
                        {s.total_hadir_bulan_ini} <span className="text-xs font-normal text-emerald-400">kali</span>
                      </td>
                      <td className="p-4 text-sm relative">
                        <div className="flex items-center gap-2">
                          <div className="w-48">
                            <CustomSelect 
                              value={s.mentor_id || ""} 
                              onChange={(newVal) => handleAssignMentor(s.id_siswa, newVal)} 
                              options={mentors.map(m => ({ value: m.id, label: m.nama }))}
                              placeholder="-- Unassigned --" 
                              isSmall={true}
                              isLoading={savingMentorId === s.id_siswa}
                            />
                          </div>
                          {successMentorId === s.id_siswa && (
                            <svg className="w-5 h-5 text-emerald-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-emerald-100 bg-white">
              <span className="text-sm text-emerald-600">
                Halaman <span className="font-bold">{currentPage}</span> dari <span className="font-bold">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => fetchData(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg disabled:opacity-50 hover:bg-emerald-100 transition-colors"
                >
                  Prev
                </button>
                <button 
                  onClick={() => fetchData(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg disabled:opacity-50 hover:bg-emerald-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

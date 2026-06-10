"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function MentorsPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<{id: string, nama: string} | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchMentors = async () => {
    const res = await fetch("/api/superadmin/mentors");
    const data = await res.json();
    if (data.success) setMentors(data.mentors);
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/superadmin/mentors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, email, password }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Mentor berhasil ditambahkan!");
      setNama("");
      setEmail("");
      setPassword("");
      fetchMentors();
    } else {
      toast.error(data.error || "Gagal menambahkan mentor.");
    }
    setLoading(false);
  };

  const openResetModal = (mentorId: string, mentorNama: string) => {
    setSelectedMentor({ id: mentorId, nama: mentorNama });
    setNewPassword("");
    setIsResetModalOpen(true);
  };

  const submitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !newPassword) return;
    
    setLoading(true);
    const res = await fetch("/api/superadmin/mentors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId: selectedMentor.id, newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Password untuk ${selectedMentor.nama} berhasil direset!`);
      setIsResetModalOpen(false);
    } else {
      toast.error(data.error || "Gagal mereset password.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-950">Manajemen Mentor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
          <h2 className="text-lg font-bold text-emerald-800 mb-4">Tambah Mentor Baru</h2>
          <form onSubmit={handleAddMentor} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">Nama Lengkap</label>
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full h-[46px] px-4 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-[46px] px-4 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-[46px] px-4 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
              {loading ? "Menambahkan..." : "Tambah Mentor"}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-4 border-b border-emerald-100 bg-emerald-50/50">
            <h2 className="text-lg font-bold text-emerald-800">Daftar Mentor</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50 text-emerald-800 text-sm">
                  <th className="p-4 font-bold border-b border-emerald-100">Nama</th>
                  <th className="p-4 font-bold border-b border-emerald-100">Email</th>
                  <th className="p-4 font-bold border-b border-emerald-100">Password</th>
                  <th className="p-4 font-bold border-b border-emerald-100">Jml Siswa</th>
                  <th className="p-4 font-bold border-b border-emerald-100">Tgl Bergabung</th>
                  <th className="p-4 font-bold border-b border-emerald-100 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mentors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-emerald-600">Belum ada mentor.</td>
                  </tr>
                ) : (
                  mentors.map((m) => (
                    <tr key={m.id} className="border-b border-emerald-50 hover:bg-emerald-50/30">
                      <td className="p-4 text-sm text-emerald-900 font-medium">{m.nama}</td>
                      <td className="p-4 text-sm text-emerald-600">{m.email}</td>
                      <td className="p-4 text-sm text-emerald-600">••••••••</td>
                      <td className="p-4 text-sm text-emerald-600 font-bold">
                        {m._count?.students || 0} <span className="text-xs font-normal text-emerald-400">siswa</span>
                      </td>
                      <td className="p-4 text-sm text-emerald-600">{new Date(m.createdAt).toLocaleDateString("id-ID")}</td>
                      <td className="p-4 text-sm text-center">
                        <button onClick={() => openResetModal(m.id, m.nama)} className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-semibold transition-colors">
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isResetModalOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all">
            <h3 className="text-xl font-extrabold text-emerald-950 mb-2">Reset Password Mentor</h3>
            <p className="text-sm text-emerald-600 mb-6">
              Masukkan password baru untuk <strong className="text-emerald-800">{selectedMentor.nama}</strong>.
            </p>
            <form onSubmit={submitResetPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-1.5">Password Baru</label>
                <input 
                  type="text" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-emerald-900 font-medium placeholder:text-emerald-300"
                  placeholder="Ketik password baru..." 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsResetModalOpen(false)} className="flex-1 px-4 py-3 bg-white border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200">
                  {loading ? "Menyimpan..." : "Simpan Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

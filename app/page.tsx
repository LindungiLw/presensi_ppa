"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal.");
      }

      // Route based on role
      if (data.role === "SUPERADMIN") {
        router.push("/superadmin");
      } else if (data.role === "MENTOR") {
        router.push("/mentor");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`${font.className} min-h-screen bg-emerald-50 flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-200/50 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-200/50 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-md relative z-10 mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-200 mb-4 transform rotate-3">
            <span className="text-white text-2xl font-black">PPA DELADA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight">Presensi PPA Delada</h1>
          <p className="text-xs sm:text-sm text-emerald-600/80 mt-1 font-medium">Silakan login untuk mengelola absensi</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center animate-in zoom-in-95 duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-emerald-900 font-medium placeholder:text-emerald-300"
              placeholder="masukkan email"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-emerald-900 font-medium placeholder:text-emerald-300"
              placeholder="masukkan password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memproses...
              </>
            ) : (
              "Masuk ke Portal"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

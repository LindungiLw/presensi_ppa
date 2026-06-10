"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  // Custom Unique Logo SVG
  const Logo = () => (
    <svg viewBox="0 0 100 100" className="w-8 h-8 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ppaGradMentor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="url(#ppaGradMentor)" opacity="0.9" />
      <path d="M50 5 L50 50 L90 25 Z" fill="#10b981" />
      <path d="M10 25 L50 50 L50 95 Z" fill="#047857" opacity="0.8" />
      <circle cx="50" cy="50" r="15" fill="#ffffff" />
      <path d="M46 45 L46 55 M50 45 L50 55 M54 45 L54 55" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className={`${font.className} min-h-screen bg-slate-50 flex flex-col`}>
      {/* Top Navbar */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Logo />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-emerald-50 leading-none">PPA DELADA IO-126</span>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Mentor Portal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-900/50 hover:bg-emerald-900 text-emerald-50 font-bold rounded-lg text-sm transition-colors border border-emerald-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

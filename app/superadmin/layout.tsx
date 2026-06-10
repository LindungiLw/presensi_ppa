"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const navs = [
    { name: "Dashboard", href: "/superadmin", icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
    { name: "Manajemen Mentor", href: "/superadmin/mentors", icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /> },
    { name: "Manajemen Siswa", href: "/superadmin/students", icon: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" /> },
    { name: "Laporan", href: "/superadmin/reports", icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
  ];

  // Custom Unique Logo SVG
  const Logo = () => (
    <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ppaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="url(#ppaGrad)" opacity="0.9" />
      <path d="M50 5 L50 50 L90 25 Z" fill="#10b981" />
      <path d="M10 25 L50 50 L50 95 Z" fill="#047857" opacity="0.8" />
      <circle cx="50" cy="50" r="15" fill="#ffffff" />
      <path d="M46 45 L46 55 M50 45 L50 55 M54 45 L54 55" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className={`${font.className} h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden`}>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-emerald-900 text-white p-4 shadow-md z-20 relative">
        <div className="flex items-center gap-3">
          <Logo />
          <h2 className="text-xl font-black tracking-tight text-emerald-100 leading-tight">PPA DELADA IO-126<br/><span className="text-sm font-medium text-emerald-300/80">Superadmin</span></h2>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-emerald-800 rounded-lg focus:outline-none"
        >
          <svg className="w-6 h-6 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 z-40 w-64 md:w-64 h-full bg-emerald-900 text-emerald-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} shadow-2xl md:shadow-none`}>
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-emerald-800/50">
          <Logo />
          <h2 className="text-xl font-black tracking-tight text-emerald-100 leading-tight">PPA DELADA IO-126<br/><span className="text-sm font-medium text-emerald-300/80">Superadmin</span></h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navs.map((nav) => {
            const isActive = pathname === nav.href;
            return (
              <Link 
                key={nav.href} 
                href={nav.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${isActive ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/20" : "text-emerald-200 hover:bg-emerald-800/50 hover:text-white"}`}
              >
                <svg className={`w-5 h-5 ${isActive ? "text-emerald-200" : "text-emerald-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {nav.icon}
                  {nav.name === "Manajemen Mentor" && <circle cx="9" cy="7" r="4" />}
                  {nav.name === "Manajemen Siswa" && <path d="M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />}
                  {nav.name === "Laporan" && <polyline points="14 2 14 8 20 8" />}
                  {nav.name === "Laporan" && <line x1="16" y1="13" x2="8" y2="13" />}
                  {nav.name === "Laporan" && <line x1="16" y1="17" x2="8" y2="17" />}
                  {nav.name === "Laporan" && <polyline points="10 9 9 9 8 9" />}
                </svg>
                {nav.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-emerald-800/50 mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold rounded-xl text-sm transition-colors text-left group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full h-full overflow-y-auto p-4 md:p-8 bg-slate-50/50 relative md:ml-0">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

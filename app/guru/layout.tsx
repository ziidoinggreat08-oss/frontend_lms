"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (!token || role !== "guru") {
      router.push("/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500 text-sm">
        Memuat portal guru...
      </div>
    );
  }

  const isActive = (path: string) =>
    pathname === path || (path !== "/guru/dashboard" && pathname.startsWith(path));

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition duration-150 ${
      active
        ? "bg-[#003399] text-white shadow-sm"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const getPageTitle = () => {
    if (pathname === "/guru/dashboard") return "Dashboard Guru";
    if (pathname.startsWith("/guru/materi")) return "Materi Pembelajaran";
    if (pathname.startsWith("/guru/tugas")) return "Penugasan Siswa";
    if (pathname.startsWith("/guru/kuis")) return "Kuis Harian Digital";
    if (pathname.startsWith("/guru/ujian")) return "Ujian Semester (PTS/PAS)";
    if (pathname.startsWith("/guru/nilai")) return "Rekap Nilai Siswa";
    if (pathname.startsWith("/guru/profil")) return "Profil Pendidik";
    return "Portal Guru";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-800">
      {/* Sidebar Guru */}
      <aside className="w-[260px] bg-white border-r border-slate-200 shadow-xs flex flex-col z-10 shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-slate-100 gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003399] text-white font-black text-lg shadow-xs">
            🎓
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#003399] tracking-wider leading-none">EDU CLASS</h1>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Portal Guru Pengajar</p>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-5">
          {/* Dashboard */}
          <div>
            <Link href="/guru/dashboard" className={navItemClass(isActive("/guru/dashboard"))}>
              <span className="text-base">📊</span>
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Menu Pembelajaran */}
          <div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 px-3">
              Kegiatan Belajar
            </h3>
            <div className="space-y-1">
              <Link href="/guru/materi" className={navItemClass(isActive("/guru/materi"))}>
                <span className="text-base">📖</span>
                <span>Materi Belajar</span>
              </Link>
              <Link href="/guru/tugas" className={navItemClass(isActive("/guru/tugas"))}>
                <span className="text-base">📝</span>
                <span>Tugas Siswa</span>
              </Link>
              <Link href="/guru/kuis" className={navItemClass(isActive("/guru/kuis"))}>
                <span className="text-base">⏱️</span>
                <span>Kuis Harian</span>
              </Link>
              <Link href="/guru/ujian" className={navItemClass(isActive("/guru/ujian"))}>
                <span className="text-base">📋</span>
                <span>Ujian Semester</span>
              </Link>
            </div>
          </div>

          {/* Menu Penilaian */}
          <div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 px-3">
              Evaluasi &amp; Nilai
            </h3>
            <div className="space-y-1">
              <Link href="/guru/nilai" className={navItemClass(isActive("/guru/nilai"))}>
                <span className="text-base">🎯</span>
                <span>Rekap Nilai Siswa</span>
              </Link>
            </div>
          </div>

          {/* Akun Pendidik */}
          <div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 px-3">
              Akun Saya
            </h3>
            <div className="space-y-1">
              <Link href="/guru/profil" className={navItemClass(isActive("/guru/profil"))}>
                <span className="text-base">👤</span>
                <span>Profil Pendidik</span>
              </Link>
            </div>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/70 mt-auto shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[#003399] flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
              {user.username?.charAt(0).toUpperCase() || "G"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user.username}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role || "Guru Pengajar"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            Logout Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-8 shadow-xs shrink-0 backdrop-blur-md">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Edu Class / Guru</p>
            <h2 className="text-base font-bold text-[#003399] capitalize leading-tight">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Semester Aktif: 2025/2026 Ganjil
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

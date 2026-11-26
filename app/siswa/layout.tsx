"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const menu = [
  ["🏠", "Dashboard", "/siswa/dashboard"],
  ["📚", "Materi Belajar", "/siswa/materi"],
  ["📝", "Tugas Siswa", "/siswa/tugas"],
  ["✦", "Quiz Interaktif", "/siswa/quiz"],
  ["📋", "Ujian Semester", "/siswa/ujian"],
  ["🗂️", "Riwayat Tugas", "/siswa/riwayat-tugas"],
  ["🗓️", "Jadwal Belajar", "/siswa/jadwal"],
  ["🔔", "Notifikasi", "/siswa/notifikasi"],
  ["👤", "Profil Saya", "/siswa/profil"],
];

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (!token || role !== "siswa") {
      router.replace("/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const title = menu.find(([, , href]) => href === pathname)?.[1] || "Portal Siswa";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-800">
      {/* Sidebar Siswa */}
      <aside className="w-[260px] bg-white border-r border-slate-200 shadow-xs flex flex-col z-10 shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-slate-100 gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003399] text-white font-black text-lg shadow-xs">
            🎓
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#003399] tracking-wider leading-none">EDU CLASS</h1>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Portal Siswa</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menu.slice(0, 5).map(([icon, n, h]) => (
              <Link
                key={h}
                href={h}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                  pathname === h
                    ? "bg-[#003399] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{icon}</span>
                <span>{n}</span>
              </Link>
            ))}
          </div>

          <p className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Aktivitas &amp; Akun
          </p>

          <div className="space-y-1">
            {menu.slice(5).map(([icon, n, h]) => (
              <Link
                key={h}
                href={h}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                  pathname === h
                    ? "bg-[#003399] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{icon}</span>
                <span>{n}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User Card & Logout */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/70 mt-auto shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[#003399] flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
              {user?.username?.charAt(0).toUpperCase() || "S"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.username || "Siswa"}</p>
              <p className="text-[10px] text-slate-400 capitalize">Peserta Didik</p>
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
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur-md shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Edu Class / Siswa</p>
            <h2 className="text-base font-bold capitalize text-[#003399] leading-tight">{title}</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Aktif Belajar
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

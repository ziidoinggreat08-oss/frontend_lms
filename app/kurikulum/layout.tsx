"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function KurikulumLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (!token || (role !== "kurikulum" && role !== "admin")) {
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
        Memuat portal kurikulum...
      </div>
    );
  }

  const isActive = (path: string) =>
    pathname === path || (path !== "/kurikulum/dashboard" && pathname.startsWith(path));

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 w-full text-left px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition ${
      active
        ? "bg-[#003399] text-white shadow-sm font-semibold"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const navLinks = [
    { href: "/kurikulum/dashboard", label: "Dashboard Monitoring", icon: "📊" },
    { href: "/kurikulum/akademik", label: "Data Akademik (Kelas & Jurusan)", icon: "🏫" },
    { href: "/kurikulum/pengampu", label: "Mapel & Guru Pengampu", icon: "📚" },
    { href: "/kurikulum/monitoring", label: "Monitoring Pembelajaran", icon: "🔍" },
    { href: "/kurikulum/nilai", label: "Rekap Nilai Siswa", icon: "🎯" },
    { href: "/kurikulum/profil", label: "Profil Akun", icon: "👤" },
  ];

  const currentTitle =
    navLinks.find((item) => isActive(item.href))?.label || "Portal Kurikulum";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar Kurikulum */}
      <aside className="w-[270px] bg-white border-r border-slate-200 shadow-xs flex flex-col z-10 shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#003399] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            🎓
          </div>
          <div>
            <h1 className="text-base font-bold text-[#003399] tracking-wide leading-none">EDU CLASS</h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Portal Kurikulum</p>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2 px-3">
              Pengawasan Akademik
            </h3>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navItemClass(isActive(link.href))}>
                  <span className="text-lg">{link.icon}</span>
                  <span className="truncate">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
            <p className="text-xs font-semibold text-[#003399]">Mode View-Only</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Hak akses kurikulum difokuskan untuk memonitor mutu, alokasi guru, dan progres capaian belajar sekolah.
            </p>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/70 mt-auto shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-[#003399] flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs">
              {user.username?.charAt(0).toUpperCase() || "K"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user.username}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role || "Kurikulum"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            Logout Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-xs shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#003399] capitalize">
              {currentTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Semester Aktif: 2025/2026 Ganjil
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

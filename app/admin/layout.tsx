"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDataAkademikOpen, setIsDataAkademikOpen] = useState(
    pathname.startsWith("/admin/jurusan") ||
    pathname.startsWith("/admin/kelas") ||
    pathname.startsWith("/admin/mata-pelajaran")
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (!token || role !== "admin") {
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
        Memuat portal admin...
      </div>
    );
  }

  const isActive = (path: string) =>
    pathname === path || (path !== "/admin/dashboard" && pathname.startsWith(path));

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition duration-150 ${
      active
        ? "bg-[#003399] text-white shadow-sm"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const subNavItemClass = (active: boolean) =>
    `flex items-center gap-2.5 w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium transition duration-150 ${
      active
        ? "bg-blue-50 text-[#003399] font-bold"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;

  const getPageTitle = () => {
    if (pathname === "/admin/dashboard") return "Dashboard Admin";
    if (pathname.startsWith("/admin/siswa")) return "Manajemen Siswa";
    if (pathname.startsWith("/admin/guru")) return "Manajemen Guru";
    if (pathname.startsWith("/admin/jurusan")) return "Manajemen Jurusan";
    if (pathname.startsWith("/admin/kelas")) return "Manajemen Kelas";
    if (pathname.startsWith("/admin/mata-pelajaran")) return "Mata Pelajaran";
    if (pathname.startsWith("/admin/kurikulum")) return "Manajemen Kurikulum";
    if (pathname.startsWith("/admin/kepala-sekolah")) return "Kepala Sekolah";
    if (pathname.startsWith("/admin/profil")) return "Profil Administrator";
    return "Admin Control Center";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-800">
      {/* Sidebar Admin */}
      <aside className="w-[260px] bg-white border-r border-slate-200 shadow-xs flex flex-col z-10 shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-slate-100 gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003399] text-white font-black text-lg shadow-xs">
            🎓
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#003399] tracking-wider leading-none">EDU CLASS</h1>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Portal Administrator</p>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-5">
          {/* Dashboard */}
          <div>
            <Link href="/admin/dashboard" className={navItemClass(isActive("/admin/dashboard"))}>
              <span className="text-base">📊</span>
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Pengguna Sekolah */}
          <div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 px-3">
              Manajemen Pengguna
            </h3>
            <div className="space-y-1">
              <Link href="/admin/siswa" className={navItemClass(isActive("/admin/siswa"))}>
                <span className="text-base">👨‍🎓</span>
                <span>Data Siswa</span>
              </Link>
              <Link href="/admin/guru" className={navItemClass(isActive("/admin/guru"))}>
                <span className="text-base">👨‍🏫</span>
                <span>Data Guru</span>
              </Link>
            </div>
          </div>

          {/* Master Akademik (Accordion) */}
          <div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 px-3">
              Data Akademik
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setIsDataAkademikOpen(!isDataAkademikOpen)}
                className={`flex items-center justify-between w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  (isActive("/admin/jurusan") || isActive("/admin/kelas") || isActive("/admin/mata-pelajaran")) && !isDataAkademikOpen
                    ? "bg-[#003399] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">🏫</span>
                  <span>Struktur &amp; Mapel</span>
                </div>
                <span className={`text-[10px] transition-transform ${isDataAkademikOpen ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {isDataAkademikOpen && (
                <div className="mt-1 pl-3 space-y-1 border-l-2 border-slate-100 ml-4">
                  <Link href="/admin/jurusan" className={subNavItemClass(isActive("/admin/jurusan"))}>
                    <span>🏢</span>
                    <span>Jurusan</span>
                  </Link>
                  <Link href="/admin/kelas" className={subNavItemClass(isActive("/admin/kelas"))}>
                    <span>🏫</span>
                    <span>Kelas Rombel</span>
                  </Link>
                  <Link href="/admin/mata-pelajaran" className={subNavItemClass(isActive("/admin/mata-pelajaran"))}>
                    <span>📚</span>
                    <span>Mata Pelajaran</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Pimpinan & Staf */}
          <div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 px-3">
              Pimpinan &amp; Staf
            </h3>
            <div className="space-y-1">
              <Link href="/admin/kurikulum" className={navItemClass(isActive("/admin/kurikulum"))}>
                <span className="text-base">📋</span>
                <span>Tim Kurikulum</span>
              </Link>
              <Link href="/admin/kepala-sekolah" className={navItemClass(isActive("/admin/kepala-sekolah"))}>
                <span className="text-base">👔</span>
                <span>Kepala Sekolah</span>
              </Link>
            </div>
          </div>

          {/* Akun Administrator */}
          <div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 px-3">
              Akun Saya
            </h3>
            <div className="space-y-1">
              <Link href="/admin/profil" className={navItemClass(isActive("/admin/profil"))}>
                <span className="text-base">👤</span>
                <span>Profil Saya</span>
              </Link>
            </div>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/70 mt-auto shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[#003399] flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
              {user.username?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user.username}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role || "Administrator"}</p>
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Edu Class / Admin</p>
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

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isJurusanKelasOpen, setIsJurusanKelasOpen] = useState(
    pathname.startsWith("/admin/jurusan") || pathname.startsWith("/admin/kelas")
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

  if (!user) return <div className="flex h-screen items-center justify-center">Memuat...</div>;

  const isActive = (path: string) => pathname.startsWith(path);

  const navItemClass = (active: boolean) =>
    `block w-full text-left px-4 py-2 rounded-lg text-[15px] transition ${
      active
        ? "bg-[#e2e2e2] border border-[#a3a3a3] text-black font-medium"
        : "text-black hover:bg-gray-100 border border-transparent"
    }`;

  const subNavItemClass = (active: boolean) =>
    `block w-full text-left px-4 py-1.5 rounded-lg text-[14px] transition ${
      active
        ? "text-blue-600 font-semibold"
        : "text-gray-600 hover:text-black"
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f6]">
      {/* Sidebar (Light Theme based on image) */}
      <aside className="w-[260px] bg-white border-r border-gray-200 shadow-sm flex flex-col z-10">
        <div className="flex h-16 items-center justify-center border-b border-gray-100 shrink-0">
          <h1 className="text-xl font-bold text-[#003399] tracking-wide">EDU CLASS</h1>
        </div>
        
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Dashboard */}
          <div className="mb-6">
            <Link href="/admin/dashboard" className={navItemClass(isActive("/admin/dashboard"))}>
              Dashboard
            </Link>
          </div>

          {/* Menejemen Data */}
          <div className="mb-6">
            <h3 className="text-[#003399] text-[15px] font-semibold mb-3 px-2">Menejemen Data</h3>
            
            <div className="space-y-2 pl-2">
              {/* Jurusan & Kelas Dropdown / Accordion */}
              <div>
                <button 
                  onClick={() => setIsJurusanKelasOpen(!isJurusanKelasOpen)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-[15px] transition flex justify-between items-center ${
                    (isActive("/admin/jurusan") || isActive("/admin/kelas")) && !isJurusanKelasOpen
                      ? "bg-[#e2e2e2] border border-[#a3a3a3] text-black font-medium"
                      : "text-black hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <span>Jurusan & Kelas</span>
                  <svg className={`w-4 h-4 transition-transform ${isJurusanKelasOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                
                {isJurusanKelasOpen && (
                  <div className="mt-1 pl-4 space-y-1 border-l-2 border-gray-100 ml-4">
                    <Link href="/admin/jurusan" className={subNavItemClass(isActive("/admin/jurusan"))}>
                      Jurusan
                    </Link>
                    <Link href="/admin/kelas" className={subNavItemClass(isActive("/admin/kelas"))}>
                      Kelas
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/admin/mata-pelajaran" className={navItemClass(isActive("/admin/mata-pelajaran"))}>
                Mapel
              </Link>
            </div>
          </div>

          {/* Menejemen Pengguna */}
          <div className="mb-6">
            <h3 className="text-[#003399] text-[15px] font-semibold mb-3 px-2">Menejemen Pengguna</h3>
            
            <div className="space-y-2 pl-2">
              <Link href="/admin/guru" className={navItemClass(isActive("/admin/guru"))}>
                Guru
              </Link>
              <Link href="/admin/siswa" className={navItemClass(isActive("/admin/siswa"))}>
                Siswa
              </Link>
              <Link href="/admin/kurikulum" className={navItemClass(isActive("/admin/kurikulum"))}>
                Kurikulum
              </Link>
              <Link href="/admin/kepala-sekolah" className={navItemClass(isActive("/admin/kepala-sekolah"))}>
                Kepala Sekolah
              </Link>
            </div>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-100 p-5 bg-gray-50 mt-auto shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-[#003399] flex items-center justify-center font-bold text-lg text-white shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.username}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm shrink-0">
          <h2 className="text-lg font-bold text-[#003399] capitalize">
            {pathname === "/admin/dashboard" 
              ? "Dashboard" 
              : pathname.split("/").pop()?.replace(/-/g, " ")}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function KepalaSekolahProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${api}/api/profil/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (data && typeof data === "object") {
              setProfile(data);
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat profil kepala sekolah:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-3 border-[#003399] border-t-transparent rounded-full mx-auto mb-3"></div>
        Memuat profil pimpinan lembaga dari database...
      </div>
    );
  }

  const p = profile || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-[#003399] mb-2 border border-blue-100">
          <span>👤</span>
          <span>Identitas Pimpinan Lembaga (View-Only)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          Profil Akun Kepala Sekolah
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kredensial resmi dan rincian identitas pimpinan eksekutif SMK Citra Negara di platform Edu Class.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {/* Cover Banner Mewah dengan Avatar & Nama di Dalamnya */}
        <div className="bg-gradient-to-r from-[#1d3557] via-[#102a45] to-[#003399] p-6 sm:p-8 rounded-t-3xl relative">
          <div className="absolute right-6 top-6">
            <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20 shadow-xs">
              PIMPINAN SEKOLAH
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 pt-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/30 shadow-lg shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-3xl sm:text-4xl shadow-xs">
                👔
              </div>
            </div>
            <div className="text-white space-y-1">
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                {p.nama_lengkap || p.username || "-"}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-blue-100 flex items-center gap-2">
                <span>NIP: {p.nip && p.nip !== "-" ? p.nip : "-"}</span>
                <span>&bull;</span>
                <span>SMK Citra Negara</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info details Murni Database */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">NIP Kepegawaian</p>
              <p className="font-mono font-bold text-slate-800 text-sm">
                {p.nip && p.nip !== "-" ? p.nip : "-"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">Jabatan Formal</p>
              <p className="font-bold text-slate-800 text-sm">
                {p.jabatan || "Kepala Sekolah (Pimpinan Eksekutif)"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">Username Login</p>
              <p className="font-mono font-bold text-slate-800 text-sm">
                @{p.username || "-"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">Email Kedinasan</p>
              <p className="font-bold text-slate-800 text-sm">
                {p.email || "-"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">Nomor Telepon</p>
              <p className="font-mono font-bold text-slate-800 text-sm">
                {p.no_telepon && p.no_telepon !== "-" ? p.no_telepon : "-"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">Hak Akses Sistem</p>
              <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-[#003399] font-bold text-[11px] border border-blue-200 mt-0.5">
                Read-Only (Monitoring Makro & Laporan)
              </span>
            </div>
          </div>

          {/* Security & Access Statement */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Kebijakan Keamanan Akun Pimpinan</span>
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Role Kepala Sekolah difokuskan pada pengawasan mutu dan rekapitulasi penilaian sekolah. Seluruh hak manipulasi akun dan master data berada di bawah kendali Administrator Sekolah.
            </p>
          </div>

          {/* Logout Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Sesi terenkripsi token JWT aktif
            </span>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
            >
              <span>🚪</span>
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto">
              🚪
            </div>
            <h3 className="text-base font-bold text-slate-800 text-center">
              Konfirmasi Keluar Akun
            </h3>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Apakah Anda yakin ingin mengakhiri sesi login Kepala Sekolah?
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

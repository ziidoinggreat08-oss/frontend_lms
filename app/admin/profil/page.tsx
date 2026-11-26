"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function AdminProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        console.error("Gagal memuat profil admin:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-3 border-[#003399] border-t-transparent rounded-full mx-auto mb-3"></div>
        Memuat profil administrator dari database...
      </div>
    );
  }

  const p = profile || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-[#003399] mb-2 border border-blue-100">
          <span>🛡️</span>
          <span>Identitas Administrator Sistem (View-Only)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          Profil Administrator
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Identitas resmi akun pengelola sistem Edu Class LMS.
        </p>
      </div>

      {/* Main Profile Card (Digital ID Card) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {/* Cover Banner Mewah dengan Avatar & Nama di Dalamnya */}
        <div className="bg-gradient-to-r from-[#1d3557] via-[#102a45] to-[#003399] p-6 sm:p-8 rounded-t-3xl relative">
          <div className="absolute right-6 top-6">
            <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20 shadow-xs">
              EDU CLASS ADMIN
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 pt-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/30 shadow-lg shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-3xl sm:text-4xl font-black text-[#003399] shadow-xs">
                🛡️
              </div>
            </div>
            <div className="text-white space-y-1">
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                {p.nama_lengkap || p.username || "Administrator"}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-blue-100 flex items-center gap-2">
                <span>{p.jabatan || "Administrator Utama"}</span>
                <span>&bull;</span>
                <span>Edu Class Control Center</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status & Peran Badge Bar */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Status Akun:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Aktif
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Otoritas:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003399] font-bold border border-blue-200 text-[11px]">
                Full System Admin
              </span>
            </div>
          </div>

          {/* Grid Informasi Detail Murni Database */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">Nama Lengkap</p>
              <p className="font-bold text-slate-800 text-sm">
                {p.nama_lengkap || p.username || "Administrator"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">Peran / Jabatan</p>
              <p className="font-bold text-slate-800 text-sm">
                {p.jabatan || "Administrator Utama"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">Username Login</p>
              <p className="font-mono font-bold text-slate-800 text-sm">
                @{p.username || "admin"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">Email Terdaftar</p>
              <p className="font-bold text-slate-800 text-sm">
                {p.email || "-"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">Nomor Telepon / Kontak</p>
              <p className="font-mono font-bold text-slate-800 text-sm">
                {p.no_telepon && p.no_telepon !== "-" ? p.no_telepon : "-"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-slate-400 font-medium">Cakupan Tanggung Jawab</p>
              <p className="font-semibold text-slate-700 text-xs">
                {p.deskripsi_tugas || "Pengelola seluruh data akademik, pengguna, dan pengaturan sistem."}
              </p>
            </div>
          </div>

          {/* Kotak Catatan Kebijakan Resmi */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
            <span className="text-base shrink-0">ℹ️</span>
            <div className="space-y-0.5">
              <p className="font-bold">Kebijakan Pengelolaan Akun</p>
              <p className="text-blue-800/80 leading-relaxed">
                Halaman ini menampilkan ringkasan data identitas pengguna resmi yang tersimpan di sistem. Seluruh penyesuaian kredensial akun dan keamanan terpusat pada panel kontrol Administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

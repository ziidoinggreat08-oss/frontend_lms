"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function Dashboard() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetch(`${api}/api/siswa/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            setD(data);
          }
        }
      } catch (err) {
        console.error("Gagal memuat dashboard siswa:", err);
      }
    };
    void loadDashboard();
  }, []);

  if (!d) {
    return (
      <div className="animate-pulse space-y-5">
        <div className="h-40 rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((x) => (
            <div key={x} className="h-28 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const s = d.ringkasan_tugas || {};
  const done = Number(s.sudah_dikumpulkan || 0);
  const todo = Number(s.belum_dikerjakan || 0);
  const late = Number(s.terlambat || 0);
  const total = Math.max(1, done + todo);
  const progress = Math.round((done / total) * 100);

  const statCards = [
    {
      label: "Belum dikerjakan",
      total: todo,
      color: "bg-blue-50 text-blue-700",
      icon: "📝",
      href: "/siswa/tugas?tab=belum",
      desc: "Tugas menunggu dikerjakan",
    },
    {
      label: "Sudah dikumpulkan",
      total: done,
      color: "bg-emerald-50 text-emerald-700",
      icon: "✓",
      href: "/siswa/tugas?tab=sudah",
      desc: "Tugas selesai dikirim",
    },
    {
      label: "Terlambat",
      total: late,
      color: "bg-amber-50 text-amber-700",
      icon: "⏰",
      href: "/siswa/tugas?tab=belum",
      desc: "Melewati batas deadline",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      {/* Banner Selamat Datang */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d3557] via-[#1647b8] to-[#0f2c78] p-7 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
        <div className="relative">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Portal Pembelajaran Siswa
          </span>
          <h1 className="mt-4 text-3xl font-extrabold">
            Halo, {d.profil?.nama_lengkap?.split(" ")[0] || "Siswa"}! 👋
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Siapkan dirimu untuk belajar, membaca materi, dan menyelesaikan tugas tepat waktu.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg bg-white/15 px-3 py-2">NIS: {d.profil?.nis || "-"}</span>
            <span className="rounded-lg bg-white/15 px-3 py-2">{d.profil?.kelas || "-"}</span>
            <span className="rounded-lg bg-white/15 px-3 py-2">{d.profil?.jurusan || "-"}</span>
          </div>
        </div>
      </section>

      {/* 3 Card Statistik Ringkasan Tugas (Bisa Diklik & Interaktif) */}
      <section className="grid gap-4 sm:grid-cols-3">
        {statCards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {c.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-800">
                  {c.total}
                </p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-lg ${c.color} shadow-xs`}>
                {c.icon}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{c.desc}</p>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs font-semibold text-blue-600 group-hover:text-blue-800">
              <span>Buka daftar tugas</span>
              <span className="group-hover:translate-x-1 transition-transform">↗</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Grid Konten: Tugas Terdekat & Progres/Aktivitas */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Daftar Tugas Terdekat */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800 text-base">Tugas terdekat</h2>
                <p className="text-xs text-slate-500">
                  Klik tugas untuk langsung membuka instruksi dan mengumpulkannya.
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                {d.tugas_terdekat?.length || 0} tugas
              </span>
            </div>

            {d.tugas_terdekat?.length ? (
              <div className="space-y-3">
                {d.tugas_terdekat.map((x: any, i: number) => (
                  <Link
                    key={x.id}
                    href={`/siswa/tugas?id=${x.id}`}
                    className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all duration-200 hover:bg-blue-50/70 hover:border-blue-200 hover:shadow-xs group cursor-pointer"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700 group-hover:bg-[#003399] group-hover:text-white transition">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800 group-hover:text-[#003399] transition">
                        {x.judul}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{x.mata_pelajaran}</p>
                    </div>
                    <div className="text-right text-xs shrink-0">
                      <p className="font-semibold text-amber-600">Tenggat</p>
                      <p className="text-slate-600">{x.deadline}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 group-hover:text-[#003399] group-hover:translate-x-0.5 transition shrink-0 ml-1">
                      Buka ↗
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                Tidak ada tugas dengan tenggat mendatang.
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Progres & Akses Belajar Cepat */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="font-bold text-slate-800 text-sm">Progres tugas</h2>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1d3557] to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {progress}% tugas tercatat sudah dikumpulkan.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="font-bold text-slate-800 text-sm">Lanjut belajar</h2>
            <div className="mt-4 space-y-2.5">
              <Link
                href="/siswa/materi"
                className="flex items-center justify-between rounded-xl bg-blue-50/70 p-3 text-xs font-bold text-blue-700 border border-blue-100/80 hover:bg-blue-100 transition cursor-pointer"
              >
                <span>📚 Jelajahi Materi</span>
                <span>↗</span>
              </Link>
              <Link
                href="/siswa/tugas"
                className="flex items-center justify-between rounded-xl bg-emerald-50/70 p-3 text-xs font-bold text-emerald-700 border border-emerald-100/80 hover:bg-emerald-100 transition cursor-pointer"
              >
                <span>📝 Lihat Semua Tugas</span>
                <span>↗</span>
              </Link>
              <Link
                href="/siswa/quiz"
                className="flex items-center justify-between rounded-xl bg-violet-50/70 p-3 text-xs font-bold text-violet-700 border border-violet-100/80 hover:bg-violet-100 transition cursor-pointer"
              >
                <span>✦ Periksa Kuis & Ujian</span>
                <span>↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

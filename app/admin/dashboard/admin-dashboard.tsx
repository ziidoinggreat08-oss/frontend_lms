"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { username: string };
type Stats = { total_siswa: number; total_guru: number; total_kelas: number; total_jurusan: number; total_mata_pelajaran: number };
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const savedUser = localStorage.getItem("user");
    if (!token || role !== "admin") { router.push("/login"); return; }
    if (savedUser) setUser(JSON.parse(savedUser) as User);
    fetch(`${apiUrl}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Gagal memuat statistik");
        setStats(data);
      })
      .catch((err: Error) => setError(err.message));
  }, [router]);

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("role"); localStorage.removeItem("user"); router.push("/"); };
  const cards = [
    ["Total Siswa", stats?.total_siswa, "bg-blue-50 text-blue-700"],
    ["Total Guru", stats?.total_guru, "bg-green-50 text-green-700"],
    ["Total Kelas", stats?.total_kelas, "bg-purple-50 text-purple-700"],
    ["Total Jurusan", stats?.total_jurusan, "bg-orange-50 text-orange-700"],
    ["Mata Pelajaran", stats?.total_mata_pelajaran, "bg-cyan-50 text-cyan-700"],
  ] as const;

  if (!user) return <div className="p-10 text-center">Memuat dashboard...</div>;
  return <main className="min-h-screen bg-slate-50 p-8 text-slate-800"><div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm"><h1 className="text-2xl font-bold text-[#1d3557]">Dashboard Admin</h1><p className="mt-2 text-slate-600">Selamat datang kembali, <strong>{user.username}</strong>!</p>{error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, total, color]) => <div key={label} className={`rounded-lg border border-slate-100 p-4 ${color}`}><h2 className="text-sm font-semibold">{label}</h2><p className="mt-1 text-3xl font-bold">{total ?? "..."}</p></div>)}</div><div className="mt-8 flex flex-wrap gap-3"><Link href="/admin/siswa" className="rounded-lg bg-[#1d3557] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#274b7a]">Kelola Data Siswa</Link><button onClick={logout} className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100">Logout</button></div></div></main>;
}

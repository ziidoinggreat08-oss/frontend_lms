"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Stats = {
  total_siswa: number;
  total_guru: number;
  total_kelas: number;
  total_jurusan: number;
  total_mapel: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.status === 401 || response.status === 403) {
          router.push("/login");
          return;
        }
        if (!response.ok) throw new Error("Gagal mengambil data statistik");
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchStats();
  }, [router]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d3557]">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">Ringkasan sistem pembelajaran Edu Class</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 font-medium">Total Siswa</h3>
            <span className="text-2xl">👨‍🎓</span>
          </div>
          <p className="text-4xl font-bold text-[#1d3557] mt-4">{stats ? stats.total_siswa : "..."}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 font-medium">Total Guru</h3>
            <span className="text-2xl">👨‍🏫</span>
          </div>
          <p className="text-4xl font-bold text-[#1d3557] mt-4">{stats ? stats.total_guru : "..."}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 font-medium">Total Kelas</h3>
            <span className="text-2xl">🏫</span>
          </div>
          <p className="text-4xl font-bold text-[#1d3557] mt-4">{stats ? stats.total_kelas : "..."}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 font-medium">Total Jurusan</h3>
            <span className="text-2xl">🏢</span>
          </div>
          <p className="text-4xl font-bold text-[#1d3557] mt-4">{stats ? stats.total_jurusan : "..."}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 font-medium">Mata Pelajaran</h3>
            <span className="text-2xl">📚</span>
          </div>
          <p className="text-4xl font-bold text-[#1d3557] mt-4">{stats ? stats.total_mapel : "..."}</p>
        </div>
      </div>
    </div>
  );
}

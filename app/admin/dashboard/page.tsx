"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Cek token dan role
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

  if (!user) return <div className="p-10 text-center">Memuat dashboard...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-[#1d3557]">Dashboard Admin</h1>
        <p className="mt-2 text-gray-600">Selamat datang kembali, <strong>{user.username}</strong>!</p>
        
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-blue-800 font-semibold text-sm">Total Siswa</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">--</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-green-800 font-semibold text-sm">Total Guru</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">--</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="text-purple-800 font-semibold text-sm">Total Kelas</h3>
            <p className="text-2xl font-bold text-purple-600 mt-1">--</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <h3 className="text-orange-800 font-semibold text-sm">Jurusan</h3>
            <p className="text-2xl font-bold text-orange-600 mt-1">--</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="mt-10 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-semibold transition"
        >
          Logout
        </button>
      </div>
    </main>
  );
}


"use client";

import { useEffect, useState, useMemo } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Kelas = {
  id: number;
  nama_kelas: string;
  tingkat: "X" | "XI" | "XII";
  jurusan_id: number;
  nama_jurusan: string;
  kode_jurusan?: string;
  tahun_ajaran_id: number;
  tahun_ajaran?: string;
  wali_kelas_id?: number | null;
  wali_kelas_nama?: string;
  jumlah_siswa?: number;
};

type JurusanOption = {
  id: number;
  kode_jurusan: string;
  nama_jurusan: string;
};

type GuruOption = {
  id: number;
  nama_lengkap: string;
};

export default function KelasPage() {
  const [data, setData] = useState<Kelas[]>([]);
  const [jurusanList, setJurusanList] = useState<JurusanOption[]>([]);
  const [guruList, setGuruList] = useState<GuruOption[]>([]);
  
  // Filter & Navigasi Terstruktur
  const [selectedJurusanId, setSelectedJurusanId] = useState<string>("all");
  const [selectedTingkat, setSelectedTingkat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Form State
  const [form, setForm] = useState({
    nama_kelas: "",
    tingkat: "X" as "X" | "XI" | "XII",
    jurusan_id: "",
    nomor_rombel: "1",
    wali_kelas_id: "",
    tahun_ajaran_id: "1",
  });
  const [isManualName, setIsManualName] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };
      const [kelasRes, jurusanRes, guruRes] = await Promise.all([
        fetch(`${API_URL}/api/kelas`, { headers }),
        fetch(`${API_URL}/api/jurusan`, { headers }),
        fetch(`${API_URL}/api/guru`, { headers }).catch(() => null),
      ]);

      const kelasJson = await kelasRes.json();
      const jurusanJson = await jurusanRes.json();
      let guruJson: GuruOption[] = [];
      if (guruRes && guruRes.ok) {
        guruJson = await guruRes.json();
      }

      setData(Array.isArray(kelasJson) ? kelasJson : []);
      setJurusanList(Array.isArray(jurusanJson) ? jurusanJson : []);
      setGuruList(Array.isArray(guruJson) ? guruJson : []);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat data kelas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update auto generated nama_kelas jika bukan mode manual edit
  useEffect(() => {
    if (!isManualName && form.jurusan_id) {
      const selectedJur = jurusanList.find((j) => String(j.id) === String(form.jurusan_id));
      const code = selectedJur ? selectedJur.kode_jurusan : "";
      const generated = `${form.tingkat} ${code} ${form.nomor_rombel}`.trim();
      setForm((prev) => ({ ...prev, nama_kelas: generated }));
    }
  }, [form.tingkat, form.jurusan_id, form.nomor_rombel, isManualName, jurusanList]);

  // Fungsi pencari nomor rombel berikutnya secara otomatis
  const getNextRombelNumber = (jurId: string | number, tk: string): string => {
    if (!jurId) return "1";

    // 1. Ambil semua kelas pada jurusan dan tingkat yang sama
    const filtered = data.filter(
      (k) => String(k.jurusan_id) === String(jurId) && k.tingkat === tk
    );

    if (filtered.length === 0) return "1";

    // 2. Ambil angka rombel dari akhir nama kelas (contoh: "X PPLG 1" -> 1, "X PPLG 2" -> 2)
    const numbers = filtered
      .map((k) => {
        const parts = k.nama_kelas.trim().split(" ");
        const last = parts[parts.length - 1];
        const parsed = parseInt(last, 10);
        return isNaN(parsed) ? 0 : parsed;
      })
      .filter((n) => n > 0);

    if (numbers.length === 0) return String(filtered.length + 1);

    // 3. Cari angka rombel tertinggi lalu tambah 1
    const maxNumber = Math.max(...numbers);
    return String(maxNumber + 1);
  };

  const handleJurusanChange = (newJurId: string) => {
    if (!editingId && !isManualName) {
      const nextRombel = getNextRombelNumber(newJurId, form.tingkat);
      const selectedJur = jurusanList.find((j) => String(j.id) === String(newJurId));
      const code = selectedJur ? selectedJur.kode_jurusan : "";
      const generated = `${form.tingkat} ${code} ${nextRombel}`.trim();
      setForm((prev) => ({
        ...prev,
        jurusan_id: newJurId,
        nomor_rombel: nextRombel,
        nama_kelas: generated,
      }));
    } else {
      setForm((prev) => ({ ...prev, jurusan_id: newJurId }));
    }
  };

  const handleTingkatChange = (newTingkat: "X" | "XI" | "XII") => {
    if (!editingId && !isManualName) {
      const nextRombel = getNextRombelNumber(form.jurusan_id, newTingkat);
      const selectedJur = jurusanList.find((j) => String(j.id) === String(form.jurusan_id));
      const code = selectedJur ? selectedJur.kode_jurusan : "";
      const generated = `${newTingkat} ${code} ${nextRombel}`.trim();
      setForm((prev) => ({
        ...prev,
        tingkat: newTingkat,
        nomor_rombel: nextRombel,
        nama_kelas: generated,
      }));
    } else {
      setForm((prev) => ({ ...prev, tingkat: newTingkat }));
    }
  };

  const openCreate = (defaultJurusanId?: number, defaultTingkat?: "X" | "XI" | "XII") => {
    const jurId = defaultJurusanId ? String(defaultJurusanId) : jurusanList[0]?.id ? String(jurusanList[0].id) : "";
    const tk = defaultTingkat || (selectedTingkat !== "all" ? (selectedTingkat as "X" | "XI" | "XII") : "X");
    
    // Hitung nomor rombel berikutnya secara otomatis
    const nextRombel = getNextRombelNumber(jurId, tk);

    const selectedJur = jurusanList.find((j) => String(j.id) === String(jurId));
    const code = selectedJur ? selectedJur.kode_jurusan : "";
    const defaultNama = `${tk} ${code} ${nextRombel}`.trim();

    setForm({
      nama_kelas: defaultNama,
      tingkat: tk,
      jurusan_id: jurId,
      nomor_rombel: nextRombel,
      wali_kelas_id: "",
      tahun_ajaran_id: "1",
    });
    setIsManualName(false);
    setEditingId(null);
    setError("");
    setIsOpen(true);
  };

  const openEdit = (item: Kelas) => {
    // Coba tebak nomor rombel dari nama_kelas terakhir
    const parts = item.nama_kelas.trim().split(" ");
    const lastPart = parts[parts.length - 1];
    const rombel = !isNaN(Number(lastPart)) ? lastPart : "1";

    setForm({
      nama_kelas: item.nama_kelas,
      tingkat: item.tingkat,
      jurusan_id: String(item.jurusan_id),
      nomor_rombel: rombel,
      wali_kelas_id: item.wali_kelas_id ? String(item.wali_kelas_id) : "",
      tahun_ajaran_id: String(item.tahun_ajaran_id || "1"),
    });
    setIsManualName(true); // Biarkan nama aslinya saat edit
    setEditingId(item.id);
    setError("");
    setIsOpen(true);
  };

  // Cek apakah nama kelas saat ini duplikat
  const isDuplicateName = useMemo(() => {
    if (!form.nama_kelas.trim()) return false;
    return data.some(
      (k) =>
        k.id !== editingId &&
        k.nama_kelas.trim().toLowerCase() === form.nama_kelas.trim().toLowerCase()
    );
  }, [data, form.nama_kelas, editingId]);

  // Daftar nomor rombel yang SUDAH digunakan pada jurusan dan tingkat ini
  const usedRombels = useMemo(() => {
    if (!form.jurusan_id) return new Set<string>();
    const filtered = data.filter(
      (k) =>
        String(k.jurusan_id) === String(form.jurusan_id) &&
        k.tingkat === form.tingkat &&
        k.id !== editingId
    );
    return new Set(
      filtered.map((k) => {
        const parts = k.nama_kelas.trim().split(" ");
        return parts[parts.length - 1];
      })
    );
  }, [data, form.jurusan_id, form.tingkat, editingId]);

  // Map guru yang sudah menjadi walas di kelas: guru_id -> nama_kelas
  const assignedWalasMap = useMemo(() => {
    const map = new Map<number, string>();
    data.forEach((k) => {
      if (k.wali_kelas_id) {
        map.set(k.wali_kelas_id, k.nama_kelas);
      }
    });
    return map;
  }, [data]);

  // Cek apakah guru yang dipilih sedang memegang kelas lain
  const isWalasConflict = useMemo(() => {
    if (!form.wali_kelas_id) return false;
    const selectedGuruId = Number(form.wali_kelas_id);
    const assignedKelas = assignedWalasMap.get(selectedGuruId);
    if (!assignedKelas) return false;
    const isCurrentKelasWalas = editingId
      ? data.find((k) => k.id === editingId)?.wali_kelas_id === selectedGuruId
      : false;
    return !isCurrentKelasWalas;
  }, [form.wali_kelas_id, assignedWalasMap, data, editingId]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicateName) {
      setError(`Kelas "${form.nama_kelas}" sudah terdaftar. Nomor rombel tidak boleh duplikat.`);
      return;
    }
    if (isWalasConflict) {
      const assignedKelas = assignedWalasMap.get(Number(form.wali_kelas_id));
      setError(`Guru yang dipilih sudah menjadi wali kelas di ${assignedKelas}. Satu guru hanya dapat menjadi walas di 1 kelas.`);
      return;
    }

    const url = editingId ? `${API_URL}/api/kelas/${editingId}` : `${API_URL}/api/kelas`;
    const method = editingId ? "PUT" : "POST";

    try {
      const payload: any = {
        nama_kelas: form.nama_kelas,
        tingkat: form.tingkat,
        jurusan_id: Number(form.jurusan_id),
        tahun_ajaran_id: Number(form.tahun_ajaran_id) || 1,
      };

      if (form.wali_kelas_id) {
        payload.wali_kelas_id = Number(form.wali_kelas_id);
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal menyimpan data kelas");
      }

      setMessage(editingId ? "Rombel kelas berhasil diubah" : "Rombel kelas baru berhasil ditambahkan");
      setTimeout(() => setMessage(""), 3500);
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan data");
    }
  };

  const remove = async (id: number, namaKelas: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus rombel kelas "${namaKelas}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/kelas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Gagal menghapus data kelas");
      }
      setMessage(`Kelas ${namaKelas} berhasil dihapus`);
      setTimeout(() => setMessage(""), 3500);
      loadData();
    } catch (e: any) {
      alert(e.message || "Gagal menghapus kelas");
    }
  };

  // Kalkulasi Statistik Keseluruhan
  const stats = useMemo(() => {
    const totalKelas = data.length;
    const totalSiswa = data.reduce((acc, curr) => acc + (curr.jumlah_siswa || 0), 0);
    const perTingkat = {
      X: data.filter((k) => k.tingkat === "X").length,
      XI: data.filter((k) => k.tingkat === "XI").length,
      XII: data.filter((k) => k.tingkat === "XII").length,
    };
    return { totalKelas, totalSiswa, perTingkat };
  }, [data]);

  // Data Terstruktur Berdasarkan Jurusan & Angkatan / Tingkat
  const structuredData = useMemo(() => {
    return jurusanList
      .filter((jur) => selectedJurusanId === "all" || String(jur.id) === selectedJurusanId)
      .map((jur) => {
        const kelasInJurusan = data.filter((k) => k.jurusan_id === jur.id);
        const tingkatGroups: Record<"X" | "XI" | "XII", Kelas[]> = {
          X: kelasInJurusan.filter(
            (k) =>
              k.tingkat === "X" &&
              (selectedTingkat === "all" || selectedTingkat === "X") &&
              (searchQuery === "" || k.nama_kelas.toLowerCase().includes(searchQuery.toLowerCase()))
          ),
          XI: kelasInJurusan.filter(
            (k) =>
              k.tingkat === "XI" &&
              (selectedTingkat === "all" || selectedTingkat === "XI") &&
              (searchQuery === "" || k.nama_kelas.toLowerCase().includes(searchQuery.toLowerCase()))
          ),
          XII: kelasInJurusan.filter(
            (k) =>
              k.tingkat === "XII" &&
              (selectedTingkat === "all" || selectedTingkat === "XII") &&
              (searchQuery === "" || k.nama_kelas.toLowerCase().includes(searchQuery.toLowerCase()))
          ),
        };

        const totalInJurusan = tingkatGroups.X.length + tingkatGroups.XI.length + tingkatGroups.XII.length;
        const totalSiswaJurusan = [...tingkatGroups.X, ...tingkatGroups.XI, ...tingkatGroups.XII].reduce(
          (sum, k) => sum + (k.jumlah_siswa || 0),
          0
        );

        return {
          jurusan: jur,
          tingkatGroups,
          totalInJurusan,
          totalSiswaJurusan,
        };
      })
      .filter((group) => {
        // Jika sedang mencari kata kunci, sembunyikan jurusan yang tidak ada kelas yang cocok
        if (searchQuery.trim() !== "") {
          return group.totalInJurusan > 0;
        }
        return true;
      });
  }, [jurusanList, data, selectedJurusanId, selectedTingkat, searchQuery]);

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-blue-50 text-[#003399]">
              Manajemen Rombel
            </span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-xs text-slate-500 font-medium">Struktur Akademik</span>
          </div>
          <h1 className="text-2xl font-black text-[#1d3557] mt-1 tracking-tight">
            Data Kelas & Rombongan Belajar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengelolaan rombel kelas terstruktur per jurusan dan per angkatan (Tingkat X, XI, XII).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openCreate()}
            className="bg-[#003399] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm shadow-blue-900/10 active:scale-95 cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            <span>Tambah Rombel Kelas</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center text-[#003399] font-bold text-lg">
            🏢
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Rombel</div>
            <div className="text-xl font-black text-[#1d3557]">{stats.totalKelas} <span className="text-xs font-normal text-slate-400">Kelas</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg">
            👥
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Siswa</div>
            <div className="text-xl font-black text-[#1d3557]">{stats.totalSiswa} <span className="text-xs font-normal text-slate-400">Siswa</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
            X
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tingkat X</div>
            <div className="text-xl font-black text-indigo-700">{stats.perTingkat.X} <span className="text-xs font-normal text-slate-400">Rombel</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-sm">
            XI
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tingkat XI</div>
            <div className="text-xl font-black text-amber-700">{stats.perTingkat.XI} <span className="text-xs font-normal text-slate-400">Rombel</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 col-span-2 sm:col-span-1">
          <div className="w-11 h-11 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-sm">
            XII
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tingkat XII</div>
            <div className="text-xl font-black text-rose-700">{stats.perTingkat.XII} <span className="text-xs font-normal text-slate-400">Rombel</span></div>
          </div>
        </div>
      </div>

      {/* Pesan Notifikasi Sukses */}
      {message && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <span className="text-emerald-600 font-bold">✓</span>
          <span>{message}</span>
        </div>
      )}

      {/* Filter Bar Navigasi Terstruktur */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Tabs Filter Jurusan */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Jurusan:
            </span>
            <button
              onClick={() => setSelectedJurusanId("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedJurusanId === "all"
                  ? "bg-[#003399] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
              }`}
            >
              Semua Jurusan ({jurusanList.length})
            </button>
            {jurusanList.map((jur) => {
              const count = data.filter((k) => k.jurusan_id === jur.id).length;
              return (
                <button
                  key={jur.id}
                  onClick={() => setSelectedJurusanId(String(jur.id))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedJurusanId === String(jur.id)
                      ? "bg-[#003399] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                  }`}
                >
                  {jur.kode_jurusan} ({count})
                </button>
              );
            })}
          </div>

          {/* Mode Tampilan (Card vs Table) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0 self-start lg:self-auto">
            <button
              onClick={() => setViewMode("card")}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                viewMode === "card" ? "bg-white text-[#003399] shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ⊞ Grid Rombel
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                viewMode === "table" ? "bg-white text-[#003399] shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ☰ Tabel List
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs Filter Tingkat / Angkatan */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Angkatan:
            </span>
            {(["all", "X", "XI", "XII"] as const).map((tk) => (
              <button
                key={tk}
                onClick={() => setSelectedTingkat(tk)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  selectedTingkat === tk
                    ? "bg-[#1d3557] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tk === "all" ? "Semua Tingkat" : `Kelas ${tk}`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari rombel kelas..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
            />
            <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Konten Terstruktur Berdasarkan Jurusan & Angkatan */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-sm">
          <div className="animate-spin w-8 h-8 border-3 border-[#003399] border-t-transparent rounded-full mx-auto mb-3"></div>
          Memuat susunan data rombel kelas...
        </div>
      ) : structuredData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
          <div className="text-3xl mb-2">📂</div>
          <p className="font-semibold text-slate-700">Tidak ada rombel kelas yang ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter jurusan, angkatan, atau kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {structuredData.map(({ jurusan, tingkatGroups, totalInJurusan, totalSiswaJurusan }) => (
            <div
              key={jurusan.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
            >
              {/* Header Kartu Jurusan */}
              <div className="p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#003399] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {jurusan.kode_jurusan}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#1d3557]">{jurusan.nama_jurusan}</h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#003399] border border-blue-100">
                        {jurusan.kode_jurusan}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Total {totalInJurusan} Rombongan Belajar • {totalSiswaJurusan} Siswa Terdaftar
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openCreate(jurusan.id)}
                    className="text-xs font-semibold bg-blue-50 text-[#003399] hover:bg-[#003399] hover:text-white px-3 py-1.5 rounded-lg border border-blue-200/80 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>+</span> Tambah Rombel di {jurusan.kode_jurusan}
                  </button>
                </div>
              </div>

              {/* Kelompok Per Angkatan (X, XI, XII) */}
              <div className="p-5 space-y-6">
                {(["X", "XI", "XII"] as const)
                  .filter((tk) => selectedTingkat === "all" || selectedTingkat === tk)
                  .map((tk) => {
                    const kelasList = tingkatGroups[tk];
                    return (
                      <div key={tk} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-black px-2 py-0.5 rounded text-white ${
                                tk === "X"
                                  ? "bg-indigo-600"
                                  : tk === "XI"
                                  ? "bg-amber-600"
                                  : "bg-rose-600"
                              }`}
                            >
                              Tingkat {tk}
                            </span>
                            <span className="text-xs font-semibold text-slate-600">
                              Angkatan {tk} ({kelasList.length} Rombel)
                            </span>
                          </div>
                          <button
                            onClick={() => openCreate(jurusan.id, tk)}
                            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>+ Tambah Rombel {tk}</span>
                          </button>
                        </div>

                        {kelasList.length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
                            <p className="text-xs text-slate-400">
                              Belum ada rombel kelas untuk Tingkat {tk} di jurusan ini.
                            </p>
                            <button
                              onClick={() => openCreate(jurusan.id, tk)}
                              className="mt-1 text-xs text-[#003399] font-semibold hover:underline cursor-pointer"
                            >
                              + Buat rombel pertama
                            </button>
                          </div>
                        ) : viewMode === "card" ? (
                          /* Tampilan Grid Kartu Rombel */
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {kelasList.map((k) => (
                              <div
                                key={k.id}
                                className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition duration-150 relative flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="text-base font-black text-[#1d3557] group-hover:text-[#003399] transition">
                                      {k.nama_kelas}
                                    </div>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                      {k.tingkat}
                                    </span>
                                  </div>

                                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-slate-400">👥</span>
                                      <span>
                                        <strong className="text-slate-700">{k.jumlah_siswa || 0}</strong> Siswa
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 truncate" title={k.wali_kelas_nama || "Belum ada wali kelas"}>
                                      <span className="text-slate-400">👨‍🏫</span>
                                      <span className="truncate">
                                        Wali: {k.wali_kelas_nama || <em className="text-slate-400">Belum diset</em>}
                                      </span>
                                    </div>
                                    {k.tahun_ajaran && (
                                      <div className="text-[11px] text-slate-400">
                                        TA: {k.tahun_ajaran}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openEdit(k)}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-[#003399] hover:bg-blue-100 transition cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => remove(k.id, k.nama_kelas)}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Tampilan Tabel Ringkas */
                          <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                                  <th className="p-3">Nama Rombel</th>
                                  <th className="p-3">Tingkat</th>
                                  <th className="p-3">Wali Kelas</th>
                                  <th className="p-3 text-center">Jumlah Siswa</th>
                                  <th className="p-3 text-right">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {kelasList.map((k) => (
                                  <tr key={k.id} className="hover:bg-slate-50/80 transition">
                                    <td className="p-3 font-bold text-slate-800">{k.nama_kelas}</td>
                                    <td className="p-3">
                                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                        {k.tingkat}
                                      </span>
                                    </td>
                                    <td className="p-3 text-slate-600">
                                      {k.wali_kelas_nama || <span className="text-slate-400 italic">Belum diset</span>}
                                    </td>
                                    <td className="p-3 text-center font-bold text-slate-700">
                                      {k.jumlah_siswa || 0}
                                    </td>
                                    <td className="p-3 text-right space-x-2">
                                      <button
                                        onClick={() => openEdit(k)}
                                        className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => remove(k.id, k.nama_kelas)}
                                        className="text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                                      >
                                        Hapus
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit Rombel Kelas */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form
            onSubmit={save}
            className="bg-white p-6 sm:p-7 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-[#1d3557]">
                  {editingId ? "Edit Rombel Kelas" : "Tambah Rombel Kelas Baru"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Isi informasi rombongan belajar secara terstruktur
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Jurusan & Tingkat Berdampingan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Jurusan *
                  </label>
                  <select
                    className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-[#003399] bg-white text-xs font-semibold"
                    value={form.jurusan_id}
                    onChange={(e) => handleJurusanChange(e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Jurusan --</option>
                    {jurusanList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.kode_jurusan} ({j.nama_jurusan})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Angkatan / Tingkat *
                  </label>
                  <select
                    className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-[#003399] bg-white text-xs font-semibold"
                    value={form.tingkat}
                    onChange={(e) => handleTingkatChange(e.target.value as "X" | "XI" | "XII")}
                    required
                  >
                    <option value="X">Tingkat X (Kelas 10)</option>
                    <option value="XI">Tingkat XI (Kelas 11)</option>
                    <option value="XII">Tingkat XII (Kelas 12)</option>
                  </select>
                </div>
              </div>

              {/* Rombel Index & Generator */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Nomor Rombel Ke-
                    </label>
                    {!editingId && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-[#003399] border border-blue-200 rounded-md">
                        Otomatis terhitung: {form.nomor_rombel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {Array.from(
                      { length: Math.max(5, Number(form.nomor_rombel) || 1) },
                      (_, i) => i + 1
                    ).map((num) => {
                      const isUsed = usedRombels.has(String(num));
                      const isSelected = form.nomor_rombel === String(num);

                      return (
                        <button
                          type="button"
                          key={num}
                          disabled={isUsed && !editingId}
                          onClick={() => {
                            if (!isUsed || editingId) {
                              setForm((prev) => ({ ...prev, nomor_rombel: String(num) }));
                              setIsManualName(false);
                            }
                          }}
                          title={
                            isUsed
                              ? `Rombel ke-${num} sudah terdaftar (tidak boleh duplikat)`
                              : `Pilih rombel ke-${num}`
                          }
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                            isSelected
                              ? "bg-[#003399] text-white shadow-xs"
                              : isUsed && !editingId
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50 line-through"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Nama Kelas (Label Resmi) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsManualName(!isManualName)}
                      className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                    >
                      {isManualName ? "Gunakan Penamaan Otomatis" : "Ubah Format Manual"}
                    </button>
                  </div>
                  <input
                    type="text"
                    className={`w-full border p-2.5 rounded-xl outline-none text-sm font-bold bg-white transition ${
                      isDuplicateName
                        ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500 text-red-900 bg-red-50/20"
                        : "border-slate-300 focus:border-[#003399] focus:ring-1 focus:ring-[#003399] text-[#1d3557]"
                    }`}
                    value={form.nama_kelas}
                    onChange={(e) => {
                      setIsManualName(true);
                      setForm({ ...form, nama_kelas: e.target.value });
                    }}
                    placeholder="Contoh: X PPLG 1"
                    required
                  />
                  {isDuplicateName ? (
                    <div className="mt-2 p-2.5 bg-red-50 text-red-700 rounded-lg border border-red-200 text-xs font-medium flex items-center gap-1.5 animate-in fade-in duration-100">
                      <span>⚠️</span>
                      <span>
                        Kelas <strong>{form.nama_kelas}</strong> sudah terdaftar di sistem. Nomor rombel tidak boleh duplikat.
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Format standar: <strong>[Tingkat] [Kode Jurusan] [Nomor Rombel]</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Wali Kelas Opsional */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Wali Kelas (Opsional)
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    1 guru hanya dapat menjadi walas di 1 kelas
                  </span>
                </div>
                <select
                  className={`w-full border p-2.5 rounded-xl outline-none text-xs transition ${
                    isWalasConflict
                      ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500"
                      : "border-slate-300 focus:border-[#003399] bg-white"
                  }`}
                  value={form.wali_kelas_id}
                  onChange={(e) => setForm({ ...form, wali_kelas_id: e.target.value })}
                >
                  <option value="">-- Belum Ditentukan (Kosongkan) --</option>
                  {guruList.map((g) => {
                    const assignedKelas = assignedWalasMap.get(g.id);
                    const isCurrentKelasWalas = editingId
                      ? data.find((k) => k.id === editingId)?.wali_kelas_id === g.id
                      : false;
                    const isUnavailable = assignedKelas && !isCurrentKelasWalas;

                    return (
                      <option
                        key={g.id}
                        value={g.id}
                        disabled={Boolean(isUnavailable)}
                        className={isUnavailable ? "text-slate-400 bg-slate-100" : "text-slate-800 font-medium"}
                      >
                        {isUnavailable
                          ? `${g.nama_lengkap} (Sudah Walas di ${assignedKelas} - Tidak Tersedia)`
                          : g.nama_lengkap}
                      </option>
                    );
                  })}
                </select>
                {isWalasConflict && (
                  <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1 animate-in fade-in duration-100">
                    <span>⚠️</span>
                    <span>
                      Guru ini sudah menjadi wali kelas di <strong>{assignedWalasMap.get(Number(form.wali_kelas_id))}</strong>. Pilih guru lain atau kosongkan kelas sebelumnya.
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isDuplicateName || isWalasConflict}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  isDuplicateName || isWalasConflict
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-[#003399] hover:bg-blue-800 text-white cursor-pointer"
                }`}
              >
                {editingId ? "Simpan Perubahan" : "Buat Rombel Kelas"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface LampiranItem {
  id?: number;
  nama_file: string;
  file_url: string;
  tipe_file?: string;
  ukuran_file?: number;
}

interface TugasItem {
  id: number;
  judul: string;
  deskripsi: string;
  mata_pelajaran: string;
  guru: string;
  tanggal_diberikan: string;
  deadline: string;
  waktu_kumpul: string;
  status: "belum_dikerjakan" | "sudah_dikumpulkan" | "terlambat";
  file_lampiran: string;
  file_url: string;
  catatan_siswa: string;
  status_penilaian?: string;
  nilai?: number;
  catatan_guru?: string;
  lampiran_guru?: LampiranItem[];
  berkas_pengumpulan?: LampiranItem[];
}

function SiswaTugasContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const idParam = searchParams.get("id");

  const [tugasList, setTugasList] = useState<TugasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"semua" | "belum" | "sudah">("semua");
  const [selectedMapel, setSelectedMapel] = useState("all");

  // State untuk modal detail & kumpulkan
  const [selectedTugas, setSelectedTugas] = useState<TugasItem | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [catatanSiswa, setCatatanSiswa] = useState("");
  const [uploading, setUploading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Set tab aktif berdasarkan query parameter (misal dari dashboard ?tab=belum atau ?tab=sudah)
  useEffect(() => {
    if (tabParam === "belum" || tabParam === "sudah" || tabParam === "semua") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const loadTugas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${api}/api/siswa/tugas`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setTugasList(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error("Gagal memuat tugas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTugas();
  }, []);

  // Buka otomatis modal detail jika query ?id=... ada di URL (misal saat klik tugas terdekat di dashboard)
  useEffect(() => {
    if (idParam && tugasList.length > 0) {
      const targetId = Number(idParam);
      const targetTugas = tugasList.find((t) => t.id === targetId);
      if (targetTugas) {
        handleOpenDetail(targetTugas);
      }
    }
  }, [idParam, tugasList]);

  // Filter daftar mapel unik
  const mapelOptions = useMemo(() => {
    const set = new Set<string>();
    tugasList.forEach((t) => {
      if (t.mata_pelajaran) set.add(t.mata_pelajaran);
    });
    return Array.from(set);
  }, [tugasList]);

  // Filter tugas
  const filteredTugas = useMemo(() => {
    return tugasList.filter((t) => {
      const matchSearch =
        t.judul.toLowerCase().includes(search.toLowerCase()) ||
        t.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
        t.guru.toLowerCase().includes(search.toLowerCase());

      const matchMapel = selectedMapel === "all" || t.mata_pelajaran === selectedMapel;

      const hasSubmitted = Boolean(t.status === "sudah_dikumpulkan" || t.file_url || (t.berkas_pengumpulan && t.berkas_pengumpulan.length > 0));

      let matchTab = true;
      if (activeTab === "belum") {
        matchTab = !hasSubmitted;
      } else if (activeTab === "sudah") {
        matchTab = hasSubmitted;
      }

      return matchSearch && matchMapel && matchTab;
    });
  }, [tugasList, search, selectedMapel, activeTab]);

  const getFullFileUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${api}${url}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Buka modal detail & sinkronisasi data formulir
  const handleOpenDetail = (tugas: TugasItem) => {
    setSelectedTugas(tugas);
    setFilesToUpload([]);
    setCatatanSiswa(tugas.catatan_siswa || "");
    setFeedbackMsg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    setFilesToUpload((prev) => [...prev, ...incoming]);
    e.target.value = "";
  };

  const removeFileToUpload = (index: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
  };

  // Kirim tugas ke backend (multi-file)
  const handleSubmitTugas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTugas) return;

    const hasExisting = (selectedTugas.berkas_pengumpulan && selectedTugas.berkas_pengumpulan.length > 0) || !!selectedTugas.file_url;
    if (filesToUpload.length === 0 && !hasExisting) {
      setFeedbackMsg({ text: "Silakan pilih minimal 1 berkas tugas untuk dikumpulkan.", type: "error" });
      return;
    }

    try {
      setUploading(true);
      setFeedbackMsg(null);

      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("catatan_siswa", catatanSiswa);

      const res = await fetch(`${api}/api/siswa/tugas/${selectedTugas.id}/pengumpulan`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: formData,
      });

      let json: any = {};
      try {
        json = await res.json();
      } catch (e) {}

      if (!res.ok) {
        throw new Error(json?.message || "Gagal mengumpulkan tugas");
      }

      setFeedbackMsg({
        text: json.message || "Tugas berhasil dikumpulkan!",
        type: "success",
      });

      // Muat ulang daftar tugas agar data terupdate
      await loadTugas();

      // Perbarui objek tugas yang sedang dibuka
      setSelectedTugas((prev) =>
        prev
          ? {
              ...prev,
              status: "sudah_dikumpulkan",
              catatan_siswa: catatanSiswa,
              waktu_kumpul: "Baru saja",
            }
          : null
      );
      setFilesToUpload([]);
    } catch (err: any) {
      setFeedbackMsg({
        text: err.message || "Terjadi kesalahan saat mengunggah tugas.",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  // Ringkasan jumlah tugas
  const summary = useMemo(() => {
    const belum = tugasList.filter((t) => {
      const hasSubmitted = t.status === "sudah_dikumpulkan" || !!t.file_url || (t.berkas_pengumpulan && t.berkas_pengumpulan.length > 0);
      return !hasSubmitted;
    }).length;
    const sudah = tugasList.length - belum;
    return { total: tugasList.length, belum, sudah };
  }, [tugasList]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003399] flex items-center justify-center text-2xl font-bold border border-blue-100 shadow-xs">
            📝
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1d3557]">
              Tugas & Penugasan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cek tugas yang diberikan guru, unduh soal, dan kumpulkan hasil pekerjaan kamu (bisa banyak berkas/multi-file).
            </p>
          </div>
        </div>

        {/* Ringkasan Cepat */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-lg">
            ⏳ Belum: <strong>{summary.belum}</strong>
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-lg">
            ✓ Selesai: <strong>{summary.sudah}</strong>
          </span>
        </div>
      </div>

      {/* Filter Tabs, Search & Mapel */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        {/* Tabs Filter Status */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("semua")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "semua"
                ? "bg-[#003399] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua Tugas ({summary.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("belum")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "belum"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Belum Selesai ({summary.belum})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sudah")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "sudah"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Sudah Dikumpulkan ({summary.sudah})
          </button>
        </div>

        {/* Search & Mapel Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tugas berdasarkan judul, instruksi, atau guru..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#003399] focus:ring-1 focus:ring-[#003399] transition"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="sm:w-64">
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#003399] focus:ring-1 focus:ring-[#003399] transition font-medium text-slate-700"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {mapelOptions.map((mapel) => (
                <option key={mapel} value={mapel}>
                  {mapel}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Tugas */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-sm">
          <div className="animate-spin w-8 h-8 border-3 border-[#003399] border-t-transparent rounded-full mx-auto mb-3"></div>
          Memuat daftar tugas...
        </div>
      ) : filteredTugas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-bold text-slate-700 text-base">Tidak ada tugas pada kategori ini</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || selectedMapel !== "all" || activeTab !== "semua"
              ? "Coba sesuaikan tab filter atau kata kunci pencarian Anda."
              : "Bagus sekali! Tidak ada penugasan baru yang perlu dikerjakan saat ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTugas.map((tugas) => {
            const isSudah = tugas.status === "sudah_dikumpulkan" || !!tugas.file_url || (tugas.berkas_pengumpulan && tugas.berkas_pengumpulan.length > 0);
            const isTerlambat = tugas.status === "terlambat" && !isSudah;
            const teacherFilesCount = (tugas.lampiran_guru && tugas.lampiran_guru.length > 0) ? tugas.lampiran_guru.length : (tugas.file_lampiran ? 1 : 0);

            return (
              <div
                key={tugas.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Header Kartu: Badge Mapel & Status Pengerjaan */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-[#003399] border border-blue-100 rounded-lg text-[11px] font-bold">
                      {tugas.mata_pelajaran}
                    </span>

                    {/* Status Badge */}
                    {isSudah ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1">
                        <span>✓</span> Sudah Dikumpulkan
                      </span>
                    ) : isTerlambat ? (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1">
                        <span>⚠️</span> Terlambat
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1">
                        <span>⏳</span> Belum Dikerjakan
                      </span>
                    )}
                  </div>

                  {/* Judul Tugas */}
                  <h3 className="font-bold text-[#1d3557] text-base line-clamp-2 group-hover:text-[#003399] transition mb-2">
                    {tugas.judul}
                  </h3>

                  {/* Cuplikan Instruksi */}
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {tugas.deskripsi || "Tidak ada instruksi khusus untuk tugas ini."}
                  </p>

                  {/* Indikator Lampiran Guru jika ada */}
                  {teacherFilesCount > 0 && (
                    <div className="mb-3 flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold bg-blue-50/70 px-2.5 py-1 rounded-lg border border-blue-100/80 w-fit">
                      <span>📎</span>
                      <span>{teacherFilesCount} Lampiran Soal</span>
                    </div>
                  )}
                </div>

                <div>
                  {/* Info Deadline & Guru */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Batas Waktu:</span>
                      <span
                        className={`font-bold ${
                          isTerlambat ? "text-rose-600" : "text-[#1d3557]"
                        }`}
                      >
                        {tugas.deadline || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Guru:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                        {tugas.guru}
                      </span>
                    </div>
                    {isSudah && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                        <span className="text-emerald-700 font-medium">Dikirim:</span>
                        <span className="text-emerald-800 font-semibold">
                          {tugas.waktu_kumpul || "Terkirim"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tombol Lihat Detail & Kumpulkan */}
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(tugas)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      isSudah
                        ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-[#003399] hover:bg-[#1d3557] text-white"
                    }`}
                  >
                    <span>{isSudah ? "📋 Lihat Detail & Tugas Saya" : "🚀 Lihat Detail & Kumpulkan"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Pop-up: Detail Tugas & Pengumpulan */}
      {selectedTugas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#003399] flex items-center justify-center text-xl shrink-0 mt-0.5">
                  📝
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 bg-blue-50 text-[#003399] rounded text-[11px] font-bold border border-blue-200">
                      {selectedTugas.mata_pelajaran}
                    </span>
                    <span className="text-xs text-slate-500">
                      Guru: <strong>{selectedTugas.guru}</strong>
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#1d3557] leading-snug">
                    {selectedTugas.judul}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTugas(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Isi Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
              {/* Feedback Alert */}
              {feedbackMsg && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    feedbackMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  <span>{feedbackMsg.type === "success" ? "✅" : "⚠️"}</span>
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              {/* Deadline & Waktu Info Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Batas Pengumpulan (Deadline):</span>
                  <span className="font-bold text-rose-600 flex items-center gap-1">
                    ⏰ {selectedTugas.deadline || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Tanggal Diberikan:</span>
                  <span className="font-semibold text-slate-700">
                    📅 {selectedTugas.tanggal_diberikan || "-"}
                  </span>
                </div>
              </div>

              {/* Instruksi Tugas */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Petunjuk & Instruksi Tugas
                </h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-sm leading-relaxed whitespace-pre-line text-slate-800">
                  {selectedTugas.deskripsi || "Tidak ada instruksi khusus yang dituliskan."}
                </div>
              </div>

              {/* Lampiran Soal dari Guru (Bisa Multi File) */}
              {(() => {
                const files: LampiranItem[] =
                  selectedTugas.lampiran_guru && selectedTugas.lampiran_guru.length > 0
                    ? selectedTugas.lampiran_guru
                    : selectedTugas.file_lampiran
                    ? [
                        {
                          nama_file: "Unduh Berkas Lampiran Soal",
                          file_url: selectedTugas.file_lampiran,
                        },
                      ]
                    : [];

                if (files.length === 0) return null;

                return (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Berkas Soal / Lampiran dari Guru ({files.length} Berkas)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {files.map((file, idx) => {
                        const isImage = file.tipe_file === "gambar" || /\.(png|jpe?g|webp)$/i.test(file.file_url);

                        if (isImage) {
                          return (
                            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-2">
                              <a
                                href={getFullFileUrl(file.file_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block overflow-hidden rounded-lg border border-slate-200 bg-white"
                              >
                                <img
                                  src={getFullFileUrl(file.file_url)}
                                  alt={file.nama_file}
                                  className="w-full h-32 object-cover hover:scale-105 transition duration-200"
                                />
                              </a>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-700 truncate" title={file.nama_file}>
                                  📸 {file.nama_file}
                                </span>
                                <a
                                  href={getFullFileUrl(file.file_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 font-bold hover:underline shrink-0 ml-1"
                                >
                                  Buka ↗
                                </a>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <a
                            key={idx}
                            href={getFullFileUrl(file.file_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl transition flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="text-2xl">📎</span>
                              <div className="truncate">
                                <p className="text-xs font-bold text-blue-900 truncate" title={file.nama_file}>
                                  {file.nama_file}
                                </p>
                                <p className="text-[11px] text-blue-700">
                                  {file.ukuran_file ? formatFileSize(file.ukuran_file) : "Klik untuk membuka berkas"}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-blue-800 font-bold group-hover:translate-x-0.5 transition">
                              Unduh ↗
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Status & Riwayat Pengumpulan Saya (Bisa Multi File) */}
              {(() => {
                const submittedFiles: LampiranItem[] =
                  selectedTugas.berkas_pengumpulan && selectedTugas.berkas_pengumpulan.length > 0
                    ? selectedTugas.berkas_pengumpulan
                    : selectedTugas.file_url
                    ? [
                        {
                          nama_file: "Berkas Pengumpulan Tugas",
                          file_url: selectedTugas.file_url,
                        },
                      ]
                    : [];

                if (submittedFiles.length === 0 && !selectedTugas.file_url) return null;

                return (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>✓</span> Riwayat Pengumpulan Anda ({submittedFiles.length} Berkas)
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        Dikirim: {selectedTugas.waktu_kumpul}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {submittedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-200/60">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-lg">📁</span>
                            <span className="text-xs font-semibold text-slate-700 truncate" title={file.nama_file}>
                              {file.nama_file}
                            </span>
                          </div>
                          <a
                            href={getFullFileUrl(file.file_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#003399] hover:underline shrink-0 ml-2"
                          >
                            Buka ↗
                          </a>
                        </div>
                      ))}
                    </div>

                    {selectedTugas.catatan_siswa && (
                      <div className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                        <span className="font-semibold text-slate-700">Catatan Anda: </span>
                        <span className="italic">{selectedTugas.catatan_siswa}</span>
                      </div>
                    )}

                    {/* Nilai Guru (Jika Sudah Dinilai) */}
                    {selectedTugas.status_penilaian === "sudah_dinilai" && (
                      <div className="mt-2 pt-2 border-t border-emerald-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Nilai dari Guru:</span>
                        <span className="px-2 py-0.5 bg-emerald-600 text-white font-black text-sm rounded-md">
                          {selectedTugas.nilai ?? 0} / 100
                        </span>
                      </div>
                    )}
                    {selectedTugas.catatan_guru && (
                      <p className="text-xs text-slate-600 italic">
                        Komentar Guru: "{selectedTugas.catatan_guru}"
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Form Unggah Tugas (Multi-File) */}
              <form onSubmit={handleSubmitTugas} className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {selectedTugas.file_url || (selectedTugas.berkas_pengumpulan && selectedTugas.berkas_pengumpulan.length > 0)
                    ? "Perbarui / Kirim Ulang Berkas Tugas"
                    : "Kumpulkan Tugas Sekarang"}
                </h4>

                {/* File Input Multi-file */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Pilih Berkas Tugas (Format PDF, DOCX, XLSX, PPTX, Gambar, atau ZIP max 10MB/berkas) *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.zip"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#003399] file:text-white hover:file:bg-[#1d3557] file:cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus:outline-none"
                  />
                  
                  {/* Daftar berkas baru yang dipilih */}
                  {filesToUpload.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {filesToUpload.length} Berkas Dipilih:
                      </p>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {filesToUpload.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-blue-50/60 border border-blue-200/80 rounded-lg text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span>📄</span>
                              <span className="font-semibold text-blue-900 truncate">{file.name}</span>
                              <span className="text-[10px] text-slate-400">({formatFileSize(file.size)})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFileToUpload(idx)}
                              className="text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 rounded hover:bg-rose-100 transition cursor-pointer text-xs"
                              title="Hapus berkas"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Catatan Siswa */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Catatan Pengantar untuk Guru (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={catatanSiswa}
                    onChange={(e) => setCatatanSiswa(e.target.value)}
                    placeholder="Contoh: Selamat siang Pak, berikut tugas praktikum modul 2 yang telah saya kerjakan. Terima kasih."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#003399] focus:ring-1 focus:ring-[#003399] transition"
                  />
                </div>

                {/* Tombol Submit Pengumpulan */}
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTugas(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2 rounded-xl bg-[#003399] hover:bg-[#1d3557] text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {uploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <span>
                        {selectedTugas.file_url || (selectedTugas.berkas_pengumpulan && selectedTugas.berkas_pengumpulan.length > 0)
                          ? "Perbarui Pengumpulan"
                          : "Kumpulkan Tugas"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SiswaTugasPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-sm">
          <div className="animate-spin w-8 h-8 border-3 border-[#003399] border-t-transparent rounded-full mx-auto mb-3"></div>
          Memuat halaman tugas...
        </div>
      }
    >
      <SiswaTugasContent />
    </Suspense>
  );
}

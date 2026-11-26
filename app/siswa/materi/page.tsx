"use client";

import { useEffect, useState, useMemo } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface LampiranItem {
  file_url: string;
  nama_file: string;
  ukuran_file?: number;
  tipe_file?: string;
}

interface MateriItem {
  id: number;
  judul: string;
  deskripsi: string;
  file_url: string;
  tautan_eksternal: string;
  mata_pelajaran: string;
  guru: string;
  created_at: string;
  lampiran?: LampiranItem[];
}

export default function SiswaMateriPage() {
  const [materiList, setMateriList] = useState<MateriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("all");
  const [detailModal, setDetailModal] = useState<MateriItem | null>(null);

  const loadMateri = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${api}/api/siswa/materi`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMateriList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Gagal memuat materi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMateri();
  }, []);

  // Filter daftar mapel unik
  const mapelOptions = useMemo(() => {
    const set = new Set<string>();
    materiList.forEach((m) => {
      if (m.mata_pelajaran) set.add(m.mata_pelajaran);
    });
    return Array.from(set);
  }, [materiList]);

  // Filter materi berdasarkan pencarian dan mapel
  const filteredMateri = useMemo(() => {
    return materiList.filter((m) => {
      const matchSearch =
        m.judul.toLowerCase().includes(search.toLowerCase()) ||
        m.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
        m.guru.toLowerCase().includes(search.toLowerCase());
      const matchMapel = selectedMapel === "all" || m.mata_pelajaran === selectedMapel;
      return matchSearch && matchMapel;
    });
  }, [materiList, search, selectedMapel]);

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003399] flex items-center justify-center text-2xl font-bold border border-blue-100 shadow-xs">
            📚
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1d3557]">
              Materi Pembelajaran
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pelajari modul pembelajaran, rangkuman, modul multi-file, dan tangkapan layar panduan dari bapak/ibu guru.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg">
            Total {materiList.length} Materi
          </span>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari materi berdasarkan judul, guru, atau isi..."
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

        {/* Filter Mapel */}
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

      {/* Grid Materi */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-sm">
          <div className="animate-spin w-8 h-8 border-3 border-[#003399] border-t-transparent rounded-full mx-auto mb-3"></div>
          Memuat materi pembelajaran...
        </div>
      ) : filteredMateri.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
          <div className="text-4xl mb-3">📖</div>
          <p className="font-bold text-slate-700 text-base">Tidak ada materi yang ditemukan</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || selectedMapel !== "all"
              ? "Coba sesuaikan kata kunci pencarian atau ganti filter mata pelajaran."
              : "Belum ada materi pelajaran yang dibagikan guru untuk kelas kamu saat ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMateri.map((materi) => {
            const files = materi.lampiran && materi.lampiran.length > 0 ? materi.lampiran : materi.file_url ? [{ file_url: materi.file_url, nama_file: materi.file_url.split("/").pop() || "Berkas", tipe_file: "dokumen" }] : [];
            const hasImages = files.some((f) => f.tipe_file === "gambar" || /\.(png|jpe?g|webp)$/i.test(f.file_url));

            return (
              <div
                key={materi.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Header Kartu: Badge Mapel & Tanggal */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-[#003399] border border-blue-100 rounded-lg text-[11px] font-bold">
                      {materi.mata_pelajaran || "Mata Pelajaran"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {materi.created_at ? materi.created_at.split(" ")[0] : ""}
                    </span>
                  </div>

                  {/* Judul Materi */}
                  <h3 className="font-bold text-[#1d3557] text-base line-clamp-2 group-hover:text-[#003399] transition mb-2">
                    {materi.judul}
                  </h3>

                  {/* Cuplikan Deskripsi */}
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {materi.deskripsi || "Tidak ada deskripsi pengantar untuk materi ini."}
                  </p>
                </div>

                <div>
                  {/* Info Guru & Lampiran Indicator */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-3.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-400">👤</span>
                      <span className="font-medium truncate">{materi.guru || "Guru Pengajar"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {files.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 font-semibold" title={`${files.length} Berkas Lampiran`}>
                          📁 {files.length} File{hasImages ? " (📸)" : ""}
                        </span>
                      )}
                      {materi.tautan_eksternal && (
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100 font-semibold" title="Ada Tautan Web">
                          Link
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tombol Lihat Detail */}
                  <button
                    type="button"
                    onClick={() => setDetailModal(materi)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-[#003399] text-[#003399] hover:text-white border border-slate-200 hover:border-[#003399] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>👁️ Lihat Detail Materi</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Materi */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#003399] flex items-center justify-center text-xl shrink-0 mt-0.5">
                  📖
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-[#003399] rounded text-[11px] font-bold border border-blue-200">
                      {detailModal.mata_pelajaran}
                    </span>
                    <span className="text-xs text-slate-400">
                      Rilis: {detailModal.created_at}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#1d3557] leading-snug">
                    {detailModal.judul}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Disusun oleh: <strong className="text-slate-700">{detailModal.guru}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Isi Konten Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
              {/* Uraian Materi */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Penjelasan & Instruksi Pembelajaran
                </h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-sm leading-relaxed whitespace-pre-line text-slate-800">
                  {detailModal.deskripsi || "Tidak ada deskripsi detail pada materi ini."}
                </div>
              </div>

              {/* Berkas Lampiran Multi-File */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lampiran Berkas & Tangkapan Layar ({detailModal.lampiran && detailModal.lampiran.length > 0 ? detailModal.lampiran.length : detailModal.file_url ? 1 : 0} Berkas)
                </h4>

                {(() => {
                  const files = detailModal.lampiran && detailModal.lampiran.length > 0
                    ? detailModal.lampiran
                    : detailModal.file_url
                    ? [{ file_url: detailModal.file_url, nama_file: detailModal.file_url.split("/").pop() || "Berkas Modul", tipe_file: "dokumen" }]
                    : [];

                  if (files.length === 0) {
                    return (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs flex items-center gap-2.5">
                        <span>📄</span>
                        <span>Tidak ada berkas file materi yang diunggah.</span>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {files.map((file, idx) => {
                        const isImage = file.tipe_file === "gambar" || /\.(png|jpe?g|webp)$/i.test(file.file_url);

                        if (isImage) {
                          return (
                            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-2">
                              <a href={getFullFileUrl(file.file_url)} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-slate-200 bg-white">
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
                            className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="text-2xl">📄</span>
                              <div className="truncate">
                                <p className="text-xs font-bold text-emerald-900 truncate" title={file.nama_file}>
                                  {file.nama_file}
                                </p>
                                <p className="text-[11px] text-emerald-700">
                                  {file.ukuran_file ? formatFileSize(file.ukuran_file) : "Klik untuk membuka berkas"}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-emerald-800 font-bold group-hover:translate-x-0.5 transition">
                              ↗
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Tautan Web Eksternal */}
              {detailModal.tautan_eksternal && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Referensi Eksternal
                  </h4>
                  <a
                    href={detailModal.tautan_eksternal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-2xl">🔗</span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-purple-900 truncate">
                          Tautan Pembelajaran / Video
                        </p>
                        <p className="text-[11px] text-purple-700 truncate">
                          {detailModal.tautan_eksternal}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-purple-800 font-bold group-hover:translate-x-0.5 transition">
                      Buka Link ↗
                    </span>
                  </a>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

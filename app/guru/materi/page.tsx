"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Lampiran = {
  id?: number;
  file_url: string;
  nama_file: string;
  ukuran_file?: number;
  tipe_file?: string;
};

type Materi = {
  id: number;
  guru_id: number;
  mata_pelajaran_id: number;
  nama_mapel: string;
  kelas_id: number;
  nama_kelas: string;
  judul: string;
  deskripsi: string;
  file_url: string;
  tautan_eksternal: string;
  created_at: string;
  lampiran?: Lampiran[];
};

type OptionItem = {
  id: number;
  nama: string;
};

export default function GuruMateriPage() {
  const [data, setData] = useState<Materi[]>([]);
  const [kelasList, setKelasList] = useState<OptionItem[]>([]);
  const [mapelList, setMapelList] = useState<OptionItem[]>([]);
  const [filterKelas, setFilterKelas] = useState("");
  const [form, setForm] = useState({
    judul: "",
    mata_pelajaran_id: "",
    kelas_id: "",
    deskripsi: "",
    file_url: "",
    tautan_eksternal: "",
  });
  const [lampiranList, setLampiranList] = useState<Lampiran[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };
      const url = filterKelas ? `${API_URL}/api/guru/materi?kelas_id=${filterKelas}` : `${API_URL}/api/guru/materi`;

      const [materiRes, kelasRes, mapelRes] = await Promise.all([
        fetch(url, { headers }),
        fetch(`${API_URL}/api/kelas`, { headers }),
        fetch(`${API_URL}/api/guru/mata-pelajaran`, { headers }),
      ]);

      const materiJson = await materiRes.json();
      const kelasJson = await kelasRes.json();
      const mapelJson = await mapelRes.json();

      setData(Array.isArray(materiJson) ? materiJson : []);
      setKelasList(kelasJson?.map((k: any) => ({ id: k.id, nama: k.nama_kelas })) || []);
      setMapelList(mapelJson?.map((m: any) => ({ id: m.id, nama: m.nama_mapel })) || []);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat data materi pembelajaran");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterKelas]);

  const openCreate = () => {
    setForm({
      judul: "",
      mata_pelajaran_id: mapelList[0]?.id ? String(mapelList[0].id) : "",
      kelas_id: kelasList[0]?.id ? String(kelasList[0].id) : "",
      deskripsi: "",
      file_url: "",
      tautan_eksternal: "",
    });
    setLampiranList([]);
    setEditingId(null);
    setError("");
    setIsOpen(true);
  };

  const openEdit = (item: Materi) => {
    setForm({
      judul: item.judul,
      mata_pelajaran_id: String(item.mata_pelajaran_id),
      kelas_id: String(item.kelas_id),
      deskripsi: item.deskripsi || "",
      file_url: item.file_url || "",
      tautan_eksternal: item.tautan_eksternal || "",
    });
    setLampiranList(item.lampiran && item.lampiran.length > 0 ? item.lampiran : item.file_url ? [{ file_url: item.file_url, nama_file: item.file_url.split("/").pop() || "Berkas", tipe_file: "dokumen" }] : []);
    setEditingId(item.id);
    setError("");
    setIsOpen(true);
  };

  // Upload multi file langsung ke server
  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingFiles(true);
      setError("");

      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch(`${API_URL}/api/guru/upload?category=materi`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal mengunggah berkas");
      }

      const uploaded: Lampiran[] = await res.json();
      setLampiranList((prev) => [...prev, ...uploaded]);
      e.target.value = "";
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah berkas");
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeLampiran = (index: number) => {
    setLampiranList((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `${API_URL}/api/guru/materi/${editingId}` : `${API_URL}/api/guru/materi`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          ...form,
          mata_pelajaran_id: Number(form.mata_pelajaran_id),
          kelas_id: Number(form.kelas_id),
          file_url: lampiranList[0]?.file_url || form.file_url,
          lampiran: lampiranList,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal menyimpan materi");
      }

      setMessage(editingId ? "Materi berhasil diperbarui" : "Materi baru berhasil ditambahkan");
      setTimeout(() => setMessage(""), 3500);
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus materi ini?")) return;
    try {
      const res = await fetch(`${API_URL}/api/guru/materi/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus materi");
      setMessage("Materi berhasil dihapus");
      setTimeout(() => setMessage(""), 3500);
      loadData();
    } catch (e: any) {
      alert(e.message || "Gagal menghapus materi");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFullFileUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_URL}${url}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-xs p-6 max-w-6xl mx-auto text-slate-800 border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d3557]">Materi Pembelajaran</h1>
          <p className="text-xs text-slate-500 mt-1">
            Unggah bahan ajar, modul PDF, screenshot/tangkapan layar, dan multi-file untuk kelas Anda
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#003399] hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <span>+ Tambah Materi</span>
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-medium">
          ✅ {message}
        </div>
      )}

      {error && !isOpen && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Filter Kelas */}
      <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
        <span className="font-semibold text-slate-600 text-xs">Filter Kelas:</span>
        <select
          value={filterKelas}
          onChange={(e) => setFilterKelas(e.target.value)}
          className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white focus:outline-none focus:border-[#003399]"
        >
          <option value="">Semua Kelas</option>
          {kelasList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto">Total: {data.length} materi</span>
      </div>

      {/* Daftar Materi */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Memuat data materi...</div>
      ) : data.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
          <p className="font-semibold">Belum ada materi pembelajaran</p>
          <p className="text-xs text-slate-400 mt-1">Klik tombol "+ Tambah Materi" untuk mulai membagikan bahan ajar ke siswa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <div key={item.id} className="border border-slate-200 rounded-xl p-4.5 bg-white hover:border-[#003399] transition shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-[#003399] rounded text-[11px] font-bold border border-blue-100">
                    {item.nama_mapel}
                  </span>
                  <span className="text-[11px] text-slate-400">{item.created_at?.split(" ")[0]}</span>
                </div>
                <h3 className="font-bold text-[#1d3557] text-base mb-1 line-clamp-2">{item.judul}</h3>
                <p className="text-xs text-slate-500 mb-2 font-medium">Kelas: {item.nama_kelas}</p>
                <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                  {item.deskripsi || "Tidak ada deskripsi."}
                </p>

                {/* Berkas Lampiran Multi-File */}
                {item.lampiran && item.lampiran.length > 0 && (
                  <div className="mb-3 pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Lampiran ({item.lampiran.length} Berkas):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.lampiran.map((f, fi) => (
                        <a
                          key={fi}
                          href={getFullFileUrl(f.file_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#003399] border border-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                          title={f.nama_file}
                        >
                          <span>{f.tipe_file === "gambar" ? "📸" : "📄"}</span>
                          <span className="truncate max-w-[120px]">{f.nama_file}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {item.tautan_eksternal ? (
                  <a href={item.tautan_eksternal} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold flex items-center gap-1">
                    <span>🔗 Link Web</span>
                  </a>
                ) : <span />}

                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="px-2.5 py-1 text-blue-700 font-semibold hover:bg-blue-50 rounded transition cursor-pointer">
                    Edit
                  </button>
                  <button onClick={() => remove(item.id)} className="px-2.5 py-1 text-rose-600 font-semibold hover:bg-rose-50 rounded transition cursor-pointer">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-[#1d3557]">
                {editingId ? "Edit Materi Pembelajaran" : "Tambah Materi Pembelajaran Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={save} className="p-6 overflow-y-auto space-y-4 flex-1">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Judul Materi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul 1 - Pengenalan HTML & CSS"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-[#003399]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mata Pelajaran Diampu *</label>
                  <select
                    required
                    value={form.mata_pelajaran_id}
                    onChange={(e) => setForm({ ...form, mata_pelajaran_id: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-[#003399] bg-white font-medium"
                    disabled={mapelList.length === 0}
                  >
                    <option value="">-- Pilih Mata Pelajaran --</option>
                    {mapelList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Kelas Target *</label>
                  <select
                    required
                    value={form.kelas_id}
                    onChange={(e) => setForm({ ...form, kelas_id: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-[#003399] bg-white font-medium"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Deskripsi / Catatan Pembelajaran</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan petunjuk belajar atau ringkasan materi untuk siswa..."
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-[#003399]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tautan Web / Video (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/... atau tautan artikel belajar"
                  value={form.tautan_eksternal}
                  onChange={(e) => setForm({ ...form, tautan_eksternal: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-[#003399]"
                />
              </div>

              {/* Upload Multi-File Lampiran */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Berkas Lampiran Multi-File (PDF, Word, Excel, PPT, Screenshot/Gambar, ZIP)
                    </label>
                    <p className="text-[11px] text-slate-500">Anda dapat memilih lebih dari satu berkas sekaligus (maks 10MB per berkas).</p>
                  </div>
                  {uploadingFiles && (
                    <span className="text-xs text-blue-600 font-bold flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Mengunggah...
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.zip,.rar"
                  onChange={handleUploadFiles}
                  disabled={uploadingFiles}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#003399] file:text-white hover:file:bg-blue-800 file:cursor-pointer bg-white border border-slate-300 rounded-xl p-1.5 focus:outline-none"
                />

                {/* Daftar Berkas Terpilih */}
                {lampiranList.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-600">Daftar Berkas Terlampir ({lampiranList.length}):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {lampiranList.map((file, idx) => (
                        <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 truncate">
                            {file.tipe_file === "gambar" ? (
                              <img src={getFullFileUrl(file.file_url)} alt="Thumbnail" className="w-8 h-8 rounded object-cover border border-slate-200" />
                            ) : (
                              <span className="text-xl">📄</span>
                            )}
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-700 truncate" title={file.nama_file}>{file.nama_file}</p>
                              {file.ukuran_file ? (
                                <p className="text-[10px] text-slate-400">{formatFileSize(file.ukuran_file)}</p>
                              ) : null}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLampiran(idx)}
                            className="text-rose-600 hover:text-rose-800 p-1 text-xs font-bold cursor-pointer"
                            title="Hapus berkas ini"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadingFiles}
                  className="px-5 py-2 bg-[#003399] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {editingId ? "Perbarui Materi" : "Simpan Materi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

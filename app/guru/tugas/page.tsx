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

type Tugas = {
  id: number;
  guru_id: number;
  mata_pelajaran_id: number;
  nama_mapel: string;
  kelas_id: number;
  nama_kelas: string;
  judul: string;
  deskripsi: string;
  deadline: string;
  created_at: string;
  total_kumpul: number;
  lampiran?: Lampiran[];
};

type OptionItem = {
  id: number;
  nama: string;
};

export default function GuruTugasPage() {
  const [data, setData] = useState<Tugas[]>([]);
  const [kelasList, setKelasList] = useState<OptionItem[]>([]);
  const [mapelList, setMapelList] = useState<OptionItem[]>([]);
  const [filterKelas, setFilterKelas] = useState("");
  const [form, setForm] = useState({
    judul: "",
    mata_pelajaran_id: "",
    kelas_id: "",
    deskripsi: "",
    deadline: "",
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

      const [tugasRes, kelasRes, mapelRes] = await Promise.all([
        fetch(`${API_URL}/api/guru/tugas`, { headers }),
        fetch(`${API_URL}/api/kelas`, { headers }),
        fetch(`${API_URL}/api/guru/mata-pelajaran`, { headers }),
      ]);

      const tugasJson = await tugasRes.json();
      const kelasJson = await kelasRes.json();
      const mapelJson = await mapelRes.json();

      setData(Array.isArray(tugasJson) ? tugasJson : []);
      setKelasList(kelasJson?.map((k: any) => ({ id: k.id, nama: k.nama_kelas })) || []);
      setMapelList(mapelJson?.map((m: any) => ({ id: m.id, nama: m.nama_mapel })) || []);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat daftar tugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setForm({
      judul: "",
      mata_pelajaran_id: mapelList[0]?.id ? String(mapelList[0].id) : "",
      kelas_id: kelasList[0]?.id ? String(kelasList[0].id) : "",
      deskripsi: "",
      deadline: "",
    });
    setLampiranList([]);
    setEditingId(null);
    setError("");
    setIsOpen(true);
  };

  const openEdit = (item: Tugas) => {
    const dlFormatted = item.deadline ? item.deadline.replace(" ", "T") : "";
    setForm({
      judul: item.judul,
      mata_pelajaran_id: String(item.mata_pelajaran_id),
      kelas_id: String(item.kelas_id),
      deskripsi: item.deskripsi || "",
      deadline: dlFormatted,
    });
    setLampiranList(item.lampiran || []);
    setEditingId(item.id);
    setError("");
    setIsOpen(true);
  };

  // Upload multi file tugas
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

      const res = await fetch(`${API_URL}/api/guru/upload?category=tugas`, {
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
    const url = editingId ? `${API_URL}/api/guru/tugas/${editingId}` : `${API_URL}/api/guru/tugas`;
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
          lampiran: lampiranList,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal menyimpan tugas");
      }

      setMessage(editingId ? "Tugas berhasil diperbarui" : "Tugas baru berhasil dibuat");
      setTimeout(() => setMessage(""), 3500);
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini? Data pengumpulan siswa juga akan terhapus.")) return;
    try {
      const res = await fetch(`${API_URL}/api/guru/tugas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus tugas");
      setMessage("Tugas berhasil dihapus");
      setTimeout(() => setMessage(""), 3500);
      loadData();
    } catch (e: any) {
      alert(e.message || "Gagal menghapus tugas");
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

  const filteredData = filterKelas
    ? data.filter((t) => String(t.kelas_id) === filterKelas)
    : data;

  return (
    <div className="bg-white rounded-xl shadow-xs p-6 max-w-6xl mx-auto text-slate-800 border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d3557]">Tugas Siswa</h1>
          <p className="text-xs text-slate-500 mt-1">
            Buat tugas proyek, latihan mandiri dengan lampiran multi-file (PDF/Word/Screenshot), dan pantau pengumpulan siswa
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#003399] hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <span>+ Buat Tugas Baru</span>
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
        <span className="text-xs text-slate-400 ml-auto">Total: {filteredData.length} tugas</span>
      </div>

      {/* Daftar Tugas */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Memuat daftar tugas...</div>
      ) : filteredData.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
          <p className="font-semibold">Belum ada penugasan</p>
          <p className="text-xs text-slate-400 mt-1">Klik tombol "+ Buat Tugas Baru" untuk mulai memberikan tugas kepada siswa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item) => (
            <div key={item.id} className="border border-slate-200 rounded-xl p-4.5 bg-white hover:border-[#003399] transition shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-[#003399] rounded text-[11px] font-bold border border-blue-100">
                    {item.nama_mapel}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                    Kelas {item.nama_kelas}
                  </span>
                </div>
                <h3 className="font-bold text-[#1d3557] text-base mb-1 line-clamp-2">{item.judul}</h3>
                <p className="text-xs text-rose-600 mb-2 font-bold flex items-center gap-1">
                  ⏰ Tenggat: {item.deadline}
                </p>
                <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                  {item.deskripsi || "Tidak ada deskripsi."}
                </p>

                {/* Multi-File Lampiran Tugas */}
                {item.lampiran && item.lampiran.length > 0 && (
                  <div className="mb-3 pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Lampiran Soal ({item.lampiran.length} Berkas):
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
                          <span>{f.tipe_file === "gambar" ? "📸" : "📎"}</span>
                          <span className="truncate max-w-[120px]">{f.nama_file}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                  📥 {item.total_kumpul} Terkumpul
                </span>

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

      {/* Modal Form Tambah/Edit Tugas */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-[#1d3557]">
                {editingId ? "Edit Tugas Siswa" : "Buat Tugas Siswa Baru"}
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Judul Tugas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Proyek Praktikum 1 - Membuat Form Registrasi"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Batas Waktu Pengumpulan (Deadline) *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-[#003399] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Instruksi Tugas *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Jelaskan petunjuk pengerjaan, format laporan, kriteria penilaian..."
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-[#003399]"
                />
              </div>

              {/* Upload Multi-File Lampiran Tugas */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Lampiran Soal / Panduan Multi-File (PDF, Word, Excel, PPT, Screenshot, ZIP)
                    </label>
                    <p className="text-[11px] text-slate-500">Unggah berkas soal atau screenshot panduan yang dapat diunduh siswa (maks 10MB per berkas).</p>
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

                {/* Daftar Berkas Terlampir */}
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
                              <span className="text-xl">📎</span>
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
                  {editingId ? "Perbarui Tugas" : "Simpan Tugas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

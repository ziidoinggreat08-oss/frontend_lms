"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type SoalPilihan = {
  huruf?: string;
  teks: string;
  benar: boolean;
};

type Soal = {
  nomor?: number;
  pertanyaan: string;
  bobot: number;
  pilihan: SoalPilihan[];
};

const soalBaru = (): Soal => ({
  pertanyaan: "",
  bobot: 1,
  pilihan: [
    { huruf: "A", teks: "", benar: true },
    { huruf: "B", teks: "", benar: false },
    { huruf: "C", teks: "", benar: false },
    { huruf: "D", teks: "", benar: false },
  ],
});

export default function GuruKuisPage({ tipe = "kuis" }: { tipe?: "kuis" | "ujian" }) {
  const label = tipe === "ujian" ? "Ujian" : "Kuis";
  const [data, setData] = useState<any[]>([]);
  const [kelas, setKelas] = useState<any[]>([]);
  const [mapel, setMapel] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Mode pembuatan soal: "manual" atau "word"
  const [inputMode, setInputMode] = useState<"manual" | "word">("manual");
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [parsingWord, setParsingWord] = useState(false);
  const [parseSuccessMsg, setParseSuccessMsg] = useState("");

  const [form, setForm] = useState({
    judul: "",
    kelas_id: "",
    mata_pelajaran_id: "",
    durasi_menit: 30,
    status: "draft",
    deskripsi: "",
    soal: [soalBaru()] as Soal[],
  });

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token") || ""}` });

  const load = async () => {
    try {
      const [a, k, m] = await Promise.all([
        fetch(`${API_URL}/api/guru/${tipe}`, { headers: headers() }),
        fetch(`${API_URL}/api/kelas`, { headers: headers() }),
        fetch(`${API_URL}/api/guru/mata-pelajaran`, { headers: headers() }),
      ]);
      if (!a.ok) throw new Error(await a.text());
      setData(await a.json());
      setKelas(await k.json());
      setMapel(await m.json());
    } catch (e: any) {
      setError(e.message || `Gagal memuat ${label.toLowerCase()}`);
    }
  };

  useEffect(() => {
    load();
  }, [tipe]);

  const setSoal = (i: number, next: Soal) =>
    setForm({
      ...form,
      soal: form.soal.map((x, n) => (n === i ? next : x)),
    });

  const create = () => {
    setError("");
    setParseSuccessMsg("");
    setInputMode("manual");
    setWordFile(null);
    setForm({
      judul: "",
      kelas_id: kelas[0] ? String(kelas[0].id) : "",
      mata_pelajaran_id: mapel[0] ? String(mapel[0].id) : "",
      durasi_menit: tipe === "ujian" ? 90 : 30,
      status: "draft",
      deskripsi: "",
      soal: [soalBaru()],
    });
    setOpen(true);
  };

  // Parsing file Word (.docx) langsung menjadi daftar soal
  const handleParseWord = async () => {
    if (!wordFile) {
      setError("Silakan pilih berkas Word (.docx) terlebih dahulu");
      return;
    }

    try {
      setParsingWord(true);
      setError("");
      setParseSuccessMsg("");

      const formData = new FormData();
      formData.append("file", wordFile);

      const res = await fetch(`${API_URL}/api/guru/kuis/parse-word`, {
        method: "POST",
        headers: headers(),
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memproses berkas Word");
      }

      if (!json.soal || json.soal.length === 0) {
        throw new Error("Tidak ada soal yang berhasil dikenali dalam berkas Word tersebut");
      }

      // Format soal yang diekstrak ke struktur soal web
      const formattedSoal: Soal[] = json.soal.map((s: any, idx: number) => {
        const hasKey = s.pilihan.some((p: any) => p.is_benar);
        return {
          nomor: idx + 1,
          pertanyaan: s.pertanyaan || "",
          bobot: s.bobot || 1,
          pilihan: s.pilihan.map((p: any, pi: number) => ({
            huruf: p.huruf || String.fromCharCode(65 + pi),
            teks: p.teks || "",
            benar: hasKey ? Boolean(p.is_benar) : pi === 0, // default ke pilihan pertama jika belum ada kunci
          })),
        };
      });

      setForm((prev) => ({
        ...prev,
        soal: formattedSoal,
      }));

      setParseSuccessMsg(
        `✅ Berhasil mengekstrak ${formattedSoal.length} soal dari Word! Silakan periksa dan tentukan kunci jawaban yang benar di bawah ini.`
      );
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses berkas Word");
    } finally {
      setParsingWord(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Validasi soal
      if (form.soal.length === 0) {
        throw new Error("Kuis harus memiliki minimal 1 soal.");
      }
      for (let i = 0; i < form.soal.length; i++) {
        const s = form.soal[i];
        if (!s.pertanyaan.trim()) {
          throw new Error(`Pertanyaan soal nomor ${i + 1} tidak boleh kosong.`);
        }
        const hasTrue = s.pilihan.some((p) => p.benar);
        if (!hasTrue) {
          throw new Error(`Silakan pilih kunci jawaban yang benar untuk soal nomor ${i + 1}.`);
        }
      }

      const r = await fetch(`${API_URL}/api/guru/${tipe}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers() },
        body: JSON.stringify({
          ...form,
          tipe,
          kelas_id: Number(form.kelas_id),
          mata_pelajaran_id: Number(form.mata_pelajaran_id),
        }),
      });

      if (!r.ok) {
        const txt = await r.text();
        throw new Error(txt || `Gagal menyimpan ${label.toLowerCase()}`);
      }

      setOpen(false);
      load();
    } catch (e: any) {
      setError(e.message || `Gagal menyimpan ${label.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 max-w-6xl mx-auto shadow-xs text-slate-800">
      <div className="flex justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1d3557]">{label}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Buat {label.toLowerCase()} dan soal pilihan ganda secara manual satu per satu atau otomatis melalui impor file Word (.docx).
          </p>
        </div>
        <button
          onClick={create}
          className="bg-[#003399] hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer shadow-xs flex items-center gap-2"
        >
          <span>+ Buat {label}</span>
        </button>
      </div>

      {error && !open && <p className="p-3 mb-4 text-sm bg-rose-50 text-rose-700 rounded-xl border border-rose-200">⚠️ {error}</p>}

      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase font-bold text-slate-500 border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="p-3">Judul</th>
            <th>Mapel / Kelas</th>
            <th>Jumlah Soal</th>
            <th>Durasi</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((x) => (
            <tr key={x.id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="p-3 font-semibold text-[#1d3557]">{x.judul}</td>
              <td className="text-slate-600">
                {x.nama_mapel} / Kelas {x.nama_kelas}
              </td>
              <td>
                <span className="px-2 py-0.5 bg-blue-50 text-[#003399] font-bold text-xs rounded border border-blue-100">
                  {x.jumlah_soal} Soal
                </span>
              </td>
              <td className="text-slate-600">{x.durasi_menit} menit</td>
              <td>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${
                    x.status === "aktif" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {x.status}
                </span>
              </td>
            </tr>
          ))}
          {!data.length && (
            <tr>
              <td className="p-8 text-center text-slate-500" colSpan={5}>
                Belum ada {label.toLowerCase()} yang dibuat.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Buat Kuis / Ujian */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 overflow-auto p-4 backdrop-blur-xs flex items-center justify-center">
          <form onSubmit={save} className="max-w-3xl w-full bg-white rounded-2xl p-6 mx-auto my-4 shadow-xl max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#1d3557]">Buat {label} Baru</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-1 flex-1 space-y-4 mt-3">
              {error && <p className="p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-semibold">⚠️ {error}</p>}
              {parseSuccessMsg && (
                <p className="p-3 text-xs bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-semibold">
                  {parseSuccessMsg}
                </p>
              )}

              {/* Data Umum Evaluasi */}
              <div className="grid md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul {label} *</label>
                  <input
                    required
                    placeholder={`Contoh: ${label} Modul 2 - Basis Data`}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-[#003399]"
                    value={form.judul}
                    onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kelas Target *</label>
                  <select
                    required
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-[#003399]"
                    value={form.kelas_id}
                    onChange={(e) => setForm({ ...form, kelas_id: e.target.value })}
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelas.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mata Pelajaran Diampu *</label>
                  <select
                    required
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-[#003399]"
                    value={form.mata_pelajaran_id}
                    onChange={(e) => setForm({ ...form, mata_pelajaran_id: e.target.value })}
                    disabled={!mapel.length}
                  >
                    <option value="">{mapel.length ? "-- Pilih Mapel --" : "Belum ada mapel diampu"}</option>
                    {mapel.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.nama_mapel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Durasi Pengerjaan (Menit) *</label>
                  <input
                    required
                    min={5}
                    type="number"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-[#003399]"
                    value={form.durasi_menit}
                    onChange={(e) => setForm({ ...form, durasi_menit: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Publikasi *</label>
                  <select
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-[#003399]"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="draft">Draft (Disimpan saja, belum muncul di siswa)</option>
                    <option value="aktif">Aktif (Langsung dapat dikerjakan siswa)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Petunjuk Pengerjaan (Opsional)</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Kerjakan dengan teliti, pilih salah satu jawaban yang paling tepat."
                    className="w-full border border-slate-300 rounded-xl p-2 text-xs sm:text-sm bg-white outline-none focus:border-[#003399]"
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  />
                </div>
              </div>

              {/* Tabs Pilihan Metode Pembuatan Soal */}
              <div className="pt-2">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setInputMode("manual")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      inputMode === "manual"
                        ? "bg-[#003399] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    ✏️ Opsi 1: Input Manual (Satu per Satu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("word")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      inputMode === "word"
                        ? "bg-[#003399] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    📄 Opsi 2: Impor dari File Word (.docx)
                  </button>
                </div>

                {/* Tab Opsi Impor Word */}
                {inputMode === "word" && (
                  <div className="mt-3 p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                          Unggah File Soal dari Word
                        </h4>
                        <p className="text-[11px] text-blue-800">
                          Sistem akan otomatis mengubah teks soal dan opsi A, B, C, D di Word menjadi kuis interaktif.
                        </p>
                      </div>
                      <a
                        href={`${API_URL}/api/guru/kuis/template-word`}
                        download
                        className="px-3 py-1.5 bg-white hover:bg-blue-50 text-[#003399] border border-blue-300 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                      >
                        <span>📥 Unduh Contoh Template Word</span>
                      </a>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <input
                        type="file"
                        accept=".docx"
                        onChange={(e) => setWordFile(e.target.files?.[0] || null)}
                        className="flex-1 text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#003399] file:text-white hover:file:bg-blue-800 file:cursor-pointer bg-white border border-slate-300 rounded-xl p-1.5 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleParseWord}
                        disabled={!wordFile || parsingWord}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {parsingWord ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Mengekstrak Soal...</span>
                          </>
                        ) : (
                          <span>⚡ Proses & Ekstrak Soal</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Daftar Soal & Kunci Jawaban */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Daftar Soal ({form.soal.length} Soal Pilihan Ganda)
                  </h3>
                  <span className="text-[11px] text-slate-500 italic">
                    * Klik radio button bulat di samping opsi untuk menentukan kunci jawaban yang benar.
                  </span>
                </div>

                {form.soal.map((s, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2.5 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <b className="text-xs text-[#1d3557] uppercase tracking-wide">Nomor Soal {i + 1}</b>
                      {form.soal.length > 1 && (
                        <button
                          type="button"
                          className="text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer"
                          onClick={() => setForm({ ...form, soal: form.soal.filter((_, n) => n !== i) })}
                        >
                          ✕ Hapus Soal
                        </button>
                      )}
                    </div>

                    <textarea
                      required
                      placeholder={`Tuliskan teks pertanyaan soal nomor ${i + 1}...`}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm bg-white outline-none focus:border-[#003399]"
                      rows={2}
                      value={s.pertanyaan}
                      onChange={(e) => setSoal(i, { ...s, pertanyaan: e.target.value })}
                    />

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span>Bobot Nilai:</span>
                      <input
                        min={1}
                        type="number"
                        className="border border-slate-300 rounded-lg p-1 w-16 text-xs bg-white text-center font-bold"
                        value={s.bobot}
                        onChange={(e) => setSoal(i, { ...s, bobot: Number(e.target.value) })}
                      />
                      <span className="text-slate-400 font-normal">poin</span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Pilihan Jawaban (Pilih 1 kunci yang benar):
                      </span>
                      {s.pilihan.map((p, pi) => (
                        <div
                          key={pi}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border transition ${
                            p.benar
                              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                            <input
                              type="radio"
                              name={`jawaban-${i}`}
                              checked={p.benar}
                              onChange={() =>
                                setSoal(i, {
                                  ...s,
                                  pilihan: s.pilihan.map((x, n) => ({ ...x, benar: n === pi })),
                                })
                              }
                              className="w-4 h-4 text-emerald-600 cursor-pointer"
                            />
                            <span className="w-5 text-center font-bold text-xs">{p.huruf || String.fromCharCode(65 + pi)}.</span>
                          </label>
                          <input
                            required
                            className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#003399]"
                            placeholder={`Teks pilihan ${String.fromCharCode(65 + pi)}`}
                            value={p.teks}
                            onChange={(e) =>
                              setSoal(i, {
                                ...s,
                                pilihan: s.pilihan.map((x, n) => (n === pi ? { ...x, teks: e.target.value } : x)),
                              })
                            }
                          />
                          {p.benar && (
                            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold shrink-0">
                              Kunci Benar ✓
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-2 text-xs font-bold text-[#003399] hover:underline flex items-center gap-1 cursor-pointer"
                onClick={() => setForm({ ...form, soal: [...form.soal, soalBaru()] })}
              >
                <span>+ Tambah Soal Manual</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-slate-300 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                disabled={saving}
                className="bg-[#003399] hover:bg-blue-800 text-white rounded-xl px-5 py-2 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : `Simpan ${label}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

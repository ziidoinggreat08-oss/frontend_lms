"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function KelasPage() {
  const [data, setData] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);
  const [form, setForm] = useState({ nama_kelas: "", tingkat: "X", jurusan_id: "", tahun_ajaran_id: "1" });
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [kelasRes, jurusanRes] = await Promise.all([
        fetch(`${API_URL}/api/kelas`),
        fetch(`${API_URL}/api/jurusan`),
      ]);
      const kelasJson = await kelasRes.json();
      const jurusanJson = await jurusanRes.json();
      setData(kelasJson || []);
      setJurusanList(jurusanJson || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setForm({ nama_kelas: "", tingkat: "X", jurusan_id: "", tahun_ajaran_id: "1" });
    setEditingId(null);
    setIsOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      nama_kelas: item.nama_kelas,
      tingkat: item.tingkat,
      jurusan_id: String(item.jurusan_id),
      tahun_ajaran_id: String(item.tahun_ajaran_id),
    });
    setEditingId(item.id);
    setIsOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const url = editingId ? `${API_URL}/api/kelas/${editingId}` : `${API_URL}/api/kelas`;
    const method = editingId ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          jurusan_id: Number(form.jurusan_id),
          tahun_ajaran_id: Number(form.tahun_ajaran_id),
        }),
      });
      setMessage("Data berhasil disimpan");
      setIsOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (id) => {
    if (!confirm("Hapus data ini?")) return;
    try {
      await fetch(`${API_URL}/api/kelas/${id}`, { method: "DELETE" });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-6xl mx-auto mt-6 text-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1d3557]">Manajemen Kelas</h1>
        <button onClick={openCreate} className="bg-[#1d3557] text-white px-4 py-2 rounded">+ Tambah Data</button>
      </div>

      {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-200">{message}</div>}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
              <th className="p-4 font-semibold">Nama Kelas</th>
              <th className="p-4 font-semibold">Tingkat</th>
              <th className="p-4 font-semibold">Jurusan</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium">{item.nama_kelas}</td>
                <td className="p-4">{item.tingkat}</td>
                <td className="p-4">
                  <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xs font-semibold">
                    {/* Cari kode_jurusan dari jurusanList berdasarkan jurusan_id */}
                    {jurusanList.find(j => j.id === item.jurusan_id)?.kode_jurusan || item.nama_jurusan}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(item)} className="text-blue-600 mr-4 font-medium">Edit</button>
                  <button onClick={() => remove(item.id)} className="text-red-600 font-medium">Hapus</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-500">Data kosong</td></tr>}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={save} className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-[#1d3557] border-b pb-3">{editingId ? "Edit" : "Tambah"} Kelas</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-2 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  value={form.nama_kelas}
                  onChange={e => setForm({ ...form, nama_kelas: e.target.value })}
                  placeholder="Contoh: X PPLG 1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat</label>
                <select
                  className="w-full border border-slate-300 p-2 rounded-lg outline-none focus:border-blue-500 bg-white text-sm"
                  value={form.tingkat}
                  onChange={e => setForm({ ...form, tingkat: e.target.value })}
                  required
                >
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jurusan</label>
                <select
                  className="w-full border border-slate-300 p-2 rounded-lg outline-none focus:border-blue-500 bg-white text-sm"
                  value={form.jurusan_id}
                  onChange={e => setForm({ ...form, jurusan_id: e.target.value })}
                  required
                >
                  <option value="">Pilih Jurusan</option>
                  {jurusanList.map(j => (
                    <option key={j.id} value={j.id}>{j.kode_jurusan} — {j.nama_jurusan}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">Batal</button>
              <button type="submit" className="px-4 py-2 bg-[#1d3557] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

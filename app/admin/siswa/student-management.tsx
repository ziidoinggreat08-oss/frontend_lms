"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Student = { id: number; nis: string; nisn: string; nama_lengkap: string; username: string; email: string; jenis_kelamin: string; tempat_lahir: string; tanggal_lahir: string; no_telepon: string; alamat: string; kelas_id: number; nama_kelas: string; jurusan_id: number; nama_jurusan: string; status: string };
type Department = { id: number; kode_jurusan: string; nama_jurusan: string };
type ClassOption = { id: number; nama_kelas: string };
type StudentForm = Omit<Student, "id" | "nama_kelas" | "nama_jurusan"> & { password: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const emptyForm: StudentForm = { nis: "", nisn: "", nama_lengkap: "", username: "", email: "", password: "", jenis_kelamin: "P", tempat_lahir: "", tanggal_lahir: "", no_telepon: "", alamat: "", kelas_id: 0, jurusan_id: 0, status: "aktif" };

export default function StudentManagement() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [editing, setEditing] = useState<Student | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` });
  const update = (field: keyof StudentForm, value: string | number) => setForm((current) => ({ ...current, [field]: value }));

  async function getJSON(path: string) {
    const response = await fetch(`${apiUrl}${path}`, { headers: headers() });
    const data = await response.json();
    if (response.status === 401 || response.status === 403) { router.push("/login"); throw new Error("Sesi admin sudah berakhir"); }
    if (!response.ok) throw new Error(data.message || "Gagal mengambil data");
    return data;
  }

  async function loadInitialData() {
    setLoading(true); setError("");
    try {
      const [studentData, departmentData] = await Promise.all([getJSON("/api/siswa"), getJSON("/api/jurusan")]);
      setStudents(studentData); setDepartments(departmentData);
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal terhubung ke backend"); }
    finally { setLoading(false); }
  }

  async function loadClasses(jurusanID: number) {
    if (!jurusanID) { setClasses([]); return; }
    try { setClasses(await getJSON(`/api/kelas?jurusan_id=${jurusanID}`)); }
    catch (err) { setClasses([]); setError(err instanceof Error ? err.message : "Gagal memuat kelas"); }
  }

  useEffect(() => {
    if (!localStorage.getItem("token") || localStorage.getItem("role") !== "admin") { router.push("/login"); return; }
    void loadInitialData();
  }, [router]);

  const filteredStudents = useMemo(() => students.filter((student) => `${student.nama_lengkap} ${student.nis} ${student.nama_kelas}`.toLowerCase().includes(search.toLowerCase())), [students, search]);
  const selectDepartment = (value: string) => { const id = Number(value); setForm((current) => ({ ...current, jurusan_id: id, kelas_id: 0 })); void loadClasses(id); };
  const startCreate = () => { setEditing(null); setForm(emptyForm); setClasses([]); setShowPassword(false); setError(""); setIsOpen(true); };
  const startEdit = (student: Student) => { setEditing(student); setForm({ ...student, password: "" }); setShowPassword(false); setError(""); setIsOpen(true); void loadClasses(student.jurusan_id); };

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch(`${apiUrl}/api/siswa${editing ? `/${editing.id}` : ""}`, { method: editing ? "PUT" : "POST", headers: headers(), body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal menyimpan siswa");
      setMessage(data.message || "Data siswa berhasil disimpan"); setIsOpen(false); await loadInitialData();
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal menyimpan siswa"); }
    finally { setSaving(false); }
  }

  async function remove(student: Student) {
    if (!window.confirm(`Hapus akun dan data ${student.nama_lengkap}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const response = await fetch(`${apiUrl}/api/siswa/${student.id}`, { method: "DELETE", headers: headers() });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || "Gagal menghapus siswa");
      setMessage(data.message); await loadInitialData();
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal menghapus siswa"); }
  }

  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-800"><div className="mx-auto max-w-7xl"><header className="mb-7 flex items-center justify-between"><div><p className="text-xs font-bold tracking-widest text-blue-600">EDU CLASS - ADMIN</p><h1 className="text-2xl font-bold text-[#1d3557]">Manajemen Siswa</h1></div><Link href="/admin/dashboard" className="text-sm font-semibold text-[#1d3557] hover:underline">Kembali ke Dashboard</Link></header><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, NIS, atau kelas..." className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /><button onClick={startCreate} className="rounded-lg bg-[#1d3557] px-4 py-2 text-sm font-semibold text-white hover:bg-[#274b7a]">+ Tambah Siswa</button></div>{message && <Notice kind="success" message={message} />}{error && <Notice kind="error" message={error} />}<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Siswa</th><th className="px-5 py-3">NIS</th><th className="px-5 py-3">Kelas / Jurusan</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody>{loading ? <tr><td colSpan={5} className="p-10 text-center text-slate-500">Memuat data siswa...</td></tr> : filteredStudents.length === 0 ? <tr><td colSpan={5} className="p-10 text-center text-slate-500">Belum ada data siswa.</td></tr> : filteredStudents.map((student) => <tr key={student.id} className="border-t border-slate-100"><td className="px-5 py-4"><p className="font-semibold">{student.nama_lengkap}</p><p className="text-xs text-slate-500">{student.email}</p></td><td className="px-5 py-4">{student.nis}</td><td className="px-5 py-4">{student.nama_kelas}<p className="text-xs text-slate-500">{student.nama_jurusan}</p></td><td className="px-5 py-4"><span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">{student.status}</span></td><td className="px-5 py-4 text-right"><button onClick={() => startEdit(student)} className="mr-3 font-semibold text-blue-700 hover:underline">Edit</button><button onClick={() => remove(student)} className="font-semibold text-red-600 hover:underline">Hapus</button></td></tr>)}</tbody></table></div></div>{isOpen && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-4"><form onSubmit={save} className="mx-auto my-5 max-w-3xl rounded-xl bg-white p-6 shadow-xl"><div className="mb-5 flex justify-between"><div><h2 className="text-lg font-bold">{editing ? "Edit Siswa" : "Tambah Siswa"}</h2><p className="text-sm text-slate-500">{editing ? "Kosongkan password jika tidak ingin menggantinya." : "Akun login siswa dibuat bersamaan."}</p></div><button type="button" onClick={() => setIsOpen(false)} className="text-sm font-semibold text-slate-600">Tutup</button></div><div className="grid gap-4 md:grid-cols-2"><Field label="Nama lengkap *" value={form.nama_lengkap} onChange={(value) => update("nama_lengkap", value)} /><Field label="NIS *" value={form.nis} onChange={(value) => update("nis", value)} /><Field label="NISN" value={form.nisn} onChange={(value) => update("nisn", value)} /><Field label="Username *" value={form.username} onChange={(value) => update("username", value)} /><Field label="Email *" type="email" value={form.email} onChange={(value) => update("email", value)} /><PasswordField label={editing ? "Password baru" : "Password *"} value={form.password} visible={showPassword} required={!editing} onChange={(value) => update("password", value)} onToggle={() => setShowPassword((visible) => !visible)} /><Select label="Jenis kelamin *" value={form.jenis_kelamin} onChange={(value) => update("jenis_kelamin", value)} options={[["L", "Laki-laki"], ["P", "Perempuan"]]} /><Select label="Status *" value={form.status} onChange={(value) => update("status", value)} options={[["aktif", "Aktif"], ["nonaktif", "Nonaktif"], ["lulus", "Lulus"], ["keluar", "Keluar"]]} /><Select label="Jurusan *" value={String(form.jurusan_id || "")} onChange={selectDepartment} options={departments.map((department) => [String(department.id), `${department.kode_jurusan} - ${department.nama_jurusan}`])} placeholder="Pilih jurusan" /><Select label="Kelas *" value={String(form.kelas_id || "")} onChange={(value) => update("kelas_id", Number(value))} options={classes.map((item) => [String(item.id), item.nama_kelas])} placeholder={form.jurusan_id ? "Pilih kelas" : "Pilih jurusan terlebih dahulu"} disabled={!form.jurusan_id} /><Field label="Tempat lahir" value={form.tempat_lahir} onChange={(value) => update("tempat_lahir", value)} /><Field label="Tanggal lahir" type="date" value={form.tanggal_lahir} onChange={(value) => update("tanggal_lahir", value)} /><Field label="No. telepon" value={form.no_telepon} onChange={(value) => update("no_telepon", value)} /></div><label className="mt-4 block text-sm font-medium">Alamat<textarea value={form.alamat} onChange={(event) => update("alamat", event.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 p-2"></textarea></label><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setIsOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Batal</button><button disabled={saving} className="rounded-lg bg-[#1d3557] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan"}</button></div></form></div>}</main>;
}

function Notice({ kind, message }: { kind: "success" | "error"; message: string }) { return <p className={`mb-4 rounded-lg p-3 text-sm ${kind === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message}</p>; }
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block text-sm font-medium">{label}<input required={label.endsWith("*")} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>; }
function PasswordField({ label, value, visible, required, onChange, onToggle }: { label: string; value: string; visible: boolean; required: boolean; onChange: (value: string) => void; onToggle: () => void }) { return <label className="block text-sm font-medium">{label}<div className="relative mt-1"><input required={required} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-11" /><button type="button" onClick={onToggle} aria-label={visible ? "Sembunyikan password" : "Tampilkan password"} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-[#1d3557]"><EyeIcon crossed={visible} /></button></div></label>; }
function EyeIcon({ crossed }: { crossed: boolean }) { return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" />{crossed && <path d="m4 4 16 16" />}</svg>; }
function Select({ label, value, onChange, options, placeholder = "Pilih opsi", disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: string[][]; placeholder?: string; disabled?: boolean }) { return <label className="block text-sm font-medium">{label}<select required disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-100"> <option value="">{placeholder}</option>{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>; }

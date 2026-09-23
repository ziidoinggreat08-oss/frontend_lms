"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal login, periksa kredensial Anda");
      }

      // Login berhasil, simpan token & role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect berdasarkan role
      switch (data.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "guru":
          router.push("/guru/dashboard");
          break;
        case "siswa":
          router.push("/siswa/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-800">

      {/* ================= MAIN LOGIN AREA ================= */}
      <section className="min-h-[calc(100vh-147px)]">

        <div className="mx-auto grid min-h-[calc(100vh-147px)] max-w-[1400px] grid-cols-1 lg:grid-cols-2">

          {/* ================= LEFT SIDE ================= */}
          <div className="relative overflow-hidden bg-[#1d3557] px-8 py-8 text-white md:px-12 lg:px-10 xl:px-14">

            {/* Logo */}
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center">
                <svg
                  viewBox="0 0 48 48"
                  className="h-10 w-10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 8C5 6.9 5.9 6 7 6H20C25 6 28 9 28 13V40C25.8 37.8 23.2 36 19 36H7C5.9 36 5 35.1 5 34V8Z"
                    fill="white"
                  />
                  <path
                    d="M43 8C43 6.9 42.1 6 41 6H28C23 6 20 9 20 13V40C22.2 37.8 24.8 36 29 36H41C42.1 36 43 35.1 43 34V8Z"
                    fill="white"
                  />
                </svg>
              </div>

              <div>
                <p className="font-serif text-[18px] leading-none">
                  EDU-Class
                </p>

                <p className="mt-1 text-[9px] text-gray-300">
                  Learning Management System
                </p>
              </div>

            </div>


            {/* Welcome */}
            <div className="mt-8 max-w-[420px]">

              <h1 className="text-[25px] font-bold leading-tight">
                Selamat Datang di
              </h1>

              <h2 className="text-[25px] font-bold leading-tight text-blue-500">
                EDU-Class
              </h2>

              <p className="mt-2 max-w-[400px] text-[11px] leading-relaxed text-gray-300">
                Platform e-learning modern untuk mendukung proses
                belajar mengajar yang lebih efektif, terstruktur,
                dan terintegrasi.
              </p>

            </div>


            {/* ================= FEATURES ================= */}
            <div className="mt-7 space-y-5">

              {/* Feature 1 */}
              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M4 5h16v11H4z" />
                    <path d="M8 20h8M12 16v4" />
                    <path d="M7 8h10M7 11h7" />
                  </svg>

                </div>

                <div>
                  <h3 className="text-[11px] font-semibold">
                    Pembelajaran Terstruktur
                  </h3>

                  <p className="mt-1 text-[9px] text-gray-300">
                    Kelola materi, tugas, dan asesmen dengan mudah.
                  </p>
                </div>

              </div>


              {/* Feature 2 */}
              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <circle cx="12" cy="8" r="3" />
                    <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
                  </svg>

                </div>

                <div>
                  <h3 className="text-[11px] font-semibold">
                    Kolaborasi Tanpa Batas
                  </h3>

                  <p className="mt-1 text-[9px] text-gray-300">
                    Guru, siswa, dan sekolah terhubung dalam satu sistem.
                  </p>
                </div>

              </div>


              {/* Feature 3 */}
              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M4 18V6" />
                    <path d="M4 18h16" />
                    <path d="M7 15l3-4 3 2 4-6" />
                  </svg>

                </div>

                <div>
                  <h3 className="text-[11px] font-semibold">
                    Monitoring Real-Time
                  </h3>

                  <p className="mt-1 text-[9px] text-gray-300">
                    Pantau perkembangan belajar siswa secara real-time.
                  </p>
                </div>

              </div>

            </div>


            {/* ================= LAPTOP ILLUSTRATION ================= */}
            <div className="mt-7 flex justify-center">

              <div className="relative h-[135px] w-[230px]">

                {/* Books */}
                <div className="absolute bottom-0 right-0">

                  <div className="h-3 w-16 rounded-sm bg-blue-200" />
                  <div className="mt-1 h-3 w-20 rounded-sm bg-white" />
                  <div className="mt-1 h-3 w-16 rounded-sm bg-blue-300" />

                </div>

                {/* Laptop */}
                <div className="absolute bottom-4 left-5 h-[95px] w-[180px] rounded-t-lg border-[4px] border-gray-200 bg-gray-300 shadow-lg">

                  <div className="m-2 h-[78px] overflow-hidden rounded bg-[#eaf3fa]">

                    <div className="flex h-4 items-center bg-[#2b6cb0] px-2">
                      <div className="h-1 w-12 rounded bg-white/80" />
                    </div>

                    <div className="flex gap-2 p-3">

                      <div className="w-1/3 space-y-2">
                        <div className="h-5 rounded bg-blue-200" />
                        <div className="h-8 rounded bg-white" />
                      </div>

                      <div className="flex-1">
                        <div className="h-4 rounded bg-white" />
                        <div className="mt-2 h-9 rounded bg-blue-100" />
                        <div className="mt-2 flex gap-1">
                          <div className="h-3 flex-1 rounded bg-blue-300" />
                          <div className="h-3 flex-1 rounded bg-blue-200" />
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Laptop base */}
                <div className="absolute bottom-0 left-0 h-3 w-[215px] rounded-full bg-gray-200 shadow" />

                {/* Plant */}
                <div className="absolute bottom-1 left-0">

                  <div className="h-8 w-5 rounded-b-full bg-[#8ab17d]" />

                  <div className="absolute -left-3 bottom-6 h-5 w-8 -rotate-45 rounded-full bg-[#91bd8b]" />

                  <div className="absolute left-2 bottom-8 h-5 w-8 rotate-45 rounded-full bg-[#7da878]" />

                </div>

              </div>

            </div>

          </div>


          {/* ================= RIGHT SIDE ================= */}
          <div className="flex items-center justify-center bg-white px-8 py-12 md:px-16">

            <div className="w-full max-w-[430px]">

              {/* Title */}
              <div className="mb-10 text-center">

                <h2 className="text-[24px] font-bold text-[#172b4d]">
                  Selamat Datang !
                </h2>

                <p className="mt-1 text-[13px] font-medium text-[#172b4d]">
                  Masuk ke Akun Anda
                </p>

              </div>


              {/* ================= LOGIN FORM ================= */}
              <form onSubmit={handleLogin} className="space-y-5">

                {/* Tampilkan pesan error jika ada */}
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-[12px] text-red-600 border border-red-100">
                    {error}
                  </div>
                )}

                {/* Username */}
                <div>

                  <label className="mb-2 block text-[11px] font-semibold text-gray-700">
                    Email atau Username
                  </label>

                  <div className="relative">

                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">

                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="12" cy="8" r="3" />
                        <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
                      </svg>

                    </div>

                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email atau username"
                      className="h-11 w-full rounded-lg bg-[#e5e5e5] pl-10 pr-4 text-[11px] outline-none transition placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                </div>


                {/* Password */}
                <div>

                  <label className="mb-2 block text-[11px] font-semibold text-gray-700">
                    Password
                  </label>

                  <div className="relative">

                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">

                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="5" y="10" width="14" height="10" rx="2" />
                        <path d="M8 10V7a4 4 0 018 0v3" />
                      </svg>

                    </div>


                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="h-11 w-full rounded-lg bg-[#e5e5e5] pl-10 pr-11 text-[11px] outline-none transition placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500"
                    />


                    {/* Show password */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label="Tampilkan password"
                    >

                      {showPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M3 3l18 18" />
                          <path d="M10.5 10.5a2 2 0 002.8 2.8" />
                          <path d="M9.9 5.1A10.6 10.6 0 0112 5c5 0 9 4 10 7-0.4 1.1-1.3 2.5-2.6 3.6" />
                          <path d="M6.2 6.2C4.5 7.3 3.2 8.9 2 12c1 3 5 7 10 7 1.5 0 2.8-.3 4-.8" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}

                    </button>

                  </div>

                </div>


                {/* Remember Me */}
                <div className="flex items-center gap-2">

                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                  />

                  <label
                    htmlFor="remember"
                    className="cursor-pointer text-[10px] text-gray-600"
                  >
                    Ingat saya
                  </label>

                </div>


                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`mt-5 h-11 w-full rounded-lg text-[12px] font-semibold text-white transition active:scale-[0.99] ${
                    isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Memproses..." : "Masuk"}
                </button>

              </form>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="bg-[#10294d] text-white">

        <div className="mx-auto grid max-w-[1400px] gap-8 px-8 py-7 md:grid-cols-4">

          {/* Logo & description */}
          <div>

            <div className="flex items-center gap-3">

              <svg
                viewBox="0 0 48 48"
                className="h-9 w-9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 8C5 6.9 5.9 6 7 6H20C25 6 28 9 28 13V40C25.8 37.8 23.2 36 19 36H7C5.9 36 5 35.1 5 34V8Z"
                  fill="white"
                />
                <path
                  d="M43 8C43 6.9 42.1 6 41 6H28C23 6 20 9 20 13V40C22.2 37.8 24.8 36 29 36H41C42.1 36 43 35.1 43 34V8Z"
                  fill="white"
                />
              </svg>

              <div>
                <p className="font-serif text-[16px]">
                  EDU-Class
                </p>

                <p className="text-[8px] text-gray-300">
                  Learning Management System
                </p>
              </div>

            </div>

            <p className="mt-3 max-w-[230px] text-[9px] leading-relaxed text-gray-300">
              Platform e-learning modern untuk mendukung
              pembelajaran yang lebih efektif dan interaktif
              dimana saja dan kapan saja.
            </p>

            <div className="mt-3 flex gap-2">

              <div className="h-7 w-7 rounded-full bg-gray-200" />
              <div className="h-7 w-7 rounded-full bg-gray-200" />
              <div className="h-7 w-7 rounded-full bg-gray-200" />
              <div className="h-7 w-7 rounded-full bg-gray-200" />

            </div>

          </div>


          {/* Peran */}
          <div>

            <h3 className="mb-3 text-[10px] font-bold">
              Peran
            </h3>

            <ul className="space-y-1 text-[9px] text-gray-300">
              <li>Administrator</li>
              <li>Guru</li>
              <li>Siswa</li>
              <li>Kurikulum</li>
              <li>Kepala Sekolah</li>
            </ul>

          </div>


          {/* Alamat */}
          <div>

            <h3 className="mb-3 text-[10px] font-bold">
              Alamat
            </h3>

            <p className="text-[9px] leading-relaxed text-gray-300">
              Jl. Tanah Baru II, Kemiri Jaya
              <br />
              No. 99, Beji, Kecamatan Beji,
              <br />
              Kota Depok, Jawa Barat
              <br />
              16421
            </p>

          </div>


          {/* Contact */}
          <div>

            <h3 className="mb-3 text-[10px] font-bold">
              Hubungi Kami
            </h3>

            <p className="text-[9px] leading-relaxed text-gray-300">
              SMK Citra Negara
              <br />
              info@citranegara.sch.id
              <br />
              (+62) 812-3456-7890
            </p>

          </div>

        </div>


        {/* Copyright */}
        <div className="border-t border-white/20 py-3 text-center text-[9px] text-white">
          © 2026 Edu-Class — Learning Management System. All Rights Reserved.
        </div>

      </footer>

    </main>
  );
}
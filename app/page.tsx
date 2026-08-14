export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* ================= NAVBAR ================= */}
      <header className="bg-[#1d3557] text-white">
        <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-6">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-9 w-9"
              >
                <path
                  d="M5 8C5 6.9 5.9 6 7 6H20C25 6 28 9 28 13V40C25.8 37.8 23.2 36 19 36H7C5.9 36 5 35.1 5 34V8Z"
                  fill="white"
                />
                <path
                  d="M43 8C43 6.9 42.1 6 41 6H28C23 6 20 9 20 13V40C22.2 37.8 24.8 36 29 36H41C42.1 36 43 35.1 43 34V8Z"
                  fill="white"
                />
                <path
                  d="M24 10H29"
                  stroke="#1d3557"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <span className="font-serif text-[18px]">
              EDU-Class
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-12 text-[12px] md:flex">
            <a
              href="#beranda"
              className="transition hover:text-blue-200"
            >
              Beranda
            </a>

            <a
              href="#fitur"
              className="transition hover:text-blue-200"
            >
              Fitur
            </a>

            <a
              href="#tentang"
              className="transition hover:text-blue-200"
            >
              Tentang
            </a>
          </nav>

        </div>
      </header>


      {/* ================= HERO ================= */}
      <section
        id="beranda"
        className="mx-auto max-w-[1200px] px-6 py-10 md:py-12"
      >
        <div className="grid items-center gap-10 md:grid-cols-2">

          {/* Hero Text */}
          <div>

            {/* Badge */}
            <div className="mb-4 inline-flex rounded-full border border-gray-300 bg-gray-100 px-4 py-1 text-[12px] text-blue-600">
              Platform Pembelajaran Modern
            </div>

            {/* Heading */}
            <h1 className="max-w-[550px] text-4xl font-bold leading-tight md:text-[44px]">
              Belajar, Mengajar,
              <br />
              <span className="text-blue-600">
                dan Berkembang.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-3 max-w-[520px] text-[16px] leading-relaxed text-gray-600">
              Platform e-learning modern untuk mendukung pembelajaran
              yang lebih efektif dan interaktif dimana saja dan kapan saja.
            </p>

            {/* Login Button */}
            <a
              href="/login"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-[13px] font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5L4 10L9 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 10H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M15 5H20V19H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              Log in
            </a>

          </div>


          {/* Hero Image */}
          <div className="flex justify-center md:justify-end">

            <div className="h-[220px] w-full max-w-[430px] overflow-hidden rounded-[24px] border border-gray-400 shadow-sm">

              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80"
                alt="Siswa sedang belajar"
                className="h-full w-full object-cover"
              />

            </div>

          </div>

        </div>
      </section>


      {/* ================= FITUR ================= */}
      <section
        id="fitur"
        className="mx-auto max-w-[1100px] px-6 pb-20"
      >

        <div className="mb-8 text-center">

          <h2 className="text-[17px] font-bold">
            Fitur Unggulan
          </h2>

          <p className="mt-2 text-[11px] text-gray-600">
            Semua yang anda butuhkan untuk pengalaman pembelajaran
            yang lebih baik.
          </p>

        </div>


        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">

          {/* Materi */}
          <FeatureCard
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="15"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M8 22H16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M8 8H16M8 12H14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
            title="Menyimpan Materi"
          />


          {/* Assessment */}
          <FeatureCard
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="5"
                  y="3"
                  width="14"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M9 8H15M9 12H15M9 16H13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
            title="Asesmen Online"
          />


          {/* Nilai */}
          <FeatureCard
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 19V5M4 19H20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M7 16L11 11L14 14L19 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            title="Generate Nilai"
          />


          {/* Tugas */}
          <FeatureCard
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="17"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M9 4V2H15V4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M8 10H16M8 14H16M8 18H13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
            title="Tugas & Penugasan"
          />

        </div>
      </section>


      {/* ================= FOOTER ================= */}
      <footer
        id="tentang"
        className="bg-[#10294d] text-white"
      >

        <div className="mx-auto grid max-w-[1200px] gap-10 px-8 py-8 md:grid-cols-4">

          {/* Brand */}
          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
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

              <span className="font-serif text-[16px]">
                EDU-Class
              </span>

            </div>

            <p className="mt-3 max-w-[210px] text-[10px] leading-relaxed text-gray-300">
              Platform e-learning modern untuk mendukung pembelajaran
              yang lebih efektif dan interaktif dimana saja dan kapan saja.
            </p>

            {/* Social */}
            <div className="mt-4 flex gap-2">

              <div className="h-7 w-7 rounded-full bg-white/90" />
              <div className="h-7 w-7 rounded-full bg-white/90" />
              <div className="h-7 w-7 rounded-full bg-white/90" />
              <div className="h-7 w-7 rounded-full bg-white/90" />

            </div>

          </div>


          {/* Role */}
          <div>

            <h3 className="mb-4 text-[12px] font-semibold">
              Peran
            </h3>

            <ul className="space-y-1 text-[10px] text-gray-300">
              <li>Administrator</li>
              <li>Guru</li>
              <li>Siswa</li>
              <li>Kurikulum</li>
              <li>Kepala</li>
              <li>Sekolah</li>
            </ul>

          </div>


          {/* Address */}
          <div>

            <h3 className="mb-4 text-[12px] font-semibold">
              Alamat
            </h3>

            <p className="text-[10px] leading-relaxed text-gray-300">
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

            <h3 className="mb-4 text-[12px] font-semibold">
              Hubungi Kami
            </h3>

            <p className="text-[10px] leading-relaxed text-gray-300">
              SMK Citra Negara
              <br />
              info@citranegara.sch.id
              <br />
              (+62) 812-3456-7890
            </p>

          </div>

        </div>


        {/* Copyright */}
        <div className="border-t border-white/30 py-3 text-center text-[10px] text-white">
          © 2026 Edu-Class — Learning Management System. All Rights Reserved.
        </div>

      </footer>

    </main>
  );
}


/* ================= FEATURE COMPONENT ================= */

function FeatureCard({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex h-[115px] flex-col items-center justify-center rounded-lg border border-gray-300 bg-[#edf4f7] transition duration-200 hover:-translate-y-1 hover:shadow-md">

      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82c4] text-[#10294d]">
        {icon}
      </div>

      <p className="text-[10px] font-semibold">
        {title}
      </p>

    </div>
  );
}
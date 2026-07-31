"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  QrCode,
  Activity,
  FileText,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR Check-in",
    caption: "Cek-in tamu cukup sekali scan",
  },
  {
    icon: Activity,
    title: "Realtime Monitoring",
    caption: "Pantau kehadiran secara langsung",
  },
  {
    icon: FileText,
    title: "Digital Report",
    caption: "Laporan otomatis & rapi",
  },
];

const WA_ADMIN = "6289508778539";

const inputBase =
  "w-full h-[52px] md:h-[56px] rounded-2xl border bg-white/10 border-white/25 pl-12 pr-12 text-base text-white placeholder:text-white/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1553D7]/10 focus:border-[#1553D7] focus:bg-white/15 md:bg-[#FAFBFD] md:border-[#E6EAF2] md:text-[#0F172A] md:placeholder:text-[#9AA3B2] md:focus:bg-[#FAFBFD]";

export default function HomePage() {
  return <HomePageContent />;
}

function HomePageContent() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then(({ user, profile }) => {
        if (!active) return;
        if (user && profile) {
          if (profile.role === "admin") router.replace("/admin/dashboard");
          else router.replace("/panitia");
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, remember }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email atau password salah");
        setLoading(false);
        return;
      }

      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/panitia");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="font-jakarta relative min-h-screen bg-[#F7F9FC] md:flex md:items-center md:justify-center md:p-6">
      {/* Main container */}
      <div className="relative z-10 flex w-full max-w-[1440px] min-h-screen flex-col md:min-h-[calc(100vh-48px)] md:flex-row md:overflow-hidden md:rounded-[28px] md:bg-white md:shadow-[0_25px_80px_rgba(0,0,0,0.12)]">
        {/* ── Shared background photo (single LCP image) ─────── */}
        <div
          className="fixed inset-0 z-0 md:absolute md:inset-y-0 md:left-0 md:right-auto md:w-1/2 md:bg-[#0A3D91]"
          aria-hidden="true"
        >
          <Image
            src="/login-tamuku.webp"
            alt=""
            fill
            preload
            quality={50}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center opacity-100 brightness-95 contrast-[1.08] blur-[1px] md:opacity-40 md:blur-[1.5px]"
          />
          {/* Mobile overlay */}
          <div className="absolute inset-0 flex bg-[linear-gradient(180deg,rgba(7,33,94,0.78)_0%,rgba(18,73,181,0.70)_55%,rgba(7,33,94,0.82)_100%)] md:hidden" />
          {/* Desktop overlay */}
          <div className="absolute inset-0 hidden bg-[linear-gradient(135deg,rgba(7,33,94,0.68),rgba(18,73,181,0.72))] md:block" />
          <div className="absolute inset-x-0 bottom-0 hidden h-32 bg-gradient-to-t from-[#0A3D91]/45 to-transparent md:block" />
          {/* Mobile decorative circles */}
          <div className="flex md:hidden">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#FFC928]/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#1657D9]/30 blur-3xl" />
          </div>
        </div>

        {/* ── Left: Branding ─────────────────────────────── */}
        <aside className="login-noise relative hidden flex-col justify-between overflow-hidden p-8 text-white md:flex md:w-1/2 lg:p-10">
          {/* Desktop decorations */}
          <div
            className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#FFC928]/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -left-16 bottom-16 h-72 w-72 rounded-full bg-[#1657D9]/30 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="login-float absolute -right-14 top-1/4 h-56 w-56 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="login-float-slow absolute -right-6 top-[30%] h-36 w-36 rounded-full border border-white/15"
            aria-hidden="true"
          />
          <div
            className="login-shine absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            aria-hidden="true"
          />

          {/* Logo */}
          <div className="login-fade-up relative z-10 inline-flex w-fit items-center gap-3 rounded-[18px] border border-white/15 bg-white/10 p-2.5 pr-5 shadow-lg shadow-black/10 backdrop-blur-[18px]">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white">
              <Image
                src="/Logo.webp"
                alt="Logo Tamuku"
                width={44}
                height={44}
                className="object-contain"
                sizes="44px"
              />
            </div>
            <div className="leading-tight">
              <p className="text-[17px] font-extrabold tracking-[0.08em]">
                TAMUKU
              </p>
              <p className="text-xs font-medium text-white/70">
                Buku Tamu Digital
              </p>
            </div>
          </div>

          {/* Hero */}
          <div className="relative z-10 my-auto flex flex-col py-4 lg:py-6">
            <h1 className="login-fade-up login-delay-2 max-w-[500px] text-[38px] font-extrabold leading-[1.08] tracking-[-0.02em] md:text-[40px] lg:text-[44px] xl:text-[48px]">
              Menyambut
              <br />
              Setiap Tamu
              <br />
              Secara{" "}
              <span className="relative inline-block text-[#FFC928]">
                Digital
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-[#FFC928]/50" />
              </span>
              .
            </h1>

            <p className="login-fade-up login-delay-3 mt-4 max-w-[520px] text-[15px] leading-[1.8] text-white/85 lg:text-base">
          Platform buku tamu digital untuk registrasi tamu,
QR Check-in, monitoring kehadiran,
dan pelaporan acara secara realtime.
            </p>

            <div className="login-fade-up login-delay-4 mt-5 flex flex-col gap-3">
              {features.map(({ icon: Icon, title, caption }) => (
                <div
                  key={title}
                  className="group flex h-14 items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl hover:shadow-black/25 lg:h-16"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FFC928]/15 text-[#FFC928] transition-colors duration-200 group-hover:bg-[#FFC928]/25 lg:h-10 lg:w-10">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[16px] font-bold text-white lg:text-[17px]">{title}</p>
                    <p className="mt-0.5 text-[14px] text-white/65">
                      {caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="login-fade-up login-delay-5 relative z-10">
            <p className="text-sm font-semibold text-white/80">© 2026 Tamuku</p>
            <p className="mt-0.5 text-[13px] text-white/60">
              Powered by STIKOM PGRI Banyuwangi
            </p>
          </div>
        </aside>

        {/* ── Right: Login form ──────────────────────────── */}
        <main className="relative flex flex-1 overflow-y-auto px-4 py-8 sm:px-8 sm:py-10 md:w-1/2 md:bg-white md:px-12 md:py-12 lg:px-20 lg:py-14">
          <div className="login-fade-up m-auto w-full max-w-[440px] rounded-[24px] border border-white/20 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8 md:max-w-[480px] lg:max-w-[460px] md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
            {/* Mobile logo */}
            <div className="mb-6 flex flex-col items-center gap-2.5 md:hidden">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg shadow-black/20">
                <Image
                  src="/Logo.webp"
                  alt="Logo Tamuku"
                  width={44}
                  height={44}
                  className="object-contain"
                  sizes="44px"
                />
              </div>
              <div className="text-center leading-tight">
                <p className="text-[17px] font-extrabold tracking-[0.06em] text-white">
                  TAMUKU
                </p>
                <p className="text-xs font-medium text-white/70">
                  Buku Tamu Digital
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-6 text-center md:mb-7 md:text-left">
              <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-4xl md:text-[36px] md:leading-[1.15] md:tracking-[-0.01em] md:text-[#0F172A] lg:text-[42px]">
                Selamat Datang
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-white/70 md:mt-3 md:text-base md:leading-relaxed md:text-[#64748B] lg:text-[17px]">
                Silakan masuk menggunakan akun Anda untuk melanjutkan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {/* Email / Username */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-white md:text-[#0F172A]"
                >
                   Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50 md:text-[#94A3B8]"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="Masukkan email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    className={`${inputBase} ${error ? "!border-red-400/60 md:!border-red-400/60" : ""}`}
                    aria-invalid={!!error}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-white md:text-[#0F172A]"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50 md:text-[#94A3B8]"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                    className={`${inputBase} ${error ? "!border-red-400/60 md:!border-red-400/60" : ""}`}
                    aria-invalid={!!error}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/60 transition-colors duration-200 hover:text-white md:text-[#94A3B8] md:hover:text-[#0F172A]"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2 rounded-xl border border-red-300/60 bg-red-100/90 px-4 py-3 text-sm font-medium text-red-700"
                >
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </div>
              )}

              {/* Remember me + forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer select-none items-center gap-2.5 text-white/80 transition-colors hover:text-white md:text-[#475569] md:hover:text-[#0F172A]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-[18px] w-[18px] cursor-pointer rounded-md border-[#E6EAF2] bg-white/10 accent-[#1553D7] md:bg-white"
                  />
                  Ingat saya
                </label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="font-semibold text-white/80 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline md:text-[#1553D7] md:hover:text-[#0A357E]"
                >
                  Lupa Password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#1553D7] to-[#0A357E] text-base font-semibold text-white shadow-[0_8px_24px_rgba(21,83,215,0.20)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(21,83,215,0.28)] hover:brightness-[1.05] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#1553D7]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 md:h-[56px]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  <>
                    Masuk
                    <ArrowRight
                      className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>

              {/* Bottom text */}
              <p className="pt-3 text-center text-sm text-white/70 md:pt-4 md:text-[#64748B]">
                Belum memiliki akun?{" "}
                <a
                  href={`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(
                    "Halo, saya ingin membuat akun Tamuku."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white underline-offset-4 transition-colors duration-200 hover:text-white hover:underline md:text-[#1553D7] md:hover:text-[#0A357E]"
                >
                  Hubungi Administrator
                </a>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

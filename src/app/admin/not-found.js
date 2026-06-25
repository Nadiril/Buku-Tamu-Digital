import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] px-6 text-center">
      {/* Kode error */}
      <p className="text-8xl font-extrabold text-accent/20 select-none leading-none">
        404
      </p>

      {/* Pesan */}
      <h1 className="mt-4 text-xl font-bold text-foreground">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 text-sm text-muted max-w-sm">
        Rute yang Anda akses tidak tersedia. Mungkin URL salah atau halaman
        belum dibuat.
      </p>

      {/* Tombol kembali */}
      <Link
        href="/admin/dashboard"
        className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7m-9 5v6h4v-6m-4 0H6a2 2 0 01-2-2v-1"
          />
        </svg>
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

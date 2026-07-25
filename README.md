# 📖 Buku Tamu Digital

![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase)
![Recharts](https://img.shields.io/badge/Recharts-22CA9E?style=flat&logo=recharts)

**Buku Tamu Digital** adalah platform buku tamu multi-event modern untuk pencatatan kehadiran tamu secara digital, efisien, dan real-time. Dibangun untuk **STIKOM PGRI Banyuwangi**, sistem ini mendukung registrasi tamu mandiri via QR Code, scan kehadiran oleh panitia, serta dashboard admin yang lengkap.

---

## ✨ Fitur

| Fitur | Deskripsi |
|-------|-----------|
| **Multi-Event** | Kelola banyak acara dalam satu platform |
| **Registrasi Mandiri** | Tamu isi data sendiri via link acara (`/event/[slug]`) |
| **QR Code** | Setiap tamu mendapat QR Code unik untuk scan kehadiran |
| **Scan Kehadiran** | Panitia scan QR tamu untuk menandai hadir/terlambat |
| **Grace Period** | Konfigurasi tolerasi keterlambatan per acara |
| **Dashboard Admin** | CRUD event, guest, user, dan laporan lengkap |
| **Panel Panitia** | Scan QR, lihat history, dan daftar event |
| **Audit Activity** | Semua aktivitas tercatat real-time |
| **Export Excel** | Ekspor data tamu ke file XLSX |
| **Dark Mode** | Tampilan modern dengan tema gelap |

---

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| [![Next.js](https://img.shields.io/badge/Next.js-16.2.7-000?logo=next.js)](https://nextjs.org) | React framework (App Router) |
| [![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://react.dev) | UI library |
| [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss)](https://tailwindcss.com) | Utility-first CSS |
| [![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase)](https://supabase.com) | Auth, database, RLS |
| [![Recharts](https://img.shields.io/badge/Recharts-22CA9E?logo=recharts)](https://recharts.org) | Grafik & statistik |
| [![Lucide](https://img.shields.io/badge/Lucide_React-F56565?logo=lucide)](https://lucide.dev) | Ikon |
| [![QRCode](https://img.shields.io/badge/qrcode.react-000?logo=qrcode)](https://github.com/zpao/qrcode.react) | Generate QR Code |
| [![Zxing](https://img.shields.io/badge/zxing--wasm-000?logo=wasm)](https://github.com/Saerat/zxing-wasm) | Scan QR Code via WASM |
| [![Nodemailer](https://img.shields.io/badge/Nodemailer-339933?logo=gmail)](https://nodemailer.com) | Kirim email QR |
| [![SheetJS](https://img.shields.io/badge/SheetJS_(xlsx)-217346?logo=microsoftexcel)](https://sheetjs.com) | Export Excel |

---

## 📁 Struktur Folder

```
📦 buku-tamu-digital
├── 📂 .next/                  # Build output (auto-generated)
├── 📂 .opencode/              # Agent instructions
├── 📂 node_modules/           # Dependencies
├── 📂 public/                 # Static assets (logo, icons)
├── 📂 src/
│   ├── 📂 app/                # Next.js App Router
│   │   ├── 📂 admin/
│   │   │   ├── 📂 (auth)/     # Admin login page
│   │   │   │   └── login/
│   │   │   └── 📂 (panel)/    # Protected admin panel
│   │   │       ├── 📂 dashboard/   # Statistik & grafik
│   │   │       ├── 📂 events/      # CRUD acara
│   │   │       │   └── [id]/
│   │   │       ├── 📂 guests/      # Daftar tamu
│   │   │       ├── 📂 laporan/     # Export laporan
│   │   │       ├── 📂 scan-qr/     # Scanner QR
│   │   │       └── 📂 users/       # Manajemen user
│   │   ├── 📂 api/           # Route handlers (REST API)
│   │   │   ├── 📂 activities/
│   │   │   ├── 📂 auth/
│   │   │   ├── 📂 events/
│   │   │   ├── 📂 guests/
│   │   │   ├── 📂 public/
│   │   │   ├── 📂 scan/
│   │   │   ├── 📂 send-qr/
│   │   │   └── 📂 users/
│   │   ├── 📂 event/
│   │   │   └── [slug]/       # Form registrasi tamu publik
│   │   ├── 📂 panitia/       # Panel panitia
│   │   │   ├── 📂 (panel)/
│   │   │   ├── 📂 events/
│   │   │   ├── 📂 history/
│   │   │   ├── 📂 profile/
│   │   │   ├── 📂 register/
│   │   │   └── 📂 scan/
│   │   ├── 📂 scan/
│   │   │   └── [token]/      # Halaman konfirmasi scan QR
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── page.js           # Halaman login
│   │   └── providers.jsx     # React context providers
│   ├── 📂 components/        # UI Components
│   │   ├── 📂 panitia/
│   │   │   ├── PanitiaLayout.jsx
│   │   │   ├── PanitiaNavbar.jsx
│   │   │   └── PanitiaSidebar.jsx
│   │   ├── 📂 scanner/
│   │   │   └── QRScanner.jsx
│   │   ├── ActivityFeed.jsx
│   │   ├── AuthGuard.jsx
│   │   ├── Button.jsx
│   │   ├── EventCard.jsx
│   │   ├── GuestTable.jsx
│   │   ├── Input.jsx
│   │   ├── Navbar.jsx
│   │   ├── SessionTimeout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   └── Toast.jsx
│   ├── 📂 hooks/             # Custom hooks
│   │   └── useIdleTimer.js
│   ├── 📂 lib/               # Utility & context
│   │   ├── 📂 supabase/
│   │   │   ├── client.js     # Supabase browser client
│   │   │   ├── middleware.js  # Supabase middleware
│   │   │   └── server.js     # Supabase server client
│   │   ├── ActivityContext.jsx
│   │   ├── email.js          # Nodemailer config
│   │   ├── event-status.js   # Event status helpers
│   │   ├── EventContext.jsx
│   │   ├── GuestContext.jsx
│   │   ├── ProfileContext.jsx
│   │   └── token.js          # QR token generator
│   └── proxy.js              # Dev proxy
├── 📂 supabase/              # Database migrations
│   ├── migration.sql         # Schema + RLS + trigger + register_guest_scan()
│   ├── public_register_guest_scan.sql  # Public self-scan function
│   └── email_migration.sql   # Email logs table + guests email column
├── .env.local                # Environment variables
├── .gitignore
├── AGENTS.md
├── eslint.config.mjs
├── jsconfig.json             # Path alias (@/)
├── next.config.mjs
├── package.json
├── postcss.config.mjs
└── PRD.md
```

---

## 🧩 Prerequisites

- **Node.js** v18+ (recommended v20+)
- **npm** v9+ (atau yarn/pnpm/bun)
- **Akun Supabase** (gratis di [supabase.com](https://supabase.com))

---

## ⚙️ Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/Nadiril/buku-tamu-digital.git
cd buku-tamu-digital
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_anda
SUPABASE_SERVICE_ROLE_KEY=service_role_key_anda
```

Dapatkan credentials dari **Supabase Dashboard → Settings → API**.

### 4. Setup Database

Buka **Supabase Dashboard → SQL Editor**, lalu jalankan 3 file SQL berikut **secara berurutan**:

#### Urutan Migrasi

| No | File | Isi | Wajib? |
|----|------|-----|--------|
| 1 | `supabase/migration.sql` | Tabel (`profiles`, `events`, `guests`, `activities`), RLS policies, trigger auto-profile, view `events_with_guest_count`, function `register_guest_scan()` | ✅ Ya |
| 2 | `supabase/public_register_guest_scan.sql` | Function `public_register_guest_scan()` untuk self-scan tamu tanpa login (dipakai di `/api/public/scan/[token]`) | ✅ Ya |
| 3 | `supabase/email_migration.sql` | Kolom `email` & `qr_sent_at` di tabel `guests`, tabel baru `email_logs` + RLS-nya (dipakai di `/api/send-qr`) | ❌ Opsional (hanya jika fitur kirim QR via email dipakai) |

**Cara menjalankan:**
1. Copy isi file `.sql`
2. Paste di SQL Editor Supabase
3. Klik **Run**
4. Lanjut ke file berikutnya setelah sukses

> **Catatan:** `migration.sql` sudah idempotent (aman dijalankan ulang). `public_register_guest_scan.sql` dan `email_migration.sql` hanya perlu dijalankan sekali.

### 5. Buat User Admin

Buat user via **Supabase Dashboard → Authentication → Add User**, lalu di SQL Editor:

```sql
INSERT INTO public.profiles (id, username, role, display_name)
VALUES ('USER_UUID', 'admin@example.com', 'admin', 'Admin Utama');
```

---

## 🚀 Menjalankan Aplikasi

### Development

```bash
npm run dev
```

Akses di [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 📖 Cara Pakai

### Untuk Admin

1. **Login** → Buka `/`, masuk dengan email & password admin
2. **Dashboard** → Lihat statistik jumlah tamu, kehadiran, grafik
3. **Events** → Buat, edit, hapus acara; atur status (`akan_datang`, `registrasi_dibuka`, `registrasi_ditutup`)
4. **Guests** → Lihat daftar tamu, tambah tamu manual, export Excel
5. **Scan QR** → Scan QR Code tamu untuk verifikasi kehadiran
6. **Users** → Kelola akun panitia
7. **Laporan** → Export data kehadiran ke Excel

### Untuk Panitia

1. **Login** → Masuk dengan akun panitia
2. **Scan** → Scan QR Code tamu saat acara berlangsung
3. **Events** → Lihat daftar acara yang sedang aktif
4. **History** → Riwayat scan yang sudah dilakukan

### Untuk Tamu (Publik)

1. Admin membagikan link acara: `/event/[slug]`
2. Tamu mengisi form: Nama, Instansi, Tujuan, No. HP
3. Data tersimpan, siap di-scan QR-nya oleh panitia

### Proses Scan QR

1. Tamu datang ke lokasi acara
2. Panitia scan QR Code tamu (bisa cetak atau tampilkan di HP)
3. Sistem menentukan status: **Hadir** (jika ≤ grace period) atau **Terlambat**
4. Tamu bisa konfirmasi via `/scan/[token]` (bisa di-forward ke tamu)

---

## 🌐 API Routes

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/session` | Cek session |
| GET | `/api/events` | List events |
| GET | `/api/events/[id]` | Detail event |
| GET | `/api/events/stats` | Statistik event |
| GET | `/api/guests` | List tamu |
| GET | `/api/guests/[id]` | Detail tamu |
| POST | `/api/guests/import` | Import tamu |
| GET | `/api/activities` | Log aktivitas |
| GET | `/api/users` | List user |
| GET | `/api/public/events` | Event publik |
| GET | `/api/public/guests` | Guest publik |
| POST | `/api/public/guests` | Registrasi tamu publik |
| GET | `/api/public/scan/[token]` | Cek data QR |
| POST | `/api/public/scan/[token]` | Konfirmasi scan publik |
| POST | `/api/public/check-email` | Cek email terdaftar |
| GET | `/api/scan/[token]` | Data scan (auth) |
| POST | `/api/send-qr` | Kirim QR via email |

---

## 📊 Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  profiles   │     │   events    │     │   guests    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (uuid)   │◄────│ created_by  │     │ id (bigint) │
│ username    │     │ id (bigint) │     │ nama        │
│ role        │     │ nama_acara  │◄────│ acara_id    │
│ display_name│     │ slug        │     │ instansi    │
│ no_hp       │     │ lokasi      │     │ no_hp       │
│ created_at  │     │ tgl_mulai   │     │ tujuan      │
└─────────────┘     │ tgl_selesai │     │ qr_token    │
                    │ jam_mulai   │     │ status      │
┌─────────────┐     │ jam_selesai │     │ waktu_dtg   │
│ activities  │     │ grace_period│     │ scanned_by  │◄────┐
├─────────────┤     │ status      │     │ created_at  │     │
│ id (bigint) │     │ created_at  │     └─────────────┘     │
│ action      │     └─────────────┘                          │
│ detail      │                                              │
│ timestamp   │     ┌────────────────────────────────────────┘
│ user_id     │◄────┘
└─────────────┘
```

---

## 🧪 Scripts

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| dev | `npm run dev` | Jalankan development server (port 3000) |
| build | `npm run build` | Build untuk production |
| start | `npm run start` | Jalankan production server (port 3000) |
| lint | `npm run lint` | Jalankan ESLint |

---

## 📦 Dependencies Utama

```json
{
  "next": "16.2.7",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "@supabase/ssr": "^0.12.0",
  "@supabase/supabase-js": "^2.110.0",
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "lucide-react": "^1.22.0",
  "recharts": "^3.9.2",
  "qrcode.react": "^4.2.0",
  "@yudiel/react-qr-scanner": "^2.6.0",
  "nodemailer": "^9.0.3",
  "xlsx": "^0.18.5"
}
```

---

## 🌍 Environment Variables

| Variable | Deskripsi |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) |

---

## 🤝 Kontribusi

1. Fork repository
2. Buat branch baru: `git checkout -b fitur-anda`
3. Commit perubahan: `git commit -m "Add: fitur baru"`
4. Push: `git push origin fitur-anda`
5. Buat Pull Request

---

## 📄 Lisensi

Proyek ini menggunakan lisensi internal **STIKOM PGRI Banyuwangi**.

---

<p align="center">
  Dibuat dengan ❤️ oleh <a href="https://github.com/Nadiril">Nadiril</a><br>
  <sub>STIKOM PGRI Banyuwangi</sub>
</p>

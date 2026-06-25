# 📘 Product Requirement Document (PRD)

# Buku Tamu Digital STIKOM PGRI Banyuwangi

## 1. Deskripsi Produk

Buku Tamu Digital STIKOM PGRI Banyuwangi adalah aplikasi berbasis web yang memungkinkan admin membuat dan mengelola berbagai acara dalam satu sistem.

Buku Tamu digital memiliki QR Code di setiap undangan yang dapat dipindai oleh resepsionis atau scan di counter pendaftaran  untuk mengisi buku tamu digital. Data tamu akan langsung tersimpan ke database dan dapat dipantau melalui dashboard admin.

---

# 2. Tujuan Produk

Membangun sistem buku tamu digital yang:

* Mengurangi penggunaan buku tamu manual.
* Mempermudah pencatatan kehadiran tamu.
* Menyediakan laporan kehadiran secara real-time.
* Memudahkan admin melihat data tamu berdasarkan acara.

---

# 3. User Types

## Admin

Admin memiliki akses untuk:

* Login ke dashboard.
* Membuat acara.
* Mengedit acara.
* Menghapus acara.
* Generate QR Code acara.
* Melihat daftar tamu.
* Melihat detail acara.
* Export laporan.
* Melihat statistik kunjungan.

---

## Guest

Guest tidak memerlukan akun.

Guest hanya dapat:

* Scan QR Code acara.
* Mengisi form buku tamu.
* Mengirim data kehadiran.

---

# 4. User Flow

## Admin Flow

1. Admin login ke dashboard.
2. Admin membuat acara baru.
3. Sistem menghasilkan QR Code unik.
4. QR Code dibagikan kepada peserta.
5. Admin memantau data tamu yang masuk.
6. Admin dapat melihat detail setiap acara.
7. Admin dapat export laporan.

---

## Guest Flow

1. Guest datang ke acara.
2. Guest scan QR Code.
3. Guest diarahkan ke halaman form.
4. Guest mengisi data.
5. Guest menekan tombol Submit.
6. Data tersimpan ke database.
7. Data langsung muncul pada dashboard admin.

---

# 5. Fitur Utama

## Authentication

* Login Admin
* JWT Authentication
* Protected Route

---

## Event Management

Admin dapat:

* Membuat acara baru
* Mengedit acara
* Menghapus acara
* Melihat seluruh acara

Field acara:

* Nama Acara
* Lokasi
* Tanggal Mulai
* Tanggal Selesai

---

## QR Code Generator

Setiap acara memiliki:

* URL unik
* QR Code unik

Contoh:

/event/seminar-ai-2026

QR Code akan mengarah langsung ke halaman form tamu.

---

## Form Buku Tamu

Field:

* Nama Lengkap
* Instansi
* Tujuan Kunjungan
* Nomor HP (Opsional)

Sistem otomatis menyimpan:

* Waktu Kedatangan
* Acara yang dikunjungi

---

## Dashboard Admin

Dashboard menampilkan:

* Total Acara
* Total Tamu
* Tamu Hari Ini
* Acara Aktif

---

## Event Cards

Setiap acara ditampilkan dalam bentuk card.

Contoh:

Seminar AI 2026

* 125 Tamu
* Aula Kampus
* 10 Juni 2026

Workshop React

* 45 Tamu
* Lab Komputer
* 15 Juni 2026

Job Fair 2026

* 320 Tamu
* Gedung Utama
* 20 Juni 2026

Ketika card diklik, admin akan diarahkan ke halaman detail acara.

---

## Detail Event

Admin dapat melihat:

* Informasi acara
* QR Code acara
* Jumlah tamu
* Daftar tamu yang hadir

Halaman:

/admin/events/[id]

---

## Guest List

Pada halaman detail acara ditampilkan:

| Nama  | Instansi  | Tujuan  | Waktu |
| ----- | --------- | ------- | ----- |
| Ahmad | STIKOM    | Seminar | 08:15 |
| Siti  | UM Jember | Seminar | 08:20 |

Fitur:

* Search Nama
* Filter Instansi
* Filter Tanggal

---

## Export Data

Admin dapat:

* Export Excel (.xlsx)
* Export CSV
* Export PDF

Export dapat dilakukan berdasarkan acara tertentu.

---

## Statistik

Menampilkan:

* Total tamu per acara
* Grafik kunjungan
* Instansi terbanyak

---

# 6. Struktur Database

## users

* id
* username
* password
* created_at
* updated_at

---

## acara

* id
* nama_acara
* slug
* lokasi
* tanggal_mulai
* tanggal_selesai
* qr_code
* created_at
* updated_at

---

## tamu

* id
* nama
* instansi
* tujuan
* no_hp
* waktu_kedatangan
* acara_id
* created_at
* updated_at

---

# 7. Relasi Database

acara

1 → banyak tamu

Contoh:

Seminar AI 2026

* Ahmad
* Siti
* Budi

Workshop React

* Dimas
* Rizki

---

# 8. Teknologi

Frontend:

* Next.js
* Tailwind CSS
* Shadcn UI

Backend:

* Express.js
* JWT Authentication

Database:

* MySQL
* Sequelize ORM

Integrasi:

* QR Code Generator
* Google Sheets API (Opsional)

Deployment:

* Vercel (Frontend)
* Railway / Render (Backend)

---

# 9. MVP

Versi pertama yang wajib selesai:

* Login Admin
* Dashboard Admin
* CRUD Acara
* Generate QR Code
* Form Buku Tamu
* Daftar Acara
* Klik Card Acara
* Detail Acara
* Daftar Tamu Per Acara
* Search Tamu
* Export Excel

---

# 10. Kriteria Keberhasilan

* Admin dapat membuat acara kurang dari 1 menit.
* Guest dapat mengisi form kurang dari 30 detik.
* Data tamu langsung muncul pada dashboard.
* Admin dapat melihat seluruh tamu berdasarkan acara.
* Laporan dapat diunduh dalam format Excel.

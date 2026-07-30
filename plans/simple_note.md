# Buku Tamu Digital - Full Codebase

## Overview
Digital multi-event guest book with Supabase backend, Next.js 16 App Router API.

**Roles:** Admin (full CRUD), Scanner (read + scan/confirm attendance)
**Auth:** Supabase Auth (email/password)
**DB:** Supabase (PostgreSQL)
**Stack:** Next.js 16.2.7, React 19.2.4, Tailwind CSS v4, Supabase, Lucide React

---

## Setup Instructions

### 1. Supabase Setup
- Run `supabase/migration.sql` in Supabase SQL Editor to create tables (profiles, events, guests, activities)
- Create users in Supabase Auth dashboard (email/password)
- Get your `service_role key` from Settings → API
- Add it to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your_key_here`

### 2. Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://iksogaopebiyhnykalnb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Run
```bash
npm install
npm run dev
```

---

## Database Schema (`supabase/migration.sql`)

### `profiles` — extends `auth.users`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | References auth.users |
| username | text | Unique username |
| role | text | 'admin' or 'scanner' |
| display_name | text | Display name |
| created_at | timestamptz | Auto-generated |

### `events`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint (PK) | Auto-increment |
| nama_acara | text | Event name |
| slug | text (unique) | URL-friendly name |
| lokasi | text | Location |
| tanggal_mulai | date | Start date |
| tanggal_selesai | date | End date |
| jam_mulai | time | Start time |
| jam_selesai | time (default '17:00') | End time |
| grace_period_minutes | int (default 30) | Late tolerance |
| status | text | 'akan_datang' / 'registrasi_dibuka' / 'registrasi_ditutup' |
| total_tamu | int | Guest count |
| created_at | timestamptz | Auto-generated |
| created_by | uuid | References profiles |

### `guests`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint (PK) | Auto-increment |
| nama | text | Guest name |
| instansi | text | Institution |
| no_hp | text | Phone number |
| tujuan | text | Visit purpose |
| kategori_tamu | text | 'reguler' / 'vip' / 'vvip' |
| status_kehadiran | text | 'hadir' / 'terlambat' / 'tidak_hadir' |
| waktu_kedatangan | timestamptz | Check-in time |
| waktu_registrasi | timestamptz | Registration time |
| created_at | timestamptz | Auto-generated |
| acara_id | bigint (FK → events) | Associated event |
| qr_token | text (unique) | QR identification token |

### `activities`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint (PK) | Auto-increment |
| action | text | Action type (login, create_event, etc) |
| detail | text | Action description |
| timestamp | timestamptz | Auto-generated |
| user_id | uuid (FK → profiles) | User who performed action |

---

## Registration Status Logic

When a guest registers (via form or QR scan), the system determines status by comparing current time against the event schedule:

```
Event:  [start_time] ----- [grace_end] ----- [end_time]
Status:    "hadir"    |    "terlambat"   |  "tidak_hadir"
```

- **On time (before grace period ends):** `status_kehadiran = "hadir"`
- **Late (after grace period, before event end):** `status_kehadiran = "terlambat"`
- **After event ends:** `status_kehadiran = "tidak_hadir"`

Grace period = `jam_mulai + grace_period_minutes` (default 30 min)

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/session` | No | Get current session |
| GET | `/api/events` | Yes | List all events |
| POST | `/api/events` | Admin | Create event |
| PUT | `/api/events/[id]` | Admin | Update event |
| DELETE | `/api/events/[id]` | Admin | Delete event |
| GET | `/api/events/stats` | Yes | Dashboard stats |
| GET | `/api/guests` | Yes | List guests (optional `?acara_id=`) |
| POST | `/api/guests` | Yes | Create guest (auto-generates QR token) |
| PUT | `/api/guests/[id]` | Yes | Update guest (scanner: status only) |
| DELETE | `/api/guests/[id]` | Admin | Delete guest |
| POST | `/api/guests/import` | Admin | Bulk import guests |
| GET | `/api/activities` | Yes | List activities |
| POST | `/api/activities` | Yes | Log activity |
| POST | `/api/scan/[token]` | Yes | Scan & confirm attendance (with status logic) |
| GET | `/api/public/events` | No | Public event list |
| POST | `/api/public/guests` | No | Public guest registration (with status logic) |
| GET | `/api/public/scan/[token]` | No | Public guest lookup by QR |
| POST | `/api/public/scan/[token]` | No | Public scan confirmation |

---

## Architecture

### File Structure
```
frontend/
├── .env.local                    # Supabase credentials
├── supabase/
│   └── migration.sql            # Database schema
├── src/
│   ├── proxy.js                 # Next.js Proxy (auth guard)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.js        # Browser Supabase client
│   │   │   ├── server.js        # Server & service role clients
│   │   │   └── middleware.js    # Proxy session handler
│   │   ├── GuestContext.jsx     # Guest state + API calls
│   │   ├── EventContext.jsx     # Event state + API calls
│   │   ├── ActivityContext.jsx  # Activity state + API calls
│   │   └── dummy-data.js       # Seed data (fallback)
│   ├── app/
│   │   ├── page.js              # Login page (Supabase auth)
│   │   ├── layout.js            # Root layout with Providers
│   │   ├── providers.jsx        # Context providers
│   │   ├── globals.css          # Tailwind + design tokens
│   │   ├── event/[slug]/page.js # Guest registration form (public)
│   │   ├── scan/[token]/page.js # QR scan confirmation (public)
│   │   ├── admin/
│   │   │   ├── layout.js        # Admin metadata
│   │   │   ├── not-found.js     # Custom 404
│   │   │   ├── (auth)/
│   │   │   │   ├── layout.js
│   │   │   │   └── login/page.js # Admin login
│   │   │   └── (panel)/
│   │   │       ├── layout.js     # With Sidebar
│   │   │       ├── dashboard/page.js
│   │   │       ├── events/page.js # CRUD + jam_selesai + grace_period
│   │   │       ├── events/[id]/page.js
│   │   │       ├── guests/page.js # CRUD + CSV import
│   │   │       ├── laporan/page.jsx
│   │   │       └── scan-qr/page.jsx
│   │   ├── scanner/
│   │   │   ├── layout.js         # Scanner header + logout
│   │   │   ├── events/page.js    # Event selection
│   │   │   └── scan/page.js     # QR scan + confirm
│   │   └── api/                  # All API routes
│   │       ├── auth/
│   │       ├── events/
│   │       ├── guests/
│   │       ├── activities/
│   │       ├── scan/[token]/
│   │       └── public/
│   └── components/
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Navbar.jsx
│       ├── Sidebar.jsx
│       ├── StatCard.jsx
│       ├── EventCard.jsx
│       ├── GuestTable.jsx
│       ├── Toast.jsx
│       ├── ActivityFeed.jsx
│       └── scanner/
│           └── QRScanner.jsx
```

### Key Flow
1. **Login** → Supabase Auth sets session cookie
2. **Proxy** checks auth for protected routes
3. **Contexts** fetch data via API on mount
4. **CRUD operations** call API → update local state optimistically
5. **Guest registration** → public API determines status by event time
6. **QR scan** → API computes status (hadir/terlambat/tidak_hadir) based on event schedule + grace period

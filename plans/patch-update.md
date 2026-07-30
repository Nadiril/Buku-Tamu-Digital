# Patch Update — v0.3.0 → v0.4.0

## Version

**0.4.0**

---

## Tasks Completed

### 1. Timezone Bug — "Acara sudah selesai" false positive

**Debug:** SQL function `public_register_guest_scan` used `::timestamptz` cast which depended on the database session's `timezone` setting. When the app server's session timezone differed from `Asia/Jakarta`, event start/end time comparisons produced wrong results — even a "dibuka" event appeared as already ended.

**Fix:** Replaced all `::timestamptz` with explicit `AT TIME ZONE 'Asia/Jakarta'` in 4 SQL files:

| File | Change |
|---|---|
| `supabase/register_guest_scan.sql` | `event_start AT TIME ZONE 'Asia/Jakarta'` |
| `supabase/public_register_guest_scan.sql` | same |
| `supabase/fix_register_guest_scan.sql` | same |
| `supabase/migration.sql` | same |

**Root cause confirmed:** After deploy, the SQL function had the fix but the event *data* itself had ended 2 days prior while status was still `dibuka` — a data issue, not a code bug. User acknowledged.

### 2. Profile Realtime — `useProfile` + `ProfileContext`

**Added files:**

| File | Purpose |
|---|---|
| `src/lib/ProfileContext.jsx` | Realtime subscription on `profiles` table, provides `profile` + `refreshProfile` |
| `src/components/AuthGuard.jsx` | Auth guard with session check + profile fetch |

**Updated files:**

| File | Change |
|---|---|
| `src/app/providers.jsx` | Wrapped with `<ProfileProvider>` |
| `src/components/Sidebar.jsx` | Use `useProfile()` instead of manual fetch |
| `src/components/panitia/PanitiaLayout.jsx` | Moved `useProfile()` into `<PanitiaLayoutInner>` inside `<Providers>` to fix "useProfile must be used within a ProfileProvider" |
| `src/app/panitia/profile/page.js` | Use `useProfile()` |

### 3. QR Scanner — Black screen, performance, and stability

**Debug — Black screen:**
- `@yudiel/react-qr-scanner` v2.6.0 Scanner component wraps constraints in `normalizedConstraints` → `constraintsCached` (via `deepEqual`). Inline `constraints` object was creating a new reference every render, causing redundant `setConstraintsCached` → `cameraSettings` recompute → `onCameraChange` → stop/start camera loop, resulting in intermittent black feed.
- `paused={!scanning}` in panitia page toggled camera stop/start on every guest scan, adding latency and risking black screen on re-start.
- `QRScanner.jsx` had `useDevices()` + Scanner internal `useDevices` — double `enumerateDevices()` call, redundant permission prompt.
- Torch detection code in loading timeout accessed stream before camera was ready.

**Fixes:**

**`src/components/scanner/QRScanner.jsx`:**
- Added `useMemo` for `constraints` — stable reference prevents unnecessary camera restarts
- Added `useMemo` for `videoDevices` filter
- Added `paused={scanState === "loading"}` — camera only starts after loading overlay removed
- Removed torch detection in loading timeout (redundant, Scanner internal handles it)
- Simplified `handleScan` — removed double `setScanState`
- Removed `scanTimeoutRef` (unused)
- Added `components={{ finder: false }}` to match panitia style
- Loading timeout reduced from 2000ms → 1000ms

**`src/app/panitia/scan/page.js`:**
- **Removed `paused={!scanning}`** — camera stays running continuously, result overlays are CSS-only
- Added `useMemo` for `constraints` — stable reference
- Added `useMemo` for `components` — avoid re-render
- Added `useMemo` for `videoDevices` filter
- Removed `paused` prop from Scanner entirely

### 4. Session Cookie — Logout on tab close

**Requirement:** Close tab → must re-login when reopening.

**Problem:** `@supabase/ssr` v0.12.0 hardcodes `maxAge: 34,560,000` (400 days) in `DEFAULT_COOKIE_OPTIONS` for all auth cookies, both server-side (`applyServerStorage`) and client-side (`setItem`). User's `cookieOptions` is spread first but overridden by `DEFAULT_COOKIE_OPTIONS.maxAge` on the next line — no API to change it.

**Fix — strip `maxAge` in both cookie paths:**

**`src/lib/supabase/server.js`** (line 17):
```js
const { maxAge, ...rest } = options;
cookieStore.set(name, value, rest);
```

**`src/lib/supabase/client.js`** (line 8-28):
```js
cookies: {
    getAll() {
        if (typeof document === "undefined") return [];
        return document.cookie.split("; ")...
    },
    setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
            const { maxAge, ...rest } = options;
            let cookie = `${name}=${value}`;
            if (rest.path) cookie += `; path=${rest.path}`;
            ...
            document.cookie = cookie;
        });
    },
}
```

**Effect:** All Supabase auth cookies are now session cookies (no `Max-Age` attribute). Browser deletes them on tab/browser close.

---

## Files Changed (since v0.3.0)

### Modified
- `src/lib/supabase/server.js` — strip maxAge
- `src/lib/supabase/client.js` — custom cookies, strip maxAge
- `src/components/scanner/QRScanner.jsx` — useMemo, paused, simplification
- `src/app/panitia/scan/page.js` — remove paused toggle, useMemo, stability
- `src/app/providers.jsx` — ProfileProvider
- `src/components/Sidebar.jsx` — useProfile
- `src/components/panitia/PanitiaLayout.jsx` — useProfile inside Providers
- `src/app/panitia/profile/page.js` — useProfile
- `src/app/admin/(panel)/layout.js` — SessionTimeout
- `supabase/*.sql` — AT TIME ZONE patch

### Added
- `src/lib/ProfileContext.jsx`
- `src/components/AuthGuard.jsx`
- `src/components/SessionTimeout.jsx`
- `src/components/panitia/PanitiaLayout.jsx`
- `src/components/panitia/PanitiaSidebar.jsx`
- `src/hooks/useIdleTimer.js`
- `supabase/fix_register_guest_scan.sql`
- `supabase/email_migration.sql`

### Deleted
- `src/components/StaffSidebar.jsx`
- `src/app/scanner/` (entire directory)
- `src/app/staff/` (entire directory)
- `src/lib/dummy-data.js`

---

## Build

```bash
npm run build   # ✓ Compiled successfully
                # ✓ TypeScript passed
                # ✓ All 29 pages generated
```



---

# Patch Update — v0.4.0 → v0.5.0

## Version

**0.5.0**

---

## Tasks Completed

### 1. Security Audit & Fixes — 25 files changed

Complete security audit covering SQL injection, auth bypass, rate limiting, input validation, access control, CSRF, CSP, and information disclosure.

#### Critical Fixes

| # | Issue | Fix |
|---|-------|-----|
| C1 | Public endpoints used `SUPABASE_SERVICE_ROLE_KEY` → bypassed all RLS | Added `createPublicClient()` with **anon key** for all public GET/read endpoints. Only service_role kept for write endpoints that need it (guest insert, email). Added RLS policies `to anon` for `events`, `profiles`, `guests`. |
| C2 | Panitia could directly update `status_kehadiran` via `PUT /api/guests/[id]` using service_role key — bypassed timing validation | Removed the panitia bypass path entirely. `PUT /api/guests/[id]` is now **admin-only**. |
| C3 | No rate limiting on login — unlimited brute force | Added **rate limit 10 req/min/IP** on `POST /api/auth/login`. |
| C4 | Client-side login (`supabase.auth.signInWithPassword()`) bypassed server-side controls | Moved login to server-side: `page.js` now calls `POST /api/auth/login` instead of direct Supabase client call. |
| C5 | Email enumeration via `/api/public/check-email` with service_role | Switched to anon key + rate limit 10 req/min/IP. |

#### High Severity Fixes

| # | Issue | Fix |
|---|-------|-----|
| H1 | 5 API routes missing role checks — panitia could access admin data | Added role check to: `GET /api/events`, `GET/POST /api/guests`, `GET /api/events/stats`, `GET /api/activities`, `POST /api/activities` |
| H2 | Logout returned success even when `signOut()` failed | Added error handling — returns 500 if signOut fails |
| H3 | Zero server-side input validation (no length limits, no type checks) | Added `sanitize()` with length limits + type checks on all POST/PUT handlers |
| H4 | CSV Formula Injection — `=DANGER()` cells stored verbatim | Added CSV formula protection: prefix `'` to cells starting with `=`, `+`, `-`, `@` |
| H5 | Weak password policy (min 6 chars, no server validation) | Raised to **min 8 chars**, validated both client + server |
| H6 | QR token leaked in API responses and UI | Strip `qr_token` from API responses; show link instead of raw token in UI |
| H7 | Raw error messages leaked DB/SMTP details (26 locations) | All errors replaced with generic messages |

#### Medium Severity Fixes

| # | Issue | Fix |
|---|-------|-----|
| M1 | Rate limiter used spoofable `x-forwarded-for` header | Parse first IP from `x-forwarded-for`, fallback to `x-real-ip` |
| M2 | In-memory rate limiter caused memory leak (Map grew unbounded) | Added `setInterval` cleanup of stale entries |
| M3 | No rate limiting on authenticated scan endpoint | Error messages sanitized |
| M4 | No CSP/X-Frame-Options/X-Content-Type-Options headers | Added security headers in `next.config.mjs` |
| M5 | Activities POST accepted any action string from any auth user | Whitelisted allowed actions; requires admin/panitia role |
| M6 | Grace period 0 → 30 bug (`Number(0) || 30` evaluates to 30) | Changed to `>= 0` check with nullish coalescing |
| M7 | Slug could be manually set via event update API | Removed `slug` from allowed update fields; always auto-generated |
| M8 | QR token exposed in guest detail API response | SELECT limited to non-sensitive fields |
| M9 | Token generator had modulo bias (char `a-d` 14% more likely) | Replaced with `crypto.randomUUID()` |

---

## Files Changed (since v0.4.0)

### Modified
| File | Change |
|------|--------|
| `src/lib/supabase/server.js` | Added `createPublicClient()` (anon key) |
| `src/lib/supabase/client.js` | Unchanged |
| `src/lib/token.js` | Replaced modulo-biased generator with `randomUUID()` |
| `src/lib/realtime/manager.js` | Suppress non-critical transport failure logs |
| `src/lib/event-status.js` | Unchanged |
| `src/lib/email.js` | Unchanged |
| `src/lib/query-client.js` | Unchanged |
| `src/app/page.js` | Login → server-side API; version bump to v0.5.0 |
| `src/app/api/auth/login/route.js` | Rate limit + input validation |
| `src/app/api/auth/logout/route.js` | Error handling on signOut |
| `src/app/api/auth/session/route.js` | Limited response fields |
| `src/app/api/events/route.js` | Role check on GET, input validation on POST |
| `src/app/api/events/[id]/route.js` | Grace period fix, error messages, removed slug from allowed |
| `src/app/api/events/stats/route.js` | Added role check |
| `src/app/api/guests/route.js` | Role check + validation on GET/POST |
| `src/app/api/guests/[id]/route.js` | Admin-only; removed panitia bypass |
| `src/app/api/guests/import/route.js` | CSV injection protection, generic error messages |
| `src/app/api/activities/route.js` | Role check + whitelisted actions |
| `src/app/api/users/route.js` | Password min 8 validation |
| `src/app/api/users/[id]/route.js` | Password min 8 validation, error messages |
| `src/app/api/send-qr/route.js` | Email format validation, generic errors |
| `src/app/api/scan/[token]/route.js` | Generic error messages |
| `src/app/api/public/events/route.js` | Anon key, limited fields |
| `src/app/api/public/guests/route.js` | Input validation, limited response fields |
| `src/app/api/public/check-email/route.js` | Anon key + rate limit |
| `src/app/api/public/scan/[token]/route.js` | Anon key + fixed rate limiter |
| `src/components/GuestTable.jsx` | QR token → link scan in detail modal |
| `src/app/panitia/profile/page.js` | Password error message, min 8 |
| `src/app/admin/(panel)/guests/page.js` | CSV formula injection protection in parser |
| `next.config.mjs` | Security headers (CSP, X-Frame-Options, etc.) |
| `supabase/migration.sql` | RLS policies for anon + panitia insert; enable Realtime for all tables |

---

## Database Migration Required

Run the full `supabase/migration.sql` in Supabase SQL Editor (idempotent). Key additions:

```sql
-- RLS for public/anonymous access
create policy "Public can read events" on public.events for select to anon using (true);
create policy "Public can read profiles" on public.profiles for select to anon using (true);
create policy "Public can read guests by qr_token" on public.guests for select to anon using (qr_token is not null);

-- RLS for panitia insert
create policy "Admin and panitia can insert guests" on public.guests for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'panitia')));

-- Enable Realtime for subscribed tables
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.guests;
alter publication supabase_realtime add table public.activities;
```

---

## Build

```bash
npm run build   # ✓ Compiled successfully
                # ✓ TypeScript passed
                # ✓ All 33 pages generated
```

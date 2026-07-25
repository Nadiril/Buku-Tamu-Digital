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

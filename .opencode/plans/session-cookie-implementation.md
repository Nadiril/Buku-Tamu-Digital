# Session Cookie Implementation

**Goal:** Make Supabase auth cookies session-only (deleted when tab/browser closes) so user must re-login after closing the tab.

## Changes

### 1. `src/lib/supabase/server.js`

Strip `maxAge` from cookie options in `setAll` callback:

```js
setAll(cookiesToSet) {
    cookiesToSet.forEach(({ name, value, options }) => {
        const { maxAge, ...rest } = options;  // remove maxAge → session cookie
        cookieStore.set(name, value, rest);
    });
},
```

### 2. `src/lib/supabase/client.js`

Pass custom `cookies.setAll` to `createBrowserClient` to strip `maxAge` on the browser side (catches auto-refresh writes):

```js
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const all = document.cookie.split("; ").filter(Boolean).map((c) => {
            const idx = c.indexOf("=");
            return { name: c.slice(0, idx), value: c.slice(idx + 1) };
          });
          return all;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const { maxAge, ...rest } = options;
            let cookie = `${name}=${value}`;
            if (rest.path) cookie += `; path=${rest.path}`;
            if (rest.domain) cookie += `; domain=${rest.domain}`;
            if (rest.sameSite) cookie += `; samesite=${rest.sameSite}`;
            if (rest.secure) cookie += "; secure";
            document.cookie = cookie;
          });
        },
      },
    },
  );
}
```

## Verification

```bash
npm run build
```

## Behavior

- User logs in → cookies set without `Max-Age` → session cookies
- User closes tab → browser deletes session cookies
- User reopens tab → no auth cookies → `supabase.auth.getUser()` returns null → AuthGuard redirects to login
- SessionTimeout (10 min inactivity) continues to work independently

## Notes

- Only affects browser session lifetime. Supabase refresh token expiry still respected on the server side.
- Cross-tab: each tab must re-login after browser restart (cookies are per-browser, shared across tabs).
- Does NOT affect the middleware or API route auth checks — they just always see `no user` after session cookies are gone.

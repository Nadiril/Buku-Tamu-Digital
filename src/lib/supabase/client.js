import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];
          const all = document.cookie.split("; ").filter(Boolean).map((c) => {
            const idx = c.indexOf("=");
            return { name: c.slice(0, idx), value: c.slice(idx + 1) };
          });
          return all;
        },
        setAll(cookiesToSet) {
          const remember = document.cookie.includes("tamuku_remember=1");
          cookiesToSet.forEach(({ name, value, options }) => {
            const { maxAge, ...rest } = options;
            let cookie = `${name}=${value}`;
            if (rest.path) cookie += `; path=${rest.path}`;
            if (rest.domain) cookie += `; domain=${rest.domain}`;
            if (rest.sameSite) cookie += `; samesite=${rest.sameSite}`;
            if (rest.secure) cookie += "; secure";
            if (remember && maxAge) cookie += `; max-age=${maxAge}`;
            document.cookie = cookie;
          });
        },
      },
    },
  );
}

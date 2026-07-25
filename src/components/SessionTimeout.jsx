"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useIdleTimer } from "@/hooks/useIdleTimer";

const TIMEOUT = 10 * 60 * 1000;

const WARNING_BEFORE = 60 * 1000;

function clearAuthStorage() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("sb-")) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith("sb-")) keys.push(key);
  }
  keys.forEach((key) => sessionStorage.removeItem(key));
}

function formatCountdown(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${seconds} detik`;
}

export default function SessionTimeout({ role = "admin" }) {
  const router = useRouter();
  const supabaseRef = useRef(null);

  useEffect(() => {
    supabaseRef.current = createClient();
  }, []);

  const handleTimeout = useCallback(async () => {
    try {
      await supabaseRef.current.auth.signOut();
    } catch {}

    clearAuthStorage();

    const redirectUrl = new URL("/", window.location.origin);
    redirectUrl.searchParams.set(
      "message",
      "Sesi Anda telah berakhir karena tidak ada aktivitas."
    );
    redirectUrl.searchParams.set("type", "timeout");
    router.push(redirectUrl.toString().replace(window.location.origin, ""));
  }, [router]);

  const { showWarning, remaining, extend, forceTimeout } = useIdleTimer({
    timeout: TIMEOUT,
    warningBefore: WARNING_BEFORE,
    onTimeout: handleTimeout,
    channelId: role,
  });

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 w-full max-w-sm mx-4 glow-accent">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-warning-muted flex items-center justify-center">
            <svg
              className="w-6 h-6 text-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground">
              Sesi Akan Berakhir
            </h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Anda tidak melakukan aktivitas selama beberapa waktu. Sesi akan
              berakhir dalam:
            </p>
          </div>

          <div className="text-3xl font-bold text-warning tabular-nums">
            {formatCountdown(remaining)}
          </div>

          <div className="flex flex-col w-full gap-2 pt-2">
            <button
              onClick={extend}
              className="w-full py-2.5 px-4 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer shadow-lg shadow-accent/20"
            >
              Perpanjang Sesi
            </button>
            <button
              onClick={forceTimeout}
              className="w-full py-2.5 px-4 rounded-xl border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-card-hover transition-colors cursor-pointer"
            >
              Logout Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

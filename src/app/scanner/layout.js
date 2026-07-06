"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Providers from "@/app/providers";

export default function ScannerLayout({ children }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <Providers>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/scanner/events" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-bold text-foreground">Registrasi Tamu</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </Providers>
  );
}

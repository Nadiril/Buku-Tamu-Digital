"use client";

import { usePathname } from "next/navigation";
import { Bell, CalendarRange, X } from "lucide-react";
import { useEventsQuery } from "@/lib/queries/useEventsQuery";

const pageTitleMap = {
  "/panitia": "Dashboard",
  "/panitia/events": "Pilih Acara",
  "/panitia/scan": "Scan QR",
  "/panitia/history": "Riwayat Registrasi",
  "/panitia/profile": "Profil",
};

const pageSubtitleMap = {
  "/panitia": "Selamat datang di Panel Panitia",
  "/panitia/events": "Pilih dan kelola acara yang tersedia",
  "/panitia/scan": "Scan QR Code tamu dengan cepat",
  "/panitia/history": "Riwayat registrasi tamu",
  "/panitia/profile": "Kelola data profil Anda",
};

export default function PanitiaNavbar({
  panitiaName = "Panitia",
  collapsed = false,
  mobileOpen = false,
  onToggleMobile,
}) {
  const pathname = usePathname() ?? "";
  const { data: events = [] } = useEventsQuery();

  const activeEvent = events?.find((e) => e.status === "registrasi_dibuka");
  const title = pageTitleMap[pathname] || "Dashboard";
  const subtitle = pageSubtitleMap[pathname] || "";

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="flex items-center gap-4 px-4 py-2.5 lg:px-6">
        {/* Hamburger Button */}
        <button
          onClick={onToggleMobile}
          className="lg:hidden w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 text-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>

        {/* Title + Subtitle */}
        <div className="min-w-0">
          <h1 className="text-base font-bold text-foreground">
            {title}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: Event Badge, Notifications, Avatar */}
        <div className="flex items-center gap-3">
          {activeEvent && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-muted border border-accent/10">
              <CalendarRange className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-accent truncate max-w-[180px]">
                {activeEvent.nama_acara}
              </span>
            </div>
          )}

          <button className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors cursor-pointer">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-accent-muted text-accent flex items-center justify-center text-xs font-semibold shrink-0 ring-2 ring-white">
              {panitiaName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground">
              {panitiaName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

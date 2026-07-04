"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/lib/EventContext";
import { useGuests } from "@/lib/GuestContext";
import Button from "@/components/Button";

const statusStyles = {
  registrasi_dibuka: {
    badge: "bg-success-muted text-success border border-success/20",
    dot: "bg-success",
    label: "Registrasi Dibuka",
  },
  akan_datang: {
    badge: "bg-warning-muted text-warning border border-warning/20",
    dot: "bg-warning",
    label: "Akan Datang",
  },
  registrasi_ditutup: {
    badge: "bg-danger-muted text-danger border border-danger/20",
    dot: "bg-danger",
    label: "Registrasi Ditutup",
  },
};

export default function ScannerEventsPage() {
  const router = useRouter();
  const { events } = useEvents();
  const { guests } = useGuests();
  const [search, setSearch] = useState("");

  const filtered = events.filter(
    (e) =>
      e.nama_acara.toLowerCase().includes(search.toLowerCase()) ||
      e.lokasi.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pilih Acara</h1>
        <p className="text-sm text-muted mt-0.5">Pilih acara untuk memulai registrasi tamu</p>
      </div>

      <div className="relative w-full sm:w-80">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Cari acara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-input border border-input-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-input-focus transition-all duration-200"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((event) => {
          const s = statusStyles[event.status] || statusStyles.akan_datang;
          const totalTamu = guests.filter((g) => g.acara_id === event.id).length;
          const canScan = event.status === "registrasi_dibuka";

          return (
            <div
              key={event.id}
              className="glass-card rounded-2xl p-5 flex flex-col transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className={`${s.badge} text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ml-3 whitespace-nowrap`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                  {s.label}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-foreground mb-2">{event.nama_acara}</h3>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{event.lokasi}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(event.tanggal_mulai)}{event.jam_mulai ? `, ${event.jam_mulai}` : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium text-foreground/70">{totalTamu}</span> Tamu
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                {canScan ? (
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => router.push(`/scanner/scan?eventId=${event.id}`)}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  >
                    Mulai Registrasi
                  </Button>
                ) : (
                  <div className="text-center">
                    <button
                      disabled
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-muted/10 text-muted/50 cursor-not-allowed"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Mulai Registrasi
                    </button>
                    <p className="text-[10px] text-muted/50 mt-1.5">
                      {event.status === "akan_datang"
                        ? "Registrasi belum dibuka oleh Admin."
                        : "Registrasi telah ditutup."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-muted/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-muted text-sm">Tidak ada acara ditemukan</p>
        </div>
      )}
    </div>
  );
}

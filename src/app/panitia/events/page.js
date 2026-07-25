"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEventsQuery } from "@/lib/queries/useEventsQuery";
import { useGuestsQuery } from "@/lib/queries/useGuestsQuery";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  QrCode,
  ArrowRight,
  CalendarRange,
  Clock,
} from "lucide-react";

const statusStyles = {
  registrasi_dibuka: {
    badge: "bg-success-light text-success border border-success/20",
    dot: "bg-success",
    label: "Registrasi Dibuka",
  },
  akan_datang: {
    badge: "bg-warning-light text-warning border border-warning/20",
    dot: "bg-warning",
    label: "Akan Datang",
  },
  registrasi_ditutup: {
    badge: "bg-danger-light text-danger border border-danger/20",
    dot: "bg-danger",
    label: "Registrasi Ditutup",
  },
};

export default function PanitiaEventsPage() {
  const router = useRouter();
  const { data: events = [] } = useEventsQuery();
  const { data: guests = [] } = useGuestsQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.nama_acara.toLowerCase().includes(search.toLowerCase()) ||
        e.lokasi.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [events, search, statusFilter]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 max-lg:px-5 max-sm:px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Pilih Acara</h1>
        <p className="text-sm text-muted-foreground mt-1">Pilih acara untuk memulai registrasi atau scan tamu</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari acara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg bg-white border border-border pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input-focus transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg bg-white border border-border px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input-focus transition-all"
        >
          <option value="all">Semua Status</option>
          <option value="registrasi_dibuka">Registrasi Dibuka</option>
          <option value="akan_datang">Akan Datang</option>
          <option value="registrasi_ditutup">Registrasi Ditutup</option>
        </select>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-lg:gap-5 max-sm:gap-4">
        {filtered.map((event) => {
          const s = statusStyles[event.status] || statusStyles.akan_datang;
          const totalTamu = guests.filter((g) => g.acara_id === event.id).length;
          const checkedIn = guests.filter(
            (g) => g.acara_id === event.id && (g.status_kehadiran === "hadir" || g.status_kehadiran === "terlambat")
          ).length;
          const canScan = event.status === "registrasi_dibuka";

          return (
            <div
              key={event.id}
              className={`group bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                canScan
                  ? "border-border hover:border-accent/30 hover:shadow-lg hover:shadow-accent/[0.03]"
                  : "border-border hover:border-border-hover hover:shadow-sm"
              }`}
            >
              {/* Top color bar */}
              <div className={`h-1 w-full ${canScan ? "bg-accent" : event.status === "akan_datang" ? "bg-warning" : "bg-muted-foreground/20"}`} />

              <div className="p-6 max-lg:p-5 max-sm:p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${s.badge} text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors mt-1">
                      {event.nama_acara}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{event.lokasi}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarRange className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatDate(event.tanggal_mulai)}{event.jam_mulai ? `, ${event.jam_mulai}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium text-foreground/70">{totalTamu}</span> Tamu
                    {checkedIn > 0 && (
                      <span className="text-success">
                        · {checkedIn} hadir
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-border/50">
                  {canScan ? (
                    <button
                      onClick={() => router.push(`/panitia/scan?eventId=${event.id}`)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Scan QR
                    </button>
                  ) : (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-muted/5 text-muted-foreground/50 text-xs font-medium cursor-not-allowed">
                        <Clock className="w-3.5 h-3.5" />
                        {event.status === "akan_datang"
                          ? "Registrasi Belum Dibuka"
                          : "Registrasi Ditutup"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">Tidak ada acara ditemukan</p>
        </div>
      )}
    </div>
  );
}

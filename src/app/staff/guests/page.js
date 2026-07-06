"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Input from "@/components/Input";

const statusKehadiranMap = {
  hadir: { badge: "bg-success-muted text-success border border-success/20", label: "Hadir" },
  terlambat: { badge: "bg-warning-muted text-warning border border-warning/20", label: "Terlambat" },
  tidak_hadir: { badge: "bg-danger-muted text-danger border border-danger/20", label: "Tidak Hadir" },
};

const kategoriMap = {
  reguler: { badge: "bg-info-muted text-info border border-info/20", label: "Reguler" },
  vip: { badge: "bg-warning-muted text-warning border border-warning/20", label: "VIP" },
  vvip: { badge: "bg-danger-muted text-danger border border-danger/20", label: "VVIP" },
};

function StaffGuestsContent() {
  const searchParams = useSearchParams();
  const acaraId = searchParams.get("acara_id");

  const [guests, setGuests] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/events").then((r) => r.json()),
      fetch(`/api/guests${acaraId ? `?acara_id=${acaraId}` : ""}`).then((r) => r.json()),
    ])
      .then(([eventsData, guestsData]) => {
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setGuests(Array.isArray(guestsData) ? guestsData : []);
        if (acaraId) {
          const ev = (Array.isArray(eventsData) ? eventsData : []).find(
            (e) => e.id === parseInt(acaraId)
          );
          setSelectedEvent(ev || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [acaraId]);

  const filtered = guests.filter((g) => {
    const matchSearch =
      g.nama.toLowerCase().includes(search.toLowerCase()) ||
      g.instansi.toLowerCase().includes(search.toLowerCase()) ||
      (g.no_hp || "").includes(search);
    const matchStatus = !statusFilter || g.status_kehadiran === statusFilter;
    return matchSearch && matchStatus;
  });

  const hadir = filtered.filter((g) => g.status_kehadiran === "hadir").length;
  const terlambat = filtered.filter((g) => g.status_kehadiran === "terlambat").length;
  const tidakHadir = filtered.filter((g) => g.status_kehadiran === "tidak_hadir").length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "\u2014";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "\u2014";
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Navbar
        title={selectedEvent ? selectedEvent.nama_acara : "Semua Data Tamu"}
        subtitle="Mode lihat saja \u2014 data tidak dapat diubah"
      />

      <div className="flex-1 p-6 space-y-6">
        {!acaraId && (
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={acaraId || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  window.location.href = `/staff/guests?acara_id=${val}`;
                } else {
                  window.location.href = "/staff/guests";
                }
              }}
              className="w-full sm:w-64 rounded-xl bg-input border border-input-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-input-focus transition-all duration-200"
            >
              <option value="">Semua Acara</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.nama_acara}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedEvent && (
          <div className="glass-card rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">{selectedEvent.nama_acara}</h3>
                <p className="text-xs text-muted mt-0.5">{selectedEvent.lokasi} \u2014 {formatDate(selectedEvent.tanggal_mulai)}</p>
              </div>
              <a
                href="/staff/guests"
                className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
              >
                Lihat Semua Acara \u2192
              </a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{loading ? "\u2014" : filtered.length}</p>
            <p className="text-xs text-muted mt-0.5">Total</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-success">{loading ? "\u2014" : hadir}</p>
            <p className="text-xs text-muted mt-0.5">Hadir</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-warning">{loading ? "\u2014" : terlambat}</p>
            <p className="text-xs text-muted mt-0.5">Terlambat</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-danger">{loading ? "\u2014" : tidakHadir}</p>
            <p className="text-xs text-muted mt-0.5">Tidak Hadir</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Cari nama, instansi, atau no. HP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 rounded-xl bg-input border border-input-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-input-focus transition-all duration-200"
            >
              <option value="">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="terlambat">Terlambat</option>
              <option value="tidak_hadir">Tidak Hadir</option>
            </select>
          </div>
          <p className="text-sm text-muted whitespace-nowrap">
            Menampilkan <span className="text-foreground font-medium">{filtered.length}</span> dari {guests.length} tamu
          </p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Nama</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Instansi</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Kategori</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">No. HP</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Status</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Jam Hadir</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-muted text-sm">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-14 h-14 text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 20h5v-2a4 4 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.858M7 20H2v-2a4 4 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-foreground/60 font-medium">Belum ada data tamu.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((guest) => (
                    <tr key={guest.id} className="border-b border-border/50 table-row-hover">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent-muted text-accent flex items-center justify-center text-xs font-bold shrink-0">
                            {guest.nama.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-foreground truncate max-w-[200px]" title={guest.nama}>
                            {guest.nama}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-muted truncate max-w-[160px] block" title={guest.instansi}>
                          {guest.instansi}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block whitespace-nowrap ${
                          (kategoriMap[guest.kategori_tamu] || kategoriMap.reguler).badge
                        }`}>
                          {(kategoriMap[guest.kategori_tamu] || kategoriMap.reguler).label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted font-mono">
                        {guest.no_hp || "\u2014"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block whitespace-nowrap ${
                          (statusKehadiranMap[guest.status_kehadiran] || statusKehadiranMap.hadir).badge
                        }`}>
                          {(statusKehadiranMap[guest.status_kehadiran] || statusKehadiranMap.hadir).label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {guest.status_kehadiran === "tidak_hadir" ? (
                          <span className="text-sm text-muted">{"\u2014"}</span>
                        ) : (
                          <div className="text-sm whitespace-nowrap">
                            <p className="text-foreground/80 font-medium">{formatTime(guest.waktu_kedatangan)}</p>
                            <p className="text-xs text-muted">{formatDate(guest.waktu_kedatangan)}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <>
      <Navbar
        title="Data Tamu"
        subtitle="Mode lihat saja \u2014 data tidak dapat diubah"
      />
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  );
}

export default function StaffGuestsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StaffGuestsContent />
    </Suspense>
  );
}

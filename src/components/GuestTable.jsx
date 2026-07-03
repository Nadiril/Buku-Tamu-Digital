"use client";

import { useState } from "react";
import Input from "./Input";

const kategoriMap = {
  reguler: { badge: "bg-info-muted text-info border border-info/20", label: "Reguler" },
  vip: { badge: "bg-warning-muted text-warning border border-warning/20", label: "VIP" },
  vvip: { badge: "bg-danger-muted text-danger border border-danger/20", label: "VVIP" },
};

const statusKehadiranMap = {
  hadir: { badge: "bg-success-muted text-success border border-success/20", label: "Hadir" },
  terlambat: { badge: "bg-warning-muted text-warning border border-warning/20", label: "Terlambat" },
  tidak_hadir: { badge: "bg-danger-muted text-danger border border-danger/20", label: "Tidak Hadir" },
};

export default function GuestTable({ guests, showEvent = false, events = [] }) {
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");

  const getEventName = (acara_id) => {
    const event = events.find((e) => e.id === acara_id);
    return event ? event.nama_acara : "—";
  };

  const filtered = guests.filter((g) => {
    const matchSearch =
      g.nama.toLowerCase().includes(search.toLowerCase()) ||
      g.instansi.toLowerCase().includes(search.toLowerCase()) ||
      (g.no_hp || "").includes(search);
    const matchKategori = !kategoriFilter || g.kategori_tamu === kategoriFilter;
    return matchSearch && matchKategori;
  });

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const cols = showEvent ? 7 : 6;

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Cari nama, instansi, atau no. HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          </div>
          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="w-full sm:w-44 rounded-xl bg-input border border-input-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-input-focus transition-all duration-200"
          >
            <option value="">Semua Kategori</option>
            <option value="reguler">Reguler</option>
            <option value="vip">VIP</option>
            <option value="vvip">VVIP</option>
          </select>
        </div>
        <p className="text-sm text-muted whitespace-nowrap">
          Menampilkan{" "}
          <span className="text-foreground font-medium">{filtered.length}</span>{" "}
          dari {guests.length} tamu
        </p>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 w-[22%]">
                  Nama
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 w-[18%]">
                  Instansi
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 w-[13%]">
                  Kategori
                </th>
                {showEvent && (
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 w-[20%]">
                    Acara
                  </th>
                )}
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 w-[13%]">
                  No. HP
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 w-[15%]">
                  Status Kehadiran
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5 w-[15%]">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={cols}
                    className="text-center py-16 text-muted text-sm"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className="w-14 h-14 text-muted/30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <p className="text-foreground/60 font-medium">Belum ada data tamu.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((guest) => (
                  <tr
                    key={guest.id}
                    className="border-b border-border/50 table-row-hover"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 max-w-full">
                        <div className="w-8 h-8 rounded-full bg-accent-muted text-accent flex items-center justify-center text-xs font-bold shrink-0">
                          {guest.nama
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <span
                          className="text-sm font-medium text-foreground truncate max-w-[200px] lg:max-w-[280px]"
                          title={guest.nama}
                        >
                          {guest.nama}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-sm text-muted block truncate max-w-[160px] lg:max-w-[220px]"
                        title={guest.instansi}
                      >
                        {guest.instansi}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block whitespace-nowrap ${
                          (kategoriMap[guest.kategori_tamu] || kategoriMap.reguler).badge
                        }`}
                      >
                        {(kategoriMap[guest.kategori_tamu] || kategoriMap.reguler).label}
                      </span>
                    </td>
                    {showEvent && (
                      <td className="px-5 py-3.5">
                        <span className="text-xs bg-accent-muted text-accent px-2.5 py-1 rounded-full font-medium inline-block whitespace-nowrap max-w-[200px] truncate" title={getEventName(guest.acara_id)}>
                          {getEventName(guest.acara_id)}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-sm text-muted font-mono">
                      {guest.no_hp || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block whitespace-nowrap ${
                          (statusKehadiranMap[guest.status_kehadiran] || statusKehadiranMap.hadir).badge
                        }`}
                      >
                        {(statusKehadiranMap[guest.status_kehadiran] || statusKehadiranMap.hadir).label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm whitespace-nowrap">
                        <p className="text-foreground/80 font-medium">
                          {formatTime(guest.created_at)}
                        </p>
                        <p className="text-xs text-muted">
                          {formatDate(guest.created_at)}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
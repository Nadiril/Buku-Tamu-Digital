"use client";

import { useState } from "react";
import Input from "./Input";

const statusMap = {
  reguler: { badge: "bg-info-muted text-info border border-info/20", label: "Reguler" },
  vip: { badge: "bg-warning-muted text-warning border border-warning/20", label: "VIP" },
  vvip: { badge: "bg-danger-muted text-danger border border-danger/20", label: "VVIP" },
};

export default function GuestTable({ guests, showEvent = false, events = [] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const getEventName = (acara_id) => {
    const event = events.find((e) => e.id === acara_id);
    return event ? event.nama_acara : "—";
  };

  const filtered = guests.filter((g) => {
    const matchSearch =
      g.nama.toLowerCase().includes(search.toLowerCase()) ||
      g.instansi.toLowerCase().includes(search.toLowerCase()) ||
      g.tujuan.toLowerCase().includes(search.toLowerCase()) ||
      (g.no_hp || "").includes(search);
    const matchStatus = !statusFilter || g.status === statusFilter;
    return matchSearch && matchStatus;
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

  const cols = showEvent ? 9 : 7;

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Cari nama, instansi, atau tujuan..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 rounded-xl bg-input border border-input-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-input-focus transition-all duration-200"
          >
            <option value="">Semua Status</option>
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                  #
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                  Nama
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                  Instansi
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                  Status
                </th>
                {showEvent && (
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                    Acara
                  </th>
                )}
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                  Tujuan
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                  No. HP
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={cols}
                    className="text-center py-12 text-muted text-sm"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-10 h-10 text-muted/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <p>Tidak ada tamu ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((guest, idx) => (
                  <tr
                    key={guest.id}
                    className="border-b border-border/50 table-row-hover"
                  >
                    <td className="px-5 py-3.5 text-sm text-muted">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-muted text-accent flex items-center justify-center text-xs font-bold shrink-0">
                          {guest.nama
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {guest.nama}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted">
                      {guest.instansi}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${(statusMap[guest.status] || statusMap.reguler).badge}`}>
                        {(statusMap[guest.status] || statusMap.reguler).label}
                      </span>
                    </td>
                    {showEvent && (
                      <td className="px-5 py-3.5">
                        <span className="text-xs bg-accent-muted text-accent px-2.5 py-1 rounded-full font-medium">
                          {getEventName(guest.acara_id)}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-accent-muted text-accent px-2.5 py-1 rounded-full font-medium">
                        {guest.tujuan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted font-mono">
                      {guest.no_hp || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm">
                        <p className="text-foreground/80 font-medium">
                          {formatTime(guest.waktu_kedatangan)}
                        </p>
                        <p className="text-xs text-muted">
                          {formatDate(guest.waktu_kedatangan)}
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

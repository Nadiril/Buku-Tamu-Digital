"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEventsQuery } from "@/lib/queries/useEventsQuery";
import { useGuestsQuery } from "@/lib/queries/useGuestsQuery";
import { useActivitiesQuery } from "@/lib/queries/useActivitiesQuery";
import {
  Calendar,
  Users,
  QrCode,
  Clock,
  ArrowRight,
  CalendarRange,
  MapPin,
  Activity,
} from "lucide-react";

export default function PanitiaDashboardPage() {
  const router = useRouter();
  const { data: events = [] } = useEventsQuery();
  const { data: guests = [] } = useGuestsQuery();
  const { data: activities = [] } = useActivitiesQuery();
  const [selectedEventId, setSelectedEventId] = useState("all");

  const stats = useMemo(() => {
    const activeEvents = events.filter((e) => e.status === "registrasi_dibuka");
    const today = new Date().toISOString().split("T")[0];
    const todayGuests = guests.filter(
      (g) => g.waktu_kedatangan && g.waktu_kedatangan.startsWith(today)
    );
    const checkedIn = guests.filter(
      (g) => g.status_kehadiran === "hadir" || g.status_kehadiran === "terlambat"
    );
    return {
      totalEvents: events.length,
      activeEvents: activeEvents.length,
      totalGuests: guests.length,
      checkedIn: checkedIn.length,
      todayCheckIns: todayGuests.length,
    };
  }, [events, guests]);

  const activeEvent = useMemo(
    () => events.find((e) => e.status === "registrasi_dibuka"),
    [events]
  );

  const recentActivity = useMemo(() => {
    return activities.slice(0, 8);
  }, [activities]);

  const fmtTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "baru saja";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const quickActions = [
    {
      label: "Scan QR",
      description: "Scan kehadiran tamu",
      icon: QrCode,
      href: "/panitia/scan",
      color: "accent",
    },
    {
      label: "Pilih Acara",
      description: "Lihat acara tersedia",
      icon: Calendar,
      href: "/panitia/events",
      color: "success",
    },
    {
      label: "Riwayat",
      description: "Data registrasi",
      icon: Clock,
      href: "/panitia/history",
      color: "info",
    },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 max-lg:px-5 max-sm:px-4 py-6 space-y-6">
      {/* Hero: Current Event */}
      {activeEvent && (
        <div className="relative overflow-hidden rounded-xl border border-accent/10 bg-gradient-to-br from-accent/5 via-white to-white p-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-light text-success text-[11px] font-semibold border border-success/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-subtle" />
                  Sedang Berlangsung
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {activeEvent.nama_acara}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {activeEvent.lokasi}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5" />
                  {new Date(activeEvent.tanggal_mulai).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {activeEvent.jam_mulai ? `, ${activeEvent.jam_mulai}` : ""}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push("/panitia/scan")}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Scan QR
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-lg:gap-5 max-sm:gap-4">
        <div className="bg-white rounded-xl border border-border p-5 hover:border-border-hover transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Total Acara</span>
            <div className="w-9 h-9 rounded-lg bg-accent-muted flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">{stats.totalEvents}</p>
          <p className="text-xs text-muted mt-1">
            <span className="text-success font-medium">{stats.activeEvents}</span> aktif
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-5 hover:border-border-hover transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Total Tamu</span>
            <div className="w-9 h-9 rounded-lg bg-success-muted flex items-center justify-center">
              <Users className="w-4 h-4 text-success" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">{stats.totalGuests}</p>
          <p className="text-xs text-muted mt-1">
            <span className="text-success font-medium">{stats.checkedIn}</span> sudah check-in
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-5 hover:border-border-hover transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Check-In Hari Ini</span>
            <div className="w-9 h-9 rounded-lg bg-warning-muted flex items-center justify-center">
              <Clock className="w-4 h-4 text-warning" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">{stats.todayCheckIns}</p>
          <p className="text-xs text-muted mt-1">Tamu yang sudah hadir hari ini</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-5 hover:border-border-hover transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Acara Aktif</span>
            <div className="w-9 h-9 rounded-lg bg-info-muted flex items-center justify-center">
              <QrCode className="w-4 h-4 text-info" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">{stats.activeEvents}</p>
          <p className="text-xs text-muted mt-1">Acara dengan registrasi terbuka</p>
        </div>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-lg:gap-5 max-sm:gap-4">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const colorStyles = {
                accent: "bg-accent-muted text-accent border-accent/10",
                success: "bg-success-muted text-success border-success/10",
                warning: "bg-warning-muted text-warning border-warning/10",
                info: "bg-info-muted text-info border-info/10",
              };
              return (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-border hover:border-border-hover hover:shadow-sm transition-all duration-200 cursor-pointer text-center group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorStyles[action.color]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Aktivitas Terbaru</h3>
            <button
              onClick={() => router.push("/panitia/history")}
              className="text-xs font-medium text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Activity className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentActivity.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-card-hover transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent/40 shrink-0" />
                    <p className="text-sm text-foreground flex-1 truncate">{a.detail}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{fmtTime(a.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

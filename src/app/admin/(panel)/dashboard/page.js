"use client";

import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import EventCard from "@/components/EventCard";
import ActivityFeed from "@/components/ActivityFeed";
import { useGuestsQuery } from "@/lib/queries/useGuestsQuery";
import { useEventsQuery } from "@/lib/queries/useEventsQuery";
import { CalendarPlus } from "lucide-react";
import Link from "next/link";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-border rounded-lg ${className}`} />;
}

function getWibDayBounds(date = new Date()) {
  const wibDateStr = new Date(date.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
  const start = new Date(wibDateStr + "T00:00:00+07:00");
  const end = new Date(start.getTime() + 24 * 3600 * 1000);
  return [start, end];
}

export default function DashboardPage() {
  const { data: guests = [], isLoading: guestsLoading } = useGuestsQuery();
  const { data: events = [], isLoading: eventsLoading } = useEventsQuery();

  const loading = guestsLoading || eventsLoading;
  const totalEvents = events.length;
  const totalGuests = guests.length;

  const [dayStart, dayEnd] = getWibDayBounds();
  const todayGuests = guests.filter((g) => {
    if (!g.waktu_kedatangan) return false;
    const t = new Date(g.waktu_kedatangan).getTime();
    return t >= dayStart.getTime() && t < dayEnd.getTime();
  }).length;
  const activeEvents = events.filter((e) => e.status === "registrasi_dibuka").length;
  const recentEvents = events.slice(0, 4);

  return (
    <>
      <Navbar
        title="Dashboard"
        subtitle="Selamat datang kembali, Admin"
      />

      <div className="flex-1 p-6 space-y-8">
        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Acara"
              value={totalEvents || "Belum ada data"}
              color="accent"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatCard
              title="Total Tamu"
              value={totalGuests || "Belum ada data"}
              color="success"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <StatCard
              title="Tamu Hari Ini"
              value={todayGuests || "Belum ada"}
              color="info"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Acara Aktif"
              value={activeEvents || "Tidak ada"}
              color="warning"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Recent Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Acara Terbaru
              </h2>
              <p className="text-sm text-muted mt-0.5">
                Kelola dan pantau acara terkini
              </p>
            </div>
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <div className="pt-3 border-t border-border/50">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <CalendarPlus className="w-8 h-8 text-muted/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted">Belum ada acara</p>
              <p className="text-xs text-muted/60 mt-1">Buat acara baru untuk mulai registrasi tamu</p>
              <Link
                href="/admin/events"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                Buat Acara
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Aktivitas Terbaru
              </h2>
              <p className="text-sm text-muted mt-0.5">
                Riwayat aktivitas pengguna
              </p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <ActivityFeed limit={10} />
          </div>
        </div>
      </div>
    </>
  );
}

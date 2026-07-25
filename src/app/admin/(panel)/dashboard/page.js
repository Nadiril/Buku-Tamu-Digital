"use client";

import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import EventCard from "@/components/EventCard";
import ActivityFeed from "@/components/ActivityFeed";
import { useGuestsQuery } from "@/lib/queries/useGuestsQuery";
import { useEventsQuery } from "@/lib/queries/useEventsQuery";
import { useActivitiesQuery } from "@/lib/queries/useActivitiesQuery";
import { useStatsQuery } from "@/lib/queries/useStatsQuery";

function getWibDayBounds(date = new Date()) {
  const wibDateStr = new Date(date.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
  const start = new Date(wibDateStr + "T00:00:00+07:00");
  const end = new Date(start.getTime() + 24 * 3600 * 1000);
  return [start, end];
}

export default function DashboardPage() {
  const { data: guests = [] } = useGuestsQuery();
  const { data: events = [] } = useEventsQuery();
  const { data: stats } = useStatsQuery();

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
        subtitle="Selamat datang kembali, Admin 👋"
      />

      <div className="flex-1 p-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Acara"
            value={totalEvents}
            color="accent"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Total Tamu"
            value={totalGuests}
            color="success"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            title="Tamu Hari Ini"
            value={todayGuests}
            color="info"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Acara Aktif"
            value={activeEvents}
            color="warning"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

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

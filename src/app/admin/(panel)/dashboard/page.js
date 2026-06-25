import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import EventCard from "@/components/EventCard";
import { dummyEvents, dashboardStats } from "@/lib/dummy-data";

export default function DashboardPage() {
  const recentEvents = dummyEvents.slice(0, 4);

  return (
    <>
      <Navbar
        title="Dashboard"
        subtitle="Selamat datang kembali, Admin 👋"
      />

      <div className="flex-1 p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <StatCard
            title="Total Acara"
            value={dashboardStats.totalEvents}
            color="accent"
            trend="+2 bulan ini"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Total Tamu"
            value={dashboardStats.totalGuests}
            color="success"
            trend="+48 minggu ini"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            title="Tamu Hari Ini"
            value={dashboardStats.todayGuests}
            color="info"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Acara Aktif"
            value={dashboardStats.activeEvents}
            color="warning"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {recentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Quick Activity */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">
            Aktivitas Terakhir
          </h3>
          <div className="space-y-4">
            {[
              {
                name: "Ahmad Fauzi",
                action: "mendaftar di",
                event: "Seminar AI 2026",
                time: "2 menit lalu",
                color: "bg-success",
              },
              {
                name: "Siti Nurhaliza",
                action: "mendaftar di",
                event: "Seminar AI 2026",
                time: "5 menit lalu",
                color: "bg-accent",
              },
              {
                name: "Dimas Aditya",
                action: "mendaftar di",
                event: "Workshop React Advanced",
                time: "15 menit lalu",
                color: "bg-info",
              },
              {
                name: "Fajar Nugroho",
                action: "mendaftar di",
                event: "Job Fair 2026",
                time: "1 jam lalu",
                color: "bg-warning",
              },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-sm group"
              >
                <div
                  className={`w-2 h-2 rounded-full ${activity.color} shrink-0`}
                ></div>
                <p className="text-muted flex-1">
                  <span className="text-foreground font-medium">
                    {activity.name}
                  </span>{" "}
                  {activity.action}{" "}
                  <span className="text-accent font-medium">
                    {activity.event}
                  </span>
                </p>
                <span className="text-xs text-muted/60 shrink-0">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

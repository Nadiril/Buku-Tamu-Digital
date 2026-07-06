"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import Link from "next/link";

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

export default function StaffDashboardPage() {
  const [events, setEvents] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/events").then((r) => r.json()),
      fetch("/api/guests").then((r) => r.json()),
    ])
      .then(([eventsData, guestsData]) => {
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setGuests(Array.isArray(guestsData) ? guestsData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalEvents = events.length;
  const totalGuests = guests.length;
  const hadir = guests.filter((g) => g.status_kehadiran === "hadir").length;
  const terlambat = guests.filter((g) => g.status_kehadiran === "terlambat").length;
  const tidakHadir = guests.filter((g) => g.status_kehadiran === "tidak_hadir").length;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getGuestCount = (eventId) => {
    return guests.filter((g) => g.acara_id === eventId).length;
  };

  const getHadirCount = (eventId) => {
    return guests.filter(
      (g) => g.acara_id === eventId && g.status_kehadiran === "hadir"
    ).length;
  };

  return (
    <>
      <Navbar
        title="Dashboard Staff"
        subtitle="Mode lihat saja — data tidak dapat diubah"
      />

      <div className="flex-1 p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Acara"
            value={loading ? "—" : totalEvents}
            color="accent"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Total Tamu"
            value={loading ? "—" : totalGuests}
            color="success"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            title="Hadir"
            value={loading ? "—" : hadir}
            color="info"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Tidak Hadir"
            value={loading ? "—" : tidakHadir + terlambat}
            color="warning"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Events List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Daftar Acara</h2>
              <p className="text-sm text-muted mt-0.5">Klik acara untuk melihat detail tamu</p>
            </div>
          </div>

          {loading ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : events.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-muted text-sm">
              Belum ada acara.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => {
                const s = statusStyles[event.status] || statusStyles.akan_datang;
                const guestCount = getGuestCount(event.id);
                const hadirCount = getHadirCount(event.id);
                return (
                  <Link key={event.id} href={`/staff/guests?acara_id=${event.id}`}>
                    <div className="glass-card rounded-2xl p-5 hover:border-border-hover hover:bg-card-hover transition-all duration-300 cursor-pointer group">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                          {event.nama_acara}
                        </h3>
                        <span className={`${s.badge} text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ml-2 whitespace-nowrap`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-muted">
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{event.lokasi}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(event.tanggal_mulai)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                        <span className="text-muted">
                          <span className="font-medium text-foreground/80">{guestCount}</span> tamu terdaftar
                        </span>
                        <span className="text-success font-medium">
                          {hadirCount} hadir
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

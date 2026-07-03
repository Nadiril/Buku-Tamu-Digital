"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import { FileDown, FileSpreadsheet, Download, BarChart3, Users, CheckCircle, XCircle, TrendingUp } from "lucide-react";

const dummyStats = {
  total: 0,
  hadir: 0,
  belumHadir: 0,
  persentase: 0,
};

export default function LaporanPage() {
  const [eventFilter, setEventFilter] = useState("");

  const stats = dummyStats;

  const statCards = [
    {
      title: "Total Tamu",
      value: stats.total,
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "Sudah Hadir",
      value: stats.hadir,
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Belum Hadir",
      value: stats.belumHadir,
      icon: XCircle,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: "Kehadiran",
      value: `${stats.persentase}%`,
      icon: TrendingUp,
      color: "text-info",
      bg: "bg-info/10",
    },
  ];

  return (
    <>
      <Navbar
        title="Laporan"
        subtitle="Lihat dan unduh laporan data tamu berdasarkan acara"
      />

      <div className="flex-1 p-4 sm:p-6 space-y-6">
        {/* Filter & Export */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full rounded-xl bg-input border border-input-border pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-input-focus transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">Semua Acara</option>
              <option value="wisuda">Wisuda 2026</option>
              <option value="seminar">Seminar Kampus</option>
            </select>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="secondary" className="flex-1 sm:flex-none">
              <FileDown className="w-4 h-4" />
              Export PDF
            </Button>
            <Button variant="success" className="flex-1 sm:flex-none">
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.title}
              className="glass-card rounded-2xl p-4 sm:p-5 hover:border-border-hover transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-muted font-medium">{card.title}</span>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />
                </div>
              </div>
              <p className={`text-xl sm:text-2xl font-bold text-foreground ${stats.total === 0 ? "text-muted/40" : ""}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-muted" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">Grafik Kehadiran</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
            <svg className="w-24 h-24 sm:w-32 sm:h-32 text-muted/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-semibold text-muted">Belum Ada Data</p>
            <p className="text-xs text-muted/60 mt-1 max-w-xs">
              Grafik kehadiran akan tampil setelah tamu mulai melakukan registrasi pada acara
            </p>
          </div>
        </div>

        {/* Detail Table Placeholder */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-muted" />
              <h3 className="text-sm sm:text-base font-bold text-foreground">Rekapitulasi Tamu</h3>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-muted/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-semibold text-muted">Belum Ada Data Tamu</p>
            <p className="text-xs text-muted/60 mt-1 max-w-xs">
              Data tamu akan muncul setelah filter acara dipilih dan terdapat tamu yang terdaftar
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

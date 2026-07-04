"use client";

import { use, useState } from "react";
import { useGuests } from "@/lib/GuestContext";
import { useEvents } from "@/lib/EventContext";
import Button from "@/components/Button";

export default function ScanPage({ params }) {
  const { token } = use(params);
  const { guests, updateGuest } = useGuests();
  const { events } = useEvents();
  const [confirmed, setConfirmed] = useState(false);

  const guest = guests.find((g) => g.qr_token === token);
  const event = guest ? events.find((e) => e.id === guest.acara_id) : null;

  const handleConfirm = () => {
    updateGuest(guest.id, {
      status_kehadiran: "hadir",
      waktu_kedatangan: new Date().toISOString(),
    });
    setConfirmed(true);
  };

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-danger-muted mx-auto flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">QR Code Tidak Valid</h1>
          <p className="text-sm text-muted">QR Code yang Anda scan tidak dikenali dalam sistem.</p>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-success/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-success/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-success-muted mx-auto flex items-center justify-center mb-5 glow-success">
            <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Kehadiran Dikonfirmasi!</h1>
          <p className="text-muted text-sm mb-2">Selamat datang,</p>
          <p className="text-accent font-semibold text-lg mb-1">{guest.nama}</p>
          <p className="text-sm text-muted mb-6">{event?.nama_acara || "—"}</p>
          <div className="glass-card rounded-2xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Instansi</span>
              <span className="text-foreground font-medium">{guest.instansi}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border/50 pt-3">
              <span className="text-muted">Waktu Hadir</span>
              <span className="text-foreground font-medium">
                {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => window.close()}>Tutup</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-accent mx-auto flex items-center justify-center shadow-lg shadow-accent/30 mb-5">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Konfirmasi Kehadiran</h1>
        <p className="text-sm text-muted mb-6">Scan QR Code berhasil. Konfirmasi kehadiran Anda di bawah ini.</p>

        <div className="glass-card rounded-2xl p-5 text-left space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Nama</span>
            <span className="text-foreground font-medium">{guest.nama}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Instansi</span>
            <span className="text-foreground font-medium">{guest.instansi}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Acara</span>
            <span className="text-foreground font-medium">{event?.nama_acara || "—"}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-border/50 pt-3">
            <span className="text-muted">Status</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              guest.status_kehadiran === "hadir" ? "bg-success-muted text-success border border-success/20" :
              "bg-warning-muted text-warning border border-warning/20"
            }`}>
              {guest.status_kehadiran === "hadir" ? "Sudah Hadir" : "Belum Hadir"}
            </span>
          </div>
        </div>

        {guest.status_kehadiran === "hadir" ? (
          <div className="flex items-center gap-2 justify-center text-success text-sm mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Anda sudah terdaftar hadir
          </div>
        ) : (
          <Button className="w-full" size="lg" onClick={handleConfirm}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Konfirmasi Kehadiran
          </Button>
        )}
      </div>
    </div>
  );
}

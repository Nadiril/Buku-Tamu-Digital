"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import QRScanner from "@/components/scanner/QRScanner";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { useGuests } from "@/lib/GuestContext";
import { useEvents } from "@/lib/EventContext";
import { useActivity } from "@/lib/ActivityContext";
import { UserRound, CheckCircle, Building2, Phone, User, Send, ArrowLeft, QrCode } from "lucide-react";

function ScannerScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");
  const { events } = useEvents();
  const selectedEvent = events.find((e) => e.id === parseInt(eventId));
  const { guests, updateGuest } = useGuests();
  const { logActivity } = useActivity();

  const [scannedGuest, setScannedGuest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scanKey, setScanKey] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  const resetScan = () => {
    setScannedGuest(null);
    setSubmitting(false);
    setSubmitted(false);
    setScanKey((k) => k + 1);
  };

  const handleSubmit = async () => {
    if (!scannedGuest) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/scan/${scannedGuest.qr_token}?acara_id=${eventId}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        updateGuest(scannedGuest.id, {
          status_kehadiran: data.status,
          waktu_kedatangan: new Date().toISOString(),
        });
        setScannedGuest((prev) => ({ ...prev, status_kehadiran: data.status }));
        setSubmitted(true);
        logActivity("scan_guest", `Scan kehadiran "${scannedGuest.nama}" di "${selectedEvent?.nama_acara}"`);
        showToast(
          data.status === "hadir" ? "Kehadiran tepat waktu!" :
          "Tamu tercatat terlambat."
        );
        setTimeout(resetScan, 2000);
      } else {
        const err = await res.json();
        setScannedGuest(null);
        showToast(err.error || "Gagal mencatat kehadiran", "error");
      }
    } catch {
      showToast("Gagal terhubung ke server", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleScanError = (err) => {
    const msg = err?.message || "Gagal mengakses kamera atau memindai QR Code";
    showToast(msg, "error");
  };

  const handleScan = (detectedCodes) => {
    if (submitting || submitted) return;
    if (!Array.isArray(detectedCodes) || detectedCodes.length === 0) return;
    const raw = detectedCodes[0]?.rawValue;
    if (!raw) return;
    let token = null;
    const match = String(raw).match(/\/scan\/([a-zA-Z0-9-]+)/);
    if (match) token = match[1];
    if (token) {
      const eventGuests = guests.filter((g) => g.acara_id === parseInt(eventId));
      const guest = eventGuests.find((g) => g.qr_token === token);
      if (guest) {
        setScannedGuest(guest);
        setSubmitted(false);
        return;
      }
    }
    showToast("QR Code tidak dikenali atau tamu tidak ditemukan di acara ini", "error");
  };

  if (!selectedEvent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/10 flex items-center justify-center mb-4">
          <QrCode className="w-8 h-8 text-muted/40" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Acara Tidak Dipilih</h3>
        <p className="text-sm text-muted mb-6">Silakan pilih acara terlebih dahulu.</p>
        <Button onClick={() => router.push("/scanner/events")}>
          <ArrowLeft className="w-4 h-4" />
          Pilih Acara
        </Button>
      </div>
    );
  }

  if (selectedEvent.status !== "registrasi_dibuka") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-warning-muted flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Registrasi Tidak Tersedia</h3>
        <p className="text-sm text-muted mb-6 max-w-xs">
          {selectedEvent.status === "akan_datang"
            ? "Acara ini masih dalam status Akan Datang. Tunggu hingga Admin membuka registrasi."
            : "Registrasi untuk acara ini sudah ditutup."}
        </p>
        <Button onClick={() => router.push("/scanner/events")}>
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">{selectedEvent.nama_acara}</h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">Scan QR Code tamu untuk mencatat kehadiran</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => router.push("/scanner/events")} icon={<ArrowLeft className="w-4 h-4" />}>
            Ganti Acara
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-col">
            <h2 className="text-sm sm:text-base font-bold text-foreground mb-3 sm:mb-4">Scanner QR-Code</h2>
            <div className="flex-1 flex items-center justify-center">
              <QRScanner key={scanKey} onScan={handleScan} onError={handleScanError} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-col">
            <h2 className="text-sm sm:text-base font-bold text-foreground mb-3 sm:mb-4">Detail Tamu</h2>
            {scannedGuest ? (
              <div className="space-y-3 sm:space-y-4 flex-1">
                <div className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl ${submitted ? "bg-success-muted border border-success/20" : "bg-accent-muted border border-accent/20"}`}>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${submitted ? "bg-success/10" : "bg-accent/10"} flex items-center justify-center shrink-0`}>
                    <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${submitted ? "text-success" : "text-accent"}`} />
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-semibold ${submitted ? "text-success" : "text-accent"}`}>
                      {submitted ? "Kehadiran Tercatat" : "Scan Berhasil"}
                    </p>
                    <p className={`text-[10px] sm:text-xs ${submitted ? "text-success/60" : "text-accent/60"}`}>
                      {submitted ? "Tamu sudah check-in" : "QR Code terverifikasi"}
                    </p>
                  </div>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-input/50 border border-border space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted">Nama</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{scannedGuest.nama}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted">Instansi</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{scannedGuest.instansi}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted">No. HP</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{scannedGuest.no_hp || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted">Status</p>
                      <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        scannedGuest.status_kehadiran === "hadir" ? "bg-success-muted text-success border border-success/20" :
                        scannedGuest.status_kehadiran === "terlambat" ? "bg-warning-muted text-warning border border-warning/20" :
                        "bg-warning-muted text-warning border border-warning/20"
                      }`}>
                        {scannedGuest.status_kehadiran === "hadir" ? "Sudah Hadir" :
                         scannedGuest.status_kehadiran === "terlambat" ? "Terlambat" : "Belum Hadir"}
                      </span>
                    </div>
                  </div>
                </div>
                {scannedGuest.status_kehadiran !== "hadir" && scannedGuest.status_kehadiran !== "terlambat" && !submitted && (
                  <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Mengirim...
                      </span>
                    ) : (
                      <><Send className="w-4 h-4" /> Konfirmasi Kehadiran</>
                    )}
                  </Button>
                )}
                {submitted && (
                  <Button variant="secondary" className="w-full" onClick={resetScan}>
                    Scan Tamu Lain
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-input/50 flex items-center justify-center mb-3 sm:mb-4">
                  <UserRound className="w-6 h-6 sm:w-8 sm:h-8 text-muted/40" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-muted">Belum ada data tamu</p>
                <p className="text-[10px] sm:text-xs text-muted/60 mt-1">Data akan tampil setelah QR Code berhasil dipindai</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60]">
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </>
  );
}

export default function ScannerScanPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ScannerScanContent />
    </Suspense>
  );
}

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Scanner, useDevices } from "@yudiel/react-qr-scanner";
import { useGuests } from "@/lib/GuestContext";
import { useEvents } from "@/lib/EventContext";
import { useActivity } from "@/lib/ActivityContext";
import {
  QrCode,
  User,
  Building2,
  Phone,
  CheckCircle,
  Send,
  ArrowLeft,
  Loader2,
  Smartphone,
  Camera,
  Zap,
  RotateCcw,
  X,
  CalendarRange,
} from "lucide-react";

const statusKehadiranMap = {
  hadir: { badge: "bg-success-light text-success border border-success/20", label: "Hadir" },
  terlambat: { badge: "bg-warning-light text-warning border border-warning/20", label: "Terlambat" },
  tidak_hadir: { badge: "bg-danger-light text-danger border border-danger/20", label: "Tidak Hadir" },
};

function ScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");
  const { events } = useEvents();
  const selectedEvent = events.find((e) => e.id === parseInt(eventId));
  const { guests, loaded: guestsLoaded, setGuests, fetchGuests } = useGuests();
  const { logActivity } = useActivity();

  const [scanning, setScanning] = useState(true);
  const [scannedGuest, setScannedGuest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [toast, setToast] = useState(null);
  const scannerRef = useRef(null);

  const devices = useDevices();
  const videoDevices = useMemo(() => devices.filter((d) => d.kind === "videoinput"), [devices]);
  const hasMultipleCameras = videoDevices.length > 1;

  const constraints = useMemo(() => ({
    facingMode,
    width: { ideal: 640, max: 640 },
    height: { ideal: 480, max: 480 },
  }), [facingMode]);

  const components = useMemo(() => ({ finder: false, torch: false }), []);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  const resetScan = () => {
    console.timeEnd("scan:total");
    setScannedGuest(null);
    setSubmitting(false);
    setSubmitted(false);
    setScanning(true);
  };

  const handleSubmit = async () => {
    if (!scannedGuest) return;
    setSubmitting(true);
    console.time("scan:request");
    try {
      const res = await fetch(`/api/scan/${scannedGuest.qr_token}?acara_id=${eventId}`, { method: "POST" });
      const data = await res.json();
      console.timeEnd("scan:request");
      if (data.success) {
        setGuests((prev) => prev.map((g) =>
          g.id === scannedGuest.id
            ? { ...g, status_kehadiran: data.status, waktu_kedatangan: data.guest?.waktu_kedatangan || new Date().toISOString() }
            : g
        ));
        fetchGuests();
        setScannedGuest((prev) => ({ ...prev, status_kehadiran: data.status }));
        setSubmitted(true);
        logActivity("scan_guest", `Scan kehadiran "${scannedGuest.nama}" di "${selectedEvent?.nama_acara}"`);
        showToast(
          data.status === "hadir" ? "Kehadiran tepat waktu!" : "Tamu tercatat terlambat."
        );
      } else {
        setScannedGuest(null);
        setScanning(true);
        showToast(data.error || data.message || "Gagal mencatat kehadiran", "error");
      }
    } catch {
      showToast("Gagal terhubung ke server", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleScan = useCallback((detectedCodes) => {
    if (!scanning || submitting || submitted) return;
    if (!Array.isArray(detectedCodes) || detectedCodes.length === 0) return;
    console.time("scan:total");
    console.time("scan:qr-callback");
    const raw = detectedCodes[0]?.rawValue;
    if (!raw) return;
    console.time("scan:lookup");
    let token = null;
    const match = String(raw).match(/\/scan\/([a-zA-Z0-9-]+)/);
    if (match) token = match[1];
    if (token) {
      const eventGuests = guests.filter((g) => g.acara_id === parseInt(eventId));
      const guest = eventGuests.find((g) => g.qr_token === token);
      if (guest) {
        console.timeEnd("scan:qr-callback");
        console.timeEnd("scan:lookup");
        console.time("scan:ui-update-guest");
        setScannedGuest(guest);
        setScanning(false);
        setSubmitted(false);
        return;
      }
    }
    console.timeEnd("scan:lookup");
    showToast("QR Code tidak dikenali", "error");
  }, [scanning, submitting, submitted, guests, eventId]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const toggleFlash = async () => {
    try {
      const stream = scannerRef.current?.getStream();
      if (!stream) return;
      const [track] = stream.getVideoTracks();
      if (!track) return;
      await track.applyConstraints({ advanced: [{ torch: !flashOn }] });
      setFlashOn(!flashOn);
    } catch {
      showToast("Flash tidak tersedia", "error");
    }
  };

  // No event selected
  if (!selectedEvent) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/5 border border-border flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Acara Tidak Dipilih</h3>
          <p className="text-sm text-muted-foreground mb-6">Silakan pilih acara terlebih dahulu untuk memulai scan.</p>
          <button
            onClick={() => router.push("/panitia/events")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Pilih Acara
          </button>
        </div>
      </div>
    );
  }

  // Still loading guests
  if (!guestsLoaded) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-1">Memuat Data Tamu</h3>
          <p className="text-sm text-muted-foreground">Silakan tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  // Event not open
  if (selectedEvent.status !== "registrasi_dibuka") {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-14 h-14 rounded-2xl bg-warning-light border border-warning/20 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Registrasi Tidak Aktif</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Acara ini belum membuka registrasi. Tunggu hingga Admin membuka registrasi.
          </p>
          <button
            onClick={() => router.push("/panitia/events")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 max-lg:px-5 max-sm:px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Scan QR</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success-light text-success text-[10px] font-semibold border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-subtle" />
              {selectedEvent.nama_acara}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Scan QR Code tamu untuk mencatat kehadiran</p>
        </div>
        <button
          onClick={() => router.push("/panitia/events")}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-card-hover transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Ganti Acara
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">Pemindai QR Code</h2>
            </div>
          </div>
          <div className="p-5">
            <div className="relative w-full max-w-sm mx-auto">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-black">
                <Scanner
                  ref={scannerRef}
                  onScan={handleScan}
                  onError={() => showToast("Gagal mengakses kamera", "error")}
                  formats={["qr_code"]}
                  retryDelay={100}
                  constraints={constraints}
                  sound={true}
                  components={components}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: { width: "100%", height: "100%", objectFit: "cover" },
                  }}
                  startTimeoutMs={5000}
                />
                {scanning && (
                  <>
                    {/* Overlay */}
                    <div className="absolute inset-0">
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] pb-[70%] rounded-xl"
                        style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }}
                      />
                      {/* Scanning line animation */}
                      <div className="absolute left-[15%] right-[15%] h-0.5 bg-accent/70 animate-scan-line rounded-full shadow-lg shadow-accent/50" />
                    </div>
                    {/* Corner brackets */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-[15%] left-[15%] w-4 h-4 border-t-2 border-l-2 border-white/80 rounded-tl-md" />
                      <div className="absolute top-[15%] right-[15%] w-4 h-4 border-t-2 border-r-2 border-white/80 rounded-tr-md" />
                      <div className="absolute bottom-[15%] left-[15%] w-4 h-4 border-b-2 border-l-2 border-white/80 rounded-bl-md" />
                      <div className="absolute bottom-[15%] right-[15%] w-4 h-4 border-b-2 border-r-2 border-white/80 rounded-br-md" />
                    </div>
                  </>
                )}
                {!scanning && scannedGuest && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-3">
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                    <p className="text-white font-semibold">Tamu Terdeteksi</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {hasMultipleCameras && (
                  <button
                    onClick={toggleCamera}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Ganti Kamera
                  </button>
                )}
                <button
                  onClick={toggleFlash}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors cursor-pointer"
                >
                  <Zap className={`w-3.5 h-3.5 ${flashOn ? "text-warning" : ""}`} />
                  Flash
                </button>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              {scanning
                ? "Posisikan QR Code di dalam kotak untuk memindai"
                : "Scan selesai"}
            </p>
          </div>
        </div>

        {/* Guest Info */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">Detail Tamu</h2>
            </div>
          </div>
          <div className="p-5">
            {scannedGuest ? (
              <div className="space-y-4">
                {/* Status Banner */}
                <div className={`flex items-center gap-3 p-3.5 rounded-lg border ${
                  submitted
                    ? "bg-success-light border-success/20"
                    : "bg-accent-muted border-accent/10"
                }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    submitted ? "bg-success/10" : "bg-accent/10"
                  }`}>
                    {submitted ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${submitted ? "text-success" : "text-accent"}`}>
                      {submitted ? "Kehadiran Tercatat" : "Scan Berhasil"}
                    </p>
                    <p className={`text-xs ${submitted ? "text-success/60" : "text-accent/60"}`}>
                      {submitted ? "Tamu sudah check-in" : "QR Code terverifikasi"}
                    </p>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card-hover">
                    <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nama</p>
                      <p className="text-sm font-semibold text-foreground">{scannedGuest.nama}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card-hover">
                    <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Instansi</p>
                      <p className="text-sm font-semibold text-foreground">{scannedGuest.instansi}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card-hover">
                    <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">No. HP</p>
                      <p className="text-sm font-semibold text-foreground">{scannedGuest.no_hp || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card-hover">
                    <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                        (statusKehadiranMap[scannedGuest.status_kehadiran] || statusKehadiranMap.tidak_hadir).badge
                      }`}>
                        {(statusKehadiranMap[scannedGuest.status_kehadiran] || statusKehadiranMap.tidak_hadir).label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {scannedGuest.status_kehadiran !== "hadir" && scannedGuest.status_kehadiran !== "terlambat" && !submitted && (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-accent/20 cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {submitting ? "Memproses..." : "Konfirmasi Kehadiran"}
                  </button>
                )}
                {submitted && (
                  <button
                    onClick={resetScan}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-card-hover transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Scan Tamu Lain
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted/5 border border-border flex items-center justify-center mb-4">
                  <User className="w-7 h-7 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Belum ada data tamu</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
                Arahkan kamera ke QR Code tamu untuk memulai pemindaian
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg bg-white ${
            toast.type === "success" ? "border-success/20" : "border-danger/20"
          }`}>
            <CheckCircle className={`w-5 h-5 ${toast.type === "success" ? "text-success" : "text-danger"}`} />
            <p className="text-sm font-medium text-foreground">{toast.message}</p>
            <button onClick={() => setToast(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PanitiaScanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}

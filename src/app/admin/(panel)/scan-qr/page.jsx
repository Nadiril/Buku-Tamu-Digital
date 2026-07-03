"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Navbar from "@/components/Navbar";
import QRScanner from "@/components/scanner/QRScanner";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { dummyEvents } from "@/lib/dummy-data";
import { UserRound, Clock, CheckCircle, Calendar, Hash, GraduationCap, User, Send, ArrowLeft, QrCode } from "lucide-react";

function ScanQRContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");
  const selectedEvent = dummyEvents.find((e) => e.id === parseInt(eventId));

  const [scanned, setScanned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scanKey, setScanKey] = useState(0);
  const [toast, setToast] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  const resetScan = () => {
    setScanned(false);
    setSubmitting(false);
    setSubmitted(false);
    setScanKey((k) => k + 1);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setScanHistory((prev) => [
        {
          id: Date.now(),
          name: dummyGuest.name,
          nim: dummyGuest.nim,
          prodi: dummyGuest.prodi,
          event: selectedEvent?.nama_acara || dummyGuest.event,
          time: "Baru saja",
        },
        ...prev,
      ]);
      showToast("Kehadiran tamu berhasil dicatat!");
      setTimeout(resetScan, 1500);
    }, 1500);
  };

  const handleScan = () => {
    if (scanned || submitting) return;
    setScanned(true);
    setSubmitted(false);
  };

  const dummyGuest = {
    name: "M. Nadiril Khoir",
    nim: "3125101308",
    prodi: "D3 Manajemen Informatika",
    event: selectedEvent?.nama_acara || "Wisuda STIKOM PGRI Banyuwangi 2026",
  };

  const statusStyles = {
    active: { badge: "bg-success-muted text-success", dot: "bg-success" },
    upcoming: { badge: "bg-info-muted text-info", dot: "bg-info" },
    completed: { badge: "bg-muted/20 text-muted", dot: "bg-muted" },
  };

  if (!selectedEvent) {
    return (
      <>
        <Navbar
          title="Registrasi Tamu"
          subtitle="Pilih acara untuk memulai registrasi tamu"
        />
        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dummyEvents.map((event) => {
              const s = statusStyles[event.status] || statusStyles.upcoming;
              return (
                <button
                  key={event.id}
                  onClick={() => router.push(`/admin/scan-qr?eventId=${event.id}`)}
                  className="glass-card rounded-2xl p-5 hover:border-border-hover hover:bg-card-hover transition-all duration-300 text-left w-full cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5 text-accent" />
                    </div>
                    <span className={`${s.badge} text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ml-3 whitespace-nowrap`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                      {s.label || event.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                    {event.nama_acara}
                  </h3>
                  <p className="text-xs text-muted mt-1">{event.lokasi}</p>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar
        title={`Registrasi Tamu - ${selectedEvent.nama_acara}`}
        subtitle="Scan QR Code tamu untuk mencatat kehadiran"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/admin/scan-qr")}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Ganti Acara
          </Button>
        }
      />

      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-sm sm:text-base font-bold text-foreground mb-3 sm:mb-4">
              Scanner QR-Code
            </h2>
            <QRScanner key={scanKey} onScan={handleScan} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-sm sm:text-base font-bold text-foreground mb-3 sm:mb-4">
              Detail Tamu
            </h2>
            {scanned ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-green-700">Scan Berhasil</p>
                    <p className="text-[10px] sm:text-xs text-green-500">
                      QR Code terverifikasi
                    </p>
                  </div>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted">Nama</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{dummyGuest.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted">NIM</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{dummyGuest.nim}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted">Program Studi</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{dummyGuest.prodi}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted">Acara</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{dummyGuest.event}</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || submitted}
                  className="w-full"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Mengirim...
                    </span>
                  ) : submitted ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Terkirim
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Kirim Data Kehadiran
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 sm:py-20 px-4 sm:px-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
                  <UserRound className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500">
                  Belum ada data tamu
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                  Data akan tampil setelah QR Code berhasil dipindai
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Riwayat Scan
            </h2>
          </div>
          {scanHistory.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {scanHistory.map((item) => (
                <div key={item.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted">{item.nim} · {item.prodi}</p>
                    <p className="text-[10px] sm:text-xs text-muted/60">{item.event}</p>
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted/60 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 sm:py-16 px-4 sm:px-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-gray-500">
                Belum ada riwayat scan
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                Riwayat akan muncul setelah tamu berhasil discan
              </p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60]">
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </>
  );
}

export default function ScanQRPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ScanQRContent />
    </Suspense>
  );
}

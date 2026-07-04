"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Scanner, useDevices } from "@yudiel/react-qr-scanner";

export default function QRScanner({ onScan, onError }) {
  const scannerRef = useRef(null);
  const [scanState, setScanState] = useState("loading");
  const [facingMode, setFacingMode] = useState("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(null);
  const scanTimeoutRef = useRef(null);
  const loadingTimeoutRef = useRef(null);

  useEffect(() => {
    if (scanState !== "loading") return;
    loadingTimeoutRef.current = setTimeout(() => {
      const stream = scannerRef.current?.getStream();
      if (stream) {
        const [track] = stream.getVideoTracks();
        if (track) {
          const caps = track.getCapabilities?.();
          setTorchSupported(!!caps?.torch);
        }
      }
      setScanState("idle");
    }, 2000);
    return () => clearTimeout(loadingTimeoutRef.current);
  }, [scanState]);

  const devices = useDevices();

  const videoDevices = devices.filter((d) => d.kind === "videoinput");
  const hasMultipleCameras = videoDevices.length > 1;

  const handleScan = useCallback(
    (codes) => {
      if (scanState === "loading") setScanState("idle");
      setScanState("scanning");
      if (onScan) onScan(codes);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = setTimeout(() => {
        setScanState((prev) => (prev === "scanning" ? "idle" : prev));
      }, 1500);
    },
    [onScan, scanState],
  );

  const handleError = useCallback(
    (err) => {
      setScanState("error");
      if (onError) onError(err);
    },
    [onError],
  );

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    setTorchSupported(null);
    setTorchOn(false);
    setScanState("loading");
  }, []);

  const toggleTorch = useCallback(async () => {
    if (!torchSupported) return;
    try {
      const stream = scannerRef.current?.getStream();
      if (!stream) return;
      const [track] = stream.getVideoTracks();
      if (!track) return;
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(!torchOn);
    } catch {
      setTorchSupported(false);
    }
  }, [torchOn, torchSupported]);

  const getStatusText = () => {
    switch (scanState) {
      case "loading":
        return "Mengaktifkan kamera...";
      case "idle":
        return "Posisikan QR Code di dalam kotak untuk melakukan pemindaian.";
      case "scanning":
        return "Memindai QR Code...";
      case "error":
        return "Gagal mengakses kamera";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Scanner Container */}
      <div className="relative w-full max-w-[340px] mx-auto">
        <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-black">
          {/* Loading overlay */}
          {scanState === "loading" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
              <div className="w-8 h-8 border-2 border-white/60 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-white/60">Mengaktifkan kamera...</p>
            </div>
          )}

          <Scanner
            ref={scannerRef}
            onScan={handleScan}
            onError={handleError}
            formats={["qr_code"]}
            constraints={{ facingMode }}
            styles={{
              container: { width: "100%", height: "100%" },
              video: { width: "100%", height: "100%", objectFit: "cover" },
            }}
            scanDelay={300}
          >
            {scanState !== "loading" && (
              <>
                {/* Dark overlay with transparent cutout */}
                <div className="absolute inset-0">
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] pb-[75%] rounded-2xl"
                    style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }}
                  />
                </div>

                {/* Corner frames */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[12.5%] left-[12.5%] w-5 h-5 border-t-[3px] border-l-[3px] border-white/90 rounded-tl-md" />
                  <div className="absolute top-[12.5%] right-[12.5%] w-5 h-5 border-t-[3px] border-r-[3px] border-white/90 rounded-tr-md" />
                  <div className="absolute bottom-[12.5%] left-[12.5%] w-5 h-5 border-b-[3px] border-l-[3px] border-white/90 rounded-bl-md" />
                  <div className="absolute bottom-[12.5%] right-[12.5%] w-5 h-5 border-b-[3px] border-r-[3px] border-white/90 rounded-br-md" />
                </div>


              </>
            )}
          </Scanner>
        </div>
      </div>

      {/* Status text */}
      <p className="text-sm text-center text-muted max-w-xs">
        {getStatusText()}
      </p>

      {/* Camera controls */}
      <div className="flex items-center gap-3">
        {hasMultipleCameras && (
          <button
            onClick={toggleCamera}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-muted hover:text-foreground bg-input/50 hover:bg-input border border-border rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Ganti Kamera
          </button>
        )}
        {torchSupported && (
          <button
            onClick={toggleTorch}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-border rounded-lg transition-colors cursor-pointer ${
              torchOn
                ? "text-warning bg-warning-muted"
                : "text-muted hover:text-foreground bg-input/50 hover:bg-input"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            {torchOn ? "Flash Nyala" : "Flash"}
          </button>
        )}
      </div>
    </div>
  );
}

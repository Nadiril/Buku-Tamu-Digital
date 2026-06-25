"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Button from "@/components/Button";

export default function QRCodeCard({ slug }) {
  const canvasRef = useRef(null);
  const qrValue = `http://localhost:3000/event/${slug}`;

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `qrcode-${slug}.png`;
    link.click();
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
      <p className="text-xs text-muted uppercase tracking-wider mb-4">QR Code Acara</p>
      <div
        ref={canvasRef}
        className="w-48 h-48 bg-white rounded-2xl p-3 flex items-center justify-center mb-4"
      >
        <QRCodeCanvas
          value={qrValue}
          size={168}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
          includeMargin={false}
        />
      </div>
      <p className="text-xs text-muted">Scan untuk membuka form buku tamu</p>
      <Button variant="secondary" size="sm" className="mt-3" onClick={handleDownload}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR
      </Button>
    </div>
  );
}

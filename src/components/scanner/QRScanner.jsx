"use client";

import { Scanner } from "@yudiel/react-qr-scanner";

export default function QRScanner({ onScan }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-black h-[200px] lg:h-[320px]">
      <Scanner
        onScan={onScan || (() => {})}
        onError={() => {}}
        constraints={{
          facingMode: "environment",
        }}
        styles={{
          container: {
            width: "100%",
            height: "100%",
          },
          video: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
          },
        }}
      />
    </div>
  );
}

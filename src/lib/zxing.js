"use client";

import { setZXingModuleOverrides } from "@yudiel/react-qr-scanner";

setZXingModuleOverrides({
  locateFile: () => "/zxing_reader.wasm",
});

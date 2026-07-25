"use client";

import { QueryProvider } from "@/lib/query-client";

export default function Providers({ children }) {
  return <QueryProvider>{children}</QueryProvider>;
}

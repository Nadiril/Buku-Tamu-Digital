"use client";

import { GuestProvider } from "@/lib/GuestContext";
import { EventProvider } from "@/lib/EventContext";
import { ActivityProvider } from "@/lib/ActivityContext";

export default function Providers({ children }) {
  return (
    <GuestProvider>
      <EventProvider>
        <ActivityProvider>
          {children}
        </ActivityProvider>
      </EventProvider>
    </GuestProvider>
  );
}

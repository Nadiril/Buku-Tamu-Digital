"use client";

import { ProfileProvider } from "@/lib/ProfileContext";
import { GuestProvider } from "@/lib/GuestContext";
import { EventProvider } from "@/lib/EventContext";
import { ActivityProvider } from "@/lib/ActivityContext";

export default function Providers({ children }) {
  return (
    <ProfileProvider>
      <GuestProvider>
        <EventProvider>
          <ActivityProvider>
            {children}
          </ActivityProvider>
        </EventProvider>
      </GuestProvider>
    </ProfileProvider>
  );
}

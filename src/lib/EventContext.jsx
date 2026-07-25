"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    };
    load();

    const supabase = createClient();
    const channel = supabase
      .channel("events-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addEvent = async (event) => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (res.ok) {
      const data = await res.json();
      setEvents((prev) => [data, ...prev]);
      return data;
    }
    return null;
  };

  const updateEvent = async (id, updates) => {
    const res = await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
      return data;
    }
    return null;
  };

  const deleteEvent = async (id) => {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      return true;
    }
    return false;
  };

  const getEventById = (id) => {
    return events.find((e) => e.id === parseInt(id)) || null;
  };

  const getEventBySlug = (slug) => {
    return events.find((e) => e.slug === slug) || null;
  };

  const value = useMemo(() => ({ events, loaded, addEvent, updateEvent, deleteEvent, getEventById, getEventBySlug, setEvents, fetchEvents }), [events, loaded, addEvent, updateEvent, deleteEvent, getEventById, getEventBySlug, setEvents, fetchEvents]);
  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used within an EventProvider");
  return ctx;
}

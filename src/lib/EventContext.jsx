"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { dummyEvents } from "./dummy-data";

const STORAGE_KEY = "buku-tamu-events";

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch {
        setEvents([...dummyEvents]);
      }
    } else {
      setEvents([...dummyEvents]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
  }, [events, loaded]);

  const addEvent = (event) => {
    setEvents((prev) => [event, ...prev]);
  };

  const updateEvent = (id, updates) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const getEventById = (id) => {
    return events.find((e) => e.id === parseInt(id)) || null;
  };

  const getEventBySlug = (slug) => {
    return events.find((e) => e.slug === slug) || null;
  };

  return (
    <EventContext.Provider value={{ events, loaded, addEvent, updateEvent, deleteEvent, getEventById, getEventBySlug, setEvents }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used within an EventProvider");
  return ctx;
}

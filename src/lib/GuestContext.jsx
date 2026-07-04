"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { dummyGuests, dummyEvents } from "./dummy-data";

const STORAGE_KEY = "buku-tamu-guests";

const GuestContext = createContext(null);

export function GuestProvider({ children }) {
  const [guests, setGuests] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setGuests(JSON.parse(stored));
      } catch {
        setGuests([...dummyGuests]);
      }
    } else {
      setGuests([...dummyGuests]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    }
  }, [guests, loaded]);

  const addGuest = (guest) => {
    setGuests((prev) => [guest, ...prev]);
  };

  const updateGuest = (id, updates) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGuest = (id) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const getGuestByToken = (token) => {
    return guests.find((g) => g.qr_token === token) || null;
  };

  const getGuestsByEvent = (eventId) => {
    if (!eventId) return guests;
    return guests.filter((g) => g.acara_id === parseInt(eventId));
  };

  return (
    <GuestContext.Provider value={{ guests, loaded, addGuest, updateGuest, deleteGuest, getGuestByToken, getGuestsByEvent, setGuests }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuests() {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error("useGuests must be used within a GuestProvider");
  return ctx;
}

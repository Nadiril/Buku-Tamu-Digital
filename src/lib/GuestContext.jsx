"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const GuestContext = createContext(null);

export function GuestProvider({ children }) {
  const [guests, setGuests] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch("/api/guests");
      if (res.ok) {
        const data = await res.json();
        setGuests(data);
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    fetchGuests();
    const interval = setInterval(fetchGuests, 30000);
    const onFocus = () => fetchGuests();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchGuests]);

  const addGuest = async (guest) => {
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guest),
    });
    if (res.ok) {
      const data = await res.json();
      setGuests((prev) => [data, ...prev]);
      return data;
    }
    return null;
  };

  const updateGuest = async (id, updates) => {
    const res = await fetch(`/api/guests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
      return data;
    }
    return null;
  };

  const deleteGuest = async (id) => {
    const res = await fetch(`/api/guests/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGuests((prev) => prev.filter((g) => g.id !== id));
      return true;
    }
    return false;
  };

  const getGuestByToken = (token) => {
    return guests.find((g) => g.qr_token === token) || null;
  };

  const getGuestsByEvent = (eventId) => {
    if (!eventId) return guests;
    return guests.filter((g) => g.acara_id === parseInt(eventId));
  };

  return (
    <GuestContext.Provider value={{ guests, loaded, addGuest, updateGuest, deleteGuest, getGuestByToken, getGuestsByEvent, setGuests, fetchGuests }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuests() {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error("useGuests must be used within a GuestProvider");
  return ctx;
}

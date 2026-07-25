"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

const ActivityContext = createContext(null);

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch("/api/activities");
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
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
        const res = await fetch("/api/activities");
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
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
      .channel("activities-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activities" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const logActivity = async (action, detail, meta = {}) => {
    try {
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, detail, ...meta }),
      });
    } catch {
      // ignore
    }
    const activity = {
      id: Date.now(),
      action,
      detail,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    setActivities((prev) => [activity, ...prev].slice(0, 100));
  };

  const clearActivities = () => {
    setActivities([]);
  };

  const value = useMemo(() => ({ activities, logActivity, clearActivities, fetchActivities }), [activities, logActivity, clearActivities, fetchActivities]);
  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used within an ActivityProvider");
  return ctx;
}

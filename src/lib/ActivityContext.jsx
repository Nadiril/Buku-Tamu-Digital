"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    fetchActivities();
  }, [fetchActivities]);

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
    // Optimistic update
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

  return (
    <ActivityContext.Provider value={{ activities, logActivity, clearActivities }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used within an ActivityProvider");
  return ctx;
}

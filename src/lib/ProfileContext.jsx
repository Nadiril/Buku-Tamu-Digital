"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setProfile(null);
        setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (data) {
        setProfile({ ...data, email: session.user.email });
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadProfile();

    const supabase = createClient();
    const channel = supabase
      .channel("profiles-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => loadProfile()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadProfile]);

  const updateProfile = async (updates) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const value = useMemo(
    () => ({ profile, loaded, updateProfile }),
    [profile, loaded, updateProfile]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}

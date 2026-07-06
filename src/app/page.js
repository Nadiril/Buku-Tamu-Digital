"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.role === "admin") router.push("/admin/dashboard");
            else if (profile?.role === "staff") router.push("/staff/dashboard");
            else router.push("/scanner/events");
          });
      } else {
        setCheckingSession(false);
      }
    });
  }, [router, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError || !data.user) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") {
      router.push("/admin/dashboard");
    } else if (profile?.role === "staff") {
      router.push("/staff/dashboard");
    } else {
      router.push("/scanner/events");
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-info/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-lg shadow-accent/20 mb-5 overflow-hidden">
            <Image src="/Logo.webp" alt="Logo STIKOM PGRI Banyuwangi" width={80} height={80} className="object-contain w-full h-full" priority unoptimized />
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-snug">
            Buku Tamu <span className="text-black">Digital</span>
          </h1>
          <p className="text-sm font-semibold text-muted mt-1">STIKOM PGRI Banyuwangi</p>
          <p className="text-xs text-muted/60 mt-1.5">Masuk untuk mengelola acara atau registrasi tamu</p>
        </div>

        <div className="glass-card rounded-2xl p-8 glow-accent">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input id="email" label="Email" type="email" placeholder="Masukkan email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required icon={<Mail className="w-4 h-4" />} />

            <div className="relative">
              <Input id="password" label="Password" type={showPassword ? "text" : "password"} placeholder="Masukkan password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required icon={<Lock className="w-4 h-4" />} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-[38px] text-muted hover:text-foreground transition-colors cursor-pointer" tabIndex={-1}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="bg-danger-muted border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted/40 mt-6">v1.0.0 — Buku Tamu Digital Multi Event</p>
      </div>
    </div>
  );
}

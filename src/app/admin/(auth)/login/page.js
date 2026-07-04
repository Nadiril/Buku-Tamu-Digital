"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useActivity } from "@/lib/ActivityContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { logActivity } = useActivity();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (form.username === "admin" && form.password === "admin") {
        logActivity("login", `Login sebagai admin`);
        router.push("/admin/dashboard");
      } else {
        setError("Username atau password salah. Coba: admin / admin");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-info/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/4 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Logo & Heading */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-lg shadow-accent/20 mb-5 overflow-hidden">
            <Image
              src="/Logo.webp"
              alt="Logo STIKOM PGRI Banyuwangi"
              width={80}
              height={80}
              className="object-contain w-full h-full"
              priority
              unoptimized
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-snug">
            Buku Tamu <span className="text-black">Digital</span>
          </h1>
          <p className="text-sm font-semibold text-muted mt-1">
            STIKOM PGRI Banyuwangi
          </p>
          <p className="text-xs text-muted/60 mt-1.5">
            Masuk ke panel admin untuk mengelola acara
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 glow-accent">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="username"
              label="Username"
              placeholder="Masukkan username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {error && (
              <div className="bg-danger-muted border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger">
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

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-center text-xs text-muted">
              Demo: username{" "}
              <code className="text-accent font-mono bg-accent-muted px-1.5 py-0.5 rounded">admin</code>
              {" "}/ password{" "}
              <code className="text-accent font-mono bg-accent-muted px-1.5 py-0.5 rounded">admin</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

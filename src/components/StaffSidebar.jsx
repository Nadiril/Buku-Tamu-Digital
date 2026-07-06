"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    label: "Dashboard",
    href: "/staff/dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
  {
    label: "Data Tamu",
    href: "/staff/guests",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a4 4 0 00-5.364-3.636M17 20H7m10 0v-2c0-.656-.126-1.283-.364-1.858M7 20H2v-2a4 4 0 015.364-3.636M7 20v-2c0-.656.126-1.283.364-1.858m0 0A5.971 5.971 0 0112 15c1.773 0 3.376.766 4.636 1.978M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

export default function StaffSidebar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync drawer state to route change
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarContent = (
    <aside className="flex flex-col h-full w-64 bg-sidebar border-r border-border">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <Link href="/staff/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-lg shadow-accent/20 shrink-0">
            <Image
              src="/Logo.webp"
              alt="Logo STIKOM PGRI Banyuwangi"
              width={40}
              height={40}
              className="object-contain w-full h-full"
              priority
              unoptimized
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">
              STIKOM PGRI
            </h1>
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase">
              Banyuwangi
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-semibold text-muted uppercase tracking-widest">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-muted hover:text-foreground hover:bg-card"
                }
              `}
            >
              <span
                className={`${
                  isActive
                    ? "text-accent"
                    : "text-muted group-hover:text-foreground"
                } transition-colors`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-info-muted text-info flex items-center justify-center text-xs font-bold">
            ST
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Staff
            </p>
            <p className="text-[10px] text-muted truncate">
              Mode Lihat Saja
            </p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="text-muted hover:text-danger transition-colors cursor-pointer"
            title="Logout"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: sidebar fixed di kiri */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-40">
        {sidebarContent}
      </div>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted hover:text-foreground transition-colors"
        aria-label="Buka menu"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile: overlay + drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

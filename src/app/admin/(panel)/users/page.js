"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Input from "@/components/Input";
import Button from "@/components/Button";

const roleMap = {
  admin: {
    badge: "bg-danger-muted text-danger border border-danger/20",
    label: "Admin",
  },
  scanner: {
    badge: "bg-warning-muted text-warning border border-warning/20",
    label: "Scanner",
  },
  staff: {
    badge: "bg-info-muted text-info border border-info/20",
    label: "Staff",
  },
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    display_name: "",
    role: "staff",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch users on mount
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal membuat pengguna");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setForm({ email: "", password: "", display_name: "", role: "staff" });
      fetchUsers();
    } catch {
      setFormError("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.display_name || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Navbar
        title="Kelola Pengguna"
        subtitle="Manajemen pengguna dan role akses"
        actions={
          <Button
            onClick={() => setShowModal(true)}
            icon={
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            Tambah Pengguna
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Cari nama, email, atau role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          </div>
          <p className="text-sm text-muted whitespace-nowrap">
            Menampilkan{" "}
            <span className="text-foreground font-medium">{filtered.length}</span>{" "}
            dari {users.length} pengguna
          </p>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                    Pengguna
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                    Email
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                    Role
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">
                    Dibuat
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16">
                      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-16 text-muted text-sm"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <svg
                          className="w-14 h-14 text-muted/30"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.2}
                            d="M17 20h5v-2a4 4 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.858M7 20H2v-2a4 4 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="text-foreground/60 font-medium">
                          Belum ada data pengguna.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/50 table-row-hover"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent-muted text-accent flex items-center justify-center text-xs font-bold shrink-0">
                            {(user.display_name || user.username || "U")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {user.display_name || user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted">
                        {user.username}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block whitespace-nowrap ${
                            (roleMap[user.role] || roleMap.staff).badge
                          }`}
                        >
                          {(roleMap[user.role] || roleMap.staff).label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowModal(false);
              setFormError("");
            }}
          />
          <div className="relative glass-card rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 glow-accent">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">
                Tambah Pengguna
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormError("");
                }}
                className="text-muted hover:text-foreground transition-colors p-1 cursor-pointer"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                icon={
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
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />

              <Input
                id="display_name"
                label="Nama Tampilan"
                type="text"
                placeholder="Masukkan nama tampilan (opsional)"
                value={form.display_name}
                onChange={(e) =>
                  setForm({ ...form, display_name: e.target.value })
                }
                icon={
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80">
                  Role <span className="text-danger ml-1">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-xl bg-input border border-input-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-input-focus transition-all duration-200"
                >
                  <option value="staff">Staff (Lihat Saja)</option>
                  <option value="scanner">Scanner (Lihat + Update Status)</option>
                  <option value="admin">Admin (Akses Penuh)</option>
                </select>
                <p className="text-xs text-muted mt-1">
                  {form.role === "staff" &&
                    "Staff hanya dapat melihat data tamu dan acara, tidak bisa mengubah apapun."}
                  {form.role === "scanner" &&
                    "Scanner dapat melihat data dan memperbarui status kehadiran tamu."}
                  {form.role === "admin" &&
                    "Admin memiliki akses penuh ke seluruh fitur."}
                </p>
              </div>

              {formError && (
                <div className="bg-danger-muted border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger flex items-center gap-2">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowModal(false);
                    setFormError("");
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

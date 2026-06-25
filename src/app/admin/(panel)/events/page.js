"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Toast from "@/components/Toast";
import { dummyEvents } from "@/lib/dummy-data";

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ nama_acara: "", lokasi: "", tanggal_mulai: "", tanggal_selesai: "" });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  const filtered = dummyEvents.filter(
    (e) => e.nama_acara.toLowerCase().includes(search.toLowerCase()) || e.lokasi.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateEvent = (e) => {
    e.preventDefault();
    setShowModal(false);
    setNewEvent({ nama_acara: "", lokasi: "", tanggal_mulai: "", tanggal_selesai: "" });
    showToast("Acara berhasil dibuat!");
  };

  return (
    <>
      <Navbar title="Kelola Acara" subtitle="Buat, edit, dan kelola semua acara" actions={
        <Button onClick={() => setShowModal(true)} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>Buat Acara</Button>
      } />

      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="w-full sm:w-80">
            <Input placeholder="Cari acara..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
          </div>
          <span className="text-sm text-muted"><span className="text-foreground font-medium">{filtered.length}</span> acara ditemukan</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map((event) => (<EventCard key={event.id} event={event} />))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-muted/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-muted text-sm">Tidak ada acara ditemukan</p>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative glass-card rounded-2xl p-8 w-full max-w-lg mx-4 glow-accent animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Buat Acara Baru</h2>
                <p className="text-sm text-muted mt-0.5">Isi detail acara di bawah ini</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-foreground transition-colors p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <Input id="event-name" label="Nama Acara" placeholder="Contoh: Seminar AI 2026" value={newEvent.nama_acara} onChange={(e) => setNewEvent({ ...newEvent, nama_acara: e.target.value })} required />
              <Input id="event-location" label="Lokasi" placeholder="Contoh: Aula Kampus Utama" value={newEvent.lokasi} onChange={(e) => setNewEvent({ ...newEvent, lokasi: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <Input id="event-start" label="Tanggal Mulai" type="date" value={newEvent.tanggal_mulai} onChange={(e) => setNewEvent({ ...newEvent, tanggal_mulai: e.target.value })} required />
                <Input id="event-end" label="Tanggal Selesai" type="date" value={newEvent.tanggal_selesai} onChange={(e) => setNewEvent({ ...newEvent, tanggal_selesai: e.target.value })} required />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Batal</Button>
                <Button type="submit" className="flex-1">Simpan Acara</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60]">
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </>
  );
}

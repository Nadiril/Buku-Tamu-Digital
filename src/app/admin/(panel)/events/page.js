"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Toast from "@/components/Toast";
import { useEvents } from "@/lib/EventContext";
import { useActivity } from "@/lib/ActivityContext";

export default function EventsPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { logActivity } = useActivity();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [newEvent, setNewEvent] = useState({ nama_acara: "", lokasi: "", tanggal_mulai: "", tanggal_selesai: "", jam_mulai: "" });
  const [toast, setToast] = useState(null);
  const [statusChangeEvent, setStatusChangeEvent] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  const filtered = events.filter(
    (e) => e.nama_acara.toLowerCase().includes(search.toLowerCase()) || e.lokasi.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setNewEvent({ nama_acara: "", lokasi: "", tanggal_mulai: "", tanggal_selesai: "", jam_mulai: "" });
    setEditingEvent(null);
    setShowModal(false);
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const slug = newEvent.nama_acara.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const event = {
      id: Date.now(),
      nama_acara: newEvent.nama_acara,
      slug,
      lokasi: newEvent.lokasi,
      tanggal_mulai: newEvent.tanggal_mulai,
      tanggal_selesai: newEvent.tanggal_selesai,
      jam_mulai: newEvent.jam_mulai,
      status: "akan_datang",
      total_tamu: 0,
      created_at: new Date().toISOString().split("T")[0],
    };
    addEvent(event);
    logActivity("create_event", `Membuat acara "${event.nama_acara}"`);
    resetForm();
    showToast("Acara berhasil dibuat!");
  };

  const handleEdit = (event) => {
    setNewEvent({
      nama_acara: event.nama_acara,
      lokasi: event.lokasi,
      tanggal_mulai: event.tanggal_mulai,
      tanggal_selesai: event.tanggal_selesai,
      jam_mulai: event.jam_mulai,
    });
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleUpdateEvent = (e) => {
    e.preventDefault();
    updateEvent(editingEvent.id, {
      nama_acara: newEvent.nama_acara,
      lokasi: newEvent.lokasi,
      tanggal_mulai: newEvent.tanggal_mulai,
      tanggal_selesai: newEvent.tanggal_selesai,
      jam_mulai: newEvent.jam_mulai,
    });
    logActivity("update_event", `Mengedit acara "${newEvent.nama_acara}"`);
    resetForm();
    showToast("Acara berhasil diperbarui!");
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    const deleted = events.find((e) => e.id === confirmDeleteId);
    deleteEvent(confirmDeleteId);
    if (deleted) logActivity("delete_event", `Menghapus acara "${deleted.nama_acara}"`);
    setConfirmDeleteId(null);
    showToast("Acara berhasil dihapus!");
  };

  const handleStatusChange = (event, newStatus) => {
    const statusLabels = {
      akan_datang: "Akan Datang",
      registrasi_dibuka: "Registrasi Dibuka",
      registrasi_ditutup: "Registrasi Ditutup",
    };
    updateEvent(event.id, { status: newStatus });
    logActivity("update_status", `Mengubah status "${event.nama_acara}" menjadi "${statusLabels[newStatus]}"`);
    showToast("Status acara berhasil diperbarui!");
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
          {filtered.map((event) => (<EventCard key={event.id} event={event} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-muted/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-muted text-sm">Tidak ada acara ditemukan</p>
          </div>
        )}
      </div>

      {/* Create / Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm}></div>
          <div className="relative glass-card rounded-2xl p-8 w-full max-w-lg mx-4 glow-accent">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">{editingEvent ? "Edit Acara" : "Buat Acara Baru"}</h2>
                <p className="text-sm text-muted mt-0.5">{editingEvent ? "Perbarui detail acara di bawah ini" : "Isi detail acara di bawah ini"}</p>
              </div>
              <button onClick={resetForm} className="text-muted hover:text-foreground transition-colors p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
              <Input id="event-name" label="Nama Acara" placeholder="Contoh: Seminar AI 2026" value={newEvent.nama_acara} onChange={(e) => setNewEvent({ ...newEvent, nama_acara: e.target.value })} required />
              <Input id="event-location" label="Lokasi" placeholder="Contoh: Aula Kampus Utama" value={newEvent.lokasi} onChange={(e) => setNewEvent({ ...newEvent, lokasi: e.target.value })} required />
              <div className="grid grid-cols-3 gap-4">
                <Input id="event-start" label="Tanggal Mulai" type="date" value={newEvent.tanggal_mulai} onChange={(e) => setNewEvent({ ...newEvent, tanggal_mulai: e.target.value })} required />
                <Input id="event-end" label="Tanggal Selesai" type="date" value={newEvent.tanggal_selesai} onChange={(e) => setNewEvent({ ...newEvent, tanggal_selesai: e.target.value })} required />
                <Input id="event-time" label="Jam Mulai" type="time" value={newEvent.jam_mulai} onChange={(e) => setNewEvent({ ...newEvent, jam_mulai: e.target.value })} required />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={resetForm}>Batal</Button>
                <Button type="submit" className="flex-1">{editingEvent ? "Simpan Perubahan" : "Simpan Acara"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}></div>
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-sm mx-4 glow-danger text-center">
            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Hapus Acara?</h3>
            <p className="text-sm text-muted mb-6">Acara yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setConfirmDeleteId(null)}>Batal</Button>
              <Button type="button" variant="danger" className="flex-1" onClick={confirmDelete}>Hapus</Button>
            </div>
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

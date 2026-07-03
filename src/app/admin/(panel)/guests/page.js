"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import GuestTable from "@/components/GuestTable";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Toast from "@/components/Toast";
import { dummyEvents, dummyGuests } from "@/lib/dummy-data";

export default function GuestsPage() {
  const [guests, setGuests] = useState(dummyGuests);
  const [eventFilter, setEventFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [newGuest, setNewGuest] = useState({
    nama: "",
    instansi: "",
    tujuan: "",
    no_hp: "",
    status: "reguler",
  });

  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importStep, setImportStep] = useState("upload"); // upload | preview

  const filteredGuests = eventFilter
    ? guests.filter((g) => g.acara_id === parseInt(eventFilter))
    : guests;

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  const handleAddGuest = (e) => {
    e.preventDefault();
    const guest = {
      id: Date.now(),
      nama: newGuest.nama,
      instansi: newGuest.instansi,
      tujuan: newGuest.tujuan,
      no_hp: newGuest.no_hp,
      status: newGuest.status,
      waktu_kedatangan: new Date().toISOString(),
      acara_id: 0,
    };
    setGuests([guest, ...guests]);
    setShowModal(false);
    setNewGuest({ nama: "", instansi: "", tujuan: "", no_hp: "", status: "reguler" });
    showToast("Tamu berhasil ditambahkan!");
  };

  const parseCSV = (text) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });
      if (row.nama) results.push(row);
    }
    return results;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      showToast("Hanya file CSV yang didukung", "error");
      return;
    }
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const rows = parseCSV(text);
      if (rows.length === 0) {
        showToast("File CSV kosong atau format tidak valid", "error");
        return;
      }
      setImportPreview(rows);
      setImportStep("preview");
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      const newGuests = importPreview.map((row, idx) => ({
        id: Date.now() + idx,
        nama: row.nama || "",
        instansi: row.instansi || "",
        tujuan: row.tujuan || "",
        no_hp: row.no_hp || "",
        status: (row.status || "reguler").toLowerCase(),
        waktu_kedatangan: row.waktu_kedatangan || new Date().toISOString(),
        acara_id: parseInt(row.acara_id) || 0,
      }));
      setGuests([...newGuests, ...guests]);
      setImporting(false);
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      setImportStep("upload");
      showToast(`${newGuests.length} tamu berhasil diimpor!`);
    }, 1000);
  };

  const resetImport = () => {
    setImportFile(null);
    setImportPreview([]);
    setImportStep("upload");
    setShowImportModal(false);
  };

  return (
    <>
      <Navbar
        title="Data Tamu"
        subtitle="Kelola semua data tamu"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowImportModal(true)} variant="secondary" icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            }>
              Import Data
            </Button>
            <Button onClick={() => setShowModal(true)} icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }>
              Tambah Tamu
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Event Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full rounded-xl bg-input border border-input-border pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-input-focus transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">Semua Acara</option>
              {dummyEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.nama_acara}
                </option>
              ))}
            </select>
          </div>
          {eventFilter && (
            <button
              onClick={() => setEventFilter("")}
              className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Hapus filter
            </button>
          )}
        </div>
        <GuestTable guests={filteredGuests} events={dummyEvents} showEvent />
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetImport}></div>
          <div className="relative glass-card rounded-2xl p-6 sm:p-8 w-full max-w-2xl mx-4 glow-accent animate-fade-in max-h-[90vh] overflow-y-auto">
            {importStep === "upload" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Import Data Tamu</h2>
                    <p className="text-sm text-muted mt-0.5">Unggah file CSV untuk mengimpor banyak tamu sekaligus</p>
                  </div>
                  <button onClick={resetImport} className="text-muted hover:text-foreground transition-colors p-1 cursor-pointer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Format Info */}
                <div className="p-4 rounded-xl bg-info/5 border border-info/20 mb-6">
                  <h3 className="text-sm font-semibold text-info mb-2">Format File CSV</h3>
                  <p className="text-xs text-muted mb-3">Kolom yang tersedia (header wajib menggunakan nama di bawah):</p>
                  <div className="bg-background/50 rounded-lg p-3 font-mono text-[11px] sm:text-xs text-muted overflow-x-auto">
                    <p className="text-foreground/80 font-semibold mb-1">Baris 1 (header):</p>
                    <p className="whitespace-pre">nama,instansi,tujuan,no_hp,status,acara_id</p>
                    <p className="text-foreground/80 font-semibold mt-3 mb-1">Baris 2+ (data):</p>
                    <p className="whitespace-pre">Ahmad Fauzi,Universitas Airlangga,Seminar,081234567890,reguler,1</p>
                    <p className="whitespace-pre">Siti Aminah,UGM,Workshop,,vip,1</p>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-[11px] text-muted">• <span className="text-foreground/80">status:</span> reguler, vip, atau vvip (default: reguler)</p>
                    <p className="text-[11px] text-muted">• <span className="text-foreground/80">acara_id:</span> ID acara tujuan (lihat menu Kelola Acara)</p>
                    <p className="text-[11px] text-muted">• Kolom yang tidak diisi bisa dikosongkan</p>
                  </div>
                </div>

                {/* File Upload */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 sm:p-12 text-center hover:border-accent/50 transition-colors cursor-pointer" onClick={() => document.getElementById("csv-file-input").click()}>
                  <svg className="w-12 h-12 text-muted/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-semibold text-foreground mb-1">Klik untuk unggah file CSV</p>
                  <p className="text-xs text-muted">atau seret file ke sini</p>
                  <input id="csv-file-input" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                </div>

                <div className="flex gap-3 pt-6">
                  <Button type="button" variant="secondary" className="flex-1" onClick={resetImport}>Batal</Button>
                  <Button type="button" className="flex-1" disabled>Pilih File</Button>
                </div>
              </>
            )}

            {importStep === "preview" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Preview Data</h2>
                    <p className="text-sm text-muted mt-0.5">{importPreview.length} data akan diimpor dari <span className="font-medium text-foreground">{importFile?.name}</span></p>
                  </div>
                  <button onClick={resetImport} className="text-muted hover:text-foreground transition-colors p-1 cursor-pointer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Preview Table */}
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/10 border-b border-border">
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">#</th>
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Nama</th>
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Instansi</th>
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Tujuan</th>
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">No. HP</th>
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Status</th>
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Acara</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((row, idx) => (
                        <tr key={idx} className="border-b border-border/50 last:border-0">
                          <td className="px-4 py-3 text-xs text-muted">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{row.nama}</td>
                          <td className="px-4 py-3 text-sm text-muted">{row.instansi || "—"}</td>
                          <td className="px-4 py-3 text-sm text-muted">{row.tujuan || "—"}</td>
                          <td className="px-4 py-3 text-sm text-muted font-mono">{row.no_hp || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              (row.status || "reguler") === "vip" ? "bg-warning-muted text-warning border border-warning/20" :
                              (row.status || "reguler") === "vvip" ? "bg-danger-muted text-danger border border-danger/20" :
                              "bg-info-muted text-info border border-info/20"
                            }`}>
                              {(row.status || "reguler").charAt(0).toUpperCase() + (row.status || "reguler").slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted">{row.acara_id || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-3 pt-6">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setImportStep("upload")}>Kembali</Button>
                  <Button type="button" className="flex-1" onClick={handleImport} disabled={importing}>
                    {importing ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Mengimpor...
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import {importPreview.length} Data
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative glass-card rounded-2xl p-8 w-full max-w-lg mx-4 glow-accent animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Tambah Tamu Baru</h2>
                <p className="text-sm text-muted mt-0.5">Isi data tamu di bawah ini</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-foreground transition-colors p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <Input
                id="guest-name"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                value={newGuest.nama}
                onChange={(e) => setNewGuest({ ...newGuest, nama: e.target.value })}
                required
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              <Input
                id="guest-instansi"
                label="Instansi / Lembaga"
                placeholder="Contoh: Universitas Airlangga"
                value={newGuest.instansi}
                onChange={(e) => setNewGuest({ ...newGuest, instansi: e.target.value })}
                required
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
              <Input
                id="guest-tujuan"
                label="Tujuan Kunjungan"
                placeholder="Contoh: Menghadiri Seminar"
                value={newGuest.tujuan}
                onChange={(e) => setNewGuest({ ...newGuest, tujuan: e.target.value })}
                required
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              />
              <Input
                id="guest-phone"
                label="Nomor HP"
                type="tel"
                placeholder="Opsional"
                value={newGuest.no_hp}
                onChange={(e) => setNewGuest({ ...newGuest, no_hp: e.target.value })}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80">
                  Status Tamu <span className="text-danger ml-1">*</span>
                </label>
                <select
                  value={newGuest.status}
                  onChange={(e) => setNewGuest({ ...newGuest, status: e.target.value })}
                  className="w-full rounded-xl bg-input border border-input-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-input-focus transition-all duration-200"
                  required
                >
                  <option value="reguler">Reguler</option>
                  <option value="vip">VIP</option>
                  <option value="vvip">VVIP</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Batal</Button>
                <Button type="submit" className="flex-1">Simpan Tamu</Button>
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

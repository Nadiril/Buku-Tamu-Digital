import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import GuestTable from "@/components/GuestTable";
import { dummyEvents, dummyGuests } from "@/lib/dummy-data";

export async function generateStaticParams() {
  return dummyEvents.map((event) => ({ id: String(event.id) }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const event = dummyEvents.find((e) => e.id === parseInt(id));
  if (!event) return { title: "Acara Tidak Ditemukan" };
  return { title: `${event.nama_acara} — Buku Tamu Digital` };
}

const statusMap = {
  active: { badge: "bg-success-muted text-success border border-success/20", dot: "bg-success pulse-dot", label: "Aktif" },
  upcoming: { badge: "bg-info-muted text-info border border-info/20", dot: "bg-info", label: "Akan Datang" },
  completed: { badge: "bg-muted/20 text-muted border border-muted/20", dot: "bg-muted", label: "Selesai" },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const event = dummyEvents.find((e) => e.id === parseInt(id));
  if (!event) notFound();

  const guests = dummyGuests.filter((g) => g.acara_id === event.id);
  const s = statusMap[event.status] || statusMap.upcoming;

  return (
    <>
      <Navbar title={event.nama_acara} subtitle="Detail dan data tamu acara" />

      <div className="flex-1 p-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/admin/events" className="text-muted hover:text-accent transition-colors">Acara</Link>
          <svg className="w-3.5 h-3.5 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-foreground font-medium">{event.nama_acara}</span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Main Info */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{event.nama_acara}</h2>
                <p className="text-sm text-muted mt-1">Dibuat pada {new Date(event.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <span className={`${s.badge} text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>{s.label}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoBox label="Lokasi" value={event.lokasi} color="text-accent" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />} />
              <InfoBox label="Tanggal" value={fmtDate(event.tanggal_mulai)} color="text-accent" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />} />
              <InfoBox label="Total Tamu" value={`${guests.length} tamu terdaftar`} color="text-success" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />} />
              <InfoBox label="Link Form" value={`/event/${event.slug}`} color="text-info" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />} mono />
            </div>
          </div>
        </div>

        {/* Guest List */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-4">Daftar Tamu</h3>
          <GuestTable guests={guests} />
        </div>
      </div>
    </>
  );
}

function InfoBox({ label, value, color, icon, mono }) {  return (
    <div className="bg-background/50 rounded-xl p-4 border border-border/50">
      <p className="text-xs text-muted uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <svg className={`w-4 h-4 ${color} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
        <p className={`text-sm text-foreground font-medium ${mono ? "font-mono text-accent" : ""}`}>{value}</p>
      </div>
    </div>
  );
}


import Link from "next/link";

export default function EventCard({ event }) {
  const statusStyles = {
    active: {
      badge: "bg-success-muted text-success border border-success/20",
      dot: "bg-success pulse-dot",
      label: "Aktif",
    },
    upcoming: {
      badge: "bg-info-muted text-info border border-info/20",
      dot: "bg-info",
      label: "Akan Datang",
    },
    completed: {
      badge: "bg-muted/20 text-muted border border-muted/20",
      dot: "bg-muted",
      label: "Selesai",
    },
  };

  const s = statusStyles[event.status] || statusStyles.upcoming;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Link href={`/admin/events/${event.id}`}>
      <div className="glass-card rounded-2xl p-5 hover:border-border-hover hover:bg-card-hover transition-all duration-300 cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate group-hover:text-accent transition-colors duration-200">
              {event.nama_acara}
            </h3>
          </div>
          <span
            className={`${s.badge} text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ml-3 whitespace-nowrap`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
            {s.label}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-muted">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{event.lokasi}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(event.tanggal_mulai)}{event.jam_mulai ? `, ${event.jam_mulai}` : ""}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium text-foreground/80">
              {event.total_tamu}
            </span>
            <span>Tamu</span>
          </div>
        </div>

        {/* Footer arrow */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-end">
          <span className="text-xs text-muted group-hover:text-accent transition-colors duration-200 flex items-center gap-1">
            Lihat Detail
            <svg
              className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

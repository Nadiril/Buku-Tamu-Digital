"use client";

import { useActivitiesQuery } from "@/lib/queries/useActivitiesQuery";
import {
  LogIn,
  CalendarPlus,
  CalendarSync,
  CalendarX,
  UserPlus,
  UserPen,
  UserX,
  ScanLine,
  Download,
  Upload,
  Trash2,
} from "lucide-react";

const actionConfig = {
  login: { icon: LogIn, color: "text-info", bg: "bg-info/10" },
  create_event: { icon: CalendarPlus, color: "text-accent", bg: "bg-accent/10" },
  update_event: { icon: CalendarSync, color: "text-warning", bg: "bg-warning/10" },
  delete_event: { icon: CalendarX, color: "text-danger", bg: "bg-danger/10" },
  create_guest: { icon: UserPlus, color: "text-success", bg: "bg-success/10" },
  update_guest: { icon: UserPen, color: "text-warning", bg: "bg-warning/10" },
  delete_guest: { icon: UserX, color: "text-danger", bg: "bg-danger/10" },
  scan_guest: { icon: ScanLine, color: "text-accent", bg: "bg-accent/10" },
  guest_scanned: { icon: ScanLine, color: "text-success", bg: "bg-success/10" },
  guest_self_scanned: { icon: ScanLine, color: "text-success", bg: "bg-success/10" },
  scan_rejected_event_ended: { icon: ScanLine, color: "text-danger", bg: "bg-danger/10" },
  export_laporan: { icon: Download, color: "text-info", bg: "bg-info/10" },
  import_guest: { icon: Upload, color: "text-success", bg: "bg-success/10" },
  clear_activities: { icon: Trash2, color: "text-danger", bg: "bg-danger/10" },
};

export default function ActivityFeed({ limit = 10 }) {
  const { data: activities = [] } = useActivitiesQuery();

  const recent = activities.slice(0, limit);

  const fmtTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "baru saja";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  if (recent.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted/60">Belum ada aktivitas</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recent.map((a) => {
        const cfg = actionConfig[a.action] || { icon: LogIn, color: "text-muted", bg: "bg-muted/10" };
        const Icon = cfg.icon;
        return (
          <div key={a.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-input/30 border border-border/50 hover:bg-input/50 transition-colors min-h-[60px]">
            <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">{a.detail}</p>
              <p className="text-xs text-muted/60 mt-1">{fmtTime(a.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function computeAttendanceStatus(event, now = new Date()) {
  const eventStart = new Date(`${event.tanggal_mulai}T${event.jam_mulai}+07:00`);
  const endDate = event.tanggal_selesai || event.tanggal_mulai;
  const eventEnd = new Date(`${endDate}T${event.jam_selesai || "17:00"}+07:00`);
  const graceEnd = new Date(eventStart.getTime() + (event.grace_period_minutes || 30) * 60000);

  if (now <= graceEnd) return "hadir";
  if (now <= eventEnd) return "terlambat";
  return null;
}

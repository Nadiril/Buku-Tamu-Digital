import StaffSidebar from "@/components/StaffSidebar";

export const metadata = {
  title: "Staff — Buku Tamu Digital",
  description: "Panel staff Buku Tamu Digital (Mode Lihat Saja).",
};

export default function StaffLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <StaffSidebar />
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">{children}</main>
    </div>
  );
}

import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Admin — Buku Tamu Digital",
  description: "Panel admin Buku Tamu Digital.",
};

export default function PanelLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">{children}</main>
    </div>
  );
}

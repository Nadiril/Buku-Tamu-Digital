import PanitiaLayout from "@/components/panitia/PanitiaLayout";

export const metadata = {
  title: "Panel Panitia - Buku Tamu Digital",
  description: "Panel Panitia - Buku Tamu Digital Multi-Event",
};

export default function Layout({ children }) {
  return <PanitiaLayout>{children}</PanitiaLayout>;
}

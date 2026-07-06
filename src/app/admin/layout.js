import Providers from "@/app/providers";

export const metadata = {
  title: "Buku Tamu Digital",
  description: "Panel admin Buku Tamu Digital.",
};

export default function AdminLayout({ children }) {
  return <Providers>{children}</Providers>;
}

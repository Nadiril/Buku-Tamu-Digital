import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const supabaseUrl = "https://iksogaopebiyhnykalnb.supabase.co";

export const metadata = {
  title: "Buku Tamu Digital",
  description:
    "Platform buku tamu digital multi-event untuk pencatatan kehadiran tamu secara modern dan efisien.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="preconnect" href={supabaseUrl} />
        <link rel="dns-prefetch" href={supabaseUrl} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
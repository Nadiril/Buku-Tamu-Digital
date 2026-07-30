import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
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
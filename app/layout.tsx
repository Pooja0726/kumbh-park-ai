import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Parking System — AI-Powered Parking Management",
  description:
    "AI-powered smart parking management with ANPR entry, real-time occupancy monitoring, mis-park detection, and automated alerts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <LanguageProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster position="top-center" richColors />
        </LanguageProvider>
      </body>
    </html>
  );
}

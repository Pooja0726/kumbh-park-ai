"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, LayoutDashboard, MapPin, QrCode, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Car },
  { href: "/entry", label: "Entry", icon: ScanLine },
  { href: "/lots", label: "Lots", icon: MapPin },
  { href: "/my-pass", label: "My Pass", icon: QrCode },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-kumbh-200/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-kumbh-500 to-sacred-600 text-white shadow-md">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-kumbh-900">KumbhPark AI</p>
            <p className="text-[10px] text-kumbh-600">महाकुंभ मोबिलिटी</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-kumbh-100 text-kumbh-800"
                  : "text-gray-600 hover:bg-gray-50 hover:text-kumbh-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <nav className="flex justify-around border-t border-kumbh-100 px-2 py-1.5 md:hidden">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium",
              pathname === href ? "text-kumbh-700" : "text-gray-500"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

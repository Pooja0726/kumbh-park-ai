"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Globe, HelpCircle, LayoutDashboard, MapPin, QrCode, ScanLine, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, useT } from "@/lib/i18n";
import { HelpModal } from "@/components/HelpModal";
import { toast } from "sonner";

export function Navbar() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const t = useT();
  const [helpOpen, setHelpOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem("sps-admin-mode") === "true");

    const handleLogin = () => setIsAdmin(true);
    const handleLogout = () => setIsAdmin(false);

    window.addEventListener("sps-admin-login", handleLogin);
    window.addEventListener("sps-admin-logout", handleLogout);

    return () => {
      window.removeEventListener("sps-admin-login", handleLogin);
      window.removeEventListener("sps-admin-logout", handleLogout);
    };
  }, []);

  const links: { href: string; label: string; icon: any }[] = [
    { href: "/", label: t.navHome, icon: Car },
    { href: "/entry", label: t.navEntry, icon: ScanLine },
    { href: "/lots", label: t.navLots, icon: MapPin },
    { href: "/my-pass", label: t.navPass, icon: QrCode },
  ];

  if (isAdmin) {
    links.push({ href: "/dashboard", label: t.navDashboard, icon: LayoutDashboard });
  }

  function handleAdminToggle() {
    if (isAdmin) {
      sessionStorage.removeItem("sps-admin-mode");
      setIsAdmin(false);
      window.dispatchEvent(new Event("sps-admin-logout"));
      toast.success("Admin Mode Deactivated");
      if (pathname.startsWith("/dashboard")) {
        window.location.href = "/";
      }
    } else {
      const pin = prompt("Enter Admin PIN to access traffic controller center:");
      if (pin === "1234") {
        sessionStorage.setItem("sps-admin-mode", "true");
        setIsAdmin(true);
        window.dispatchEvent(new Event("sps-admin-login"));
        toast.success("Admin Mode Activated");
      } else if (pin !== null) {
        toast.error("Incorrect PIN. Access Denied.");
      }
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-kumbh-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-kumbh-500 to-sacred-600 text-white shadow-md">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-kumbh-900">{t.navBrand}</p>
              <p className="text-[10px] text-kumbh-600">{t.navBrandSub}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-0.5 md:flex">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
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

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
            >
              <Globe className="h-3.5 w-3.5" />
              {t.langToggle}
            </button>

            {/* Help Button */}
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-kumbh-50 hover:text-kumbh-700"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.navHelp}</span>
            </button>

            {/* Admin Toggle */}
            <button
              type="button"
              onClick={handleAdminToggle}
              className={cn(
                "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                isAdmin
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 animate-pulse"
                  : "border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              )}
              title={isAdmin ? "Exit Admin Mode" : "Enter Admin Mode (Traffic Authority)"}
            >
              {isAdmin ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isAdmin ? "Admin Active" : "Admin"}</span>
            </button>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="flex justify-around border-t border-kumbh-100 px-1 py-1.5 md:hidden">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 text-[9px] font-medium",
                pathname === href ? "text-kumbh-700" : "text-gray-500"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bus, MapPin, Users } from "lucide-react";
import type { ParkingZone } from "@/lib/types";
import { getZoneOccupancy } from "@/lib/parking-engine";
import { cn, occupancyBarColor, occupancyColor } from "@/lib/utils";
import { useLanguage, useT } from "@/lib/i18n";

export function ZoneCard({ zone }: { zone: ParkingZone }) {
  const { lang } = useLanguage();
  const t = useT();
  const occ = getZoneOccupancy(zone);
  const zoneName = lang === "hi" ? zone.nameHindi : zone.name;

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

  const cardContent = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{zoneName}</h3>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            occupancyColor(occ.percent)
          )}
        >
          {occ.percent}% {t.zoneFull}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn("h-full rounded-full transition-all", occupancyBarColor(occ.percent))}
          style={{ width: `${occ.percent}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {occ.free} {t.zoneFree}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {zone.walkMinutesToGhat} {t.zoneWalk}
        </span>
        <span className="flex items-center gap-1">
          <Bus className="h-3.5 w-3.5" />
          {t.zoneShuttle}
        </span>
      </div>
    </>
  );

  if (isAdmin) {
    return (
      <Link
        href={`/dashboard/zone/${zone.id}`}
        className="block rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-kumbh-200 cursor-pointer"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="block rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      {cardContent}
    </div>
  );
}

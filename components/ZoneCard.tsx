import Link from "next/link";
import { Bus, MapPin, Users } from "lucide-react";
import type { ParkingZone } from "@/lib/types";
import { getZoneOccupancy } from "@/lib/parking-engine";
import { cn, occupancyBarColor, occupancyColor } from "@/lib/utils";

export function ZoneCard({ zone }: { zone: ParkingZone }) {
  const occ = getZoneOccupancy(zone);

  return (
    <Link
      href={`/dashboard/zone/${zone.id}`}
      className="block rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{zone.name}</h3>
          <p className="text-sm text-kumbh-700">{zone.nameHindi}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            occupancyColor(occ.percent)
          )}
        >
          {occ.percent}% full
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
          {occ.free} free
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {zone.walkMinutesToGhat} min walk
        </span>
        <span className="flex items-center gap-1">
          <Bus className="h-3.5 w-3.5" />
          Shuttle
        </span>
      </div>
    </Link>
  );
}

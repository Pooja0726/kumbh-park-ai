"use client";

import type { ParkingSlot, ParkingZone } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ParkingGridProps {
  zone: ParkingZone;
  onSlotClick?: (slot: ParkingSlot) => void;
  selectedSlotId?: string;
  interactive?: boolean;
}

const statusStyles: Record<ParkingSlot["status"], string> = {
  free: "bg-emerald-100 border-emerald-300 text-emerald-800",
  occupied: "bg-blue-100 border-blue-300 text-blue-800",
  "mis-parked": "bg-amber-100 border-amber-400 text-amber-900 animate-pulse",
  blocked: "bg-red-100 border-red-400 text-red-900 animate-pulse",
};

const statusLabels: Record<ParkingSlot["status"], string> = {
  free: "Free",
  occupied: "Parked",
  "mis-parked": "Mis-parked",
  blocked: "Blocked",
};

export function ParkingGrid({
  zone,
  onSlotClick,
  selectedSlotId,
  interactive = false,
}: ParkingGridProps) {
  const grid: (ParkingSlot | null)[][] = Array.from({ length: zone.rows }, () =>
    Array(zone.cols).fill(null)
  );
  zone.slots.forEach((slot) => {
    grid[slot.row][slot.col] = slot;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-xs">
        {(["free", "occupied", "mis-parked", "blocked"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 rounded border", statusStyles[s])} />
            {statusLabels[s]}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border-2 border-red-500 bg-red-50" />
          Fire Lane
        </span>
      </div>

      <div
        className="inline-grid gap-1.5 rounded-xl bg-gray-50 p-3"
        style={{ gridTemplateColumns: `repeat(${zone.cols}, minmax(0, 1fr))` }}
      >
        {grid.flat().map((slot, i) => {
          if (!slot) return <div key={i} className="h-14 w-14" />;
          const isFireLane = slot.isFireLane;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={!interactive || slot.status === "free"}
              onClick={() => interactive && onSlotClick?.(slot)}
              title={
                slot.vehicleNumber
                  ? `${slot.vehicleNumber} — ${statusLabels[slot.status]}`
                  : isFireLane
                    ? "Emergency lane — keep clear"
                    : "Available"
              }
              className={cn(
                "flex h-14 w-14 flex-col items-center justify-center rounded-lg border-2 text-[9px] font-semibold transition-transform",
                isFireLane && "ring-2 ring-red-400 ring-offset-1",
                statusStyles[slot.status],
                selectedSlotId === slot.id && "ring-2 ring-kumbh-600 ring-offset-2 scale-105",
                interactive && slot.status !== "free" && "cursor-pointer hover:scale-105",
                !interactive && "cursor-default"
              )}
            >
              {isFireLane && <span className="text-[8px] text-red-600">🚨</span>}
              {slot.vehicleNumber ? (
                <span className="max-w-full truncate px-0.5">
                  {slot.vehicleNumber.slice(-6)}
                </span>
              ) : (
                <span>{isFireLane ? "FIRE" : "—"}</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        Aisle → columns 3–4 are drive lanes. Fire lanes marked with 🚨
      </p>
    </div>
  );
}

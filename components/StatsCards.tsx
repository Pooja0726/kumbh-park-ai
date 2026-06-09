"use client";

import { AlertTriangle, Car, ParkingCircle, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/lib/types";
import { cn, occupancyColor } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const t = useT();

  const cards = [
    {
      label: t.statOccupancy,
      value: `${stats.occupancyPercent}%`,
      sub: `${stats.occupiedSlots} / ${stats.totalSlots} ${t.statSlots}`,
      icon: TrendingUp,
      color: occupancyColor(stats.occupancyPercent),
    },
    {
      label: t.statFreeSlots,
      value: stats.freeSlots.toString(),
      sub: t.statFreeAvailable,
      icon: ParkingCircle,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: t.statMisparked,
      value: stats.misParkedSlots.toString(),
      sub: t.statMisparkedSub,
      icon: Car,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: t.statActiveAlerts,
      value: stats.activeViolations.toString(),
      sub: t.statAlertsSub,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{card.label}</p>
            <div className={cn("rounded-lg p-2", card.color)}>
              <card.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
          <p className="text-xs text-gray-500">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

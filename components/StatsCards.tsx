import { AlertTriangle, Car, ParkingCircle, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/lib/types";
import { cn, occupancyColor } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Occupancy",
      value: `${stats.occupancyPercent}%`,
      sub: `${stats.occupiedSlots} / ${stats.totalSlots} slots`,
      icon: TrendingUp,
      color: occupancyColor(stats.occupancyPercent),
    },
    {
      label: "Free Slots",
      value: stats.freeSlots.toString(),
      sub: "Available now",
      icon: ParkingCircle,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Mis-parked",
      value: stats.misParkedSlots.toString(),
      sub: "Needs attention",
      icon: Car,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Active Alerts",
      value: stats.activeViolations.toString(),
      sub: "Unresolved violations",
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

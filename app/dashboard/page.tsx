"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { StatsCards } from "@/components/StatsCards";
import { ViolationAlert, NotificationFeed } from "@/components/ViolationAlert";
import { ZoneCard } from "@/components/ZoneCard";
import type { DashboardStats, NotificationLog, ParkingZone, Violation } from "@/lib/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data.stats);
      setZones(data.zones ?? []);
      setViolations(data.violations ?? []);
      setNotifications(data.notifications ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleEscalate(id: string) {
    const res = await fetch("/api/violations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "escalate", violationId: id }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Alert escalated to ${data.violation.tier}`);
      fetchData();
    } else {
      toast.error(data.error);
    }
  }

  async function handleResolve(id: string) {
    const res = await fetch("/api/violations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve", violationId: id }),
    });
    if (res.ok) {
      toast.success("Violation resolved");
      fetchData();
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Command Dashboard</h1>
          <p className="text-kumbh-700">कमांड केंद्र · Real-time monitoring</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/dashboard/marshal"
            className="rounded-lg bg-kumbh-600 px-4 py-2 text-sm font-medium text-white hover:bg-kumbh-700"
          >
            Marshal View
          </Link>
        </div>
      </div>

      {stats && <div className="mt-6"><StatsCards stats={stats} /></div>}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Active Violations</h2>
          <p className="text-sm text-gray-500">Mis-park and fire-lane alerts</p>
          <div className="mt-4 space-y-3">
            {violations.filter((v) => !v.resolved).length === 0 ? (
              <p className="rounded-lg bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-700">
                No active violations — all clear
              </p>
            ) : (
              violations
                .filter((v) => !v.resolved)
                .map((v) => (
                  <ViolationAlert
                    key={v.id}
                    violation={v}
                    onEscalate={handleEscalate}
                    onResolve={handleResolve}
                  />
                ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Notification Log</h2>
          <p className="text-sm text-gray-500">Mock SMS, WhatsApp, calls, marshal dispatch</p>
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <NotificationFeed logs={notifications} />
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Parking Zones</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} />
          ))}
        </div>
      </section>
    </div>
  );
}

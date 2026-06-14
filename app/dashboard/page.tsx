"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Car } from "lucide-react";
import { StatsCards } from "@/components/StatsCards";
import { ViolationAlert, NotificationFeed } from "@/components/ViolationAlert";
import { ZoneCard } from "@/components/ZoneCard";
import type { DashboardStats, NotificationLog, ParkingZone, VehicleRegistration, Violation } from "@/lib/types";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export default function DashboardPage() {
  const t = useT();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [registrations, setRegistrations] = useState<VehicleRegistration[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data.stats);
      setZones(data.zones ?? []);
      setRegistrations(data.registrations ?? []);
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
      if (data.sms && !data.sms.sent && data.sms.mode === "live" && data.sms.error) {
        toast.error(`Twilio Error: ${data.sms.error}`, { duration: 6000 });
      }
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
          <h1 className="text-2xl font-bold text-gray-900">{t.dashTitle}</h1>
          <p className="text-kumbh-700">{t.dashSub}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t.dashRefresh}
          </button>
          <Link
            href="/dashboard/marshal"
            className="rounded-lg bg-kumbh-600 px-4 py-2 text-sm font-medium text-white hover:bg-kumbh-700"
          >
            {t.dashMarshal}
          </Link>
        </div>
      </div>

      {stats && <div className="mt-6"><StatsCards stats={stats} /></div>}

      {/* Registered Vehicles */}
      <section className="mt-8">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-kumbh-600" />
          <h2 className="text-lg font-semibold text-gray-900">{t.dashVehicles}</h2>
          <span className="rounded-full bg-kumbh-100 px-2 py-0.5 text-xs font-bold text-kumbh-700">
            {registrations.length}
          </span>
        </div>
        <div className="mt-4 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {registrations.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              {t.dashNoVehicles}{" "}
              <Link href="/entry" className="font-medium text-kumbh-600 hover:underline">
                {t.dashEntryGate}
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">{t.thVehicle}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">{t.thPhone}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">{t.thZoneSlot}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">{t.thPassCode}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">{t.thTime}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">{reg.vehicleNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{reg.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{reg.zoneId} / {reg.slotId}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-kumbh-50 px-2 py-1 font-mono text-xs font-bold text-kumbh-800">
                          {reg.passCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(reg.registeredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">{t.dashViolations}</h2>
          <p className="text-sm text-gray-500">{t.dashViolationsSub}</p>
          <div className="mt-4 space-y-3">
            {violations.filter((v) => !v.resolved).length === 0 ? (
              <p className="rounded-lg bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-700">
                {t.dashNoClear}
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
          <h2 className="text-lg font-semibold text-gray-900">{t.dashNotifLog}</h2>
          <p className="text-sm text-gray-500">{t.dashNotifSub}</p>
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <NotificationFeed logs={notifications} />
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">{t.dashZones}</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {zones.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} />
          ))}
        </div>
      </section>
    </div>
  );
}

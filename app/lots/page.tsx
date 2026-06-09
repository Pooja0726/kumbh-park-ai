"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { ZoneCard } from "@/components/ZoneCard";
import type { ParkingZone } from "@/lib/types";
import { useT } from "@/lib/i18n";

export default function LotsPage() {
  const t = useT();
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchZones() {
    setLoading(true);
    try {
      const res = await fetch("/api/zones");
      const data = await res.json();
      setZones(data.zones ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchZones();
    const interval = setInterval(fetchZones, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.lotsTitle}</h1>
          <p className="text-kumbh-700">{t.lotsSub}</p>
        </div>
        <button
          type="button"
          onClick={fetchZones}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t.lotsRefresh}
        </button>
      </div>

      <p className="mt-2 text-sm text-gray-500">
        {t.lotsAutoRefresh}
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </div>

      {zones.length === 0 && !loading && (
        <p className="mt-12 text-center text-gray-500">{t.lotsNoZones}</p>
      )}

      <div className="mt-12 rounded-xl border border-kumbh-200 bg-kumbh-50 p-6 text-center">
        <p className="font-medium text-kumbh-900">{t.lotsFull}</p>
        <p className="mt-1 text-sm text-kumbh-700">
          {t.lotsFullDesc}
        </p>
        <Link
          href="/entry"
          className="mt-4 inline-block rounded-lg bg-kumbh-600 px-6 py-2 text-sm font-medium text-white hover:bg-kumbh-700"
        >
          {t.lotsRegister}
        </Link>
      </div>
    </div>
  );
}

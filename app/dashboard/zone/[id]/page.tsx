"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Siren } from "lucide-react";
import { toast } from "sonner";
import { ParkingGrid } from "@/components/ParkingGrid";
import { AlertToast } from "@/components/ViolationAlert";
import type { ParkingSlot, ParkingZone, ViolationType } from "@/lib/types";

export default function ZoneDetailPage() {
  const params = useParams();
  const zoneId = params.id as string;
  const [zone, setZone] = useState<ParkingZone | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const fetchZone = useCallback(async () => {
    const res = await fetch(`/api/zones?id=${zoneId}`);
    const data = await res.json();
    setZone(data.zone ?? null);
  }, [zoneId]);

  useEffect(() => {
    fetchZone();
    const interval = setInterval(fetchZone, 5000);
    return () => clearInterval(interval);
  }, [fetchZone]);

  async function triggerViolation(type: ViolationType) {
    if (!selectedSlot || !zone) {
      toast.error("Select an occupied slot first");
      return;
    }

    const res = await fetch("/api/violations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zoneId: zone.id,
        slotId: selectedSlot.id,
        type,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      const v = data.violation;
      setAlertMsg(
        `SMS + WhatsApp sent to ${v.phone} for ${v.vehicleNumber}`
      );
      toast.error(`Alert: ${v.vehicleNumber} — ${type}`);
      fetchZone();
    } else {
      toast.error(data.error);
    }
  }

  if (!zone) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading zone... or zone not found.
        <Link href="/dashboard" className="mt-4 block text-kumbh-600">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-kumbh-600 hover:text-kumbh-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">{zone.name}</h1>
      <p className="text-kumbh-700">{zone.nameHindi} · Live camera grid simulation</p>

      <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <ParkingGrid
          zone={zone}
          interactive
          selectedSlotId={selectedSlot?.id}
          onSlotClick={setSelectedSlot}
        />
      </div>

      {selectedSlot && (
        <div className="mt-4 rounded-xl border border-kumbh-200 bg-kumbh-50 p-4">
          <p className="text-sm font-medium text-kumbh-900">
            Selected: {selectedSlot.id}
            {selectedSlot.vehicleNumber && ` — ${selectedSlot.vehicleNumber}`}
          </p>
          <p className="mt-1 text-xs text-kumbh-700">
            Simulate AI detection — triggers mock SMS/call to registered owner
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => triggerViolation("mis-parked")}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Mis-parked
            </button>
            <button
              type="button"
              onClick={() => triggerViolation("blocking-aisle")}
              className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2 text-xs font-medium text-white hover:bg-orange-700"
            >
              Blocking Aisle
            </button>
            <button
              type="button"
              onClick={() => triggerViolation("double-parking")}
              className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-3 py-2 text-xs font-medium text-white hover:bg-amber-800"
            >
              Double Parking
            </button>
            <button
              type="button"
              onClick={() => triggerViolation("fire-lane")}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
            >
              <Siren className="h-3.5 w-3.5" />
              Fire Lane Block
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <strong>Demo tip:</strong> Click any occupied (blue) or mis-parked (amber) slot,
        then trigger a violation. The owner receives tiered alerts visible on the dashboard.
      </div>

      {alertMsg && <AlertToast message={alertMsg} onClose={() => setAlertMsg(null)} />}
    </div>
  );
}

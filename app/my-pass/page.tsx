"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import { Bus, MapPin, Navigation, Phone } from "lucide-react";
import type { ParkingZone, VehicleRegistration } from "@/lib/types";
import { formatSlotLabel } from "@/lib/parking-engine";
import { useT } from "@/lib/i18n";

function MyPassContent() {
  const searchParams = useSearchParams();
  const t = useT();
  const [passCode, setPassCode] = useState("");
  const [registration, setRegistration] = useState<VehicleRegistration | null>(null);
  const [zone, setZone] = useState<ParkingZone | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code") ?? sessionStorage.getItem("parking-pass") ?? "";
    if (code) {
      setPassCode(code);
      fetchPass(code);
    }
  }, [searchParams]);

  async function fetchPass(code: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pass?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Pass not found");
        setRegistration(null);
        return;
      }
      setRegistration(data.registration);
      setZone(data.zone);
    } catch {
      setError("Failed to load pass");
    } finally {
      setLoading(false);
    }
  }

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (passCode) fetchPass(passCode);
  }

  const slot = zone?.slots.find((s) => s.id === registration?.slotId);

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">{t.passTitle}</h1>
      <p className="mt-1 text-sm text-gray-500">{t.passSub}</p>

      <form onSubmit={handleLookup} className="mt-6 flex gap-2">
        <input
          type="text"
          value={passCode}
          onChange={(e) => setPassCode(e.target.value.toUpperCase())}
          placeholder="PARK-XXXX-XXXX"
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 font-mono text-sm focus:border-kumbh-500 focus:outline-none focus:ring-2 focus:ring-kumbh-200"
        />
        <button
          type="submit"
          className="rounded-xl bg-kumbh-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-kumbh-700"
        >
          {t.passLoad}
        </button>
      </form>

      {loading && <p className="mt-6 text-center text-gray-500">{t.passLoading}</p>}
      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {registration && zone && slot && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border-2 border-kumbh-200 bg-white p-6 shadow-sm">
            <div className="flex justify-center rounded-xl bg-white p-4">
              <QRCode value={registration.passCode} size={160} />
            </div>
            <p className="mt-4 text-center font-mono text-sm font-bold text-kumbh-800">
              {registration.passCode}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-kumbh-100 p-2">
                <MapPin className="h-5 w-5 text-kumbh-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.passVehicle}</p>
                <p className="font-mono font-bold text-gray-900">
                  {registration.vehicleNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">{t.passZone}</p>
                <p className="font-semibold">{zone.name}</p>
              </div>
              <div>
                <p className="text-gray-500">{t.passSlot}</p>
                <p className="font-semibold">{formatSlotLabel(slot)}</p>
              </div>
              <div>
                <p className="text-gray-500">{t.passDestination}</p>
                <p className="font-semibold">{registration.destination}</p>
              </div>
              <div>
                <p className="text-gray-500">{t.passRegistered}</p>
                <p className="font-semibold">
                  {new Date(registration.registeredAt).toLocaleTimeString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-kumbh-50 to-kumbh-100 p-5">
            <h2 className="flex items-center gap-2 font-semibold text-kumbh-900">
              <Navigation className="h-5 w-5" />
              {t.passRoute}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-kumbh-800">
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kumbh-200 text-xs font-bold">1</span>
                {t.passStep1} {zone.shuttleStop} ({zone.walkMinutesToGhat} {t.passStep1Suffix})
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kumbh-200 text-xs font-bold">2</span>
                {t.passStep2} {registration.destination} ({t.passStep2Suffix})
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kumbh-200 text-xs font-bold">3</span>
                {t.passStep3}
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
            <Phone className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-amber-900">
              {t.passMisparkWarn}{" "}
              <strong>{registration.phone}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm">
            <Bus className="h-5 w-5 shrink-0 text-blue-600" />
            <p className="text-blue-900">
              {t.passShuttleNote} <strong>{zone.shuttleStop}</strong> {t.passShuttleSuffix}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyPassPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <MyPassContent />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CameraCapture } from "@/components/CameraCapture";
import { CheckCircle, Loader2 } from "lucide-react";
import type { Destination } from "@/lib/types";
import { isValidIndianPlate } from "@/lib/parking-engine";
import { useLanguage, useT } from "@/lib/i18n";

const DESTINATIONS: Destination[] = [
  "Sangam Ghat",
  "Main Ghat",
  "Arail Ghat",
  "Jhusi Parking Hub",
];

export default function EntryPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = useT();
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState<Destination>("Sangam Ghat");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    passCode: string;
    smsSent: boolean;
    smsMode: "live" | "mock";
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidIndianPlate(vehicleNumber)) {
      toast.error("Invalid plate format. Example: UP32AB1234");
      return;
    }
    if (!/^\+?[0-9]{10,13}$/.test(phone.replace(/[\s-]/g, ""))) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleNumber, phone, destination, language: lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }
      setSuccess({
        passCode: data.passCode,
        smsSent: data.sms?.sent ?? false,
        smsMode: data.sms?.mode ?? "mock",
      });
      if (data.sms?.sent) {
        toast.success("Vehicle registered! SMS sent to your phone.");
      } else if (data.sms?.mode === "mock") {
        toast.success("Vehicle registered! (SMS simulated — see note below)");
      } else {
        toast.success("Vehicle registered! Parking pass generated.");
        if (data.sms?.mode === "live" && data.sms?.error) {
          toast.error(`Twilio Error: ${data.sms.error}`, { duration: 6000 });
        }
      }

      // Save full registration to localStorage for client-side persistence (survives Vercel serverless recycles)
      try {
        const saved = JSON.parse(localStorage.getItem("sps-passes") || "{}");
        saved[data.passCode.toUpperCase()] = {
          id: `reg-${Date.now()}`,
          vehicleNumber: vehicleNumber.toUpperCase().replace(/\s+/g, "").trim(),
          phone,
          destination,
          zoneId: data.zoneId,
          slotId: data.slotId,
          language: lang,
          registeredAt: new Date().toISOString(),
          passCode: data.passCode,
        };
        localStorage.setItem("sps-passes", JSON.stringify(saved));
      } catch (e) {
        console.error("Failed to save pass to localStorage:", e);
      }

      sessionStorage.setItem("parking-pass", data.passCode);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{t.entryApproved}</h1>
        <p className="mt-2 text-gray-600">{t.entryPassIssued}</p>
        <p className="mt-4 rounded-lg bg-kumbh-50 px-4 py-3 font-mono text-lg font-bold text-kumbh-800">
          {success.passCode}
        </p>
        {success.smsSent ? (
          <p className="mt-2 text-sm text-emerald-700">
            {t.entrySmsSent} {phone}
          </p>
        ) : (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {t.entrySmsNotSent}
          </p>
        )}
        <button
          type="button"
          onClick={() => router.push(`/my-pass?code=${success.passCode}`)}
          className="mt-6 w-full rounded-xl bg-kumbh-600 py-3 font-semibold text-white hover:bg-kumbh-700"
        >
          {t.entryViewPass}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{t.entryTitle}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t.entrySub}
        </p>
      </div>

      <CameraCapture onPlateDetected={(plate) => setVehicleNumber(plate)} />

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t.labelVehicle}
          </label>
          <input
            type="text"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            placeholder="UP32AB1234"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-lg uppercase tracking-wider focus:border-kumbh-500 focus:outline-none focus:ring-2 focus:ring-kumbh-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t.labelPhone}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-kumbh-500 focus:outline-none focus:ring-2 focus:ring-kumbh-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t.labelDestination}
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value as Destination)}
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-kumbh-500 focus:outline-none focus:ring-2 focus:ring-kumbh-200"
          >
            {DESTINATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-kumbh-600 py-3.5 font-semibold text-white hover:bg-kumbh-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t.labelSubmit}
        </button>
      </form>
    </div>
  );
}

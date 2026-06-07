"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CameraCapture } from "@/components/CameraCapture";
import { CheckCircle, Loader2 } from "lucide-react";
import type { Destination } from "@/lib/types";
import { isValidIndianPlate } from "@/lib/parking-engine";

const DESTINATIONS: Destination[] = [
  "Sangam Ghat",
  "Main Ghat",
  "Arail Ghat",
  "Jhusi Parking Hub",
];

export default function EntryPage() {
  const router = useRouter();
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState<Destination>("Sangam Ghat");
  const [language, setLanguage] = useState<"hi" | "en">("hi");
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
        body: JSON.stringify({ vehicleNumber, phone, destination, language }),
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
      }
      sessionStorage.setItem("kumbh-pass", data.passCode);
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
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Entry Approved</h1>
        <p className="mt-2 text-gray-600">पार्किंग पास जारी · Parking pass issued</p>
        <p className="mt-4 rounded-lg bg-kumbh-50 px-4 py-3 font-mono text-lg font-bold text-kumbh-800">
          {success.passCode}
        </p>
        {success.smsSent ? (
          <p className="mt-2 text-sm text-emerald-700">
            SMS sent to {phone}
          </p>
        ) : (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            SMS not sent to your phone — notifications are <strong>simulated</strong> until
            Twilio is configured in <code className="text-xs">.env.local</code>. See README.
            Alerts appear on the Dashboard.
          </p>
        )}
        <button
          type="button"
          onClick={() => router.push(`/my-pass?code=${success.passCode}`)}
          className="mt-6 w-full rounded-xl bg-kumbh-600 py-3 font-semibold text-white hover:bg-kumbh-700"
        >
          View Parking Pass & Route
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Entry Gate</h1>
        <p className="text-kumbh-700">वाहन प्रवेश · कैमरा स्कैन</p>
        <p className="mt-1 text-sm text-gray-500">
          Capture plate photo, scan number, register phone, get parking slot
        </p>
      </div>

      <CameraCapture onPlateDetected={(plate) => setVehicleNumber(plate)} />

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Vehicle Number / वाहन नंबर
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
            Mobile Number / मोबाइल
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
            Destination Ghat / गंतव्य घाट
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Alert Language / भाषा
          </label>
          <div className="mt-2 flex gap-3">
            {(["hi", "en"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-medium ${
                  language === lang
                    ? "border-kumbh-500 bg-kumbh-50 text-kumbh-800"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {lang === "hi" ? "हिंदी" : "English"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-kumbh-600 py-3.5 font-semibold text-white hover:bg-kumbh-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Register & Get Parking Pass
        </button>
      </form>
    </div>
  );
}

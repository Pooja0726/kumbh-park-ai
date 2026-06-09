"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Shield } from "lucide-react";
import type { Violation } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useLanguage, useT } from "@/lib/i18n";

export default function MarshalPage() {
  const t = useT();
  const { lang } = useLanguage();
  const [violations, setViolations] = useState<Violation[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setViolations(
        (data.violations ?? []).filter(
          (v: Violation) => !v.resolved && (v.tier === "marshal" || v.type === "fire-lane")
        )
      );
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-kumbh-600"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.marshalBack}
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <div className="rounded-xl bg-red-100 p-3">
          <Shield className="h-6 w-6 text-red-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t.marshalTitle}</h1>
          <p className="text-sm text-gray-500">{t.marshalSub}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {violations.length === 0 ? (
          <div className="rounded-xl bg-emerald-50 p-8 text-center text-emerald-700">
            {t.marshalNone}
          </div>
        ) : (
          violations.map((v) => (
            <div
              key={v.id}
              className={`rounded-xl border p-4 ${
                v.type === "fire-lane"
                  ? "border-red-300 bg-red-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="font-mono text-lg font-bold">{v.vehicleNumber}</p>
                <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  {t.marshalUrgent}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {v.zoneId} / {v.slotId}
              </div>
              <p className="mt-2 text-sm">
                {lang === "hi" ? v.messageHindi : v.message}
              </p>
              <p className="mt-1 text-xs text-gray-500">{formatDateTime(v.createdAt)}</p>
              <a
                href={`tel:${v.phone}`}
                className="mt-3 block rounded-lg bg-gray-900 py-2.5 text-center text-sm font-medium text-white"
              >
                {t.marshalCall} {v.phone}
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

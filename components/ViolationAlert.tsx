"use client";

import { AlertTriangle, Bell, Phone, Shield, X } from "lucide-react";
import type { NotificationLog, Violation } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useLanguage, useT } from "@/lib/i18n";

interface ViolationAlertProps {
  violation: Violation;
  onEscalate?: (id: string) => void;
  onResolve?: (id: string) => void;
  compact?: boolean;
}

const tierIcons = {
  sms: Bell,
  call: Phone,
  marshal: Shield,
};

export function ViolationAlert({
  violation,
  onEscalate,
  onResolve,
  compact = false,
}: ViolationAlertProps) {
  const { lang } = useLanguage();
  const t = useT();
  const Icon = tierIcons[violation.tier];

  const tierLabels = {
    sms: t.violSmsSent,
    call: t.violCallTriggered,
    marshal: t.violMarshalDispatched,
  };

  return (
    <div
      className={`rounded-xl border ${
        violation.resolved
          ? "border-gray-200 bg-gray-50 opacity-70"
          : violation.type === "fire-lane"
            ? "border-red-300 bg-red-50"
            : "border-amber-300 bg-amber-50"
      } p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`rounded-lg p-2 ${
              violation.type === "fire-lane" ? "bg-red-200" : "bg-amber-200"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${
                violation.type === "fire-lane" ? "text-red-700" : "text-amber-700"
              }`}
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{violation.vehicleNumber}</p>
            <p className="text-sm text-gray-600">
              {violation.zoneId} / {violation.slotId}
            </p>
            {!compact && (
              <p className="mt-1 text-sm text-gray-700">
                {lang === "hi" ? violation.messageHindi : violation.message}
              </p>
            )}
            <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
              <Icon className="h-3.5 w-3.5" />
              {tierLabels[violation.tier]} · {formatDateTime(violation.createdAt)}
            </div>
          </div>
        </div>
        {violation.resolved && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            {t.violResolved}
          </span>
        )}
      </div>

      {!violation.resolved && (onEscalate || onResolve) && (
        <div className="mt-3 flex gap-2">
          {onEscalate && violation.tier !== "marshal" && (
            <button
              type="button"
              onClick={() => onEscalate(violation.id)}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            >
              {t.violEscalate}
            </button>
          )}
          {onResolve && (
            <button
              type="button"
              onClick={() => onResolve(violation.id)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {t.violResolve}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function NotificationFeed({ logs }: { logs: NotificationLog[] }) {
  const t = useT();

  if (logs.length === 0) {
    return (
      <p className="text-sm text-gray-500">{t.violNoNotif}</p>
    );
  }

  const channelColors: Record<NotificationLog["channel"], string> = {
    sms: "bg-blue-100 text-blue-800",
    whatsapp: "bg-green-100 text-green-800",
    call: "bg-purple-100 text-purple-800",
    marshal: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-h-64 space-y-2 overflow-y-auto">
      {logs.slice(0, 20).map((log) => (
        <div
          key={log.id}
          className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white p-3 text-sm"
        >
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${channelColors[log.channel]}`}
          >
            {log.channel}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-800">
              {log.vehicleNumber} → {log.phone}
            </p>
            <p className="truncate text-gray-600">{log.message}</p>
            <p className="text-xs text-gray-400">{formatDateTime(log.sentAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AlertToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const t = useT();

  return (
    <div className="fixed bottom-20 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-lg md:bottom-6">
      <Bell className="h-5 w-5 shrink-0 text-amber-600" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-900">{t.violAlertDispatched}</p>
        <p className="text-sm text-amber-800">{message}</p>
      </div>
      <button type="button" onClick={onClose} className="text-amber-600 hover:text-amber-800">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

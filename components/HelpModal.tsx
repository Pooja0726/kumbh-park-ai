"use client";

import { useState } from "react";
import { HelpCircle, Mail, Phone, ChevronDown, ChevronUp, X, MessageCircle } from "lucide-react";
import { useT } from "@/lib/i18n";

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (!open) return null;

  const faqs = [
    { q: t.helpFaq1Q, a: t.helpFaq1A },
    { q: t.helpFaq2Q, a: t.helpFaq2A },
    { q: t.helpFaq3Q, a: t.helpFaq3A },
    { q: t.helpFaq4Q, a: t.helpFaq4A },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-100 bg-gradient-to-r from-kumbh-600 to-sacred-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2">
              <HelpCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t.helpTitle}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600">{t.helpDesc}</p>

          {/* Contact Cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-900">{t.helpPhone}</p>
              </div>
              <p className="mt-2 font-mono text-sm font-bold text-emerald-800">{t.helpPhoneNum}</p>
              <p className="mt-1 text-xs text-emerald-600">{t.helpPhoneAvail}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-900">{t.helpEmail}</p>
              </div>
              <p className="mt-2 text-sm font-bold text-blue-800">{t.helpEmailAddr}</p>
              <p className="mt-1 text-xs text-blue-600">{t.helpEmailReply}</p>
            </div>
          </div>

          {/* Emergency */}
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <MessageCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-900">WhatsApp Support</p>
              <p className="text-xs text-red-700">+91 98765-XXXXX</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-sm font-bold text-gray-900">{t.helpFaqTitle}</h3>
            <div className="mt-3 space-y-2">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800"
                  >
                    {faq.q}
                    {expandedFaq === i ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                    )}
                  </button>
                  {expandedFaq === i && (
                    <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {t.helpClose}
          </button>
        </div>
      </div>
    </div>
  );
}

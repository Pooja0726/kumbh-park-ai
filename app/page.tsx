"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bus,
  Camera,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";
import { useT } from "@/lib/i18n";

export default function HomePage() {
  const t = useT();

  const features = [
    { icon: Camera, title: t.feat1Title, desc: t.feat1Desc },
    { icon: AlertTriangle, title: t.feat2Title, desc: t.feat2Desc },
    { icon: Phone, title: t.feat3Title, desc: t.feat3Desc },
    { icon: MapPin, title: t.feat4Title, desc: t.feat4Desc },
    { icon: Bus, title: t.feat5Title, desc: t.feat5Desc },
    { icon: Shield, title: t.feat6Title, desc: t.feat6Desc },
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-kumbh-600 via-sacred-600 to-kumbh-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="mb-3 text-sm font-medium text-kumbh-200">
            {t.heroBadge}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mt-2 text-xl text-kumbh-100">{t.heroSubtitle}</p>
          <p className="mt-6 max-w-2xl text-lg text-kumbh-50">
            {t.heroDesc}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/entry"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-kumbh-800 shadow-lg transition hover:bg-kumbh-50"
            >
              {t.heroCta1}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/lots"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              {t.heroCta3}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.howItWorks}</h2>
        <p className="mt-1 text-gray-600">{t.howItWorksSub}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { step: "1", title: t.step1Title, desc: t.step1Desc },
            { step: "2", title: t.step2Title, desc: t.step2Desc },
            { step: "3", title: t.step3Title, desc: t.step3Desc },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-kumbh-100 bg-white p-6 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-kumbh-100 text-lg font-bold text-kumbh-700">
                {item.step}
              </span>
              <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-kumbh-50/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900">{t.platformFeatures}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <f.icon className="h-8 w-8 text-kumbh-600" />
                <h3 className="mt-3 font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-kumbh-700 to-sacred-600 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold">{t.ctaTitle}</h2>
          <p className="mt-2 text-kumbh-100">
            {t.ctaSub}
          </p>
          <Link
            href="/entry"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-kumbh-800 shadow-lg hover:bg-kumbh-50"
          >
            {t.ctaButton}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

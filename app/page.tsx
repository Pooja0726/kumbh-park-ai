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

const features = [
  {
    icon: Camera,
    title: "ANPR Entry Gate",
    titleHi: "नंबर प्लेट स्कैन",
    desc: "Scan vehicle plates at entry, register phone number, and get instant parking assignment.",
  },
  {
    icon: AlertTriangle,
    title: "Mis-park Detection",
    titleHi: "गलत पार्किंग पहचान",
    desc: "AI monitors every slot. Blocked aisles and fire lanes trigger automatic owner alerts.",
  },
  {
    icon: Phone,
    title: "Tiered Auto-Alerts",
    titleHi: "स्वचालित सूचना",
    desc: "SMS → WhatsApp → Auto-call → Marshal dispatch. Messages in Hindi and English.",
  },
  {
    icon: MapPin,
    title: "Ghat Route Guide",
    titleHi: "घाट मार्गदर्शन",
    desc: "After parking, pilgrims get walking time, shuttle stops, and least-congested routes.",
  },
  {
    icon: Bus,
    title: "Multi-Zone Orchestration",
    titleHi: "बहु-क्षेत्र प्रबंधन",
    desc: "Live occupancy across all lots. Redirect traffic before zones hit capacity.",
  },
  {
    icon: Shield,
    title: "Command Dashboard",
    titleHi: "कमांड डैशबोर्ड",
    desc: "Real-time heatmaps, violation feed, and analytics for traffic authorities.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-kumbh-600 via-sacred-600 to-kumbh-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="mb-3 text-sm font-medium text-kumbh-200">
            महाकुंभ 2025 · Transportation & Mobility
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            KumbhPark AI
          </h1>
          <p className="mt-2 text-xl text-kumbh-100">स्मार्ट पार्किंग · सुरक्षित आवागमन</p>
          <p className="mt-6 max-w-2xl text-lg text-kumbh-50">
            Intelligent parking management for millions of pilgrims. Scan, park, get guided
            to the ghat — with automatic alerts when your vehicle causes congestion.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/entry"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-kumbh-800 shadow-lg transition hover:bg-kumbh-50"
            >
              Register Vehicle
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Authority Dashboard
            </Link>
            <Link
              href="/lots"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              View Live Lots
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
        <p className="mt-1 text-gray-600">तीन आसान कदम · Three simple steps</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { step: "1", title: "Scan & Register", desc: "Camera reads plate. Enter phone + destination ghat." },
            { step: "2", title: "Park & Get Pass", desc: "Assigned slot + QR pass with shuttle and walking route." },
            { step: "3", title: "Auto-Monitored", desc: "Mis-park? You get SMS, call, and marshal support automatically." },
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
          <h2 className="text-2xl font-bold text-gray-900">Platform Features</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <f.icon className="h-8 w-8 text-kumbh-600" />
                <h3 className="mt-3 font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-kumbh-700">{f.titleHi}</p>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-kumbh-700 to-sacred-600 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold">Ready to enter the parking zone?</h2>
          <p className="mt-2 text-kumbh-100">
            पार्किंग जोन में प्रवेश के लिए वाहन पंजीकरण करें
          </p>
          <Link
            href="/entry"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-kumbh-800 shadow-lg hover:bg-kumbh-50"
          >
            Start Entry Registration
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

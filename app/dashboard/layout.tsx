"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already unlocked in this session
    const unlocked = sessionStorage.getItem("sps-admin-mode") === "true";
    setIsUnlocked(unlocked);
    setLoading(false);
  }, []);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pin === "1234") {
      sessionStorage.setItem("sps-admin-mode", "true");
      setIsUnlocked(true);
      // Trigger a custom event so the Navbar can update its status dynamically
      window.dispatchEvent(new Event("sps-admin-login"));
    } else {
      setError("Incorrect Admin PIN. Access Denied.");
      setPin("");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-kumbh-600" />
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Restricted Access</h2>
          <p className="mt-2 text-sm text-gray-600">
            This area is for Traffic Controllers and Marshals only.
          </p>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div>
              <input
                type="password"
                maxLength={4}
                pattern="[0-9]*"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-Digit PIN"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-2xl font-bold tracking-[1em] focus:border-kumbh-500 focus:outline-none focus:ring-2 focus:ring-kumbh-200"
                required
              />
              <p className="mt-2 text-xs text-gray-400">Hint: Use PIN 1234 for testing</p>
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-kumbh-600 py-3 font-semibold text-white hover:bg-kumbh-700 transition"
            >
              <ShieldCheck className="h-4 w-4" />
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-kumbh-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

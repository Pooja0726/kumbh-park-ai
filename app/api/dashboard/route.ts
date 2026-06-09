import { NextResponse } from "next/server";
import {
  getDashboardStats,
  getNotifications,
  getRegistrations,
  getViolations,
  getZones,
} from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    stats: getDashboardStats(),
    zones: getZones(),
    registrations: getRegistrations(),
    violations: getViolations(),
    notifications: getNotifications(),
  });
}

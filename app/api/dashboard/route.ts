import { NextResponse } from "next/server";
import {
  getDashboardStats,
  getNotifications,
  getViolations,
  getZones,
} from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    stats: getDashboardStats(),
    zones: getZones(),
    violations: getViolations(),
    notifications: getNotifications(),
  });
}

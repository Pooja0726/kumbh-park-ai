import { NextResponse } from "next/server";
import { getRegistrationByPass, getZone } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Pass code required" }, { status: 400 });
  }

  const registration = getRegistrationByPass(code);
  if (!registration) {
    return NextResponse.json({ error: "Parking pass not found" }, { status: 404 });
  }

  const zone = getZone(registration.zoneId);
  return NextResponse.json({ registration, zone });
}

import { NextResponse } from "next/server";
import { registerVehicle } from "@/lib/store";
import type { Destination } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { vehicleNumber, phone, destination, language } = body as {
    vehicleNumber: string;
    phone: string;
    destination: Destination;
    language: "hi" | "en";
  };

  if (!vehicleNumber || !phone || !destination) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = registerVehicle({
    vehicleNumber,
    phone,
    destination,
    language: language ?? "hi",
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    passCode: result.passCode,
    vehicleNumber: result.vehicleNumber,
    zoneId: result.zoneId,
    slotId: result.slotId,
    destination: result.destination,
    message:
      language === "hi"
        ? `पार्किंग पास जारी। स्लॉट: ${result.slotId}`
        : `Parking pass issued. Slot: ${result.slotId}`,
  });
}

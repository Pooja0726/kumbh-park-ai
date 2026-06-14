import { NextResponse } from "next/server";
import { registerVehicle } from "@/lib/store";
import { sendSms, isSmsConfigured } from "@/lib/sms-service";
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

  const smsText =
    language === "hi"
      ? `स्मार्ट पार्किंग: वाहन ${result.vehicleNumber} पंजीकृत। पास: ${result.passCode}। स्लॉट: ${result.slotId}।`
      : `SmartParking: Vehicle ${result.vehicleNumber} registered. Pass: ${result.passCode}. Slot: ${result.slotId}.`;

  const sms = await sendSms(phone, smsText);

  return NextResponse.json({
    passCode: result.passCode,
    vehicleNumber: result.vehicleNumber,
    zoneId: result.zoneId,
    slotId: result.slotId,
    destination: result.destination,
    sms: {
      configured: isSmsConfigured(),
      sent: sms.sent,
      mode: sms.mode,
      error: sms.error,
    },
    message:
      language === "hi"
        ? `पार्किंग पास जारी। स्लॉट: ${result.slotId}`
        : `Parking pass issued. Slot: ${result.slotId}`,
  });
}

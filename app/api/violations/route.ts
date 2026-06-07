import { NextResponse } from "next/server";
import {
  escalateViolation,
  reportViolation,
  resolveViolation,
} from "@/lib/store";
import { sendSms } from "@/lib/sms-service";
import type { ViolationType } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { zoneId, slotId, type } = body as {
    zoneId: string;
    slotId: string;
    type: ViolationType;
  };

  if (!zoneId || !slotId || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const result = reportViolation({ zoneId, slotId, type });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const sms = await sendSms(result.phone, result.messageHindi);

  return NextResponse.json({ violation: result, sms });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { action, violationId } = body as {
    action: "escalate" | "resolve";
    violationId: string;
  };

  if (!action || !violationId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const result =
    action === "escalate"
      ? escalateViolation(violationId)
      : resolveViolation(violationId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (action === "escalate") {
    const msg =
      result.tier === "call"
        ? `कॉल: ${result.messageHindi}`
        : result.tier === "marshal"
          ? `मार्शल भेजा गया: ${result.zoneId} ${result.slotId}`
          : result.messageHindi;
    await sendSms(result.phone, msg);
  }

  return NextResponse.json({ violation: result });
}

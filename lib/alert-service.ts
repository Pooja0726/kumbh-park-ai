import type { AlertTier, NotificationLog, Violation, ViolationType } from "./types";

const MESSAGES: Record<
  ViolationType,
  { en: string; hi: string }
> = {
  "mis-parked": {
    en: "Your vehicle {plate} is not parked within the slot lines. Please reposition immediately.",
    hi: "आपका वाहन {plate} स्लॉट लाइन के अंदर नहीं है। कृपया तुरंत सही जगह पर खड़ा करें।",
  },
  "blocking-aisle": {
    en: "Your vehicle {plate} is blocking the aisle. Relocate within 10 minutes.",
    hi: "आपका वाहन {plate} गलियारा रोक रहा है। 10 मिनट में हटाएं।",
  },
  "double-parking": {
    en: "Your vehicle {plate} is occupying two slots. Please move to your assigned slot.",
    hi: "आपका वाहन {plate} दो स्लॉट घेर रहा है। कृपया अपने स्लॉट पर ले जाएं।",
  },
  "fire-lane": {
    en: "URGENT: Vehicle {plate} is blocking the fire/emergency lane. Move immediately!",
    hi: "अत्यावश्यक: वाहन {plate} आपातकालीन लेन में है। तुरंत हटाएं!",
  },
};

export function getViolationMessage(
  type: ViolationType,
  plate: string,
  lang: "hi" | "en"
): string {
  const template = MESSAGES[type][lang === "hi" ? "hi" : "en"];
  return template.replace("{plate}", plate);
}

export function getNextTier(current?: AlertTier): AlertTier {
  if (!current) return "sms";
  if (current === "sms") return "call";
  return "marshal";
}

export function createViolation(
  vehicleNumber: string,
  phone: string,
  zoneId: string,
  slotId: string,
  type: ViolationType,
  tier: AlertTier = "sms"
): Violation {
  return {
    id: `vio-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    vehicleNumber,
    phone,
    zoneId,
    slotId,
    type,
    tier,
    message: getViolationMessage(type, vehicleNumber, "en"),
    messageHindi: getViolationMessage(type, vehicleNumber, "hi"),
    createdAt: new Date().toISOString(),
    resolved: false,
  };
}

export function dispatchAlert(
  violation: Violation,
  tier: AlertTier
): NotificationLog[] {
  const logs: NotificationLog[] = [];
  const base = {
    vehicleNumber: violation.vehicleNumber,
    phone: violation.phone,
    sentAt: new Date().toISOString(),
    status: "delivered" as const,
  };

  if (tier === "sms" || tier === "call" || tier === "marshal") {
    logs.push({
      id: `notif-${Date.now()}-sms`,
      ...base,
      channel: "sms",
      message: violation.messageHindi,
    });
    logs.push({
      id: `notif-${Date.now()}-wa`,
      ...base,
      channel: "whatsapp",
      message: violation.messageHindi,
    });
  }

  if (tier === "call" || tier === "marshal") {
    logs.push({
      id: `notif-${Date.now()}-call`,
      ...base,
      channel: "call",
      message: `IVR Call (Hindi): ${violation.messageHindi}`,
    });
  }

  if (tier === "marshal") {
    logs.push({
      id: `notif-${Date.now()}-marshal`,
      ...base,
      channel: "marshal",
      message: `Marshal dispatched to ${violation.zoneId} / ${violation.slotId}`,
    });
  }

  return logs;
}

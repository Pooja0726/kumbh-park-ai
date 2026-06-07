import { INITIAL_ZONES } from "./mock-data";
import {
  assignBestZone,
  buildRegistration,
  normalizePlate,
} from "./parking-engine";
import {
  createViolation,
  dispatchAlert,
  getNextTier,
} from "./alert-service";
import type {
  DashboardStats,
  Destination,
  NotificationLog,
  ParkingZone,
  VehicleRegistration,
  Violation,
  ViolationType,
} from "./types";

interface Store {
  zones: ParkingZone[];
  registrations: VehicleRegistration[];
  violations: Violation[];
  notifications: NotificationLog[];
}

const g = globalThis as typeof globalThis & { __kumbhStore?: Store };

function getStore(): Store {
  if (!g.__kumbhStore) {
    g.__kumbhStore = {
      zones: structuredClone(INITIAL_ZONES),
      registrations: [],
      violations: [],
      notifications: [],
    };
  }
  return g.__kumbhStore;
}

export function getZones(): ParkingZone[] {
  return structuredClone(getStore().zones);
}

export function getZone(id: string): ParkingZone | undefined {
  return getZones().find((z) => z.id === id);
}

export function getRegistrations(): VehicleRegistration[] {
  return [...getStore().registrations];
}

export function getRegistrationByPass(passCode: string): VehicleRegistration | undefined {
  return getStore().registrations.find((r) => r.passCode === passCode);
}

export function getRegistrationByPlate(plate: string): VehicleRegistration | undefined {
  const normalized = normalizePlate(plate);
  return getStore().registrations.find((r) => r.vehicleNumber === normalized);
}

export function getViolations(): Violation[] {
  return [...getStore().violations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getNotifications(): NotificationLog[] {
  return [...getStore().notifications].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
}

export function registerVehicle(input: {
  vehicleNumber: string;
  phone: string;
  destination: Destination;
  language: "hi" | "en";
}): VehicleRegistration | { error: string } {
  const store = getStore();
  const plate = normalizePlate(input.vehicleNumber);

  if (store.registrations.some((r) => r.vehicleNumber === plate)) {
    return { error: "Vehicle already registered in the system." };
  }

  const assignment = assignBestZone(store.zones, input.destination);
  if (!assignment) {
    return { error: "All parking zones are full. Please use alternate lot." };
  }

  const { zone, slot } = assignment;
  const zoneRef = store.zones.find((z) => z.id === zone.id)!;
  const slotRef = zoneRef.slots.find((s) => s.id === slot.id)!;
  slotRef.status = "occupied";
  slotRef.vehicleNumber = plate;

  const registration = buildRegistration(
    plate,
    input.phone,
    input.destination,
    zoneRef,
    slotRef,
    input.language
  );
  store.registrations.push(registration);
  return registration;
}

export function reportViolation(input: {
  zoneId: string;
  slotId: string;
  type: ViolationType;
}): Violation | { error: string } {
  const store = getStore();
  const zone = store.zones.find((z) => z.id === input.zoneId);
  if (!zone) return { error: "Zone not found" };

  const slot = zone.slots.find((s) => s.id === input.slotId);
  if (!slot || !slot.vehicleNumber) {
    return { error: "No vehicle at this slot" };
  }

  slot.status = input.type === "fire-lane" ? "blocked" : "mis-parked";

  const reg = store.registrations.find(
    (r) => r.vehicleNumber === slot.vehicleNumber
  );
  const phone = reg?.phone ?? "+91-0000000000";

  const violation = createViolation(
    slot.vehicleNumber,
    phone,
    input.zoneId,
    input.slotId,
    input.type,
    "sms"
  );

  store.violations.unshift(violation);
  const logs = dispatchAlert(violation, "sms");
  store.notifications.unshift(...logs);

  return violation;
}

export function escalateViolation(violationId: string): Violation | { error: string } {
  const store = getStore();
  const violation = store.violations.find((v) => v.id === violationId);
  if (!violation) return { error: "Violation not found" };
  if (violation.resolved) return { error: "Violation already resolved" };

  const nextTier = getNextTier(violation.tier);
  violation.tier = nextTier;
  const logs = dispatchAlert(violation, nextTier);
  store.notifications.unshift(...logs);
  return violation;
}

export function resolveViolation(violationId: string): Violation | { error: string } {
  const store = getStore();
  const violation = store.violations.find((v) => v.id === violationId);
  if (!violation) return { error: "Violation not found" };

  violation.resolved = true;
  violation.resolvedAt = new Date().toISOString();

  const zone = store.zones.find((z) => z.id === violation.zoneId);
  const slot = zone?.slots.find((s) => s.id === violation.slotId);
  if (slot) slot.status = "occupied";

  return violation;
}

export function getDashboardStats(): DashboardStats {
  const store = getStore();
  const parkable = store.zones.flatMap((z) =>
    z.slots.filter((s) => !s.isFireLane)
  );
  const occupied = parkable.filter(
    (s) => s.status === "occupied" || s.status === "mis-parked" || s.status === "blocked"
  ).length;
  const misParked = parkable.filter((s) => s.status === "mis-parked").length;
  const free = parkable.length - occupied;
  const activeViolations = store.violations.filter((v) => !v.resolved).length;

  return {
    totalSlots: parkable.length,
    occupiedSlots: occupied,
    freeSlots: free,
    misParkedSlots: misParked,
    activeViolations,
    occupancyPercent: Math.round((occupied / parkable.length) * 100),
  };
}

export function mockOcrPlate(imageDataHint?: string): string {
  const samples = ["UP32AB1234", "UP70CX5678", "UP14DE9012", "UP75FG3456"];
  if (imageDataHint && imageDataHint.length > 8) {
    const hash = imageDataHint.length % samples.length;
    return samples[hash];
  }
  return samples[Math.floor(Math.random() * samples.length)];
}

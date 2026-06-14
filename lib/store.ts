import fs from "fs";
import path from "path";
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
  seeded: boolean;
}

const g = globalThis as typeof globalThis & { __parkingStore?: Store };
const STORE_FILE = path.join(process.cwd(), ".next", "parking-store.json");

function loadFromFile(): Store | null {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error loading parking store:", e);
  }
  return null;
}

export function saveToFile() {
  try {
    const store = g.__parkingStore;
    if (!store) return;
    const dir = path.dirname(STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving parking store:", e);
  }
}

function getStore(): Store {
  if (!g.__parkingStore) {
    const loaded = loadFromFile();
    if (loaded) {
      g.__parkingStore = loaded;
    } else {
      g.__parkingStore = {
        zones: structuredClone(INITIAL_ZONES),
        registrations: [],
        violations: [],
        notifications: [],
        seeded: false,
      };
    }
  }
  // Auto-seed on first access
  if (!g.__parkingStore.seeded) {
    g.__parkingStore.seeded = true;
    seedInitialData(g.__parkingStore);
    saveToFile();
  }
  return g.__parkingStore;
}

/**
 * Seed the store with realistic initial data so the dashboard
 * shows real-time data immediately without manual registration.
 */
function seedInitialData(store: Store) {
  const seedVehicles = [
    { plate: "UP32AB1234", phone: "9876543210", dest: "Sangam Ghat" as Destination, lang: "hi" as const },
    { plate: "UP70CX5678", phone: "9123456780", dest: "Main Ghat" as Destination, lang: "en" as const },
    { plate: "UP14DE9012", phone: "9988776655", dest: "Arail Ghat" as Destination, lang: "hi" as const },
    { plate: "DL01MN3456", phone: "8877665544", dest: "Sangam Ghat" as Destination, lang: "en" as const },
    { plate: "MH12PQ7890", phone: "7766554433", dest: "Main Ghat" as Destination, lang: "en" as const },
    { plate: "RJ14RS2345", phone: "6655443322", dest: "Jhusi Parking Hub" as Destination, lang: "hi" as const },
    { plate: "UP32AB0123", phone: "9876543210", dest: "Sangam Ghat" as Destination, lang: "en" as const, passCode: "PARK-0123-IZM9" },
  ];

  // Register seed vehicles
  seedVehicles.forEach((v, index) => {
    const plate = normalizePlate(v.plate);
    const assignment = assignBestZone(store.zones, v.dest);
    if (!assignment) return;

    const { zone, slot } = assignment;
    const zoneRef = store.zones.find((z) => z.id === zone.id)!;
    const slotRef = zoneRef.slots.find((s) => s.id === slot.id)!;
    slotRef.status = "occupied";
    slotRef.vehicleNumber = plate;

    const registration = buildRegistration(plate, v.phone, v.dest, zoneRef, slotRef, v.lang);
    // Ensure unique IDs (Date.now() can collide in a tight loop)
    registration.id = `reg-seed-${index}`;
    if ("passCode" in v && v.passCode) {
      registration.passCode = v.passCode;
    }
    store.registrations.push(registration);
  });

  // Create seed violations (mis-park + fire-lane)
  const misParkedReg = store.registrations[1]; // UP70CX5678
  if (misParkedReg) {
    const zone = store.zones.find((z) => z.id === misParkedReg.zoneId)!;
    const slot = zone.slots.find((s) => s.id === misParkedReg.slotId)!;
    slot.status = "mis-parked";

    const violation1 = createViolation(
      misParkedReg.vehicleNumber,
      misParkedReg.phone,
      misParkedReg.zoneId,
      misParkedReg.slotId,
      "mis-parked",
      "sms"
    );
    store.violations.push(violation1);
    const logs1 = dispatchAlert(violation1, "sms");
    store.notifications.push(...logs1);
  }

  const fireLaneReg = store.registrations[3]; // DL01MN3456
  if (fireLaneReg) {
    const zone = store.zones.find((z) => z.id === fireLaneReg.zoneId)!;
    // Find a fire lane slot and mark it as blocked
    const fireSlot = zone.slots.find((s) => s.isFireLane && s.status === "free");
    if (fireSlot) {
      fireSlot.status = "blocked";
      fireSlot.vehicleNumber = fireLaneReg.vehicleNumber;

      const violation2 = createViolation(
        fireLaneReg.vehicleNumber,
        fireLaneReg.phone,
        zone.id,
        fireSlot.id,
        "fire-lane",
        "call"
      );
      store.violations.push(violation2);
      const logs2 = dispatchAlert(violation2, "call");
      store.notifications.push(...logs2);
    }
  }
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
  saveToFile();
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
  saveToFile();
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
  saveToFile();
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
  saveToFile();
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

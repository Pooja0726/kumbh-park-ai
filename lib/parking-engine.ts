import type {
  Destination,
  ParkingSlot,
  ParkingZone,
  VehicleRegistration,
} from "./types";

export function findFreeSlot(zone: ParkingZone): ParkingSlot | null {
  return (
    zone.slots.find(
      (s) => s.status === "free" && !s.isFireLane
    ) ?? null
  );
}

export function getZoneOccupancy(zone: ParkingZone) {
  const parkable = zone.slots.filter((s) => !s.isFireLane);
  const occupied = parkable.filter(
    (s) => s.status === "occupied" || s.status === "mis-parked"
  ).length;
  const misParked = parkable.filter((s) => s.status === "mis-parked").length;
  const free = parkable.length - occupied;
  const percent = Math.round((occupied / parkable.length) * 100);
  return { occupied, free, misParked, total: parkable.length, percent };
}

export function assignBestZone(
  zones: ParkingZone[],
  destination: Destination
): { zone: ParkingZone; slot: ParkingSlot } | null {
  const matching = zones
    .filter((z) => z.destination === destination)
    .map((z) => ({ zone: z, occupancy: getZoneOccupancy(z) }))
    .filter((x) => x.occupancy.free > 0)
    .sort((a, b) => a.occupancy.percent - b.occupancy.percent);

  const pool = matching.length > 0 ? matching : zones
    .map((z) => ({ zone: z, occupancy: getZoneOccupancy(z) }))
    .filter((x) => x.occupancy.free > 0)
    .sort((a, b) => a.occupancy.percent - b.occupancy.percent);

  for (const item of pool) {
    const slot = findFreeSlot(item.zone);
    if (slot) return { zone: item.zone, slot };
  }
  return null;
}

export function generatePassCode(vehicleNumber: string): string {
  const suffix = vehicleNumber.replace(/[^A-Z0-9]/gi, "").slice(-4);
  return `KUMBH-${suffix}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export function formatSlotLabel(slot: ParkingSlot): string {
  return `Row ${slot.row + 1}, Col ${slot.col + 1}`;
}

export function normalizePlate(input: string): string {
  return input.toUpperCase().replace(/\s+/g, "").trim();
}

export function isValidIndianPlate(plate: string): boolean {
  const normalized = normalizePlate(plate);
  return /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(normalized);
}

export function buildRegistration(
  vehicleNumber: string,
  phone: string,
  destination: Destination,
  zone: ParkingZone,
  slot: ParkingSlot,
  language: "hi" | "en"
): VehicleRegistration {
  return {
    id: `reg-${Date.now()}`,
    vehicleNumber: normalizePlate(vehicleNumber),
    phone,
    destination,
    zoneId: zone.id,
    slotId: slot.id,
    language,
    registeredAt: new Date().toISOString(),
    passCode: generatePassCode(vehicleNumber),
  };
}

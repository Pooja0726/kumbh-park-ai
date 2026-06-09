import type { ParkingZone } from "./types";

function buildSlots(
  zoneId: string,
  rows: number,
  cols: number,
  occupied: string[],
  misParked: string[] = [],
  fireLaneCols: number[] = []
): ParkingZone["slots"] {
  const slots: ParkingZone["slots"] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `${zoneId}-R${r + 1}C${c + 1}`;
      const vehicle = occupied.find((v) => v.endsWith(`@${id}`))?.split("@")[0];
      const isMisParked = misParked.some((v) => v.endsWith(`@${id}`));
      slots.push({
        id,
        row: r,
        col: c,
        status: fireLaneCols.includes(c)
          ? vehicle
            ? "blocked"
            : "free"
          : isMisParked
            ? "mis-parked"
            : vehicle
              ? "occupied"
              : "free",
        vehicleNumber: vehicle,
        isFireLane: fireLaneCols.includes(c),
      });
    }
  }
  return slots;
}

export const INITIAL_ZONES: ParkingZone[] = [
  {
    id: "zone-a",
    name: "Sangam North Lot",
    nameHindi: "संगम उत्तर पार्किंग",
    destination: "Sangam Ghat",
    rows: 4,
    cols: 6,
    shuttleStop: "Gate 1 Shuttle Bay",
    walkMinutesToGhat: 12,
    slots: buildSlots("zone-a", 4, 6, [], [], [5]),
  },
  {
    id: "zone-b",
    name: "Arail Riverside Lot",
    nameHindi: "अरैल तट पार्किंग",
    destination: "Arail Ghat",
    rows: 3,
    cols: 8,
    shuttleStop: "Arail Shuttle Point B",
    walkMinutesToGhat: 8,
    slots: buildSlots("zone-b", 3, 8, [], [], [7]),
  },
  {
    id: "zone-c",
    name: "Jhusi Main Hub",
    nameHindi: "झूसी मुख्य हब",
    destination: "Jhusi Parking Hub",
    rows: 5,
    cols: 5,
    shuttleStop: "Jhusi Central Shuttle",
    walkMinutesToGhat: 15,
    slots: buildSlots("zone-c", 5, 5, [], [], [4]),
  },
  {
    id: "zone-d",
    name: "Main Ghat Parking",
    nameHindi: "मुख्य घाट पार्किंग",
    destination: "Main Ghat",
    rows: 4,
    cols: 6,
    shuttleStop: "Main Ghat Shuttle Bay",
    walkMinutesToGhat: 5,
    slots: buildSlots("zone-d", 4, 6, [], [], [5]),
  },
];

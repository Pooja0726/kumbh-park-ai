export type SlotStatus = "free" | "occupied" | "mis-parked" | "blocked";

export type ViolationType =
  | "mis-parked"
  | "blocking-aisle"
  | "double-parking"
  | "fire-lane";

export type AlertTier = "sms" | "call" | "marshal";

export type Destination =
  | "Sangam Ghat"
  | "Main Ghat"
  | "Arail Ghat"
  | "Jhusi Parking Hub";

export interface ParkingSlot {
  id: string;
  row: number;
  col: number;
  status: SlotStatus;
  vehicleNumber?: string;
  isFireLane?: boolean;
}

export interface ParkingZone {
  id: string;
  name: string;
  nameHindi: string;
  destination: Destination;
  rows: number;
  cols: number;
  slots: ParkingSlot[];
  shuttleStop: string;
  walkMinutesToGhat: number;
}

export interface VehicleRegistration {
  id: string;
  vehicleNumber: string;
  phone: string;
  destination: Destination;
  zoneId: string;
  slotId: string;
  language: "hi" | "en";
  registeredAt: string;
  passCode: string;
}

export interface Violation {
  id: string;
  vehicleNumber: string;
  phone: string;
  zoneId: string;
  slotId: string;
  type: ViolationType;
  tier: AlertTier;
  message: string;
  messageHindi: string;
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface NotificationLog {
  id: string;
  vehicleNumber: string;
  phone: string;
  channel: "sms" | "whatsapp" | "call" | "marshal";
  message: string;
  sentAt: string;
  status: "sent" | "delivered" | "failed";
}

export interface DashboardStats {
  totalSlots: number;
  occupiedSlots: number;
  freeSlots: number;
  misParkedSlots: number;
  activeViolations: number;
  occupancyPercent: number;
}

import { addHours, subMinutes } from "date-fns";
import { TicketData } from "../ticket-detail";

export type MockSlot = {
  id: string;
  label: string;
  status: "available" | "occupied" | "reserved";
  ticket?: TicketData;
};

export type MockZone = {
  id: string;
  name: string;
  priceHour: number;
  priceDay: number;
  slots: MockSlot[];
};

export type MockGate = {
  id: string;
  name: string;
  type: "in" | "out" | "both";
  position: "top" | "bottom" | "left" | "right";
};

export type MockFloor = {
  id: string;
  name: string;
  gates: MockGate[];
  zones: MockZone[];
};

export const getMockTicket = (label: string, status: "occupied" | "reserved"): TicketData => {
  const now = new Date();
  const startOffset = status === "occupied" ? Math.floor(Math.random() * 180) + 30 : 0;
  const duration = Math.floor(Math.random() * 3) + 2;
  const startTime = subMinutes(now, startOffset);
  const endTime = addHours(startTime, duration);

  return {
    ticketCode: `TCK-${label}-${Math.floor(Math.random() * 10000)}`,
    customerName: status === "occupied" ? "Nguyen Van A" : "Reserved Client",
    licensePlate: status === "occupied" ? `51F-${Math.floor(Math.random() * 900)}.${Math.floor(Math.random() * 90)}` : "",
    position: label,
    startTime,
    endTime,
    price: 50000 * duration,
  };
};

export const generateMockSlots = (prefix: string, count: number): MockSlot[] => {
  return Array.from({ length: count }).map((_, i) => {
    const label = `${prefix}${i + 1}`;
    const rand = Math.random();
    const status: "available" | "occupied" | "reserved" = rand > 0.7 ? "occupied" : rand > 0.6 ? "reserved" : "available";
    return {
      id: `slot_${label}`,
      label,
      status,
      ticket: status !== "available" ? getMockTicket(label, status) : undefined,
    };
  });
};

export const initialMockFloors: MockFloor[] = [
  {
    id: "f1",
    name: "Tầng hầm B1",
    gates: [{ id: "g1", name: "Cổng vào chính", type: "in", position: "bottom" }, { id: "g2", name: "Lối ra", type: "out", position: "top" }],
    zones: [
      { id: "z1", name: "Khu A VIP", priceHour: 30000, priceDay: 200000, slots: generateMockSlots("A", 15) },
      { id: "z2", name: "Khu B Thường", priceHour: 20000, priceDay: 150000, slots: generateMockSlots("B", 10) },
    ],
  },
  {
    id: "f2",
    name: "Tầng trệt",
    gates: [{ id: "g3", name: "Vào/Ra", type: "both", position: "right" }],
    zones: [
      { id: "z3", name: "Khu C Ngoài trời", priceHour: 15000, priceDay: 120000, slots: generateMockSlots("C", 30) },
    ],
  },
];

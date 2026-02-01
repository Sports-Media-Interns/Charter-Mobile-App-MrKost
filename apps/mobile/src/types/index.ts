export * from "./database";
export * from "./crm";

export interface Airport {
  code: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface AircraftOption {
  type: string;
  category: "light" | "midsize" | "super_midsize" | "heavy" | "ultra_long_range";
  passengerCapacity: number;
  range: number;
  speed: number;
  imageUrl?: string;
}

export interface TripSummary {
  id: string;
  status: string;
  tripType: string;
  passengerCount: number;
  legs: LegSummary[];
  createdAt: Date;
}

export interface LegSummary {
  legNumber: number;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string;
}

export interface QuoteSummary {
  id: string;
  operatorName: string;
  aircraftType: string;
  totalPrice: number;
  safetyRating: string | null;
  validUntil: Date;
  status: string;
}

export interface BookingSummary {
  id: string;
  confirmationNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  departureDate: string;
  route: string;
}

export type RootStackParamList = {
  "(auth)": undefined;
  "(tabs)": undefined;
  "request/[id]": { id: string };
  "quote/[id]": { id: string };
  "booking/[id]": { id: string };
};

export const AIRCRAFT_CATEGORIES = [
  { key: "light", label: "Light Jet", passengers: "4-7", range: "1,500 nm" },
  { key: "midsize", label: "Midsize Jet", passengers: "7-9", range: "2,500 nm" },
  { key: "super_midsize", label: "Super Midsize", passengers: "8-10", range: "3,500 nm" },
  { key: "heavy", label: "Heavy Jet", passengers: "10-16", range: "4,500 nm" },
  { key: "ultra_long_range", label: "Ultra Long Range", passengers: "12-19", range: "7,500 nm" },
] as const;

export const REQUEST_STATUSES = [
  { key: "draft", label: "Draft", color: "#9CA3AF" },
  { key: "submitted", label: "Submitted", color: "#1E3A5F" },
  { key: "quoting", label: "Quoting", color: "#F59E0B" },
  { key: "quoted", label: "Quoted", color: "#1E3A5F" },
  { key: "approved", label: "Approved", color: "#22C55E" },
  { key: "booked", label: "Booked", color: "#22C55E" },
  { key: "completed", label: "Completed", color: "#6B7280" },
  { key: "cancelled", label: "Cancelled", color: "#EF4444" },
] as const;

export const BOOKING_STATUSES = [
  { key: "confirmed", label: "Confirmed", color: "#22C55E" },
  { key: "in_progress", label: "In Progress", color: "#1E3A5F" },
  { key: "completed", label: "Completed", color: "#6B7280" },
  { key: "cancelled", label: "Cancelled", color: "#EF4444" },
] as const;

export const PAYMENT_STATUSES = [
  { key: "pending", label: "Pending", color: "#EF4444" },
  { key: "partial", label: "Partial", color: "#F59E0B" },
  { key: "paid", label: "Paid", color: "#22C55E" },
  { key: "refunded", label: "Refunded", color: "#6B7280" },
] as const;

export const TRIP_TYPES = [
  { key: "one_way", label: "One Way" },
  { key: "round_trip", label: "Round Trip" },
  { key: "multi_leg", label: "Multi-Leg" },
] as const;

export const URGENCY_LEVELS = [
  { key: "standard", label: "Standard", responseTime: "48-72 hours" },
  { key: "urgent", label: "Urgent", responseTime: "24 hours" },
  { key: "emergency", label: "Emergency", responseTime: "4 hours" },
] as const;

export const SAFETY_RATINGS = [
  { key: "argus_gold", label: "ARGUS Gold", icon: "shield-checkmark" },
  { key: "argus_platinum", label: "ARGUS Platinum", icon: "shield-checkmark" },
  { key: "wyvern_wingman", label: "Wyvern Wingman", icon: "shield-checkmark" },
  { key: "is_bao", label: "IS-BAO Stage 3", icon: "shield-checkmark" },
] as const;

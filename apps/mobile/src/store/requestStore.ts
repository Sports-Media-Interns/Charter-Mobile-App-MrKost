import { create } from "zustand";
import { Tables } from "@/types/database";

interface FlightLeg {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string;
  flexibilityHours: number;
}

interface RequestDraft {
  tripType: "one_way" | "round_trip" | "multi_leg";
  passengerCount: number;
  baggageNotes: string;
  specialRequirements: string;
  urgency: "standard" | "urgent" | "emergency";
  legs: FlightLeg[];
}

interface RequestState {
  draft: RequestDraft;
  currentStep: number;
  requests: Tables<"charter_requests">[];
  setDraft: (draft: Partial<RequestDraft>) => void;
  addLeg: (leg: FlightLeg) => void;
  updateLeg: (index: number, leg: Partial<FlightLeg>) => void;
  removeLeg: (index: number) => void;
  setStep: (step: number) => void;
  resetDraft: () => void;
  setRequests: (requests: Tables<"charter_requests">[]) => void;
}

const initialDraft: RequestDraft = {
  tripType: "round_trip",
  passengerCount: 1,
  baggageNotes: "",
  specialRequirements: "",
  urgency: "standard",
  legs: [
    {
      departureAirport: "",
      arrivalAirport: "",
      departureDate: "",
      departureTime: "",
      flexibilityHours: 2,
    },
  ],
};

export const useRequestStore = create<RequestState>((set) => ({
  draft: initialDraft,
  currentStep: 0,
  requests: [],
  setDraft: (updates) =>
    set((state) => ({
      draft: { ...state.draft, ...updates },
    })),
  addLeg: (leg) =>
    set((state) => ({
      draft: { ...state.draft, legs: [...state.draft.legs, leg] },
    })),
  updateLeg: (index, updates) =>
    set((state) => ({
      draft: {
        ...state.draft,
        legs: state.draft.legs.map((leg, i) =>
          i === index ? { ...leg, ...updates } : leg
        ),
      },
    })),
  removeLeg: (index) =>
    set((state) => ({
      draft: {
        ...state.draft,
        legs: state.draft.legs.filter((_, i) => i !== index),
      },
    })),
  setStep: (currentStep) => set({ currentStep }),
  resetDraft: () => set({ draft: initialDraft, currentStep: 0 }),
  setRequests: (requests) => set({ requests }),
}));

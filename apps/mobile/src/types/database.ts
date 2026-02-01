export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: "team_admin" | "travel_coordinator" | "league_admin" | "broker" | "support";
          organization_id: string | null;
          avatar_url: string | null;
          biometric_enabled: boolean;
          push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          type: "team" | "league" | "broker";
          logo_url: string | null;
          sport: string | null;
          league_id: string | null;
          home_airport: string | null;
          billing_address: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["organizations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      charter_requests: {
        Row: {
          id: string;
          organization_id: string;
          requester_id: string;
          status: "draft" | "submitted" | "quoting" | "quoted" | "approved" | "booked" | "completed" | "cancelled";
          trip_type: "one_way" | "round_trip" | "multi_leg";
          passenger_count: number;
          baggage_notes: string | null;
          special_requirements: string | null;
          urgency: "standard" | "urgent" | "emergency";
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["charter_requests"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["charter_requests"]["Insert"]>;
      };
      flight_legs: {
        Row: {
          id: string;
          request_id: string;
          leg_number: number;
          departure_airport: string;
          arrival_airport: string;
          departure_date: string;
          departure_time: string;
          flexibility_hours: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["flight_legs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["flight_legs"]["Insert"]>;
      };
      quotes: {
        Row: {
          id: string;
          request_id: string;
          broker_id: string;
          operator_name: string;
          aircraft_type: string;
          aircraft_category: string;
          tail_number: string | null;
          base_price: number;
          taxes_fees: number;
          total_price: number;
          valid_until: string;
          safety_rating: string | null;
          amenities: string[] | null;
          notes: string | null;
          status: "pending" | "presented" | "accepted" | "rejected" | "expired";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quotes"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["quotes"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          quote_id: string;
          request_id: string;
          organization_id: string;
          status: "confirmed" | "in_progress" | "completed" | "cancelled";
          confirmation_number: string;
          payment_status: "pending" | "partial" | "paid" | "refunded";
          total_amount: number;
          amount_paid: number;
          manifest_submitted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      passengers: {
        Row: {
          id: string;
          booking_id: string;
          full_name: string;
          date_of_birth: string | null;
          gender: string | null;
          weight_lbs: number | null;
          seat_preference: string | null;
          dietary_restrictions: string | null;
          emergency_contact: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["passengers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["passengers"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          request_id: string;
          sender_id: string;
          content: string;
          attachments: string[] | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

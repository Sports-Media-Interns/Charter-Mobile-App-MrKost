import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store";

export function useBookings() {
  const { profile } = useAuthStore();

  return useQuery({
    queryKey: ["bookings", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          confirmation_number,
          status,
          payment_status,
          total_amount,
          created_at,
          quote:quotes (
            aircraft_type,
            operator_name
          ),
          request:charter_requests (
            trip_type,
            passenger_count,
            flight_legs (
              leg_number,
              departure_airport,
              arrival_airport,
              departure_date,
              departure_time
            )
          )
        `
        )
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          quote:quotes (
            aircraft_type,
            aircraft_category,
            operator_name,
            tail_number,
            safety_rating,
            amenities
          ),
          request:charter_requests (
            trip_type,
            passenger_count,
            baggage_notes,
            special_requirements,
            flight_legs (*)
          ),
          passengers (*)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useUpcomingBookings() {
  const { profile } = useAuthStore();

  return useQuery({
    queryKey: ["bookings", "upcoming", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          confirmation_number,
          status,
          request:charter_requests (
            flight_legs (
              departure_airport,
              arrival_airport,
              departure_date
            )
          )
        `
        )
        .eq("organization_id", profile.organization_id)
        .in("status", ["confirmed", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

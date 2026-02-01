import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store";
import { CRMService } from "@/services/crm";
import { getCRMConfig } from "@/config/crm";
import { logger } from "@/utils/logger";

export function useRequests() {
  const { profile } = useAuthStore();

  return useQuery({
    queryKey: ["requests", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("charter_requests")
        .select(
          `
          id,
          status,
          trip_type,
          passenger_count,
          urgency,
          created_at,
          flight_legs (
            leg_number,
            departure_airport,
            arrival_airport,
            departure_date,
            departure_time
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

export function useRequest(id: string) {
  return useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("charter_requests")
        .select(
          `
          *,
          flight_legs (*),
          quotes (
            id,
            operator_name,
            aircraft_type,
            total_price,
            safety_rating,
            valid_until,
            status
          ),
          requester:users!requester_id (
            full_name,
            email
          )
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

export function useCreateRequest() {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();

  return useMutation({
    mutationFn: async (data: {
      tripType: string;
      passengerCount: number;
      baggageNotes?: string;
      specialRequirements?: string;
      urgency: string;
      legs: Array<{
        departureAirport: string;
        arrivalAirport: string;
        departureDate: string;
        departureTime: string;
        flexibilityHours: number;
      }>;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization found");

      const { data: request, error: requestError } = await supabase
        .from("charter_requests")
        .insert({
          organization_id: profile.organization_id,
          requester_id: profile.id,
          status: "submitted",
          trip_type: data.tripType,
          passenger_count: data.passengerCount,
          baggage_notes: data.baggageNotes || null,
          special_requirements: data.specialRequirements || null,
          urgency: data.urgency,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (requestError) throw requestError;

      const legs = data.legs.map((leg, index) => ({
        request_id: request.id,
        leg_number: index + 1,
        departure_airport: leg.departureAirport.toUpperCase(),
        arrival_airport: leg.arrivalAirport.toUpperCase(),
        departure_date: leg.departureDate,
        departure_time: leg.departureTime,
        flexibility_hours: leg.flexibilityHours,
      }));

      const { error: legsError } = await supabase.from("flight_legs").insert(legs);

      if (legsError) throw legsError;

      return request;
    },
    onSuccess: async (request, variables) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });

      // Track request creation and create CRM opportunity
      if (getCRMConfig().enabled && CRMService.isInitialized()) {
        try {
          const service = CRMService.getInstance();
          await service.trackEvent("request_submitted", {
            properties: {
              requestId: request.id,
              tripType: variables.tripType,
              passengerCount: variables.passengerCount,
              urgency: variables.urgency,
              legCount: variables.legs.length,
            },
          });

          // Create opportunity in CRM
          await service.createRequestOpportunity({
            id: request.id,
            trip_type: variables.tripType,
            passenger_count: variables.passengerCount,
            urgency: variables.urgency,
            status: "submitted",
            special_requirements: variables.specialRequirements,
          });
        } catch (error) {
          logger.warn("Failed to track request in CRM:", error);
        }
      }
    },
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("charter_requests")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request", id] });
    },
  });
}

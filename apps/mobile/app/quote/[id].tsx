import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store";
import { useCRMTracker } from "@/hooks/useCRMTracker";

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const { trackEvent, trackButtonClick } = useCRMTracker();

  const { data: quote } = useQuery({
    queryKey: ["quote", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select(
          `
          *,
          request:charter_requests (
            id,
            trip_type,
            passenger_count,
            organization_id,
            flight_legs (*)
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

  // Track quote viewed
  useEffect(() => {
    if (quote) {
      trackEvent("quote_viewed", {
        properties: {
          quoteId: id,
          operator: quote.operator_name,
          price: quote.total_price,
          aircraftType: quote.aircraft_type,
        },
      });
    }
  }, [quote?.id]);

  const acceptMutation = useMutation({
    mutationFn: async () => {
      // Update quote status
      await supabase.from("quotes").update({ status: "accepted" }).eq("id", id);

      // Update request status
      await supabase
        .from("charter_requests")
        .update({ status: "approved" })
        .eq("id", quote?.request_id);

      // Create booking
      const confirmationNumber = `TJ${Date.now().toString(36).toUpperCase()}`;
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          quote_id: id,
          request_id: quote?.request_id,
          organization_id: quote?.request?.organization_id,
          status: "confirmed",
          confirmation_number: confirmationNumber,
          payment_status: "pending",
          total_amount: quote?.total_price,
          amount_paid: 0,
          manifest_submitted: false,
        })
        .select()
        .single();

      if (error) throw error;
      return booking;
    },
    onSuccess: (booking) => {
      trackEvent("quote_accepted", {
        properties: {
          quoteId: id,
          bookingId: booking.id,
          operator: quote?.operator_name,
          price: quote?.total_price,
        },
      });
      trackEvent("booking_created", {
        properties: {
          bookingId: booking.id,
          confirmationNumber: booking.confirmation_number,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      Alert.alert("Quote Accepted", "Your booking has been confirmed.", [
        { text: "View Booking", onPress: () => router.replace(`/booking/${booking.id}`) },
      ]);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleAcceptQuote = () => {
    trackButtonClick("accept_quote_button");
    Alert.alert(
      "Accept Quote",
      `Accept this quote for $${quote?.total_price.toLocaleString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => acceptMutation.mutate(),
        },
      ]
    );
  };

  if (!quote) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-neutral-500">Loading...</Text>
      </View>
    );
  }

  const isExpired = new Date(quote.valid_until) < new Date();
  const canAccept = quote.status === "pending" && !isExpired;

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Aircraft Header */}
        <View className="bg-primary-500 px-6 py-8">
          <Text className="text-primary-100 text-sm">Aircraft</Text>
          <Text className="text-white text-2xl font-bold">{quote.aircraft_type}</Text>
          <Text className="text-primary-100 mt-1">{quote.operator_name}</Text>
          {quote.tail_number && (
            <Text className="text-primary-200 text-sm mt-2">
              Tail: {quote.tail_number}
            </Text>
          )}
        </View>

        {/* Price Card */}
        <View className="bg-white mx-4 -mt-4 rounded-xl p-6 shadow-lg">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-neutral-500">Total Price</Text>
              <Text className="text-3xl font-bold text-primary-500">
                ${quote.total_price.toLocaleString()}
              </Text>
            </View>
            {quote.safety_rating && (
              <View className="items-end">
                <View className="flex-row items-center bg-success/10 px-3 py-2 rounded-lg">
                  <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
                  <Text className="text-success font-semibold ml-2">
                    {quote.safety_rating}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View className="flex-row mt-4 pt-4 border-t border-neutral-100">
            <View className="flex-1">
              <Text className="text-xs text-neutral-400">BASE PRICE</Text>
              <Text className="text-neutral-800 font-medium">
                ${quote.base_price.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-neutral-400">TAXES & FEES</Text>
              <Text className="text-neutral-800 font-medium">
                ${quote.taxes_fees.toLocaleString()}
              </Text>
            </View>
          </View>

          {isExpired && (
            <View className="mt-4 bg-error/10 px-4 py-3 rounded-lg flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="text-error ml-2">This quote has expired</Text>
            </View>
          )}

          {!isExpired && quote.status === "pending" && (
            <View className="mt-4 bg-warning/10 px-4 py-3 rounded-lg flex-row items-center">
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text className="text-warning ml-2">
                Valid until {new Date(quote.valid_until).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Aircraft Details */}
        <View className="px-4 pt-6">
          <Text className="text-lg font-semibold text-neutral-800 mb-4">
            Aircraft Details
          </Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row mb-4">
              <View className="flex-1">
                <Text className="text-xs text-neutral-400">CATEGORY</Text>
                <Text className="text-neutral-800 font-medium capitalize">
                  {quote.aircraft_category?.replace("_", " ") ?? "N/A"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-neutral-400">OPERATOR</Text>
                <Text className="text-neutral-800 font-medium">
                  {quote.operator_name}
                </Text>
              </View>
            </View>

            {quote.amenities && quote.amenities.length > 0 && (
              <View className="pt-4 border-t border-neutral-100">
                <Text className="text-xs text-neutral-400 mb-2">AMENITIES</Text>
                <View className="flex-row flex-wrap">
                  {quote.amenities.map((amenity: string, index: number) => (
                    <View
                      key={index}
                      className="bg-neutral-100 px-3 py-1 rounded-full mr-2 mb-2"
                    >
                      <Text className="text-neutral-600 text-sm">{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Flight Summary */}
        {quote.request?.flight_legs && (
          <View className="px-4 pt-6">
            <Text className="text-lg font-semibold text-neutral-800 mb-4">
              Flight Summary
            </Text>
            {quote.request.flight_legs.map((leg: any, index: number) => (
              <View key={leg.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                <View className="flex-row items-center">
                  <Text className="text-lg font-bold text-primary-500">
                    {leg.departure_airport}
                  </Text>
                  <Ionicons
                    name="airplane"
                    size={18}
                    color="#9CA3AF"
                    style={{ marginHorizontal: 8 }}
                  />
                  <Text className="text-lg font-bold text-primary-500">
                    {leg.arrival_airport}
                  </Text>
                  <Text className="text-neutral-400 ml-auto">
                    {new Date(leg.departure_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {quote.notes && (
          <View className="px-4 pt-6">
            <Text className="text-lg font-semibold text-neutral-800 mb-4">
              Additional Notes
            </Text>
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-neutral-700">{quote.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Accept Button */}
      {canAccept && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-6 py-4 pb-8">
          <TouchableOpacity
            className={`h-14 rounded-xl items-center justify-center ${
              acceptMutation.isPending ? "bg-primary-300" : "bg-primary-500"
            }`}
            onPress={handleAcceptQuote}
            disabled={acceptMutation.isPending}
          >
            <Text className="text-white font-semibold text-lg">
              {acceptMutation.isPending ? "Processing..." : "Accept Quote"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

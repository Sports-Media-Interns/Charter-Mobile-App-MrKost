import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useState, useCallback } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: request, refetch } = useQuery({
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return { bg: "bg-neutral-100", text: "text-neutral-600" };
      case "submitted":
        return { bg: "bg-primary-100", text: "text-primary-600" };
      case "quoting":
        return { bg: "bg-warning/20", text: "text-warning" };
      case "quoted":
        return { bg: "bg-primary-500", text: "text-white" };
      case "approved":
      case "booked":
        return { bg: "bg-success", text: "text-white" };
      case "cancelled":
        return { bg: "bg-error", text: "text-white" };
      default:
        return { bg: "bg-neutral-100", text: "text-neutral-600" };
    }
  };

  const handleCancelRequest = () => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            await supabase
              .from("charter_requests")
              .update({ status: "cancelled" })
              .eq("id", id);
            refetch();
          },
        },
      ]
    );
  };

  if (!request) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-neutral-500">Loading...</Text>
      </View>
    );
  }

  const statusColors = getStatusColor(request.status);
  const pendingQuotes = request.quotes?.filter((q: any) => q.status === "pending") ?? [];

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Banner */}
        <View className={`px-6 py-4 ${statusColors.bg}`}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className={`text-sm ${statusColors.text}`}>Status</Text>
              <Text className={`text-xl font-bold capitalize ${statusColors.text}`}>
                {request.status.replace("_", " ")}
              </Text>
            </View>
            {request.urgency === "urgent" && (
              <View className="bg-warning px-3 py-1 rounded-full">
                <Text className="text-white font-medium">URGENT</Text>
              </View>
            )}
          </View>
        </View>

        {/* Flight Legs */}
        <View className="px-4 pt-6">
          <Text className="text-lg font-semibold text-neutral-800 mb-4">
            Flight Details
          </Text>
          {request.flight_legs?.map((leg: any, index: number) => (
            <View key={leg.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <Text className="text-sm text-neutral-500 mb-2">Leg {index + 1}</Text>
              <View className="flex-row items-center justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary-500">
                    {leg.departure_airport}
                  </Text>
                  <Text className="text-neutral-500 text-sm">Departure</Text>
                </View>
                <View className="flex-1 items-center px-4">
                  <Ionicons name="airplane" size={24} color="#1E3A5F" />
                  <View className="w-full h-0.5 bg-neutral-200 mt-2" />
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary-500">
                    {leg.arrival_airport}
                  </Text>
                  <Text className="text-neutral-500 text-sm">Arrival</Text>
                </View>
              </View>
              <View className="flex-row mt-4 pt-3 border-t border-neutral-100">
                <View className="flex-1">
                  <Text className="text-xs text-neutral-400">DATE</Text>
                  <Text className="text-neutral-800 font-medium">
                    {new Date(leg.departure_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-neutral-400">TIME</Text>
                  <Text className="text-neutral-800 font-medium">
                    {leg.departure_time}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-neutral-400">FLEXIBILITY</Text>
                  <Text className="text-neutral-800 font-medium">
                    ±{leg.flexibility_hours}h
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Passenger Info */}
        <View className="px-4 pt-4">
          <Text className="text-lg font-semibold text-neutral-800 mb-4">
            Trip Information
          </Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row mb-4">
              <View className="flex-1">
                <Text className="text-xs text-neutral-400">PASSENGERS</Text>
                <Text className="text-xl font-bold text-neutral-800">
                  {request.passenger_count}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-neutral-400">TRIP TYPE</Text>
                <Text className="text-neutral-800 font-medium capitalize">
                  {request.trip_type.replace("_", " ")}
                </Text>
              </View>
            </View>
            {request.baggage_notes && (
              <View className="mb-3 pt-3 border-t border-neutral-100">
                <Text className="text-xs text-neutral-400">BAGGAGE NOTES</Text>
                <Text className="text-neutral-700">{request.baggage_notes}</Text>
              </View>
            )}
            {request.special_requirements && (
              <View className="pt-3 border-t border-neutral-100">
                <Text className="text-xs text-neutral-400">SPECIAL REQUIREMENTS</Text>
                <Text className="text-neutral-700">{request.special_requirements}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quotes */}
        {pendingQuotes.length > 0 && (
          <View className="px-4 pt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-neutral-800">
                Available Quotes
              </Text>
              <View className="bg-primary-500 px-3 py-1 rounded-full">
                <Text className="text-white font-medium">{pendingQuotes.length}</Text>
              </View>
            </View>
            {pendingQuotes.map((quote: any) => (
              <TouchableOpacity
                key={quote.id}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                onPress={() => router.push(`/quote/${quote.id}`)}
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-lg font-semibold text-neutral-800">
                      {quote.aircraft_type}
                    </Text>
                    <Text className="text-neutral-500">{quote.operator_name}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-primary-500">
                      ${quote.total_price.toLocaleString()}
                    </Text>
                    {quote.safety_rating && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="shield-checkmark" size={14} color="#22C55E" />
                        <Text className="text-success text-sm ml-1">
                          {quote.safety_rating}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                  <Text className="text-neutral-400 text-sm">
                    Valid until{" "}
                    {new Date(quote.valid_until).toLocaleDateString()}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-primary-500 font-medium">View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#1E3A5F" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Actions */}
        {request.status !== "cancelled" && request.status !== "completed" && (
          <View className="px-4 pt-6">
            <TouchableOpacity
              className="py-4 border border-error rounded-xl items-center"
              onPress={handleCancelRequest}
            >
              <Text className="text-error font-medium">Cancel Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

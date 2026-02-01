import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import { useCRMTracker } from "@/hooks/useCRMTracker";
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trackEvent } = useCRMTracker();
  const { isDark } = useTheme();

  const { data: booking } = useQuery({
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

  // Track booking viewed
  useEffect(() => {
    if (booking) {
      trackEvent("booking_viewed", {
        properties: {
          bookingId: id,
          confirmationNumber: booking.confirmation_number,
          status: booking.status,
          paymentStatus: booking.payment_status,
          totalAmount: booking.total_amount,
        },
      });
    }
  }, [booking?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success";
      case "in_progress":
        return "bg-primary-500";
      case "completed":
        return "bg-neutral-500";
      case "cancelled":
        return "bg-error";
      default:
        return "bg-neutral-400";
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return { bg: "bg-success/10", text: "text-success", icon: "checkmark-circle" };
      case "partial":
        return { bg: "bg-warning/10", text: "text-warning", icon: "time" };
      case "pending":
        return { bg: "bg-error/10", text: "text-error", icon: "alert-circle" };
      default:
        return { bg: "bg-neutral-100", text: "text-neutral-500", icon: "help-circle" };
    }
  };

  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-neutral-500">Loading...</Text>
      </View>
    );
  }

  const paymentBadge = getPaymentBadge(booking.payment_status);
  const firstLeg = booking.request?.flight_legs?.[0];

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Confirmation Header */}
        <View className="bg-primary-500 px-6 py-8">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemeToggle />
          </View>
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-primary-100 text-sm">Confirmation Number</Text>
              <Text className="text-white text-2xl font-bold tracking-wider">
                {booking.confirmation_number}
              </Text>
            </View>
            <View className={`px-4 py-2 rounded-full ${getStatusColor(booking.status)}`}>
              <Text className="text-white font-semibold capitalize">
                {booking.status.replace("_", " ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Flight Card */}
        <View className="bg-white mx-4 -mt-4 rounded-xl p-6 shadow-lg">
          <View className="flex-row items-center justify-between">
            <View className="items-center">
              <Text className="text-3xl font-bold text-primary-500">
                {firstLeg?.departure_airport ?? "---"}
              </Text>
              <Text className="text-neutral-500">Departure</Text>
            </View>
            <View className="items-center flex-1 px-4">
              <Ionicons name="airplane" size={28} color="#1E3A5F" />
              <View className="w-full h-0.5 bg-neutral-200 mt-2" />
              <Text className="text-neutral-400 text-sm mt-2">
                {booking.quote?.aircraft_type}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-primary-500">
                {firstLeg?.arrival_airport ?? "---"}
              </Text>
              <Text className="text-neutral-500">Arrival</Text>
            </View>
          </View>

          <View className="flex-row mt-6 pt-4 border-t border-neutral-100">
            <View className="flex-1">
              <Text className="text-xs text-neutral-400">DATE</Text>
              <Text className="text-neutral-800 font-semibold">
                {firstLeg?.departure_date
                  ? new Date(firstLeg.departure_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "TBD"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-neutral-400">TIME</Text>
              <Text className="text-neutral-800 font-semibold">
                {firstLeg?.departure_time ?? "TBD"}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Status */}
        <View className="px-4 pt-6">
          <Text className="text-lg font-semibold text-neutral-800 mb-4">
            Payment
          </Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-neutral-500">Total Amount</Text>
                <Text className="text-2xl font-bold text-neutral-800">
                  ${booking.total_amount.toLocaleString()}
                </Text>
              </View>
              <View className={`flex-row items-center px-4 py-2 rounded-full ${paymentBadge.bg}`}>
                <Ionicons name={paymentBadge.icon as any} size={18} color={paymentBadge.text.replace("text-", "#")} />
                <Text className={`ml-2 font-semibold capitalize ${paymentBadge.text}`}>
                  {booking.payment_status}
                </Text>
              </View>
            </View>

            {booking.amount_paid > 0 && booking.amount_paid < booking.total_amount && (
              <View className="mt-4 pt-4 border-t border-neutral-100">
                <View className="flex-row justify-between">
                  <Text className="text-neutral-500">Amount Paid</Text>
                  <Text className="text-success font-medium">
                    ${booking.amount_paid.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-neutral-500">Remaining</Text>
                  <Text className="text-error font-medium">
                    ${(booking.total_amount - booking.amount_paid).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Aircraft Details */}
        <View className="px-4 pt-6">
          <Text className="text-lg font-semibold text-neutral-800 mb-4">
            Aircraft
          </Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-14 h-14 bg-primary-50 rounded-xl items-center justify-center">
                <Ionicons name="airplane" size={28} color="#1E3A5F" />
              </View>
              <View className="ml-4">
                <Text className="text-lg font-semibold text-neutral-800">
                  {booking.quote?.aircraft_type}
                </Text>
                <Text className="text-neutral-500">
                  {booking.quote?.operator_name}
                </Text>
              </View>
              {booking.quote?.safety_rating && (
                <View className="ml-auto flex-row items-center">
                  <Ionicons name="shield-checkmark" size={18} color="#22C55E" />
                  <Text className="text-success ml-1">{booking.quote.safety_rating}</Text>
                </View>
              )}
            </View>

            {booking.quote?.tail_number && (
              <View className="pt-3 border-t border-neutral-100">
                <Text className="text-xs text-neutral-400">TAIL NUMBER</Text>
                <Text className="text-neutral-800 font-mono">
                  {booking.quote.tail_number}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Passenger Manifest */}
        <View className="px-4 pt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-neutral-800">
              Passengers ({booking.request?.passenger_count ?? 0})
            </Text>
            {!booking.manifest_submitted && (
              <TouchableOpacity className="flex-row items-center">
                <Ionicons name="add-circle" size={20} color="#1E3A5F" />
                <Text className="text-primary-500 font-medium ml-1">Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {booking.passengers && booking.passengers.length > 0 ? (
            booking.passengers.map((passenger: any, index: number) => (
              <View key={passenger.id} className="bg-white rounded-xl p-4 mb-2 shadow-sm flex-row items-center">
                <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                  <Text className="text-primary-500 font-bold">
                    {index + 1}
                  </Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-neutral-800 font-medium">
                    {passenger.full_name}
                  </Text>
                  {passenger.seat_preference && (
                    <Text className="text-neutral-500 text-sm">
                      Seat: {passenger.seat_preference}
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white rounded-xl p-6 items-center shadow-sm">
              <Ionicons name="people-outline" size={40} color="#D1D5DB" />
              <Text className="text-neutral-500 mt-2">No passengers added yet</Text>
              <TouchableOpacity className="mt-4 bg-primary-500 px-6 py-3 rounded-xl">
                <Text className="text-white font-semibold">Add Passengers</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="px-4 pt-6">
          <TouchableOpacity className="bg-white rounded-xl p-4 shadow-sm flex-row items-center mb-3">
            <View className="w-12 h-12 bg-primary-50 rounded-xl items-center justify-center">
              <Ionicons name="chatbubble-outline" size={24} color="#1E3A5F" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-neutral-800 font-medium">Contact Support</Text>
              <Text className="text-neutral-500 text-sm">Get help with your booking</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl p-4 shadow-sm flex-row items-center">
            <View className="w-12 h-12 bg-primary-50 rounded-xl items-center justify-center">
              <Ionicons name="document-outline" size={24} color="#1E3A5F" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-neutral-800 font-medium">View Documents</Text>
              <Text className="text-neutral-500 text-sm">Contracts and receipts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

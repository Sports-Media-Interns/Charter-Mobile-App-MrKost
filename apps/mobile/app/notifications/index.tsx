import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNotifications, useMarkNotificationsRead } from '@/hooks/useNotifications';
import { LoadingSpinner, EmptyState } from '@/components';
import { typography, spacing } from '@/theme';
import { formatDistanceToNow } from 'date-fns';

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  request_submitted: 'paper-plane-outline',
  quote_received: 'pricetag-outline',
  quote_accepted: 'checkmark-circle-outline',
  booking_confirmed: 'airplane-outline',
  payment_received: 'card-outline',
  payment_failed: 'alert-circle-outline',
  booking_cancelled: 'close-circle-outline',
  message_received: 'chatbubble-outline',
  flight_status_update: 'navigate-outline',
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: notifications, isLoading, refetch, isRefetching } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const handlePress = (notification: { id: string; type: string; data: Record<string, string> }) => {
    // Mark as read
    markRead.mutate([notification.id]);

    // Navigate based on type
    const data = notification.data || {};
    if (data.request_id) {
      router.push(`/request/${data.request_id}`);
    } else if (data.booking_id) {
      router.push(`/booking/${data.booking_id}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading notifications..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing[6],
          paddingVertical: spacing[4],
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginLeft: spacing[4],
          }}
        >
          Notifications
        </Text>
        <ThemeToggle color={colors.text.primary} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing[4] }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications"
            description="You're all caught up!"
          />
        }
        renderItem={({ item }) => {
          const isUnread = !item.read_at;
          const iconName = ICON_MAP[item.type] || 'notifications-outline';

          return (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                padding: spacing[4],
                paddingHorizontal: spacing[6],
                backgroundColor: isUnread ? colors.primary[50] : 'transparent',
                borderBottomWidth: 1,
                borderBottomColor: colors.border.light,
              }}
              onPress={() => handlePress(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}: ${item.body}`}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isUnread ? colors.primary[100] : colors.neutral[100],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing[3],
                }}
              >
                <Ionicons
                  name={iconName}
                  size={20}
                  color={isUnread ? colors.primary[500] : colors.neutral[500]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: isUnread ? typography.fontWeight.semibold : typography.fontWeight.regular,
                    color: colors.text.primary,
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    marginTop: 2,
                  }}
                  numberOfLines={2}
                >
                  {item.body}
                </Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    marginTop: spacing[1],
                  }}
                >
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </Text>
              </View>
              {isUnread && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.primary[500],
                    alignSelf: 'center',
                  }}
                />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

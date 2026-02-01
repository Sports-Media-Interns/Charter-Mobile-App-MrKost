import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from './Badge';
import { colors as staticColors, borderRadius, typography, spacing, shadows } from '@/theme';
import { useTheme } from '@/providers/ThemeProvider';

interface FlightCardProps {
  departure: string;
  arrival: string;
  date: string;
  time?: string;
  passengers?: number;
  status?: string;
  aircraft?: string;
  price?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export function FlightCard({
  departure,
  arrival,
  date,
  time,
  passengers,
  status,
  aircraft,
  price,
  onPress,
  style,
}: FlightCardProps) {
  const { colors } = useTheme();
  const Content = () => (
    <>
      {/* Route Display */}
      <View style={styles.routeContainer}>
        <View style={styles.routeSection}>
          <View style={styles.airportBox}>
            <Text style={styles.airportCode}>{departure}</Text>
          </View>
          <View style={styles.routeLine}>
            <View style={styles.routeLineInner} />
            <View style={styles.planeIcon}>
              <Ionicons name="airplane" size={18} color={colors.primary[500]} />
            </View>
            <View style={styles.routeLineInner} />
          </View>
          <View style={styles.airportBox}>
            <Text style={styles.airportCode}>{arrival}</Text>
          </View>
        </View>
        {status && (
          <View style={styles.statusContainer}>
            <StatusBadge status={status} size="sm" />
          </View>
        )}
      </View>

      {/* Flight Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.neutral[500]} />
          <Text style={styles.detailText}>{date}</Text>
        </View>
        {time && (
          <>
            <View style={styles.detailDot} />
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={colors.neutral[500]} />
              <Text style={styles.detailText}>{time}</Text>
            </View>
          </>
        )}
        {passengers && (
          <>
            <View style={styles.detailDot} />
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={colors.neutral[500]} />
              <Text style={styles.detailText}>{passengers} pax</Text>
            </View>
          </>
        )}
      </View>

      {/* Aircraft and Price */}
      {(aircraft || price) && (
        <View style={styles.bottomRow}>
          {aircraft && (
            <View style={styles.aircraftContainer}>
              <Ionicons name="airplane-outline" size={14} color={colors.neutral[400]} />
              <Text style={styles.aircraftText}>{aircraft}</Text>
            </View>
          )}
          {price && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Est.</Text>
              <Text style={styles.priceValue}>
                ${price.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.neutral[0] }, style]}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel={`Flight from ${departure} to ${arrival}`}
        accessibilityRole="button"
      >
        <Content />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[0] }, style]}>
      <Content />
    </View>
  );
}

const colors = staticColors;
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    ...shadows.sm,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  routeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  airportBox: {
    alignItems: 'center',
  },
  airportCode: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  routeLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[3],
  },
  routeLineInner: {
    flex: 1,
    height: 2,
    backgroundColor: colors.neutral[200],
  },
  planeIcon: {
    marginHorizontal: spacing[2],
  },
  statusContainer: {
    marginLeft: spacing[4],
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    marginLeft: spacing[2],
  },
  detailDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[300],
    marginHorizontal: spacing[3],
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  aircraftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aircraftText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginLeft: spacing[1],
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[400],
    marginRight: spacing[1],
  },
  priceValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary[500],
  },
});

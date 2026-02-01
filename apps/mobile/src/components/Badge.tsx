import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing } from '@/theme';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  outlined?: boolean;
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  icon,
  outlined = false,
  style,
}: BadgeProps) {
  const getBadgeStyle = (): ViewStyle => {
    const base: ViewStyle = {
      ...sizeStyles[size],
      borderRadius: borderRadius.full,
      flexDirection: 'row',
      alignItems: 'center',
    };

    if (outlined) {
      base.backgroundColor = 'transparent';
      base.borderWidth = 1;
      base.borderColor = variantColors[variant].bg;
    } else {
      base.backgroundColor = variantColors[variant].bg;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    return {
      ...textSizes[size],
      fontWeight: typography.fontWeight.medium,
      color: outlined
        ? variantColors[variant].bg
        : variantColors[variant].text,
    };
  };

  const iconSize = iconSizes[size];
  const iconColor = outlined
    ? variantColors[variant].bg
    : variantColors[variant].text;

  return (
    <View style={[getBadgeStyle(), style]}>
      {icon && (
        <Ionicons
          name={icon}
          size={iconSize}
          color={iconColor}
          style={styles.icon}
        />
      )}
      <Text style={getTextStyle()}>{label}</Text>
    </View>
  );
}

// Status-specific badges for common use cases
export function StatusBadge({
  status,
  size = 'md',
}: {
  status: string;
  size?: BadgeSize;
}) {
  const statusConfig: Record<string, { variant: BadgeVariant; label: string; icon: keyof typeof Ionicons.glyphMap }> = {
    draft: { variant: 'default', label: 'Draft', icon: 'document-outline' },
    submitted: { variant: 'info', label: 'Submitted', icon: 'paper-plane-outline' },
    quoting: { variant: 'warning', label: 'Quoting', icon: 'time-outline' },
    quoted: { variant: 'primary', label: 'Quoted', icon: 'pricetag-outline' },
    approved: { variant: 'success', label: 'Approved', icon: 'checkmark-circle-outline' },
    booked: { variant: 'success', label: 'Booked', icon: 'airplane-outline' },
    completed: { variant: 'secondary', label: 'Completed', icon: 'checkmark-done-outline' },
    cancelled: { variant: 'error', label: 'Cancelled', icon: 'close-circle-outline' },
    pending: { variant: 'warning', label: 'Pending', icon: 'hourglass-outline' },
    confirmed: { variant: 'success', label: 'Confirmed', icon: 'shield-checkmark-outline' },
    in_progress: { variant: 'info', label: 'In Progress', icon: 'sync-outline' },
  };

  const config = statusConfig[status] || {
    variant: 'default' as BadgeVariant,
    label: status,
    icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
  };

  return (
    <Badge
      label={config.label}
      variant={config.variant}
      icon={config.icon}
      size={size}
    />
  );
}

const sizeStyles: Record<BadgeSize, ViewStyle> = {
  sm: { paddingHorizontal: spacing[2], paddingVertical: spacing[1] },
  md: { paddingHorizontal: spacing[3], paddingVertical: spacing[1] + 2 },
  lg: { paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
};

const textSizes: Record<BadgeSize, TextStyle> = {
  sm: { fontSize: typography.fontSize.xs },
  md: { fontSize: typography.fontSize.sm },
  lg: { fontSize: typography.fontSize.base },
};

const iconSizes: Record<BadgeSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.neutral[200], text: colors.neutral[700] },
  primary: { bg: colors.primary[100], text: colors.primary[500] },
  secondary: { bg: colors.secondary[100], text: colors.secondary[700] },
  success: { bg: colors.accent[100], text: colors.accent[700] },
  warning: { bg: '#FEF3C7', text: '#92400E' },
  error: { bg: '#FEE2E2', text: '#B91C1C' },
  info: { bg: '#DBEAFE', text: '#1D4ED8' },
};

const styles = StyleSheet.create({
  icon: {
    marginRight: spacing[1],
  },
});

import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { borderRadius, typography } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: colors.primary[500] },
    secondary: { backgroundColor: colors.neutral[100] },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary[500],
    },
    ghost: { backgroundColor: 'transparent' },
    gold: { backgroundColor: colors.secondary[500] },
    danger: { backgroundColor: colors.error },
  };

  const textColors: Record<string, string> = {
    primary: colors.neutral[0],
    secondary: colors.neutral[700],
    outline: colors.primary[500],
    ghost: colors.primary[500],
    gold: colors.neutral[900],
    danger: colors.neutral[0],
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...sizeStyles[size],
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    const vs = variantStyles[variant];
    if (isDisabled) {
      return { ...baseStyle, ...vs, opacity: 0.5 };
    }

    return { ...baseStyle, ...vs };
  };

  const getTextStyle = (): TextStyle => {
    return {
      ...textSizeStyles[size],
      fontWeight: typography.fontWeight.semibold,
      color: textColors[variant],
    };
  };

  const iconColor = textColors[variant];
  const iconSizeValue = iconSizes[size];

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSizeValue}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSizeValue}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const sizeStyles: Record<string, ViewStyle> = {
  sm: { height: 40, paddingHorizontal: 16 },
  md: { height: 48, paddingHorizontal: 24 },
  lg: { height: 56, paddingHorizontal: 32 },
};

const textSizeStyles: Record<string, TextStyle> = {
  sm: { fontSize: typography.fontSize.sm },
  md: { fontSize: typography.fontSize.base },
  lg: { fontSize: typography.fontSize.lg },
};

const iconSizes: Record<string, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

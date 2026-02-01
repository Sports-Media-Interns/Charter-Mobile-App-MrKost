import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { borderRadius, shadows, spacing } from '@/theme';
import { useTheme } from '@/providers/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
  onPress,
}: CardProps) {
  const { colors } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: colors.neutral[0],
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
    };

    // Apply variant styles
    switch (variant) {
      case 'elevated':
        Object.assign(base, shadows.lg);
        break;
      case 'outlined':
        base.borderWidth = 1;
        base.borderColor = colors.border.light;
        break;
      case 'filled':
        base.backgroundColor = colors.neutral[50];
        break;
      default:
        Object.assign(base, shadows.sm);
    }

    // Apply padding
    switch (padding) {
      case 'none':
        base.padding = 0;
        break;
      case 'sm':
        base.padding = spacing[3];
        break;
      case 'md':
        base.padding = spacing[4];
        break;
      case 'lg':
        base.padding = spacing[6];
        break;
    }

    return base;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
}

// Sub-components for structured cards
export function CardHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return <View style={[styles.header, { borderBottomColor: colors.border.light }, style]}>{children}</View>;
}

export function CardBody({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.body, style]}>{children}</View>;
}

export function CardFooter({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return <View style={[styles.footer, { borderTopColor: colors.border.light }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    marginBottom: spacing[3],
  },
  body: {
    flex: 1,
  },
  footer: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    marginTop: spacing[3],
  },
});

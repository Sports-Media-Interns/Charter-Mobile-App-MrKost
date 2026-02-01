import { useRef, useEffect } from 'react';
import { View, ActivityIndicator, Text, ViewStyle, Animated } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { typography, spacing } from '@/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = 'large',
  message,
  fullScreen = false,
  color,
  style,
}: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const spinnerColor = color || colors.primary[500];

  if (fullScreen) {
    return (
      <View
        style={[
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background.primary,
          },
          style,
        ]}
      >
        <View style={{ alignItems: 'center' }}>
          <ActivityIndicator size={size} color={spinnerColor} />
          {message && (
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginTop: spacing[4],
              }}
            >
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[8] },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <Text
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginTop: spacing[4],
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

// Skeleton loading placeholder
export function SkeletonLoader({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width || '100%',
          height: height || 20,
          borderRadius,
          backgroundColor: colors.neutral[200],
        },
        { opacity },
        style,
      ]}
    />
  );
}

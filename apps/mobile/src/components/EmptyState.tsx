import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { useTheme } from '@/providers/ThemeProvider';
import { typography, spacing } from '@/theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        { alignItems: 'center', paddingVertical: spacing[16], paddingHorizontal: spacing[8] },
        style,
      ]}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.neutral[100],
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing[4],
        }}
      >
        <Ionicons name={icon} size={40} color={colors.neutral[400]} />
      </View>
      <Text
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            textAlign: 'center',
            marginTop: spacing[2],
            lineHeight: 20,
          }}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing[6] }}>
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            fullWidth={false}
            icon="add-circle-outline"
          />
        </View>
      )}
    </View>
  );
}

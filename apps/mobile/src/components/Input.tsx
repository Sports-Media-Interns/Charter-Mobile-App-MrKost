import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { borderRadius, typography, spacing } from '@/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
}

export function Input({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputSize = 'md',
  variant = 'default',
  secureTextEntry,
  accessibilityLabel,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry !== undefined;

  const getInputContainerStyle = (): ViewStyle[] => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.neutral[0],
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing[4],
      ...inputSizeStyles[inputSize],
    };

    if (variant === 'filled') {
      base.backgroundColor = colors.neutral[100];
      base.borderWidth = 0;
    } else if (variant === 'outlined') {
      base.backgroundColor = 'transparent';
      base.borderWidth = 2;
    }

    if (isFocused) {
      base.borderColor = colors.primary[500];
      if (variant === 'filled') {
        base.borderWidth = 2;
        base.borderColor = colors.primary[500];
      }
    }

    if (error) {
      base.borderColor = colors.error;
    }

    return [base];
  };

  return (
    <View style={[{ marginBottom: spacing[4] }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          {label}
        </Text>
      )}

      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primary[500] : colors.neutral[400]}
            style={{ marginRight: spacing[2] }}
          />
        )}

        <TextInput
          style={{
            flex: 1,
            fontSize: typography.fontSize.base,
            color: colors.text.primary,
            height: '100%',
            ...(leftIcon ? { marginLeft: spacing[2] } : {}),
            ...(rightIcon || isPassword ? { marginRight: spacing[2] } : {}),
          }}
          placeholderTextColor={colors.neutral[400]}
          onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
          secureTextEntry={isPassword && !showPassword}
          accessibilityLabel={accessibilityLabel || label}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ padding: spacing[1] }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.neutral[400]}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ padding: spacing[1] }}
            disabled={!onRightIconPress}
          >
            <Ionicons name={rightIcon} size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing[1] }}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.error,
              marginLeft: spacing[1],
            }}
            accessibilityRole="alert"
          >
            {error}
          </Text>
        </View>
      )}

      {helper && !error && (
        <Text
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginTop: spacing[1],
          }}
        >
          {helper}
        </Text>
      )}
    </View>
  );
}

const inputSizeStyles: Record<string, ViewStyle> = {
  sm: { height: 40 },
  md: { height: 48 },
  lg: { height: 56 },
};

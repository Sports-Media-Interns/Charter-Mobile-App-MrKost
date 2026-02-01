import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input } from './Input';
import { Ionicons } from '@expo/vector-icons';
import { ViewStyle } from 'react-native';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  helper?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  containerStyle?: ViewStyle;
  inputSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  containerStyle,
  inputSize,
  variant,
  multiline,
  numberOfLines,
  editable,
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          label={label}
          placeholder={placeholder}
          helper={helper}
          error={error?.message}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          onRightIconPress={onRightIconPress}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          containerStyle={containerStyle}
          inputSize={inputSize}
          variant={variant}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
        />
      )}
    />
  );
}

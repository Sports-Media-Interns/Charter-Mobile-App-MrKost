import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  color?: string;
  size?: number;
}

export function ThemeToggle({ color = '#FFFFFF', size = 22 }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggle}
      accessibilityLabel="Toggle dark mode"
      accessibilityRole="button"
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons
        name={isDark ? 'sunny-outline' : 'moon-outline'}
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
}

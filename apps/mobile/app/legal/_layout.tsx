import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function LegalLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background.secondary,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="user-guide" />
    </Stack>
  );
}

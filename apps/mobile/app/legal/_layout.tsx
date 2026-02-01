import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function LegalLayout() {
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

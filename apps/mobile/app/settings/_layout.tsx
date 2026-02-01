import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function SettingsLayout() {
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
      <Stack.Screen name="notifications" />
      <Stack.Screen name="security" />
      <Stack.Screen name="billing" />
      <Stack.Screen name="help" />
      <Stack.Screen name="company" />
      <Stack.Screen name="contacts" />
      <Stack.Screen name="personnel" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}

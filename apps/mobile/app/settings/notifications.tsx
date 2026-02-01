import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card } from '@/components';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const { colors: themeColors, isDark } = useTheme();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Receive notifications on your device',
      enabled: true,
    },
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive updates via email',
      enabled: true,
    },
    {
      id: 'quotes',
      title: 'New Quotes',
      description: 'When new quotes are received for your requests',
      enabled: true,
    },
    {
      id: 'bookings',
      title: 'Booking Updates',
      description: 'Flight confirmations and changes',
      enabled: true,
    },
    {
      id: 'reminders',
      title: 'Flight Reminders',
      description: '24 hours before departure',
      enabled: true,
    },
    {
      id: 'approvals',
      title: 'Approval Requests',
      description: 'When bookings need your approval',
      enabled: true,
    },
    {
      id: 'marketing',
      title: 'Marketing & Promotions',
      description: 'Special offers and updates',
      enabled: false,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background.secondary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.neutral[0], borderBottomColor: themeColors.border.light }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <ThemeToggle color={themeColors.text.primary} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>NOTIFICATION PREFERENCES</Text>
        <Card variant="outlined" padding="none">
          {settings.map((setting, index) => (
            <View
              key={setting.id}
              style={[
                styles.settingItem,
                index < settings.length - 1 && styles.settingItemBorder,
              ]}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: colors.neutral[200], true: colors.primary[200] }}
                thumbColor={setting.enabled ? colors.primary[500] : colors.neutral[400]}
              />
            </View>
          ))}
        </Card>

        <Text style={styles.footerNote}>
          You can change these preferences at any time. Some notifications are required for critical booking updates.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[16],
    paddingBottom: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: 100,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: spacing[3],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing[4],
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  footerNote: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing[6],
    paddingHorizontal: spacing[4],
    lineHeight: 20,
  },
});

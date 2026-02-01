import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface MenuItem {
  icon: IconName;
  label: string;
  subtitle: string;
  route: string;
  color: string;
}

const menuItems: MenuItem[] = [
  {
    icon: 'notifications-outline',
    label: 'Notifications',
    subtitle: 'Manage alerts and preferences',
    route: '/settings/notifications',
    color: colors.primary[500],
  },
  {
    icon: 'shield-checkmark-outline',
    label: 'Security & Privacy',
    subtitle: 'Password, 2FA, and data settings',
    route: '/settings/security',
    color: colors.success[500],
  },
  {
    icon: 'card-outline',
    label: 'Billing & Payments',
    subtitle: 'Invoices, payment methods, history',
    route: '/settings/billing',
    color: colors.secondary[500],
  },
  {
    icon: 'help-circle-outline',
    label: 'Help & Support',
    subtitle: 'User guide, FAQ, contact us',
    route: '/settings/help',
    color: colors.info?.[500] || colors.primary[400],
  },
];

export default function AccountScreen() {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background.primary }]}>
      <View style={[styles.header, { backgroundColor: themeColors.primary[500], paddingTop: insets.top + spacing[2] }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={styles.headerTitle}>Account</Text>
            <Text style={styles.headerSubtitle}>Settings & Preferences</Text>
          </View>
          <ThemeToggle />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Admin: User Management */}
        <TouchableOpacity
          style={[
            styles.adminCard,
            {
              backgroundColor: themeColors.neutral[0],
              borderColor: themeColors.primary[500],
            },
          ]}
          onPress={() => router.push('/settings/admin' as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: themeColors.primary[500] + '15' }]}>
            <Ionicons name="people" size={24} color={themeColors.primary[500]} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuLabel, { color: themeColors.text.primary }]}>
              User Management
            </Text>
            <Text style={[styles.menuSubtitle, { color: themeColors.text.secondary }]}>
              Add, edit, and manage team users
            </Text>
          </View>
          <View style={[styles.adminBadge, { backgroundColor: themeColors.primary[500] }]}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.neutral[400]} />
        </TouchableOpacity>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.menuItem,
              {
                backgroundColor: themeColors.neutral[0],
                borderColor: themeColors.border.light,
              },
            ]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuLabel, { color: themeColors.text.primary }]}>
                {item.label}
              </Text>
              <Text style={[styles.menuSubtitle, { color: themeColors.text.secondary }]}>
                {item.subtitle}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.neutral[400]} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: spacing[6],
    paddingHorizontal: spacing[6],
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[200],
    marginTop: spacing[1],
  },
  content: {
    padding: spacing[4],
    paddingTop: spacing[5],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    marginBottom: spacing[3],
    borderWidth: 1,
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  menuSubtitle: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    marginBottom: spacing[5],
    borderWidth: 1.5,
    ...shadows.sm,
  },
  adminBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    marginRight: spacing[2],
  },
  adminBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});

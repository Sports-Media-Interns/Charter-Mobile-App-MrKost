import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/services/supabase';
import { Card, FlightCard, Button, EmptyState } from '@/components';
import { colors as staticColors, typography, spacing, borderRadius, shadows } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface QuickStat {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'request' | 'quote' | 'booking';
  title: string;
  subtitle: string;
  time: string;
  status: string;
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const { colors, isDark, toggle } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        // Extract name from email for now
        const name = user.email.split('@')[0].replace(/[._]/g, ' ');
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    };
    fetchUser();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Refresh data here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickStats: QuickStat[] = [
    { label: 'Active Requests', value: 3, icon: 'document-text', color: colors.primary[500] },
    { label: 'Pending Quotes', value: 2, icon: 'pricetag', color: colors.secondary[500] },
    { label: 'Upcoming Flights', value: 1, icon: 'airplane', color: colors.accent[500] },
  ];

  const upcomingFlight = {
    departure: 'DFW',
    arrival: 'LAX',
    date: 'Jan 28, 2026',
    time: '10:00 AM',
    passengers: 15,
    status: 'confirmed',
    aircraft: 'Gulfstream G650',
  };

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'quote',
      title: 'New Quote Received',
      subtitle: 'DFW → MIA • $45,000',
      time: '2 hours ago',
      status: 'pending',
    },
    {
      id: '2',
      type: 'request',
      title: 'Request Submitted',
      subtitle: 'LAX → JFK • 8 passengers',
      time: '5 hours ago',
      status: 'quoting',
    },
    {
      id: '3',
      type: 'booking',
      title: 'Booking Confirmed',
      subtitle: 'DFW → LAX • Jan 28',
      time: 'Yesterday',
      status: 'confirmed',
    },
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'quote':
        return 'pricetag';
      case 'request':
        return 'document-text';
      case 'booking':
        return 'checkmark-circle';
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'quote':
        return colors.secondary[500];
      case 'request':
        return colors.primary[500];
      case 'booking':
        return colors.accent[500];
    }
  };

  const query = searchQuery.toLowerCase().trim();

  // --- Global searchable data ---
  const actionItems = [
    { title: 'New Request', subtitle: 'Book a charter flight', icon: 'add-circle' as const, iconBg: colors.primary[50], iconColor: colors.primary[500], route: '/(tabs)/new-request' },
    { title: 'View Quotes', subtitle: 'Compare & approve quotes', icon: 'list' as const, iconBg: colors.secondary[50], iconColor: colors.secondary[600], route: '/(tabs)/requests' },
    { title: 'My Trips', subtitle: 'Manage bookings and flights', icon: 'calendar' as const, iconBg: colors.accent[50], iconColor: colors.accent[600], route: '/(tabs)/bookings' },
    { title: 'Team', subtitle: 'Manage travelers and personnel', icon: 'people' as const, iconBg: colors.neutral[100], iconColor: colors.neutral[600], route: '/(tabs)/profile' },
  ];

  const settingsPages = [
    { title: 'Notifications', subtitle: 'Manage notification preferences', icon: 'notifications-outline' as const, iconColor: colors.primary[500], route: '/settings/notifications' },
    { title: 'Security & Privacy', subtitle: 'Password, 2FA, privacy settings', icon: 'shield-checkmark-outline' as const, iconColor: colors.primary[500], route: '/settings/security' },
    { title: 'Billing & Payments', subtitle: 'Payment methods, invoices', icon: 'card-outline' as const, iconColor: colors.secondary[600], route: '/settings/billing' },
    { title: 'Help & Support', subtitle: 'FAQs, contact us, feedback', icon: 'help-circle-outline' as const, iconColor: colors.neutral[600], route: '/settings/help' },
    { title: 'Company Settings', subtitle: 'Organization info, home airport', icon: 'business-outline' as const, iconColor: colors.primary[500], route: '/settings/company' },
    { title: 'Contacts', subtitle: 'Manage company contacts', icon: 'people-outline' as const, iconColor: colors.accent[600], route: '/settings/contacts' },
    { title: 'Authorized Personnel', subtitle: 'Manage who can approve and book', icon: 'person-add-outline' as const, iconColor: colors.primary[500], route: '/settings/personnel' },
  ];

  const people = [
    { name: 'Dan Kirkpatrick', role: 'Team Admin', email: 'dan@dakdan.com' },
    { name: 'Sarah Johnson', role: 'Travel Coordinator', email: 'sarah@mavericks.com' },
    { name: 'Mike Williams', role: 'Assistant Travel Manager', email: 'mike@mavericks.com' },
    { name: 'Mark Cuban', role: 'Owner', email: 'mark@mavericks.com' },
    { name: 'Jason Kidd', role: 'Head Coach', email: 'jkidd@mavericks.com' },
    { name: 'Luka Doncic', role: 'Player', email: 'luka@mavericks.com' },
  ];

  const faqItems = [
    { question: 'How do I request a charter flight?', answer: 'Tap the "+" button or select "New Request" from Home.' },
    { question: 'How long does it take to receive quotes?', answer: 'Standard: 2-4 hours. Urgent/Emergency: faster.' },
    { question: 'Can I modify or cancel a booking?', answer: 'Yes, from the Trips section. Policies vary by operator.' },
    { question: 'How do I add authorized travelers?', answer: 'Go to Profile > Authorized Personnel.' },
    { question: 'What payment methods are accepted?', answer: 'Credit cards, corporate cards, ACH/Wire transfers.' },
  ];

  const filteredActions = query
    ? actionItems.filter(a => `${a.title} ${a.subtitle}`.toLowerCase().includes(query))
    : actionItems;

  const filteredActivity = query
    ? recentActivity.filter(a => `${a.title} ${a.subtitle} ${a.status}`.toLowerCase().includes(query))
    : recentActivity;

  const flightMatchesSearch = !query ||
    `${upcomingFlight.departure} ${upcomingFlight.arrival} ${upcomingFlight.date} ${upcomingFlight.aircraft} ${upcomingFlight.status}`.toLowerCase().includes(query);

  const filteredSettings = query
    ? settingsPages.filter(s => `${s.title} ${s.subtitle}`.toLowerCase().includes(query))
    : [];

  const filteredPeople = query
    ? people.filter(p => `${p.name} ${p.role} ${p.email}`.toLowerCase().includes(query))
    : [];

  const filteredFAQs = query
    ? faqItems.filter(f => `${f.question} ${f.answer}`.toLowerCase().includes(query))
    : [];

  const hasResults = filteredActions.length > 0 || filteredActivity.length > 0 || flightMatchesSearch ||
    filteredSettings.length > 0 || filteredPeople.length > 0 || filteredFAQs.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary[500], paddingTop: insets.top + spacing[4] }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{userName || 'Welcome'}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => setShowSearch(!showSearch)}
                accessibilityLabel="Toggle search"
                accessibilityRole="button"
              >
                <Ionicons name={showSearch ? 'close' : 'search'} size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => {
                  if (typeof window !== 'undefined') {
                    window.alert('No new notifications.');
                  } else {
                    Alert.alert('Notifications', 'No new notifications.');
                  }
                }}
                accessibilityLabel="View notifications"
                accessibilityRole="button"
              >
                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={toggle}
                accessibilityLabel="Toggle dark mode"
                accessibilityRole="button"
              >
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          {showSearch && (
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              marginBottom: spacing[4],
            }}>
              <Ionicons name="search" size={18} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                  color: '#FFFFFF',
                  fontSize: 16,
                }}
                placeholder="Search requests, trips, quotes..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            {quickStats.map((stat, index) => (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  index < quickStats.length - 1 && { marginRight: spacing[2] },
                ]}
              >
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* No Results */}
        {query.length > 0 && !hasResults && (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Ionicons name="search-outline" size={48} color={colors.neutral[400]} />
            <Text style={{ color: colors.text.secondary, marginTop: 12, fontSize: 16 }}>
              No results for "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        {filteredActions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                {query ? 'Matching Actions' : 'Quick Actions'}
              </Text>
            </View>
            <View style={styles.actionsGrid}>
              {filteredActions.map((action) => (
                <TouchableOpacity
                  key={action.title}
                  style={[styles.actionCard, { backgroundColor: colors.neutral[0], width: (width - spacing[4] * 2 - spacing[3]) / 2 }]}
                  onPress={() => router.push(action.route as any)}
                  accessibilityLabel={action.title}
                  accessibilityRole="button"
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.iconBg }]}>
                    <Ionicons name={action.icon} size={28} color={action.iconColor} />
                  </View>
                  <Text style={[styles.actionTitle, { color: colors.text.primary }]}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Upcoming Flight */}
        {flightMatchesSearch && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Upcoming Flight</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlightCard
              departure={upcomingFlight.departure}
              arrival={upcomingFlight.arrival}
              date={upcomingFlight.date}
              time={upcomingFlight.time}
              passengers={upcomingFlight.passengers}
              status={upcomingFlight.status}
              aircraft={upcomingFlight.aircraft}
              onPress={() => router.push('/booking/1')}
            />
          </View>
        )}

        {/* Recent Activity */}
        {filteredActivity.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                {query ? 'Matching Activity' : 'Recent Activity'}
              </Text>
              {!query && (
                <TouchableOpacity>
                  <Text style={styles.sectionLink}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
            <Card variant="outlined" padding="none">
              {filteredActivity.map((activity, index) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    index < filteredActivity.length - 1 && styles.activityItemBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: `${getActivityColor(activity.type)}15` },
                    ]}
                  >
                    <Ionicons
                      name={getActivityIcon(activity.type)}
                      size={20}
                      color={getActivityColor(activity.type)}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: colors.text.primary }]}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                  </View>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        )}

        {/* People Results */}
        {filteredPeople.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>People</Text>
            </View>
            <Card variant="outlined" padding="none">
              {filteredPeople.map((person, index) => (
                <TouchableOpacity
                  key={person.email}
                  style={[
                    styles.activityItem,
                    index < filteredPeople.length - 1 && styles.activityItemBorder,
                  ]}
                  onPress={() => router.push('/(tabs)/profile')}
                >
                  <View style={[styles.activityIcon, { backgroundColor: colors.primary[50] }]}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary[500] }}>
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: colors.text.primary }]}>{person.name}</Text>
                    <Text style={styles.activitySubtitle}>{person.role} • {person.email}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        )}

        {/* Settings Results */}
        {filteredSettings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Settings</Text>
            </View>
            <Card variant="outlined" padding="none">
              {filteredSettings.map((page, index) => (
                <TouchableOpacity
                  key={page.route}
                  style={[
                    styles.activityItem,
                    index < filteredSettings.length - 1 && styles.activityItemBorder,
                  ]}
                  onPress={() => router.push(page.route as any)}
                >
                  <View style={[styles.activityIcon, { backgroundColor: colors.primary[50] }]}>
                    <Ionicons name={page.icon} size={20} color={page.iconColor} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: colors.text.primary }]}>{page.title}</Text>
                    <Text style={styles.activitySubtitle}>{page.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        )}

        {/* FAQ Results */}
        {filteredFAQs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Help & FAQ</Text>
            </View>
            <Card variant="outlined" padding="none">
              {filteredFAQs.map((faq, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.activityItem,
                    index < filteredFAQs.length - 1 && styles.activityItemBorder,
                  ]}
                  onPress={() => router.push('/settings/help')}
                >
                  <View style={[styles.activityIcon, { backgroundColor: colors.secondary[50] }]}>
                    <Ionicons name="help-circle-outline" size={20} color={colors.secondary[600]} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: colors.text.primary }]}>{faq.question}</Text>
                    <Text style={styles.activitySubtitle} numberOfLines={1}>{faq.answer}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        )}

        {/* Support Banner */}
        {!query && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.supportBanner} onPress={() => router.push('/settings/help')}>
              <View style={styles.supportContent}>
                <Ionicons name="headset" size={24} color={colors.primary[500]} />
                <View style={styles.supportText}>
                  <Text style={styles.supportTitle}>Need Assistance?</Text>
                  <Text style={styles.supportSubtitle}>Our team is available 24/7</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/new-request')}
        accessibilityLabel="Create new request"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color={colors.neutral[0]} />
      </TouchableOpacity>
    </View>
  );
}

const colors = staticColors;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
    borderBottomLeftRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[200],
  },
  userName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
    marginTop: spacing[1],
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary[500],
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[200],
    textAlign: 'center',
    marginTop: spacing[1],
  },
  section: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  sectionLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  actionCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    ...shadows.sm,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  actionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  actionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  activitySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  activityTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportText: {
    marginLeft: spacing[3],
  },
  supportTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  supportSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing[6],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
});

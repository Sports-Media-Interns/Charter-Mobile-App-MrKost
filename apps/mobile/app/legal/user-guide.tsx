import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { colors, typography, spacing, borderRadius } from '@/theme';

const APP_NAME = 'Sports Media Charter';
const SUPPORT_EMAIL = 'charter@sportsmedia.net';
const SUPPORT_PHONE = '+1 (970) 436-0580';

export default function UserGuideScreen() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const Section = ({ id, title, icon, children }: { id: string; title: string; icon: string; children: React.ReactNode }) => {
    const isExpanded = expandedSections.includes(id);
    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(id)}
        >
          <View style={styles.sectionTitleRow}>
            <Ionicons name={icon as any} size={20} color={colors.primary[500]} style={{ marginRight: spacing[2] }} />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.neutral[400]}
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.sectionContent}>
            {children}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Guide</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="airplane" size={28} color={colors.primary[500]} />
          </View>
          <Text style={styles.introTitle}>Welcome to {APP_NAME}</Text>
          <Text style={styles.introText}>
            Your complete platform for managing private charter aviation for professional sports teams. This guide covers everything you need to get started and make the most of the app.
          </Text>
        </View>

        {/* Sections */}
        <Section id="getting-started" title="Getting Started" icon="rocket-outline">
          <Text style={styles.heading}>Signing In</Text>
          <Text style={styles.bodyText}>
            Enter your email and password on the login screen. If your organization uses Single Sign-On (SSO), tap "Continue with SSO" instead.
          </Text>
          <Text style={styles.bodyText}>
            If you don't have an account, tap "Request Access" on the login screen. Your organization administrator will need to approve your access.
          </Text>

          <Text style={styles.heading}>Home Screen</Text>
          <Text style={styles.bodyText}>
            After signing in, you'll see the Home tab with an overview of your active requests, upcoming trips, and recent activity. Use the navigation bar at the bottom to move between sections.
          </Text>

          <Text style={styles.heading}>Navigation</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Home</Text> — Dashboard with active requests and upcoming flights</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Requests</Text> — View and manage all charter requests</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Book (+)</Text> — Create a new charter request</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Trips</Text> — View confirmed bookings and trip details</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Profile</Text> — Account settings, company info, and preferences</Text>
          </View>
        </Section>

        <Section id="requesting" title="Requesting a Charter" icon="create-outline">
          <Text style={styles.heading}>Creating a New Request</Text>
          <Text style={styles.bodyText}>
            Tap the "+" button in the navigation bar to start a new charter request. You'll need to provide:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Trip Type</Text> — One-way, round trip, or multi-leg</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Departure & Arrival</Text> — Airport codes or city names</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Date & Time</Text> — Preferred departure date and time</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Passengers</Text> — Number of travelers</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Special Requirements</Text> — Baggage notes, dietary needs, accessibility</Text>
          </View>

          <Text style={styles.heading}>Urgency Levels</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Standard</Text> — Quotes within 2–4 hours during business hours</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Urgent</Text> — Prioritized quoting, typically within 1–2 hours</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Emergency</Text> — For flights needed within 24 hours; fastest response</Text>
          </View>

          <Text style={styles.heading}>Request Status</Text>
          <Text style={styles.bodyText}>
            After submitting, your request moves through these stages: Draft → Submitted → Quoting → Quoted → Approved → Booked → Completed.
          </Text>
        </Section>

        <Section id="quotes" title="Reviewing Quotes" icon="document-text-outline">
          <Text style={styles.bodyText}>
            When quotes are ready, you'll receive a push notification and see them in the Requests section. Each quote includes:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Aircraft type and category (light, midsize, heavy, etc.)</Text>
            <Text style={styles.bulletItem}>• Operator name and safety rating</Text>
            <Text style={styles.bulletItem}>• Base price, taxes/fees, and total price</Text>
            <Text style={styles.bulletItem}>• Available amenities</Text>
            <Text style={styles.bulletItem}>• Quote validity period</Text>
          </View>
          <Text style={styles.bodyText}>
            Compare quotes side by side, then tap "Accept" on your preferred option. Once accepted, your broker will confirm the booking.
          </Text>
        </Section>

        <Section id="bookings" title="Managing Bookings" icon="briefcase-outline">
          <Text style={styles.heading}>Viewing Trips</Text>
          <Text style={styles.bodyText}>
            The Trips tab shows all confirmed bookings. Tap any booking to see full details including flight information, confirmation number, and payment status.
          </Text>

          <Text style={styles.heading}>Passenger Manifest</Text>
          <Text style={styles.bodyText}>
            For each booking, you'll need to submit a passenger manifest before departure. Go to the booking details and tap "Manage Passengers" to add traveler information including names, dates of birth, and emergency contacts.
          </Text>

          <Text style={styles.heading}>Modifications & Cancellations</Text>
          <Text style={styles.bodyText}>
            To modify or cancel a booking, open the booking details and select the appropriate option. Cancellation policies vary by operator. Cancellations more than 7 days before departure typically receive a full refund.
          </Text>
        </Section>

        <Section id="payments" title="Billing & Payments" icon="card-outline">
          <Text style={styles.bodyText}>
            Manage payments from Profile → Billing & Payments. The app supports:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Credit/Debit Cards</Text> — All major cards accepted via secure Stripe processing</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Corporate Cards</Text> — Add your company card for team billing</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Bank Transfer</Text> — ACH and wire transfer for larger amounts</Text>
          </View>

          <Text style={styles.heading}>Invoices</Text>
          <Text style={styles.bodyText}>
            An invoice is generated automatically when a booking is confirmed. Invoices are emailed to your organization's team administrators and travel coordinators, and are also viewable in the Billing section.
          </Text>

          <Text style={styles.heading}>Payment Status</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Pending</Text> — Payment not yet initiated</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Partial</Text> — Deposit or partial payment received</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Paid</Text> — Full payment received</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Refunded</Text> — Payment has been refunded</Text>
          </View>
        </Section>

        <Section id="notifications" title="Notifications" icon="notifications-outline">
          <Text style={styles.bodyText}>
            Stay informed about your charter activity with real-time notifications. Go to Profile → Notifications to customize which alerts you receive.
          </Text>

          <Text style={styles.heading}>Notification Categories</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Request Updates</Text> — Status changes on your charter requests</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Quotes</Text> — New quotes and quote status changes</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Bookings</Text> — Booking confirmations, updates, and flight status</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Payments</Text> — Payment confirmations, failures, and receipts</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Messages</Text> — New messages from your broker</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>System</Text> — Account and security alerts</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Marketing</Text> — Promotions and announcements</Text>
          </View>

          <Text style={styles.heading}>Channels</Text>
          <Text style={styles.bodyText}>
            For each category, you can enable or disable Push Notifications, Email, and SMS independently.
          </Text>
        </Section>

        <Section id="team" title="Team Management" icon="people-outline">
          <Text style={styles.heading}>Company Contacts</Text>
          <Text style={styles.bodyText}>
            View and manage your organization's contacts from Profile → Company Contacts. These are the key people your broker can reach for coordination.
          </Text>

          <Text style={styles.heading}>Authorized Personnel</Text>
          <Text style={styles.bodyText}>
            Manage who can approve requests and make bookings from Profile → Authorized Personnel. Each person can be granted:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Can Approve</Text> — Authority to approve quotes and requests</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Can Book</Text> — Authority to confirm bookings</Text>
          </View>

          <Text style={styles.heading}>Admin Features</Text>
          <Text style={styles.bodyText}>
            Organization administrators have access to user management from Profile → Admin. Admins can add, edit, or deactivate team members.
          </Text>
        </Section>

        <Section id="security" title="Security & Privacy" icon="shield-checkmark-outline">
          <Text style={styles.bodyText}>
            Your data security is our priority. The app includes:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Biometric Authentication</Text> — Enable Face ID or fingerprint login from Profile → Security</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Two-Factor Authentication</Text> — Add an extra layer of security to your account</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Session Management</Text> — View and revoke active sessions</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Data Export</Text> — Download all your personal data</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Account Deletion</Text> — Request full account and data deletion with a 14-day cooling-off period</Text>
          </View>
          <Text style={styles.bodyText}>
            For full details on how we handle your information, see our Privacy Policy and Terms of Service available under Help & Support → Resources.
          </Text>
        </Section>

        <Section id="messaging" title="Messaging Your Broker" icon="chatbubbles-outline">
          <Text style={styles.bodyText}>
            Each charter request includes a built-in messaging thread. Use it to communicate directly with your assigned broker about:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Flight details and special requirements</Text>
            <Text style={styles.bulletItem}>• Quote questions and negotiations</Text>
            <Text style={styles.bulletItem}>• Schedule changes or updates</Text>
            <Text style={styles.bulletItem}>• Passenger manifest coordination</Text>
          </View>
          <Text style={styles.bodyText}>
            You'll receive a notification when your broker replies. All messages are logged for your records.
          </Text>
        </Section>

        <Section id="support" title="Getting Help" icon="help-circle-outline">
          <Text style={styles.bodyText}>
            If you need assistance, we're here to help:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Phone</Text> — Call us 24/7 at {SUPPORT_PHONE}</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Email</Text> — {SUPPORT_EMAIL}</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>Live Chat</Text> — Available from the Help & Support screen</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bold}>FAQ</Text> — Check the Frequently Asked Questions section for quick answers</Text>
          </View>
          <Text style={styles.bodyText}>
            You can also send feedback directly from the app via Help & Support → Send Feedback.
          </Text>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sports Media Charter Travel</Text>
          <Text style={styles.footerSubtext}>A Division of Sports Media, Inc.</Text>
          <Text style={styles.footerSubtext}>© 2026 Sports Media, Inc. All rights reserved.</Text>
        </View>
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
  introCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    alignItems: 'center',
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  introIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  introTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  introText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  sectionContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[4],
  },
  heading: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  bodyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing[2],
  },
  bulletList: {
    marginBottom: spacing[2],
  },
  bulletItem: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 24,
    paddingLeft: spacing[2],
  },
  bold: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing[6],
    paddingBottom: spacing[4],
  },
  footerText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  footerSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
});

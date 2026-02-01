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
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';

const EFFECTIVE_DATE = 'January 1, 2026';
const COMPANY_NAME = 'Sports Media, Inc.';
const APP_NAME = 'Sports Media Charter';
const WEBSITE = 'travel.sportsmedia.net';
const SUPPORT_EMAIL = 'privacy@sportsmedia.net';
const SUPPORT_PHONE = '+1 (970) 436-0580';
const ADDRESS = '274 Mount Harvard Ave, Suite 900, Severance, CO 80550';

export default function PrivacyPolicyScreen() {
  const { colors: themeColors, isDark } = useTheme();
  const [expandedSections, setExpandedSections] = useState<string[]>(['intro']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => {
    const isExpanded = expandedSections.includes(id);
    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(id)}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
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
    <View style={[styles.container, { backgroundColor: themeColors.background.secondary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.neutral[0], borderBottomColor: themeColors.border.light }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <ThemeToggle color={themeColors.text.primary} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View style={styles.policyHeader}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={32} color={colors.primary[500]} />
          </View>
          <Text style={styles.policyTitle}>{APP_NAME} Privacy Policy</Text>
          <Text style={styles.companyName}>A Division of {COMPANY_NAME}</Text>
          <Text style={styles.effectiveDate}>Effective Date: {EFFECTIVE_DATE}</Text>
        </View>

        {/* Introduction */}
        <Section id="intro" title="1. Introduction">
          <Text style={styles.paragraph}>
            Welcome to {APP_NAME}, a service provided by {COMPANY_NAME} ("Company," "we," "us," or "our").
            We are committed to protecting your personal information and your right to privacy.
          </Text>
          <Text style={styles.paragraph}>
            This Privacy Policy describes how we collect, use, disclose, and safeguard your information
            when you use our mobile application and related services (collectively, the "Service").
            By using {APP_NAME}, you agree to the collection and use of information in accordance with this policy.
          </Text>
          <Text style={styles.paragraph}>
            Our website is located at: {WEBSITE}
          </Text>
        </Section>

        {/* Information We Collect */}
        <Section id="collect" title="2. Information We Collect">
          <Text style={styles.subheading}>Personal Information</Text>
          <Text style={styles.paragraph}>We may collect the following personal information:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Full name and contact information (email, phone number, address)</Text>
            <Text style={styles.bulletItem}>• Company/organization details and billing information</Text>
            <Text style={styles.bulletItem}>• Government-issued identification for travel verification</Text>
            <Text style={styles.bulletItem}>• Travel preferences, frequent airports, and trip history</Text>
            <Text style={styles.bulletItem}>• Payment card information (processed securely via third-party providers)</Text>
            <Text style={styles.bulletItem}>• Profile photographs and account credentials</Text>
          </View>

          <Text style={styles.subheading}>Automatically Collected Information</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Device information (model, operating system, unique identifiers)</Text>
            <Text style={styles.bulletItem}>• Usage data (features accessed, time spent, interactions)</Text>
            <Text style={styles.bulletItem}>• Location data (with your consent, for airport proximity features)</Text>
            <Text style={styles.bulletItem}>• Log data (IP address, browser type, access times)</Text>
          </View>

          <Text style={styles.subheading}>Biometric Data</Text>
          <Text style={styles.paragraph}>
            If you enable biometric authentication (Face ID, Touch ID, or fingerprint), we do not store
            your biometric data. Authentication is performed locally on your device using your device's
            secure enclave. We only store a flag indicating whether biometric login is enabled for your account.
          </Text>
        </Section>

        {/* How We Use Information */}
        <Section id="use" title="3. How We Use Your Information">
          <Text style={styles.paragraph}>We use your information to:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Process and fulfill charter flight requests and bookings</Text>
            <Text style={styles.bulletItem}>• Communicate with you regarding quotes, confirmations, and updates</Text>
            <Text style={styles.bulletItem}>• Process payments and maintain billing records</Text>
            <Text style={styles.bulletItem}>• Verify identity for security and regulatory compliance</Text>
            <Text style={styles.bulletItem}>• Improve our services based on usage patterns</Text>
            <Text style={styles.bulletItem}>• Send promotional communications (with your consent)</Text>
            <Text style={styles.bulletItem}>• Comply with legal obligations and aviation regulations</Text>
            <Text style={styles.bulletItem}>• Detect and prevent fraud or unauthorized access</Text>
          </View>
        </Section>

        {/* Data Sharing */}
        <Section id="sharing" title="4. Information Sharing & Disclosure">
          <Text style={styles.paragraph}>We may share your information with:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Charter operators and aircraft providers to fulfill your bookings</Text>
            <Text style={styles.bulletItem}>• Payment processors (Stripe, etc.) to process transactions</Text>
            <Text style={styles.bulletItem}>• Aviation authorities as required by law (TSA, FAA, CBP)</Text>
            <Text style={styles.bulletItem}>• Third-party service providers who assist in operating our Service</Text>
            <Text style={styles.bulletItem}>• Legal authorities when required by law or to protect our rights</Text>
          </View>
          <Text style={styles.paragraph}>
            We do NOT sell your personal information to third parties for marketing purposes.
          </Text>
        </Section>

        {/* Data Security */}
        <Section id="security" title="5. Data Security">
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your data:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• 256-bit SSL/TLS encryption for all data in transit</Text>
            <Text style={styles.bulletItem}>• AES-256 encryption for data at rest</Text>
            <Text style={styles.bulletItem}>• Multi-factor authentication options</Text>
            <Text style={styles.bulletItem}>• Regular security audits and penetration testing</Text>
            <Text style={styles.bulletItem}>• SOC 2 Type II compliant infrastructure</Text>
            <Text style={styles.bulletItem}>• PCI DSS compliant payment processing</Text>
          </View>
        </Section>

        {/* Two-Factor Authentication */}
        <Section id="2fa" title="6. Two-Factor Authentication Policy">
          <Text style={styles.paragraph}>
            Two-Factor Authentication (2FA) adds an additional layer of security to your account.
            When enabled:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• You will receive a verification code via SMS or authenticator app</Text>
            <Text style={styles.bulletItem}>• Codes are valid for 5 minutes and are single-use</Text>
            <Text style={styles.bulletItem}>• Recovery codes are provided for account recovery</Text>
            <Text style={styles.bulletItem}>• Administrators may require 2FA for all organizational users</Text>
          </View>
          <Text style={styles.paragraph}>
            We strongly recommend enabling 2FA for accounts with booking or approval permissions.
          </Text>
        </Section>

        {/* Your Rights */}
        <Section id="rights" title="7. Your Privacy Rights">
          <Text style={styles.paragraph}>You have the right to:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Access: Request a copy of all personal data we hold about you</Text>
            <Text style={styles.bulletItem}>• Correction: Request correction of inaccurate or incomplete data</Text>
            <Text style={styles.bulletItem}>• Deletion: Request deletion of your personal data (subject to legal retention requirements)</Text>
            <Text style={styles.bulletItem}>• Portability: Receive your data in a structured, machine-readable format</Text>
            <Text style={styles.bulletItem}>• Opt-Out: Unsubscribe from marketing communications at any time</Text>
            <Text style={styles.bulletItem}>• Restriction: Request restriction of processing in certain circumstances</Text>
          </View>
        </Section>

        {/* Download Data */}
        <Section id="download" title="8. Download Your Data">
          <Text style={styles.paragraph}>
            You may request a complete copy of your personal data at any time through the app's
            Settings {'>'} Security & Privacy {'>'} Download My Data feature.
          </Text>
          <Text style={styles.paragraph}>
            Upon request, we will compile your data within 30 days and provide it in JSON and PDF formats.
            This includes:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Account information and profile data</Text>
            <Text style={styles.bulletItem}>• Trip history and booking records</Text>
            <Text style={styles.bulletItem}>• Payment history (excluding full card numbers)</Text>
            <Text style={styles.bulletItem}>• Communication preferences</Text>
            <Text style={styles.bulletItem}>• Activity logs and usage history</Text>
          </View>
        </Section>

        {/* Account Deletion */}
        <Section id="deletion" title="9. Account Deletion">
          <Text style={styles.paragraph}>
            You may request deletion of your account and associated data. The process is as follows:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>1. Submit deletion request via Settings {'>'} Security & Privacy {'>'} Delete Account</Text>
            <Text style={styles.bulletItem}>2. Confirm your identity via email verification</Text>
            <Text style={styles.bulletItem}>3. 14-day cooling off period (you may cancel during this time)</Text>
            <Text style={styles.bulletItem}>4. Permanent deletion after cooling off period</Text>
          </View>
          <Text style={styles.paragraph}>
            Note: Certain data may be retained for legal compliance (tax records for 7 years,
            aviation security records as required by law). You will be notified of any retained data.
          </Text>
        </Section>

        {/* Data Retention */}
        <Section id="retention" title="10. Data Retention">
          <Text style={styles.paragraph}>We retain your data for the following periods:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Account data: Until account deletion + 30 days</Text>
            <Text style={styles.bulletItem}>• Trip records: 7 years (tax/legal compliance)</Text>
            <Text style={styles.bulletItem}>• Payment records: 7 years (financial regulations)</Text>
            <Text style={styles.bulletItem}>• Security logs: 2 years</Text>
            <Text style={styles.bulletItem}>• Marketing preferences: Until you unsubscribe</Text>
          </View>
        </Section>

        {/* Children's Privacy */}
        <Section id="children" title="11. Children's Privacy">
          <Text style={styles.paragraph}>
            {APP_NAME} is not intended for individuals under 18 years of age. We do not knowingly
            collect personal information from children. If you believe we have collected information
            from a minor, please contact us immediately at {SUPPORT_EMAIL}.
          </Text>
        </Section>

        {/* International Transfers */}
        <Section id="international" title="12. International Data Transfers">
          <Text style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your own.
            We ensure appropriate safeguards are in place, including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Standard Contractual Clauses approved by regulatory authorities</Text>
            <Text style={styles.bulletItem}>• Compliance with GDPR for European users</Text>
            <Text style={styles.bulletItem}>• Privacy Shield successor frameworks where applicable</Text>
          </View>
        </Section>

        {/* Changes to Policy */}
        <Section id="changes" title="13. Changes to This Policy">
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Posting the new policy in the app with a new effective date</Text>
            <Text style={styles.bulletItem}>• Sending an email notification to your registered address</Text>
            <Text style={styles.bulletItem}>• Displaying a prominent notice in the app</Text>
          </View>
          <Text style={styles.paragraph}>
            Your continued use of {APP_NAME} after changes become effective constitutes acceptance
            of the revised policy.
          </Text>
        </Section>

        {/* Contact Information */}
        <Section id="contact" title="14. Contact Us">
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy or wish to exercise your privacy rights,
            please contact us:
          </Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactCompany}>{COMPANY_NAME}</Text>
            <Text style={styles.contactLine}>{APP_NAME} Privacy Team</Text>
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={16} color={colors.primary[500]} />
              <Text style={styles.contactText}>{ADDRESS}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={16} color={colors.primary[500]} />
              <Text style={styles.contactText}>{SUPPORT_EMAIL}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={16} color={colors.primary[500]} />
              <Text style={styles.contactText}>{SUPPORT_PHONE}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="globe-outline" size={16} color={colors.primary[500]} />
              <Text style={styles.contactText}>{WEBSITE}</Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            For privacy-specific concerns, please allow up to 30 days for a response.
          </Text>
        </Section>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </Text>
          <Text style={styles.footerText}>
            {APP_NAME}™ is a trademark of {COMPANY_NAME}
          </Text>
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
  policyHeader: {
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  policyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  companyName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  effectiveDate: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing[2],
  },
  section: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
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
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  sectionContent: {
    padding: spacing[4],
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  paragraph: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing[3],
  },
  subheading: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
  bulletList: {
    marginBottom: spacing[3],
  },
  bulletItem: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 24,
    paddingLeft: spacing[2],
  },
  contactBox: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginVertical: spacing[3],
  },
  contactCompany: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
    marginBottom: spacing[1],
  },
  contactLine: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    marginBottom: spacing[3],
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  contactText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginLeft: spacing[2],
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: spacing[4],
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
});

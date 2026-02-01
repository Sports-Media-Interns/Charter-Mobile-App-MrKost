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

const EFFECTIVE_DATE = 'January 1, 2026';
const COMPANY_NAME = 'Sports Media, Inc.';
const APP_NAME = 'Sports Media Charter';
const WEBSITE = 'travel.sportsmedia.net';
const SUPPORT_EMAIL = 'legal@sportsmedia.net';
const SUPPORT_PHONE = '+1 (970) 436-0580';
const ADDRESS = '274 Mount Harvard Ave, Suite 900, Severance, CO 80550';

export default function TermsScreen() {
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
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View style={styles.policyHeader}>
          <View style={styles.logoContainer}>
            <Ionicons name="document-text" size={32} color={colors.primary[500]} />
          </View>
          <Text style={styles.policyTitle}>{APP_NAME} Terms of Service</Text>
          <Text style={styles.companyName}>A Division of {COMPANY_NAME}</Text>
          <Text style={styles.effectiveDate}>Effective Date: {EFFECTIVE_DATE}</Text>
        </View>

        {/* Agreement */}
        <Section id="intro" title="1. Agreement to Terms">
          <Text style={styles.paragraph}>
            These Terms of Service ("Terms") constitute a legally binding agreement between you
            ("User," "you," or "your") and {COMPANY_NAME} ("Company," "we," "us," or "our")
            governing your access to and use of the {APP_NAME} mobile application and related
            services (collectively, the "Service").
          </Text>
          <Text style={styles.paragraph}>
            BY ACCESSING OR USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD,
            AND AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE, YOU MUST NOT USE THE SERVICE.
          </Text>
          <Text style={styles.paragraph}>
            You represent that you are at least 18 years of age and have the legal capacity to
            enter into binding agreements.
          </Text>
        </Section>

        {/* Service Description */}
        <Section id="service" title="2. Service Description">
          <Text style={styles.paragraph}>
            {APP_NAME} is a private aviation charter brokerage platform that connects corporate
            clients, sports organizations, and travel coordinators with charter aircraft operators.
          </Text>
          <Text style={styles.subheading}>Our Services Include:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Charter flight request submission and management</Text>
            <Text style={styles.bulletItem}>• Quote comparison from vetted operators</Text>
            <Text style={styles.bulletItem}>• Booking confirmation and trip management</Text>
            <Text style={styles.bulletItem}>• Passenger manifest coordination</Text>
            <Text style={styles.bulletItem}>• Billing and payment processing</Text>
            <Text style={styles.bulletItem}>• Real-time flight tracking and notifications</Text>
          </View>
          <Text style={styles.paragraph}>
            {COMPANY_NAME} acts as a broker/intermediary. We do not own or operate aircraft.
            All flights are operated by independent FAA Part 135 certified charter operators.
          </Text>
        </Section>

        {/* User Accounts */}
        <Section id="accounts" title="3. User Accounts & Responsibilities">
          <Text style={styles.subheading}>Account Registration</Text>
          <Text style={styles.paragraph}>
            To use the Service, you must create an account with accurate, complete, and current
            information. You are responsible for:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Maintaining the confidentiality of your login credentials</Text>
            <Text style={styles.bulletItem}>• All activities that occur under your account</Text>
            <Text style={styles.bulletItem}>• Notifying us immediately of any unauthorized access</Text>
            <Text style={styles.bulletItem}>• Keeping your contact information up to date</Text>
          </View>

          <Text style={styles.subheading}>Administrator Accounts</Text>
          <Text style={styles.paragraph}>
            Organization administrators have additional responsibilities including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Managing user access and permissions for their organization</Text>
            <Text style={styles.bulletItem}>• Setting password policies and security requirements</Text>
            <Text style={styles.bulletItem}>• Ensuring authorized personnel comply with these Terms</Text>
            <Text style={styles.bulletItem}>• Promptly removing access for terminated employees</Text>
          </View>

          <Text style={styles.subheading}>Password Requirements</Text>
          <Text style={styles.paragraph}>
            Each user must maintain their own unique password. Passwords must meet minimum
            security requirements set by your organization administrator. Password sharing
            is strictly prohibited and grounds for account termination.
          </Text>
        </Section>

        {/* Booking Terms */}
        <Section id="booking" title="4. Booking Terms & Conditions">
          <Text style={styles.subheading}>Quote Requests</Text>
          <Text style={styles.paragraph}>
            Quotes provided through the Service are estimates based on information available
            at the time of request. Final pricing may vary based on:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Actual flight routing and fuel costs</Text>
            <Text style={styles.bulletItem}>• Airport fees and handling charges</Text>
            <Text style={styles.bulletItem}>• Crew positioning requirements</Text>
            <Text style={styles.bulletItem}>• Catering and special requests</Text>
            <Text style={styles.bulletItem}>• International overflight permits</Text>
          </View>

          <Text style={styles.subheading}>Booking Confirmation</Text>
          <Text style={styles.paragraph}>
            A booking is not confirmed until you receive written confirmation from {APP_NAME}
            and payment has been processed or credit terms approved.
          </Text>

          <Text style={styles.subheading}>Cancellation Policy</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• 7+ days before departure: Full refund minus administrative fee</Text>
            <Text style={styles.bulletItem}>• 3-7 days before departure: 50% refund</Text>
            <Text style={styles.bulletItem}>• Less than 72 hours: No refund (exceptions for weather/mechanical)</Text>
          </View>
        </Section>

        {/* Copyright */}
        <Section id="copyright" title="5. Copyright & Intellectual Property">
          <View style={styles.legalBox}>
            <Text style={styles.legalTitle}>COPYRIGHT NOTICE</Text>
            <Text style={styles.legalText}>
              © {new Date().getFullYear()} {COMPANY_NAME}. All Rights Reserved.
            </Text>
          </View>

          <Text style={styles.paragraph}>
            All content, features, and functionality of the Service—including but not limited to
            text, graphics, logos, icons, images, audio clips, digital downloads, data compilations,
            software, and the compilation thereof—are the exclusive property of {COMPANY_NAME}
            or its licensors and are protected by United States and international copyright,
            trademark, patent, trade secret, and other intellectual property laws.
          </Text>

          <Text style={styles.subheading}>Permitted Use</Text>
          <Text style={styles.paragraph}>
            You are granted a limited, non-exclusive, non-transferable license to access and use
            the Service for your internal business purposes only. You may not:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Copy, reproduce, or duplicate any part of the Service</Text>
            <Text style={styles.bulletItem}>• Modify, adapt, or create derivative works</Text>
            <Text style={styles.bulletItem}>• Distribute, license, sell, or transfer the Service</Text>
            <Text style={styles.bulletItem}>• Reverse engineer, decompile, or disassemble the software</Text>
            <Text style={styles.bulletItem}>• Remove any copyright or proprietary notices</Text>
          </View>
        </Section>

        {/* Trademarks */}
        <Section id="trademarks" title="6. Trademark Notice">
          <View style={styles.legalBox}>
            <Text style={styles.legalTitle}>TRADEMARK NOTICE</Text>
            <Text style={styles.legalText}>
              {APP_NAME}™, the {APP_NAME} logo, and all related names, logos, product and
              service names, designs, and slogans are trademarks of {COMPANY_NAME} or its
              affiliates. You must not use such marks without prior written permission.
            </Text>
          </View>

          <Text style={styles.subheading}>Protected Marks Include:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Sports Media Charter™</Text>
            <Text style={styles.bulletItem}>• SM Charter™</Text>
            <Text style={styles.bulletItem}>• "Charter Smarter"™</Text>
            <Text style={styles.bulletItem}>• The Sports Media Charter logo and design elements</Text>
            <Text style={styles.bulletItem}>• Sports Media, Inc.®</Text>
          </View>

          <Text style={styles.paragraph}>
            All other trademarks, registered trademarks, product names, and company names or
            logos mentioned herein are the property of their respective owners.
          </Text>
        </Section>

        {/* Liability */}
        <Section id="liability" title="7. Limitation of Liability">
          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • {COMPANY_NAME} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </Text>
            <Text style={styles.bulletItem}>
              • OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR THE
              SPECIFIC SERVICE GIVING RISE TO THE CLAIM.
            </Text>
            <Text style={styles.bulletItem}>
              • WE DO NOT GUARANTEE AIRCRAFT AVAILABILITY, OPERATOR PERFORMANCE, OR
              SPECIFIC FLIGHT OUTCOMES.
            </Text>
          </View>

          <Text style={styles.subheading}>Aviation Liability</Text>
          <Text style={styles.paragraph}>
            Charter operators maintain their own insurance coverage. {COMPANY_NAME} is not
            responsible for incidents during flight operations. Operators are required to
            maintain minimum coverage as required by FAA regulations.
          </Text>
        </Section>

        {/* Indemnification */}
        <Section id="indemnification" title="8. Indemnification">
          <Text style={styles.paragraph}>
            You agree to indemnify, defend, and hold harmless {COMPANY_NAME}, its officers,
            directors, employees, agents, licensors, and suppliers from and against all claims,
            liabilities, damages, judgments, awards, losses, costs, expenses, and fees (including
            reasonable attorneys' fees) arising out of or relating to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Your violation of these Terms</Text>
            <Text style={styles.bulletItem}>• Your use of the Service</Text>
            <Text style={styles.bulletItem}>• Your violation of any rights of a third party</Text>
            <Text style={styles.bulletItem}>• Any content or information you provide</Text>
          </View>
        </Section>

        {/* Disclaimers */}
        <Section id="disclaimers" title="9. Disclaimers">
          <Text style={styles.paragraph}>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
          </Text>
          <Text style={styles.paragraph}>
            WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE,
            OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </Text>
        </Section>

        {/* Governing Law */}
        <Section id="law" title="10. Governing Law & Disputes">
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the
            State of Texas, without regard to its conflict of law provisions.
          </Text>
          <Text style={styles.paragraph}>
            Any dispute arising from these Terms or your use of the Service shall be resolved
            exclusively in the state or federal courts located in Dallas County, Texas. You
            consent to the personal jurisdiction of such courts.
          </Text>
          <Text style={styles.subheading}>Arbitration</Text>
          <Text style={styles.paragraph}>
            For disputes under $50,000, you agree to binding arbitration administered by the
            American Arbitration Association under its Commercial Arbitration Rules. The
            arbitration shall be conducted in Dallas, Texas.
          </Text>
        </Section>

        {/* Termination */}
        <Section id="termination" title="11. Termination">
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and access to the Service immediately,
            without prior notice or liability, for any reason, including breach of these Terms.
          </Text>
          <Text style={styles.paragraph}>
            Upon termination:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Your right to use the Service will cease immediately</Text>
            <Text style={styles.bulletItem}>• Outstanding payment obligations remain due</Text>
            <Text style={styles.bulletItem}>• Confirmed bookings will be honored or refunded per cancellation policy</Text>
            <Text style={styles.bulletItem}>• Data retention follows our Privacy Policy</Text>
          </View>
        </Section>

        {/* Modifications */}
        <Section id="modifications" title="12. Modifications to Terms">
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. Material changes will be
            communicated via:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Email notification to your registered address</Text>
            <Text style={styles.bulletItem}>• In-app notification</Text>
            <Text style={styles.bulletItem}>• Updated effective date on this page</Text>
          </View>
          <Text style={styles.paragraph}>
            Continued use of the Service after changes become effective constitutes acceptance
            of the modified Terms.
          </Text>
        </Section>

        {/* Contact */}
        <Section id="contact" title="13. Contact Information">
          <Text style={styles.paragraph}>
            For questions about these Terms of Service:
          </Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactCompany}>{COMPANY_NAME}</Text>
            <Text style={styles.contactLine}>Legal Department</Text>
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
        </Section>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </Text>
          <Text style={styles.footerText}>
            {APP_NAME}™ is a registered trademark of {COMPANY_NAME}
          </Text>
          <Text style={styles.footerVersion}>
            Terms Version 1.0 | Last Updated: {EFFECTIVE_DATE}
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
    marginBottom: spacing[1],
  },
  legalBox: {
    backgroundColor: colors.secondary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary[500],
  },
  legalTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary[700],
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  legalText: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary[800],
    lineHeight: 20,
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
  footerVersion: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
});

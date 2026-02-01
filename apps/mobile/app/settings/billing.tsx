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
import { Card, Button, Badge } from '@/components';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  name: string;
  last4: string;
  expiry?: string;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

export default function BillingScreen() {
  const { colors: themeColors, isDark } = useTheme();
  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', name: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
    { id: '2', type: 'card', name: 'Amex', last4: '1234', expiry: '06/25', isDefault: false },
    { id: '3', type: 'bank', name: 'Chase Business', last4: '9876', isDefault: false },
  ]);

  const [invoices] = useState<Invoice[]>([
    { id: 'INV-001', date: 'Jan 15, 2026', amount: 45000, status: 'paid', description: 'DFW → LAX Charter' },
    { id: 'INV-002', date: 'Jan 10, 2026', amount: 62500, status: 'paid', description: 'DFW → MIA Round Trip' },
    { id: 'INV-003', date: 'Jan 05, 2026', amount: 38000, status: 'pending', description: 'DFW → JFK Charter' },
    { id: 'INV-004', date: 'Dec 20, 2025', amount: 55000, status: 'paid', description: 'DFW → SFO Charter' },
  ]);

  const billingInfo = {
    companyName: 'Dallas Mavericks',
    address: '2500 Victory Avenue',
    city: 'Dallas, TX 75219',
    taxId: 'XX-XXXXXXX',
    billingEmail: 'billing@mavericks.com',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background.secondary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.neutral[0], borderBottomColor: themeColors.border.light }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing & Payments</Text>
        <ThemeToggle color={themeColors.text.primary} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <Card variant="elevated" style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Outstanding Balance</Text>
            <TouchableOpacity>
              <Ionicons name="refresh" size={20} color={colors.neutral[0]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>$38,000.00</Text>
          <View style={styles.balanceFooter}>
            <View style={styles.balanceInfo}>
              <Ionicons name="time-outline" size={16} color={colors.primary[200]} />
              <Text style={styles.balanceNote}>1 invoice pending</Text>
            </View>
            <Button
              title="Pay Now"
              onPress={() => {}}
              variant="gold"
              size="sm"
              fullWidth={false}
            />
          </View>
        </Card>

        {/* Payment Methods */}
        <Text style={styles.sectionLabel}>PAYMENT METHODS</Text>
        <Card variant="outlined" padding="none">
          {paymentMethods.map((method, index) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentItem,
                index < paymentMethods.length - 1 && styles.paymentItemBorder,
              ]}
            >
              <View style={styles.paymentIcon}>
                <Ionicons
                  name={method.type === 'card' ? 'card' : 'business'}
                  size={20}
                  color={colors.primary[500]}
                />
              </View>
              <View style={styles.paymentInfo}>
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.paymentDetails}>
                  •••• {method.last4}
                  {method.expiry && ` · Expires ${method.expiry}`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addPaymentBtn}>
            <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
            <Text style={styles.addPaymentText}>Add Payment Method</Text>
          </TouchableOpacity>
        </Card>

        {/* Billing Information */}
        <Text style={styles.sectionLabel}>BILLING INFORMATION</Text>
        <Card variant="outlined">
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Company</Text>
            <Text style={styles.billingValue}>{billingInfo.companyName}</Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Address</Text>
            <Text style={styles.billingValue}>
              {billingInfo.address}{'\n'}{billingInfo.city}
            </Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Tax ID</Text>
            <Text style={styles.billingValue}>{billingInfo.taxId}</Text>
          </View>
          <View style={[styles.billingRow, { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
            <Text style={styles.billingLabel}>Billing Email</Text>
            <Text style={styles.billingValue}>{billingInfo.billingEmail}</Text>
          </View>
          <Button
            title="Edit Billing Info"
            onPress={() => {}}
            variant="outline"
            size="md"
            style={{ marginTop: spacing[4] }}
          />
        </Card>

        {/* Recent Invoices */}
        <Text style={styles.sectionLabel}>RECENT INVOICES</Text>
        <Card variant="outlined" padding="none">
          {invoices.map((invoice, index) => (
            <TouchableOpacity
              key={invoice.id}
              style={[
                styles.invoiceItem,
                index < invoices.length - 1 && styles.invoiceItemBorder,
              ]}
            >
              <View style={styles.invoiceMain}>
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceId}>{invoice.id}</Text>
                  <Badge
                    label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    variant={getStatusColor(invoice.status) as any}
                    size="sm"
                  />
                </View>
                <Text style={styles.invoiceDescription}>{invoice.description}</Text>
                <Text style={styles.invoiceDate}>{invoice.date}</Text>
              </View>
              <View style={styles.invoiceAmount}>
                <Text style={styles.invoiceAmountText}>
                  ${invoice.amount.toLocaleString()}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All Invoices</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary[500]} />
        </TouchableOpacity>

        {/* Billing Support */}
        <Text style={styles.sectionLabel}>BILLING SUPPORT</Text>
        <Card variant="outlined" style={styles.supportCard}>
          <View style={styles.supportHeader}>
            <View style={styles.supportIcon}>
              <Ionicons name="headset" size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.supportInfo}>
              <Text style={styles.supportTitle}>Charter Billing Support</Text>
              <Text style={styles.supportSubtitle}>Sports Media, Inc.</Text>
            </View>
          </View>
          <View style={styles.supportContacts}>
            <TouchableOpacity style={styles.supportContactItem}>
              <Ionicons name="call-outline" size={18} color={colors.primary[500]} />
              <Text style={styles.supportContactText}>+1 (970) 436-0580</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportContactItem}>
              <Ionicons name="mail-outline" size={18} color={colors.primary[500]} />
              <Text style={styles.supportContactText}>billing@sportsmedia.net</Text>
            </TouchableOpacity>
            <View style={styles.supportContactItem}>
              <Ionicons name="time-outline" size={18} color={colors.neutral[400]} />
              <Text style={styles.supportHours}>Mon-Fri 8am-8pm CT</Text>
            </View>
          </View>
          <View style={styles.supportAddress}>
            <Text style={styles.addressText}>Sports Media, Inc.</Text>
            <Text style={styles.addressText}>274 Mount Harvard Ave, Suite 900</Text>
            <Text style={styles.addressText}>Severance, CO 80550</Text>
          </View>
        </Card>
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
  balanceCard: {
    backgroundColor: colors.primary[500],
    marginBottom: spacing[6],
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[200],
  },
  balanceAmount: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
    marginBottom: spacing[4],
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceNote: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[200],
    marginLeft: spacing[2],
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  paymentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  paymentInfo: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  defaultBadge: {
    backgroundColor: colors.accent[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing[2],
  },
  defaultBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent[700],
  },
  paymentDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  addPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing[2],
  },
  addPaymentText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing[3],
    marginBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  billingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  billingValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'right',
  },
  invoiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  invoiceItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  invoiceMain: {
    flex: 1,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  invoiceId: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  invoiceDescription: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  invoiceDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  invoiceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceAmountText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  viewAllText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
  supportCard: {
    marginBottom: spacing[4],
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  supportIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  supportSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  supportContacts: {
    marginBottom: spacing[4],
  },
  supportContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  supportContactText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
    marginLeft: spacing[3],
  },
  supportHours: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing[3],
  },
  supportAddress: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
  addressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 22,
  },
});

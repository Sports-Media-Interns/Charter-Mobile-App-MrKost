import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Button, Input, Card } from '@/components';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function CompanyScreen() {
  const { colors: themeColors, isDark } = useTheme();
  const [companyName, setCompanyName] = useState('Dallas Mavericks');
  const [companyType, setCompanyType] = useState('NBA Team');
  const [sport, setSport] = useState('Basketball');
  const [homeAirport, setHomeAirport] = useState('DFW');
  const [address, setAddress] = useState('2500 Victory Avenue');
  const [city, setCity] = useState('Dallas');
  const [state, setState] = useState('TX');
  const [zip, setZip] = useState('75219');
  const [billingEmail, setBillingEmail] = useState('billing@mavericks.com');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (Platform.OS === 'web') {
        window.alert('Company information updated successfully!');
      } else {
        Alert.alert('Success', 'Company information updated successfully!');
      }
      router.back();
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background.secondary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.neutral[0], borderBottomColor: themeColors.border.light }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Information</Text>
        <ThemeToggle color={themeColors.text.primary} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Company Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={40} color={colors.primary[500]} />
          </View>
          <TouchableOpacity style={styles.changeLogoBtn}>
            <Ionicons name="camera" size={16} color={colors.primary[500]} />
            <Text style={styles.changeLogoText}>Change Logo</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <Text style={styles.sectionLabel}>BASIC INFORMATION</Text>
        <Card variant="outlined">
          <Input
            label="Company Name"
            placeholder="Enter company name"
            value={companyName}
            onChangeText={setCompanyName}
            leftIcon="business-outline"
          />
          <Input
            label="Company Type"
            placeholder="e.g., NBA Team, Corporation"
            value={companyType}
            onChangeText={setCompanyType}
            leftIcon="layers-outline"
          />
          <Input
            label="Sport/Industry"
            placeholder="e.g., Basketball, Entertainment"
            value={sport}
            onChangeText={setSport}
            leftIcon="trophy-outline"
          />
          <Input
            label="Home Airport (IATA Code)"
            placeholder="e.g., DFW, LAX"
            value={homeAirport}
            onChangeText={(text) => setHomeAirport(text.toUpperCase())}
            autoCapitalize="characters"
            maxLength={4}
            leftIcon="airplane-outline"
            containerStyle={{ marginBottom: 0 }}
          />
        </Card>

        {/* Address */}
        <Text style={styles.sectionLabel}>COMPANY ADDRESS</Text>
        <Card variant="outlined">
          <Input
            label="Street Address"
            placeholder="Enter street address"
            value={address}
            onChangeText={setAddress}
            leftIcon="location-outline"
          />
          <View style={styles.row}>
            <View style={styles.flex2}>
              <Input
                label="City"
                placeholder="City"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={styles.flex1}>
              <Input
                label="State"
                placeholder="ST"
                value={state}
                onChangeText={(text) => setState(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
            <View style={styles.flex1}>
              <Input
                label="ZIP"
                placeholder="ZIP"
                value={zip}
                onChangeText={setZip}
                keyboardType="numeric"
                maxLength={5}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
          </View>
        </Card>

        {/* Billing */}
        <Text style={styles.sectionLabel}>BILLING CONTACT</Text>
        <Card variant="outlined">
          <Input
            label="Billing Email"
            placeholder="billing@company.com"
            value={billingEmail}
            onChangeText={setBillingEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            containerStyle={{ marginBottom: 0 }}
          />
        </Card>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            variant="primary"
            size="lg"
          />
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
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  changeLogoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    gap: spacing[2],
  },
  changeLogoText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  buttonSection: {
    marginTop: spacing[6],
  },
});

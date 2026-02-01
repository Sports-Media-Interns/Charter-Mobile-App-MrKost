import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/services/supabase';
import { Card, Button, Badge } from '@/components';
import { colors as staticColors, typography, spacing, borderRadius, shadows } from '@/theme';
import { useCRMTracker } from '@/hooks/useCRMTracker';
import { useTheme } from '@/hooks/useTheme';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarInitials: string;
  avatarUri?: string;
}

interface CompanyInfo {
  name: string;
  type: string;
  sport: string;
  homeAirport: string;
  billingEmail: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

interface AuthorizedPerson {
  id: string;
  name: string;
  title: string;
  email: string;
  canApprove: boolean;
  canBook: boolean;
}

// Mock data - in production, this would come from Supabase
const mockProfile: UserProfile = {
  name: 'Dan Kirkpatrick',
  email: 'dan@dakdan.com',
  phone: '+1 (555) 123-4567',
  role: 'Team Admin',
  avatarInitials: 'DK',
};

const mockCompany: CompanyInfo = {
  name: 'Dallas Mavericks',
  type: 'NBA Team',
  sport: 'Basketball',
  homeAirport: 'DFW - Dallas/Fort Worth',
  billingEmail: 'billing@mavericks.com',
};

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Travel Coordinator',
    email: 'sarah@mavericks.com',
    phone: '+1 (555) 234-5678',
    isPrimary: true,
  },
  {
    id: '2',
    name: 'Mike Williams',
    role: 'Assistant Travel Manager',
    email: 'mike@mavericks.com',
    phone: '+1 (555) 345-6789',
    isPrimary: false,
  },
];

const mockAuthorizedPersonnel: AuthorizedPerson[] = [
  {
    id: '1',
    name: 'Mark Cuban',
    title: 'Owner',
    email: 'mark@mavericks.com',
    canApprove: true,
    canBook: true,
  },
  {
    id: '2',
    name: 'Jason Kidd',
    title: 'Head Coach',
    email: 'jkidd@mavericks.com',
    canApprove: true,
    canBook: false,
  },
  {
    id: '3',
    name: 'Luka Doncic',
    title: 'Player',
    email: 'luka@mavericks.com',
    canApprove: false,
    canBook: false,
  },
];

export default function ProfileScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [company] = useState<CompanyInfo>(mockCompany);
  const [contacts] = useState<Contact[]>(mockContacts);
  const [authorizedPersonnel] = useState<AuthorizedPerson[]>(mockAuthorizedPersonnel);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { trackEvent, trackButtonClick } = useCRMTracker();
  const { colors, isDark, toggle } = useTheme();
  const insets = useSafeAreaInsets();

  // Track profile viewed on mount
  useEffect(() => {
    trackEvent('profile_viewed');
  }, []);

  const handleSignOut = async () => {
    trackEvent('user_logged_out');
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh data here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const requestPermission = async (type: 'camera' | 'library') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermission('library');
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access to change your profile picture.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setShowAvatarModal(false);
      setUploadingAvatar(true);

      // Simulate upload delay
      setTimeout(() => {
        setProfile(prev => ({ ...prev, avatarUri: result.assets[0].uri }));
        setUploadingAvatar(false);
        trackEvent('avatar_changed', { properties: { source: 'gallery' } });
        Alert.alert('Success', 'Profile picture updated successfully.');
      }, 1500);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermission('camera');
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant camera access to take a profile picture.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setShowAvatarModal(false);
      setUploadingAvatar(true);

      // Simulate upload delay
      setTimeout(() => {
        setProfile(prev => ({ ...prev, avatarUri: result.assets[0].uri }));
        setUploadingAvatar(false);
        trackEvent('avatar_changed', { properties: { source: 'camera' } });
        Alert.alert('Success', 'Profile picture updated successfully.');
      }, 1500);
    }
  };

  const removePhoto = () => {
    setShowAvatarModal(false);
    setProfile(prev => ({ ...prev, avatarUri: undefined }));
    trackEvent('avatar_changed', { properties: { source: 'removed' } });
    Alert.alert('Success', 'Profile picture removed.');
  };

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
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={toggle}
              accessibilityLabel="Toggle dark mode"
              accessibilityRole="button"
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push('/settings/security')}
              accessibilityLabel="Settings"
              accessibilityRole="button"
            >
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.neutral[0] }]}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowAvatarModal(true)}
            disabled={uploadingAvatar}
            accessibilityLabel="Change profile picture"
            accessibilityRole="button"
          >
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              {uploadingAvatar ? (
                <Ionicons name="hourglass" size={12} color={colors.neutral[0]} />
              ) : (
                <Ionicons name="camera" size={12} color={colors.neutral[0]} />
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text.primary }]}>{profile.name}</Text>
            <Text style={[styles.profileEmail, { color: colors.text.secondary }]}>{profile.email}</Text>
            <View style={styles.roleContainer}>
              <Badge label={profile.role} variant="primary" size="sm" />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editProfileBtn, { backgroundColor: colors.primary[50] }]}
            onPress={() => router.push('/settings/security')}
          >
            <Ionicons name="pencil" size={18} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>

        {/* Company Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Company Information</Text>
            <TouchableOpacity onPress={() => router.push('/settings/company')}>
              <Ionicons name="pencil-outline" size={18} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings/company')} activeOpacity={0.7}>
            <Card variant="outlined">
              <View style={styles.companyHeader}>
                <View style={styles.companyLogo}>
                  <Ionicons name="business" size={24} color={colors.primary[500]} />
                </View>
                <View style={styles.companyHeaderInfo}>
                  <Text style={[styles.companyName, { color: colors.text.primary }]}>{company.name}</Text>
                  <Text style={styles.companyType}>{company.type} - {company.sport}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
              </View>
              <View style={[styles.companyDetails, { borderTopColor: colors.border.light }]}>
                <View style={styles.companyDetailRow}>
                  <View style={styles.companyDetailIcon}>
                    <Ionicons name="airplane-outline" size={16} color={colors.neutral[400]} />
                  </View>
                  <View style={styles.companyDetailContent}>
                    <Text style={styles.companyDetailLabel}>Home Airport</Text>
                    <Text style={[styles.companyDetailValue, { color: colors.text.primary }]}>{company.homeAirport}</Text>
                  </View>
                </View>
                <View style={styles.companyDetailRow}>
                  <View style={styles.companyDetailIcon}>
                    <Ionicons name="mail-outline" size={16} color={colors.neutral[400]} />
                  </View>
                  <View style={styles.companyDetailContent}>
                    <Text style={styles.companyDetailLabel}>Billing Email</Text>
                    <Text style={[styles.companyDetailValue, { color: colors.text.primary }]}>{company.billingEmail}</Text>
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Company Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Company Contacts</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push('/settings/contacts')}
            >
              <Ionicons name="add-circle" size={22} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>
          <Card variant="outlined" padding="none">
            {contacts.map((contact, index) => (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.contactItem,
                  index < contacts.length - 1 && [styles.contactItemBorder, { borderBottomColor: colors.border.light }],
                ]}
                onPress={() => router.push('/settings/contacts')}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <View style={styles.contactNameRow}>
                    <Text style={[styles.contactName, { color: colors.text.primary }]}>{contact.name}</Text>
                    {contact.isPrimary && (
                      <Badge label="Primary" variant="success" size="sm" />
                    )}
                  </View>
                  <Text style={styles.contactRole}>{contact.role}</Text>
                  <View style={styles.contactDetails}>
                    <Ionicons name="mail-outline" size={12} color={colors.neutral[400]} />
                    <Text style={styles.contactDetailText}>{contact.email}</Text>
                  </View>
                  <View style={styles.contactDetails}>
                    <Ionicons name="call-outline" size={12} color={colors.neutral[400]} />
                    <Text style={styles.contactDetailText}>{contact.phone}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Authorized Personnel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Authorized Personnel</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push('/settings/personnel')}
            >
              <Ionicons name="add-circle" size={22} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>
          <Card variant="outlined" padding="none">
            {authorizedPersonnel.map((person, index) => (
              <TouchableOpacity
                key={person.id}
                style={[
                  styles.personItem,
                  index < authorizedPersonnel.length - 1 && [styles.personItemBorder, { borderBottomColor: colors.border.light }],
                ]}
                onPress={() => router.push('/settings/personnel')}
              >
                <View style={styles.personAvatar}>
                  <Text style={styles.personAvatarText}>
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.personInfo}>
                  <Text style={[styles.personName, { color: colors.text.primary }]}>{person.name}</Text>
                  <Text style={styles.personTitle}>{person.title}</Text>
                  <View style={styles.permissionBadges}>
                    {person.canApprove && (
                      <View style={styles.permissionBadge}>
                        <Ionicons name="checkmark-circle" size={12} color={colors.accent[600]} />
                        <Text style={styles.permissionText}>Can Approve</Text>
                      </View>
                    )}
                    {person.canBook && (
                      <View style={styles.permissionBadge}>
                        <Ionicons name="airplane" size={12} color={colors.primary[500]} />
                        <Text style={styles.permissionText}>Can Book</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Admin Section - Only shown for admin users */}
        {profile.role === 'Team Admin' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Administration</Text>
            <Card variant="outlined" padding="none">
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/settings/admin')}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.error[50] }]}>
                  <Ionicons name="people-outline" size={20} color={colors.error[600]} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text.primary }]}>User Management</Text>
                <Badge label="Admin" variant="error" size="sm" />
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} style={{ marginLeft: spacing[2] }} />
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Account</Text>
          <Card variant="outlined" padding="none">
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder, { borderBottomColor: colors.border.light }]}
              onPress={() => router.push('/settings/notifications')}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="notifications-outline" size={20} color={colors.primary[500]} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text.primary }]}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder, { borderBottomColor: colors.border.light }]}
              onPress={() => router.push('/settings/security')}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary[500]} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text.primary }]}>Security & Privacy</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder, { borderBottomColor: colors.border.light }]}
              onPress={() => router.push('/settings/billing')}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.secondary[50] }]}>
                <Ionicons name="card-outline" size={20} color={colors.secondary[600]} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text.primary }]}>Billing & Payments</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings/help')}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.neutral[100] }]}>
                <Ionicons name="help-circle-outline" size={20} color={colors.neutral[600]} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text.primary }]}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            icon="log-out-outline"
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>Sports Media Charter v1.0.0</Text>
      </ScrollView>

      {/* Avatar Picker Modal */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAvatarModal(false)}
        >
          <View style={[styles.avatarModalContent, { backgroundColor: colors.neutral[0] }]}>
            <View style={styles.avatarModalHeader}>
              <Text style={[styles.avatarModalTitle, { color: colors.text.primary }]}>Profile Picture</Text>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarModalPreview}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatarModalImage} />
              ) : (
                <View style={styles.avatarModalPlaceholder}>
                  <Text style={styles.avatarModalPlaceholderText}>{profile.avatarInitials}</Text>
                </View>
              )}
            </View>

            <View style={styles.avatarModalOptions}>
              <TouchableOpacity style={styles.avatarOption} onPress={takePhoto}>
                <View style={[styles.avatarOptionIcon, { backgroundColor: colors.primary[50] }]}>
                  <Ionicons name="camera" size={24} color={colors.primary[500]} />
                </View>
                <Text style={[styles.avatarOptionText, { color: colors.text.primary }]}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.avatarOption} onPress={pickImageFromGallery}>
                <View style={[styles.avatarOptionIcon, { backgroundColor: colors.secondary[50] }]}>
                  <Ionicons name="images" size={24} color={colors.secondary[600]} />
                </View>
                <Text style={[styles.avatarOptionText, { color: colors.text.primary }]}>Choose from Gallery</Text>
              </TouchableOpacity>

              {profile.avatarUri && (
                <TouchableOpacity style={styles.avatarOption} onPress={removePhoto}>
                  <View style={[styles.avatarOptionIcon, { backgroundColor: colors.error[50] }]}>
                    <Ionicons name="trash" size={24} color={colors.error[500]} />
                  </View>
                  <Text style={[styles.avatarOptionText, { color: colors.error[500] }]}>
                    Remove Photo
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.avatarModalNote}>
              Supported formats: JPG, PNG. Max size: 5MB.
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: colors.neutral[0],
    marginHorizontal: spacing[4],
    marginTop: -spacing[6],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[0],
  },
  avatarText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  roleContainer: {
    marginTop: spacing[2],
  },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: spacing[6],
    paddingHorizontal: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  addBtn: {
    padding: spacing[1],
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyHeaderInfo: {
    marginLeft: spacing[3],
    flex: 1,
  },
  companyName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  companyType: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  companyDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[4],
  },
  companyDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  companyDetailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  companyDetailContent: {
    flex: 1,
  },
  companyDetailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  companyDetailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginTop: spacing[1],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  contactItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.secondary[700],
  },
  contactInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  contactName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  contactRole: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  contactDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  contactDetailText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing[1],
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  personItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  personInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  personName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  personTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  permissionBadges: {
    flexDirection: 'row',
    marginTop: spacing[2],
    gap: spacing[2],
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  permissionText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginLeft: spacing[1],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  version: {
    textAlign: 'center',
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing[6],
    marginBottom: spacing[4],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  avatarModalContent: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  avatarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  avatarModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  avatarModalPreview: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  avatarModalImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary[100],
  },
  avatarModalPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary[200],
  },
  avatarModalPlaceholderText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  avatarModalOptions: {
    gap: spacing[3],
  },
  avatarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    borderRadius: borderRadius.xl,
  },
  avatarOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  avatarOptionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  avatarModalNote: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing[4],
  },
});

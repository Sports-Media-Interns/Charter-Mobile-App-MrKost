import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Platform,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Card, Button, Badge } from '@/components';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';

// ============================================================================
// TYPES
// ============================================================================

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'team_admin' | 'executive' | 'manager' | 'requester' | 'viewer';
  status: 'active' | 'locked' | 'pending' | 'suspended';
  avatarUri?: string;
  department: string;
  title: string;
  lastLogin?: string;
  createdAt: string;
  lastPasswordChange?: string;
  mfaEnabled: boolean;
  permissions: {
    canCreateRequests: boolean;
    canApproveRequests: boolean;
    canViewAllRequests: boolean;
    canManageUsers: boolean;
  };
}

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

type ModalType = 'add' | 'view' | null;
type AddStep = 'info' | 'role' | 'security' | 'review';

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLE_CONFIG = {
  team_admin: {
    label: 'Team Admin',
    desc: 'Full access to all features including user management',
    icon: 'shield-checkmark',
    color: colors.primary[500],
    bg: colors.primary[50],
  },
  executive: {
    label: 'Executive',
    desc: 'Can create, approve requests and view reports',
    icon: 'briefcase',
    color: colors.secondary[600],
    bg: colors.secondary[50],
  },
  manager: {
    label: 'Manager',
    desc: 'Can create requests and approve within scope',
    icon: 'people',
    color: colors.accent[600],
    bg: colors.accent[50],
  },
  requester: {
    label: 'Requester',
    desc: 'Can create and submit charter requests',
    icon: 'airplane',
    color: colors.neutral[600],
    bg: colors.neutral[100],
  },
  viewer: {
    label: 'Viewer',
    desc: 'Read-only access to approved content',
    icon: 'eye',
    color: colors.neutral[500],
    bg: colors.neutral[100],
  },
};

const STATUS_CONFIG = {
  active: { label: 'Active', color: colors.accent[600], bg: colors.accent[50] },
  pending: { label: 'Pending', color: colors.secondary[600], bg: colors.secondary[50] },
  locked: { label: 'Locked', color: colors.error, bg: '#FEE2E2' },
  suspended: { label: 'Suspended', color: colors.neutral[600], bg: colors.neutral[200] },
};

const DEPARTMENTS = [
  'Executive Office',
  'Team Operations',
  'Travel & Logistics',
  'Finance',
  'Player Personnel',
  'Coaching Staff',
  'Medical',
  'Communications',
];

const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Dan',
    lastName: 'Kirkpatrick',
    email: 'dan@dakdan.com',
    phone: '+1 (555) 123-4567',
    role: 'team_admin',
    status: 'active',
    department: 'Executive Office',
    title: 'Director of Operations',
    lastLogin: '2026-01-25T10:30:00',
    createdAt: '2025-06-15',
    lastPasswordChange: '2026-01-10',
    mfaEnabled: true,
    permissions: { canCreateRequests: true, canApproveRequests: true, canViewAllRequests: true, canManageUsers: true },
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@mavericks.com',
    phone: '+1 (555) 234-5678',
    role: 'manager',
    status: 'active',
    department: 'Travel & Logistics',
    title: 'Director of Team Travel',
    lastLogin: '2026-01-24T15:45:00',
    createdAt: '2025-08-20',
    lastPasswordChange: '2025-12-01',
    mfaEnabled: true,
    permissions: { canCreateRequests: true, canApproveRequests: true, canViewAllRequests: true, canManageUsers: false },
  },
  {
    id: '3',
    firstName: 'Marcus',
    lastName: 'Williams',
    email: 'mwilliams@mavericks.com',
    phone: '+1 (555) 345-6789',
    role: 'executive',
    status: 'active',
    department: 'Player Personnel',
    title: 'VP of Basketball Operations',
    lastLogin: '2026-01-23T09:15:00',
    createdAt: '2025-09-10',
    mfaEnabled: true,
    permissions: { canCreateRequests: true, canApproveRequests: true, canViewAllRequests: true, canManageUsers: false },
  },
  {
    id: '4',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jmartinez@mavericks.com',
    phone: '+1 (555) 456-7890',
    role: 'requester',
    status: 'locked',
    department: 'Finance',
    title: 'CFO',
    lastLogin: '2026-01-15T14:20:00',
    createdAt: '2025-10-05',
    mfaEnabled: false,
    permissions: { canCreateRequests: true, canApproveRequests: false, canViewAllRequests: false, canManageUsers: false },
  },
  {
    id: '5',
    firstName: 'Robert',
    lastName: 'Davis',
    email: 'rdavis@mavericks.com',
    phone: '',
    role: 'viewer',
    status: 'pending',
    department: 'Communications',
    title: 'Communications Director',
    createdAt: '2026-01-20',
    mfaEnabled: false,
    permissions: { canCreateRequests: false, canApproveRequests: false, canViewAllRequests: false, canManageUsers: false },
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminScreen() {
  const { colors: themeColors, isDark } = useTheme();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add user form
  const [addStep, setAddStep] = useState<AddStep>('info');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    title: '',
    role: 'requester' as User['role'],
    avatarUri: '',
    password: '',
    confirmPassword: '',
    sendInvite: true,
    requireMfa: false,
  });
  const [pwdReqs, setPwdReqs] = useState<PasswordRequirements>({
    minLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecial: false,
  });

  // Helpers
  const showAlert = (title: string, msg: string) => {
    Platform.OS === 'web' ? window.alert(`${title}\n\n${msg}`) : Alert.alert(title, msg);
  };

  const getInitials = (first: string, last: string) => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  const formatDate = (str?: string) => {
    if (!str) return 'Never';
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const validatePassword = (pwd: string): PasswordRequirements => ({
    minLength: pwd.length >= 12,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  });

  const isPasswordValid = () => Object.values(pwdReqs).every(Boolean);

  const filteredUsers = users.filter(u => {
    const name = `${u.firstName} ${u.lastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Image picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Required', 'Please grant photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setForm(f => ({ ...f, avatarUri: result.assets[0].uri }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Required', 'Please grant camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setForm(f => ({ ...f, avatarUri: result.assets[0].uri }));
    }
  };

  // Form actions
  const resetForm = () => {
    setForm({
      firstName: '', lastName: '', email: '', phone: '', department: '', title: '',
      role: 'requester', avatarUri: '', password: '', confirmPassword: '', sendInvite: true, requireMfa: false,
    });
    setAddStep('info');
    setPwdReqs({ minLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecial: false });
  };

  const validateInfo = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showAlert('Required', 'Please enter first and last name.');
      return false;
    }
    if (!form.email.includes('@')) {
      showAlert('Invalid Email', 'Please enter a valid email.');
      return false;
    }
    if (!form.department || !form.title.trim()) {
      showAlert('Required', 'Please select department and enter job title.');
      return false;
    }
    return true;
  };

  const validateSecurity = () => {
    if (!form.sendInvite) {
      if (!isPasswordValid()) {
        showAlert('Password', 'Password does not meet requirements.');
        return false;
      }
      if (form.password !== form.confirmPassword) {
        showAlert('Mismatch', 'Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const createUser = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newUser: User = {
        id: Date.now().toString(),
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        role: form.role,
        status: form.sendInvite ? 'pending' : 'active',
        avatarUri: form.avatarUri,
        department: form.department,
        title: form.title,
        createdAt: new Date().toISOString().split('T')[0],
        mfaEnabled: false,
        permissions: {
          canCreateRequests: ['team_admin', 'executive', 'manager', 'requester'].includes(form.role),
          canApproveRequests: ['team_admin', 'executive', 'manager'].includes(form.role),
          canViewAllRequests: ['team_admin', 'executive', 'manager'].includes(form.role),
          canManageUsers: form.role === 'team_admin',
        },
      };
      setUsers(prev => [...prev, newUser]);
      setIsLoading(false);
      setActiveModal(null);
      resetForm();
      showAlert('Success', form.sendInvite
        ? `Invitation sent to ${form.email}`
        : `${form.firstName} ${form.lastName} has been added.`);
    }, 1500);
  };

  const toggleUserStatus = (user: User) => {
    if (user.id === '1') {
      showAlert('Not Allowed', 'You cannot modify your own account.');
      return;
    }
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    showAlert('Updated', `Account ${newStatus === 'active' ? 'activated' : 'suspended'}.`);
  };

  const unlockUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'active' } : u));
    showAlert('Unlocked', `${user.firstName}'s account has been unlocked.`);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background.secondary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.neutral[0], borderBottomColor: themeColors.border.light }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>Dallas Mavericks</Text>
        </View>
        <ThemeToggle color={themeColors.text.primary} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={[styles.statNum, { color: colors.neutral[0] }]}>{users.length}</Text>
            <Text style={[styles.statLabel, { color: colors.neutral[0] }]}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.accent[600] }]}>
              {users.filter(u => u.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.secondary[600] }]}>
              {users.filter(u => u.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.error }]}>
              {users.filter(u => u.status === 'locked' || u.status === 'suspended').length}
            </Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* User List */}
        <Text style={styles.sectionLabel}>{filteredUsers.length} USERS</Text>

        {filteredUsers.map(user => {
          const roleConfig = ROLE_CONFIG[user.role];
          const statusConfig = STATUS_CONFIG[user.status];
          const isYou = user.id === '1';

          return (
            <Card key={user.id} variant="outlined" style={styles.userCard}>
              <TouchableOpacity
                style={styles.userRow}
                onPress={() => { setSelectedUser(user); setActiveModal('view'); }}
              >
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                  {user.avatarUri ? (
                    <Image source={{ uri: user.avatarUri }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: roleConfig.bg }]}>
                      <Text style={[styles.avatarText, { color: roleConfig.color }]}>
                        {getInitials(user.firstName, user.lastName)}
                      </Text>
                    </View>
                  )}
                  {user.mfaEnabled && (
                    <View style={styles.mfaBadge}>
                      <Ionicons name="shield-checkmark" size={8} color={colors.neutral[0]} />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                    {isYou && <View style={styles.youBadge}><Text style={styles.youText}>You</Text></View>}
                  </View>
                  <Text style={styles.userTitle}>{user.title}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
              </TouchableOpacity>

              {/* Tags */}
              <View style={styles.tagRow}>
                <View style={[styles.tag, { backgroundColor: roleConfig.bg }]}>
                  <Ionicons name={roleConfig.icon as any} size={12} color={roleConfig.color} />
                  <Text style={[styles.tagText, { color: roleConfig.color }]}>{roleConfig.label}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.tagText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{user.department}</Text>
                </View>
              </View>

              {/* Meta */}
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
                <Text style={styles.metaText}>Last login: {formatDate(user.lastLogin)}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                {user.status === 'pending' && (
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]}>
                    <Ionicons name="mail" size={16} color={colors.neutral[0]} />
                    <Text style={styles.actionBtnTextWhite}>Resend Invite</Text>
                  </TouchableOpacity>
                )}
                {user.status === 'locked' && (
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSuccess]} onPress={() => unlockUser(user)}>
                    <Ionicons name="lock-open" size={16} color={colors.neutral[0]} />
                    <Text style={styles.actionBtnTextWhite}>Unlock</Text>
                  </TouchableOpacity>
                )}
                {user.status === 'active' && !isYou && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => toggleUserStatus(user)}>
                    <Ionicons name="pause-circle-outline" size={16} color={colors.secondary[600]} />
                    <Text style={[styles.actionBtnText, { color: colors.secondary[600] }]}>Suspend</Text>
                  </TouchableOpacity>
                )}
                {user.status === 'suspended' && (
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSuccess]} onPress={() => toggleUserStatus(user)}>
                    <Ionicons name="play-circle" size={16} color={colors.neutral[0]} />
                    <Text style={styles.actionBtnTextWhite}>Activate</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => { setSelectedUser(user); setActiveModal('view'); }}
                >
                  <Ionicons name="open-outline" size={16} color={colors.primary[500]} />
                  <Text style={[styles.actionBtnText, { color: colors.primary[500] }]}>Details</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}

        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No users found</Text>
          </View>
        )}

        {/* Policy */}
        <View style={styles.policyBox}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary[500]} />
          <View style={{ flex: 1, marginLeft: spacing[3] }}>
            <Text style={styles.policyTitle}>Security Policy</Text>
            <Text style={styles.policyText}>
              Passwords require 12+ characters with complexity. 2FA recommended for approval access. All actions are logged.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ======== ADD USER MODAL ======== */}
      <Modal visible={activeModal === 'add'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add New User</Text>
                <Text style={styles.modalSubtitle}>
                  Step {['info', 'role', 'security', 'review'].indexOf(addStep) + 1} of 4
                </Text>
              </View>
              <TouchableOpacity onPress={() => { setActiveModal(null); resetForm(); }}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Progress */}
            <View style={styles.progressRow}>
              {['info', 'role', 'security', 'review'].map((step, i) => {
                const current = ['info', 'role', 'security', 'review'].indexOf(addStep);
                const done = i < current;
                const active = i === current;
                return (
                  <View key={step} style={styles.progressItem}>
                    <View style={[styles.progressDot, done && styles.progressDotDone, active && styles.progressDotActive]}>
                      {done ? (
                        <Ionicons name="checkmark" size={12} color={colors.neutral[0]} />
                      ) : (
                        <Text style={[styles.progressDotText, (active || done) && { color: colors.neutral[0] }]}>{i + 1}</Text>
                      )}
                    </View>
                    {i < 3 && <View style={[styles.progressLine, done && styles.progressLineDone]} />}
                  </View>
                );
              })}
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Step 1: Info */}
              {addStep === 'info' && (
                <View>
                  {/* Avatar */}
                  <View style={styles.avatarSection}>
                    <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
                      {form.avatarUri ? (
                        <Image source={{ uri: form.avatarUri }} style={styles.avatarPickerImg} />
                      ) : (
                        <View style={styles.avatarPickerEmpty}>
                          <Ionicons name="person" size={40} color={colors.neutral[400]} />
                        </View>
                      )}
                      <View style={styles.avatarPickerBadge}>
                        <Ionicons name="camera" size={14} color={colors.neutral[0]} />
                      </View>
                    </TouchableOpacity>
                    <View style={styles.avatarBtns}>
                      <TouchableOpacity style={styles.avatarBtn} onPress={pickImage}>
                        <Ionicons name="images-outline" size={18} color={colors.primary[500]} />
                        <Text style={styles.avatarBtnText}>Gallery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.avatarBtn} onPress={takePhoto}>
                        <Ionicons name="camera-outline" size={18} color={colors.primary[500]} />
                        <Text style={styles.avatarBtnText}>Camera</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Fields */}
                  <View style={styles.formRow}>
                    <View style={styles.formHalf}>
                      <Text style={styles.formLabel}>First Name *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={form.firstName}
                        onChangeText={t => setForm(f => ({ ...f, firstName: t }))}
                        placeholder="John"
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                    <View style={styles.formHalf}>
                      <Text style={styles.formLabel}>Last Name *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={form.lastName}
                        onChangeText={t => setForm(f => ({ ...f, lastName: t }))}
                        placeholder="Smith"
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                  </View>

                  <Text style={styles.formLabel}>Email *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.email}
                    onChangeText={t => setForm(f => ({ ...f, email: t.toLowerCase() }))}
                    placeholder="john.smith@team.com"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.formLabel}>Phone</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.phone}
                    onChangeText={t => setForm(f => ({ ...f, phone: t }))}
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.formLabel}>Department *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing[4] }}>
                    {DEPARTMENTS.map(d => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.chip, form.department === d && styles.chipActive]}
                        onPress={() => setForm(f => ({ ...f, department: d }))}
                      >
                        <Text style={[styles.chipText, form.department === d && styles.chipTextActive]}>{d}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.formLabel}>Job Title *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.title}
                    onChangeText={t => setForm(f => ({ ...f, title: t }))}
                    placeholder="Director of Team Travel"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>
              )}

              {/* Step 2: Role */}
              {addStep === 'role' && (
                <View>
                  <Text style={styles.stepTitle}>Select Role</Text>
                  <Text style={styles.stepDesc}>Choose the appropriate access level for this user.</Text>

                  {(Object.keys(ROLE_CONFIG) as Array<keyof typeof ROLE_CONFIG>).map(key => {
                    const cfg = ROLE_CONFIG[key];
                    const selected = form.role === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[styles.roleCard, selected && styles.roleCardSelected]}
                        onPress={() => setForm(f => ({ ...f, role: key }))}
                      >
                        <View style={[styles.roleIcon, { backgroundColor: cfg.bg }]}>
                          <Ionicons name={cfg.icon as any} size={24} color={cfg.color} />
                        </View>
                        <View style={styles.roleInfo}>
                          <Text style={styles.roleLabel}>{cfg.label}</Text>
                          <Text style={styles.roleDesc}>{cfg.desc}</Text>
                        </View>
                        <View style={[styles.radio, selected && styles.radioSelected]}>
                          {selected && <View style={styles.radioInner} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Step 3: Security */}
              {addStep === 'security' && (
                <View>
                  <Text style={styles.stepTitle}>Security Settings</Text>

                  <View style={styles.switchRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.switchLabel}>Send Activation Email</Text>
                      <Text style={styles.switchDesc}>User will set their own password via email link.</Text>
                    </View>
                    <Switch
                      value={form.sendInvite}
                      onValueChange={v => setForm(f => ({ ...f, sendInvite: v }))}
                      trackColor={{ false: colors.neutral[200], true: colors.primary[200] }}
                      thumbColor={form.sendInvite ? colors.primary[500] : colors.neutral[400]}
                    />
                  </View>

                  {!form.sendInvite && (
                    <View style={styles.passwordSection}>
                      <Text style={styles.formLabel}>Password *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={form.password}
                        onChangeText={t => { setForm(f => ({ ...f, password: t })); setPwdReqs(validatePassword(t)); }}
                        placeholder="Create password"
                        placeholderTextColor={colors.text.tertiary}
                        secureTextEntry
                      />

                      <Text style={styles.formLabel}>Confirm Password *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={form.confirmPassword}
                        onChangeText={t => setForm(f => ({ ...f, confirmPassword: t }))}
                        placeholder="Confirm password"
                        placeholderTextColor={colors.text.tertiary}
                        secureTextEntry
                      />

                      <View style={styles.pwdReqBox}>
                        <Text style={styles.pwdReqTitle}>Password Requirements:</Text>
                        {[
                          { key: 'minLength', label: '12+ characters' },
                          { key: 'hasUppercase', label: 'Uppercase letter (A-Z)' },
                          { key: 'hasLowercase', label: 'Lowercase letter (a-z)' },
                          { key: 'hasNumber', label: 'Number (0-9)' },
                          { key: 'hasSpecial', label: 'Special character (!@#$%)' },
                        ].map(r => (
                          <View key={r.key} style={styles.pwdReqItem}>
                            <Ionicons
                              name={pwdReqs[r.key as keyof PasswordRequirements] ? 'checkmark-circle' : 'ellipse-outline'}
                              size={16}
                              color={pwdReqs[r.key as keyof PasswordRequirements] ? colors.accent[600] : colors.neutral[400]}
                            />
                            <Text style={[
                              styles.pwdReqText,
                              pwdReqs[r.key as keyof PasswordRequirements] && { color: colors.accent[700] }
                            ]}>{r.label}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.switchRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.switchLabel}>Require Two-Factor Authentication</Text>
                      <Text style={styles.switchDesc}>Recommended for users with approval permissions.</Text>
                    </View>
                    <Switch
                      value={form.requireMfa}
                      onValueChange={v => setForm(f => ({ ...f, requireMfa: v }))}
                      trackColor={{ false: colors.neutral[200], true: colors.accent[200] }}
                      thumbColor={form.requireMfa ? colors.accent[600] : colors.neutral[400]}
                    />
                  </View>
                </View>
              )}

              {/* Step 4: Review */}
              {addStep === 'review' && (
                <View>
                  <Text style={styles.stepTitle}>Review & Confirm</Text>

                  <View style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      {form.avatarUri ? (
                        <Image source={{ uri: form.avatarUri }} style={styles.reviewAvatar} />
                      ) : (
                        <View style={[styles.reviewAvatarEmpty, { backgroundColor: ROLE_CONFIG[form.role].bg }]}>
                          <Text style={[styles.reviewAvatarText, { color: ROLE_CONFIG[form.role].color }]}>
                            {getInitials(form.firstName, form.lastName)}
                          </Text>
                        </View>
                      )}
                      <View style={styles.reviewInfo}>
                        <Text style={styles.reviewName}>{form.firstName} {form.lastName}</Text>
                        <Text style={styles.reviewTitle}>{form.title}</Text>
                        <View style={[styles.tag, { backgroundColor: ROLE_CONFIG[form.role].bg, marginTop: spacing[2] }]}>
                          <Text style={[styles.tagText, { color: ROLE_CONFIG[form.role].color }]}>
                            {ROLE_CONFIG[form.role].label}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.reviewDetails}>
                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Email</Text>
                        <Text style={styles.reviewValue}>{form.email}</Text>
                      </View>
                      {form.phone && (
                        <View style={styles.reviewRow}>
                          <Text style={styles.reviewLabel}>Phone</Text>
                          <Text style={styles.reviewValue}>{form.phone}</Text>
                        </View>
                      )}
                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Department</Text>
                        <Text style={styles.reviewValue}>{form.department}</Text>
                      </View>
                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Activation</Text>
                        <Text style={styles.reviewValue}>{form.sendInvite ? 'Email invitation' : 'Manual password'}</Text>
                      </View>
                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>2FA Required</Text>
                        <Text style={styles.reviewValue}>{form.requireMfa ? 'Yes' : 'No'}</Text>
                      </View>
                    </View>
                  </View>

                  {form.sendInvite && (
                    <View style={styles.infoBox}>
                      <Ionicons name="information-circle" size={20} color={colors.primary[600]} />
                      <Text style={styles.infoText}>
                        An activation email will be sent to {form.email} with instructions to complete account setup.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              {addStep !== 'info' && (
                <TouchableOpacity
                  style={styles.footerBtnSecondary}
                  onPress={() => {
                    const steps: AddStep[] = ['info', 'role', 'security', 'review'];
                    const idx = steps.indexOf(addStep);
                    setAddStep(steps[idx - 1]);
                  }}
                >
                  <Ionicons name="arrow-back" size={18} color={colors.primary[500]} />
                  <Text style={styles.footerBtnSecondaryText}>Back</Text>
                </TouchableOpacity>
              )}
              {addStep === 'info' && (
                <TouchableOpacity style={styles.footerBtnSecondary} onPress={() => { setActiveModal(null); resetForm(); }}>
                  <Text style={styles.footerBtnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.footerBtnPrimary, isLoading && styles.footerBtnDisabled]}
                disabled={isLoading}
                onPress={() => {
                  if (addStep === 'info' && validateInfo()) setAddStep('role');
                  else if (addStep === 'role') setAddStep('security');
                  else if (addStep === 'security' && validateSecurity()) setAddStep('review');
                  else if (addStep === 'review') createUser();
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.neutral[0]} />
                ) : (
                  <>
                    <Text style={styles.footerBtnPrimaryText}>
                      {addStep === 'review' ? 'Create User' : 'Continue'}
                    </Text>
                    {addStep !== 'review' && <Ionicons name="arrow-forward" size={18} color={colors.neutral[0]} />}
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======== VIEW USER MODAL ======== */}
      <Modal visible={activeModal === 'view'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>User Details</Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.viewProfile}>
                  {selectedUser.avatarUri ? (
                    <Image source={{ uri: selectedUser.avatarUri }} style={styles.viewAvatar} />
                  ) : (
                    <View style={[styles.viewAvatarEmpty, { backgroundColor: ROLE_CONFIG[selectedUser.role].bg }]}>
                      <Text style={[styles.viewAvatarText, { color: ROLE_CONFIG[selectedUser.role].color }]}>
                        {getInitials(selectedUser.firstName, selectedUser.lastName)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.viewName}>{selectedUser.firstName} {selectedUser.lastName}</Text>
                  <Text style={styles.viewTitle}>{selectedUser.title}</Text>
                  <View style={styles.viewBadges}>
                    <View style={[styles.tag, { backgroundColor: ROLE_CONFIG[selectedUser.role].bg }]}>
                      <Ionicons name={ROLE_CONFIG[selectedUser.role].icon as any} size={12} color={ROLE_CONFIG[selectedUser.role].color} />
                      <Text style={[styles.tagText, { color: ROLE_CONFIG[selectedUser.role].color }]}>
                        {ROLE_CONFIG[selectedUser.role].label}
                      </Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: STATUS_CONFIG[selectedUser.status].bg }]}>
                      <Text style={[styles.tagText, { color: STATUS_CONFIG[selectedUser.status].color }]}>
                        {STATUS_CONFIG[selectedUser.status].label}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>CONTACT</Text>
                  <View style={styles.viewRow}>
                    <Ionicons name="mail-outline" size={18} color={colors.text.tertiary} />
                    <Text style={styles.viewRowText}>{selectedUser.email}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Ionicons name="call-outline" size={18} color={colors.text.tertiary} />
                    <Text style={styles.viewRowText}>{selectedUser.phone || 'Not provided'}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Ionicons name="business-outline" size={18} color={colors.text.tertiary} />
                    <Text style={styles.viewRowText}>{selectedUser.department}</Text>
                  </View>
                </View>

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>SECURITY</Text>
                  <View style={styles.viewRow}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={colors.text.tertiary} />
                    <Text style={styles.viewRowText}>2FA: {selectedUser.mfaEnabled ? 'Enabled' : 'Not enabled'}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Ionicons name="key-outline" size={18} color={colors.text.tertiary} />
                    <Text style={styles.viewRowText}>Password changed: {formatDate(selectedUser.lastPasswordChange)}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Ionicons name="time-outline" size={18} color={colors.text.tertiary} />
                    <Text style={styles.viewRowText}>Last login: {formatDate(selectedUser.lastLogin)}</Text>
                  </View>
                </View>

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>PERMISSIONS</Text>
                  {Object.entries(selectedUser.permissions).map(([key, val]) => (
                    <View key={key} style={styles.permRow}>
                      <Ionicons
                        name={val ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={val ? colors.accent[600] : colors.neutral[400]}
                      />
                      <Text style={[styles.permText, !val && { color: colors.neutral[400] }]}>
                        {key.replace(/([A-Z])/g, ' $1').replace('can', '').trim()}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>ACCOUNT</Text>
                  <View style={styles.viewRow}>
                    <Ionicons name="calendar-outline" size={18} color={colors.text.tertiary} />
                    <Text style={styles.viewRowText}>Created: {formatDate(selectedUser.createdAt)}</Text>
                  </View>
                </View>
              </ScrollView>
            )}

            {selectedUser && selectedUser.id !== '1' && (
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.footerBtnSecondary}>
                  <Ionicons name="key-outline" size={18} color={colors.secondary[600]} />
                  <Text style={[styles.footerBtnSecondaryText, { color: colors.secondary[600] }]}>Reset Password</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.footerBtnPrimary, { backgroundColor: selectedUser.status === 'active' ? colors.secondary[600] : colors.accent[600] }]}
                  onPress={() => { setActiveModal(null); toggleUserStatus(selectedUser); }}
                >
                  <Text style={styles.footerBtnPrimaryText}>
                    {selectedUser.status === 'active' ? 'Suspend' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },

  // Header
  header: {
    backgroundColor: colors.primary[500],
    paddingTop: spacing[14],
    paddingBottom: spacing[4],
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.neutral[0] },
  headerSubtitle: { fontSize: typography.fontSize.sm, color: colors.primary[200], marginTop: 2 },

  content: { flex: 1, padding: spacing[4] },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
  statCard: {
    flex: 1, backgroundColor: colors.neutral[0], borderRadius: borderRadius.lg, padding: spacing[3],
    alignItems: 'center', borderWidth: 1, borderColor: colors.border.light,
  },
  statCardPrimary: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  statNum: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.primary[500] },
  statLabel: { fontSize: typography.fontSize.xs, color: colors.text.secondary, marginTop: 2 },

  // Search
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg, paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderWidth: 1, borderColor: colors.border.light, marginBottom: spacing[4], gap: spacing[2],
  },
  searchInput: { flex: 1, fontSize: typography.fontSize.base, color: colors.text.primary },

  sectionLabel: {
    fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary, letterSpacing: 0.5, marginBottom: spacing[3],
  },

  // User Card
  userCard: { marginBottom: spacing[3] },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  mfaBadge: {
    position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.accent[600], alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.neutral[0],
  },
  userInfo: { flex: 1, marginLeft: spacing[3] },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  userName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  youBadge: { backgroundColor: colors.primary[100], paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: borderRadius.sm },
  youText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, color: colors.primary[600] },
  userTitle: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  userEmail: { fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginTop: 2 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[3] },
  tag: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[2], paddingVertical: 4,
    borderRadius: borderRadius.sm, backgroundColor: colors.neutral[100], gap: 4,
  },
  tagText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, color: colors.text.secondary },

  metaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing[3],
    paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  metaText: { fontSize: typography.fontSize.xs, color: colors.text.tertiary },

  actionRow: {
    flexDirection: 'row', gap: spacing[2], marginTop: spacing[3],
    paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing[2], borderRadius: borderRadius.md, backgroundColor: colors.neutral[50], gap: 4,
  },
  actionBtnPrimary: { backgroundColor: colors.primary[500] },
  actionBtnSuccess: { backgroundColor: colors.accent[600] },
  actionBtnText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
  actionBtnTextWhite: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.neutral[0] },

  emptyState: { alignItems: 'center', paddingVertical: spacing[10] },
  emptyTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.secondary, marginTop: spacing[4] },

  policyBox: {
    flexDirection: 'row', backgroundColor: colors.primary[50], borderRadius: borderRadius.xl,
    padding: spacing[4], marginTop: spacing[4], borderWidth: 1, borderColor: colors.primary[200],
  },
  policyTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.primary[700], marginBottom: spacing[1] },
  policyText: { fontSize: typography.fontSize.sm, color: colors.primary[600], lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.neutral[0], borderTopLeftRadius: borderRadius['2xl'], borderTopRightRadius: borderRadius['2xl'], maxHeight: '92%' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary },
  modalSubtitle: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  modalBody: { padding: spacing[4], maxHeight: 480 },
  modalFooter: {
    flexDirection: 'row', padding: spacing[4], borderTopWidth: 1, borderTopColor: colors.border.light, gap: spacing[3],
  },

  // Progress
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[4] },
  progressItem: { flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.neutral[200],
    alignItems: 'center', justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: colors.primary[500] },
  progressDotDone: { backgroundColor: colors.accent[600] },
  progressDotText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.tertiary },
  progressLine: { width: 36, height: 2, backgroundColor: colors.neutral[200], marginHorizontal: spacing[1] },
  progressLineDone: { backgroundColor: colors.accent[600] },

  // Avatar Section
  avatarSection: { alignItems: 'center', marginBottom: spacing[6] },
  avatarPicker: { position: 'relative', marginBottom: spacing[3] },
  avatarPickerImg: { width: 96, height: 96, borderRadius: 48 },
  avatarPickerEmpty: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.neutral[200], alignItems: 'center', justifyContent: 'center' },
  avatarPickerBadge: {
    position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.neutral[0],
  },
  avatarBtns: { flexDirection: 'row', gap: spacing[4] },
  avatarBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avatarBtnText: { fontSize: typography.fontSize.sm, color: colors.primary[500], fontWeight: typography.fontWeight.medium },

  // Form
  formRow: { flexDirection: 'row', gap: spacing[3] },
  formHalf: { flex: 1 },
  formLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[2], marginTop: spacing[3] },
  formInput: {
    backgroundColor: colors.neutral[50], borderWidth: 1, borderColor: colors.border.medium,
    borderRadius: borderRadius.lg, paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    fontSize: typography.fontSize.base, color: colors.text.primary,
  },

  chip: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: borderRadius.full, backgroundColor: colors.neutral[100], marginRight: spacing[2] },
  chipActive: { backgroundColor: colors.primary[500] },
  chipText: { fontSize: typography.fontSize.sm, color: colors.text.secondary },
  chipTextActive: { color: colors.neutral[0], fontWeight: typography.fontWeight.medium },

  // Role
  stepTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing[2] },
  stepDesc: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[4], lineHeight: 20 },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing[4], backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.xl, marginBottom: spacing[3], borderWidth: 2, borderColor: 'transparent',
  },
  roleCardSelected: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  roleIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  roleInfo: { flex: 1, marginLeft: spacing[3] },
  roleLabel: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  roleDesc: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: 2, lineHeight: 18 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.neutral[300], alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary[500] },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary[500] },

  // Security
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  switchLabel: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text.primary },
  switchDesc: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: 2 },

  passwordSection: { marginTop: spacing[4], padding: spacing[4], backgroundColor: colors.neutral[50], borderRadius: borderRadius.xl },
  pwdReqBox: { marginTop: spacing[4], padding: spacing[4], backgroundColor: colors.neutral[100], borderRadius: borderRadius.lg },
  pwdReqTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing[3] },
  pwdReqItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  pwdReqText: { fontSize: typography.fontSize.sm, color: colors.text.secondary },

  // Review
  reviewCard: { backgroundColor: colors.neutral[50], borderRadius: borderRadius.xl, padding: spacing[4] },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border.light, marginBottom: spacing[4] },
  reviewAvatar: { width: 64, height: 64, borderRadius: 32 },
  reviewAvatarEmpty: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  reviewInfo: { marginLeft: spacing[4] },
  reviewName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text.primary },
  reviewTitle: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  reviewDetails: { gap: spacing[3] },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewLabel: { fontSize: typography.fontSize.sm, color: colors.text.secondary },
  reviewValue: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2], padding: spacing[4],
    backgroundColor: colors.primary[50], borderRadius: borderRadius.lg, marginTop: spacing[4],
  },
  infoText: { flex: 1, fontSize: typography.fontSize.sm, color: colors.primary[700], lineHeight: 20 },

  // Footer
  footerBtnSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing[3], paddingHorizontal: spacing[5], borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.border.medium, gap: spacing[1],
  },
  footerBtnSecondaryText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.primary[500] },
  footerBtnPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing[3], paddingHorizontal: spacing[5], borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[500], gap: spacing[2],
  },
  footerBtnPrimaryText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.neutral[0] },
  footerBtnDisabled: { backgroundColor: colors.neutral[300] },

  // View Modal
  viewProfile: { alignItems: 'center', paddingBottom: spacing[6], borderBottomWidth: 1, borderBottomColor: colors.border.light, marginBottom: spacing[4] },
  viewAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: spacing[3] },
  viewAvatarEmpty: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[3] },
  viewAvatarText: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
  viewName: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary },
  viewTitle: { fontSize: typography.fontSize.base, color: colors.text.secondary, marginTop: spacing[1] },
  viewBadges: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] },
  viewSection: { marginBottom: spacing[6] },
  viewSectionTitle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.tertiary, letterSpacing: 0.5, marginBottom: spacing[3] },
  viewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] },
  viewRowText: { fontSize: typography.fontSize.base, color: colors.text.primary },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  permText: { fontSize: typography.fontSize.sm, color: colors.text.primary, textTransform: 'capitalize' },
});

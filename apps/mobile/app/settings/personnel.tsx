import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Button, Input, Card, Badge } from '@/components';
import { colors, typography, spacing, borderRadius } from '@/theme';

interface Person {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  canApprove: boolean;
  canBook: boolean;
  canViewReports: boolean;
}

export default function PersonnelScreen() {
  const [personnel, setPersonnel] = useState<Person[]>([
    { id: '1', name: 'Mark Cuban', title: 'Owner', email: 'mark@mavericks.com', phone: '+1 (555) 111-2222', canApprove: true, canBook: true, canViewReports: true },
    { id: '2', name: 'Jason Kidd', title: 'Head Coach', email: 'jkidd@mavericks.com', phone: '+1 (555) 222-3333', canApprove: true, canBook: false, canViewReports: true },
    { id: '3', name: 'Luka Doncic', title: 'Player', email: 'luka@mavericks.com', phone: '+1 (555) 333-4444', canApprove: false, canBook: false, canViewReports: false },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCanApprove, setFormCanApprove] = useState(false);
  const [formCanBook, setFormCanBook] = useState(false);
  const [formCanViewReports, setFormCanViewReports] = useState(false);

  const openAddModal = () => {
    setEditingPerson(null);
    setFormName('');
    setFormTitle('');
    setFormEmail('');
    setFormPhone('');
    setFormCanApprove(false);
    setFormCanBook(false);
    setFormCanViewReports(false);
    setShowModal(true);
  };

  const openEditModal = (person: Person) => {
    setEditingPerson(person);
    setFormName(person.name);
    setFormTitle(person.title);
    setFormEmail(person.email);
    setFormPhone(person.phone);
    setFormCanApprove(person.canApprove);
    setFormCanBook(person.canBook);
    setFormCanViewReports(person.canViewReports);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName || !formEmail) {
      if (Platform.OS === 'web') {
        window.alert('Please fill in name and email');
      } else {
        Alert.alert('Error', 'Please fill in name and email');
      }
      return;
    }

    if (editingPerson) {
      setPersonnel(personnel.map(p =>
        p.id === editingPerson.id
          ? { ...p, name: formName, title: formTitle, email: formEmail, phone: formPhone, canApprove: formCanApprove, canBook: formCanBook, canViewReports: formCanViewReports }
          : p
      ));
    } else {
      const newPerson: Person = {
        id: Date.now().toString(),
        name: formName,
        title: formTitle,
        email: formEmail,
        phone: formPhone,
        canApprove: formCanApprove,
        canBook: formCanBook,
        canViewReports: formCanViewReports,
      };
      setPersonnel([...personnel, newPerson]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove this person?')) {
        setPersonnel(personnel.filter(p => p.id !== id));
      }
    } else {
      Alert.alert(
        'Remove Person',
        'Are you sure you want to remove this authorized person?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => setPersonnel(personnel.filter(p => p.id !== id)) },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Authorized Personnel</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionDescription}>
          Manage team members and their permissions. Authorized personnel can approve bookings, make reservations, and access reports based on their assigned permissions.
        </Text>

        {personnel.map((person) => (
          <Card key={person.id} variant="outlined" style={styles.personCard}>
            <TouchableOpacity
              style={styles.personHeader}
              onPress={() => openEditModal(person)}
            >
              <View style={styles.personAvatar}>
                <Text style={styles.personAvatarText}>
                  {person.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personTitle}>{person.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>

            <View style={styles.personDetails}>
              <View style={styles.personDetailRow}>
                <Ionicons name="mail-outline" size={14} color={colors.neutral[400]} />
                <Text style={styles.personDetailText}>{person.email}</Text>
              </View>
              <View style={styles.personDetailRow}>
                <Ionicons name="call-outline" size={14} color={colors.neutral[400]} />
                <Text style={styles.personDetailText}>{person.phone}</Text>
              </View>
            </View>

            <View style={styles.permissionsList}>
              <Text style={styles.permissionsTitle}>Permissions</Text>
              <View style={styles.permissionsGrid}>
                <View style={[styles.permissionBadge, person.canApprove && styles.permissionBadgeActive]}>
                  <Ionicons
                    name={person.canApprove ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={person.canApprove ? colors.accent[600] : colors.neutral[400]}
                  />
                  <Text style={[styles.permissionText, person.canApprove && styles.permissionTextActive]}>
                    Can Approve
                  </Text>
                </View>
                <View style={[styles.permissionBadge, person.canBook && styles.permissionBadgeActive]}>
                  <Ionicons
                    name={person.canBook ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={person.canBook ? colors.accent[600] : colors.neutral[400]}
                  />
                  <Text style={[styles.permissionText, person.canBook && styles.permissionTextActive]}>
                    Can Book
                  </Text>
                </View>
                <View style={[styles.permissionBadge, person.canViewReports && styles.permissionBadgeActive]}>
                  <Ionicons
                    name={person.canViewReports ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={person.canViewReports ? colors.accent[600] : colors.neutral[400]}
                  />
                  <Text style={[styles.permissionText, person.canViewReports && styles.permissionTextActive]}>
                    View Reports
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.personActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => openEditModal(person)}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.primary[500]} />
                <Text style={[styles.actionBtnText, { color: colors.primary[500] }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDelete(person.id)}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text style={[styles.actionBtnText, { color: colors.error }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        <TouchableOpacity style={styles.addPersonBtn} onPress={openAddModal}>
          <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
          <Text style={styles.addPersonText}>Add Authorized Person</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPerson ? 'Edit Person' : 'Add Person'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Personal Information</Text>
            <Input
              label="Full Name"
              placeholder="Enter full name"
              value={formName}
              onChangeText={setFormName}
              leftIcon="person-outline"
            />
            <Input
              label="Title / Position"
              placeholder="e.g., Head Coach, Player"
              value={formTitle}
              onChangeText={setFormTitle}
              leftIcon="briefcase-outline"
            />
            <Input
              label="Email Address"
              placeholder="email@company.com"
              value={formEmail}
              onChangeText={setFormEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={formPhone}
              onChangeText={setFormPhone}
              keyboardType="phone-pad"
              leftIcon="call-outline"
            />

            <Text style={[styles.modalSectionTitle, { marginTop: spacing[6] }]}>Permissions</Text>
            <Card variant="outlined" padding="none">
              <View style={[styles.permissionRow, styles.permissionRowBorder]}>
                <View style={styles.permissionInfo}>
                  <Ionicons name="checkmark-done" size={20} color={colors.accent[600]} />
                  <View style={styles.permissionDetails}>
                    <Text style={styles.permissionLabel}>Can Approve Bookings</Text>
                    <Text style={styles.permissionDesc}>Approve or reject charter requests</Text>
                  </View>
                </View>
                <Switch
                  value={formCanApprove}
                  onValueChange={setFormCanApprove}
                  trackColor={{ false: colors.neutral[200], true: colors.accent[200] }}
                  thumbColor={formCanApprove ? colors.accent[500] : colors.neutral[400]}
                />
              </View>
              <View style={[styles.permissionRow, styles.permissionRowBorder]}>
                <View style={styles.permissionInfo}>
                  <Ionicons name="airplane" size={20} color={colors.primary[500]} />
                  <View style={styles.permissionDetails}>
                    <Text style={styles.permissionLabel}>Can Book Flights</Text>
                    <Text style={styles.permissionDesc}>Submit new charter requests</Text>
                  </View>
                </View>
                <Switch
                  value={formCanBook}
                  onValueChange={setFormCanBook}
                  trackColor={{ false: colors.neutral[200], true: colors.primary[200] }}
                  thumbColor={formCanBook ? colors.primary[500] : colors.neutral[400]}
                />
              </View>
              <View style={styles.permissionRow}>
                <View style={styles.permissionInfo}>
                  <Ionicons name="bar-chart" size={20} color={colors.secondary[500]} />
                  <View style={styles.permissionDetails}>
                    <Text style={styles.permissionLabel}>View Reports</Text>
                    <Text style={styles.permissionDesc}>Access spending and usage reports</Text>
                  </View>
                </View>
                <Switch
                  value={formCanViewReports}
                  onValueChange={setFormCanViewReports}
                  trackColor={{ false: colors.neutral[200], true: colors.secondary[200] }}
                  thumbColor={formCanViewReports ? colors.secondary[500] : colors.neutral[400]}
                />
              </View>
            </Card>
          </ScrollView>
        </View>
      </Modal>
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
  addBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: 100,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[6],
    lineHeight: 20,
  },
  personCard: {
    marginBottom: spacing[4],
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  personAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  personAvatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  personTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  personDetails: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  personDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  personDetailText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginLeft: spacing[2],
  },
  permissionsList: {
    marginBottom: spacing[3],
  },
  permissionsTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: spacing[2],
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    gap: spacing[1],
  },
  permissionBadgeActive: {
    backgroundColor: colors.accent[50],
  },
  permissionText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
  },
  permissionTextActive: {
    color: colors.accent[700],
  },
  personActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing[3],
    gap: spacing[4],
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actionBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  addPersonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary[100],
    borderStyle: 'dashed',
  },
  addPersonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[16],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalCancel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  modalSave: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  modalContent: {
    flex: 1,
    padding: spacing[4],
  },
  modalSectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: spacing[3],
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  permissionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing[3],
  },
  permissionDetails: {
    marginLeft: spacing[3],
  },
  permissionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  permissionDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
});

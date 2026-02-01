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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Button, Input, Card, Badge } from '@/components';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export default function ContactsScreen() {
  const { colors: themeColors, isDark } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Sarah Johnson', role: 'Travel Coordinator', email: 'sarah@mavericks.com', phone: '+1 (555) 234-5678', isPrimary: true },
    { id: '2', name: 'Mike Williams', role: 'Assistant Travel Manager', email: 'mike@mavericks.com', phone: '+1 (555) 345-6789', isPrimary: false },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');

  const openAddModal = () => {
    setEditingContact(null);
    setFormName('');
    setFormRole('');
    setFormEmail('');
    setFormPhone('');
    setShowModal(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormRole(contact.role);
    setFormEmail(contact.email);
    setFormPhone(contact.phone);
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

    if (editingContact) {
      setContacts(contacts.map(c =>
        c.id === editingContact.id
          ? { ...c, name: formName, role: formRole, email: formEmail, phone: formPhone }
          : c
      ));
    } else {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: formName,
        role: formRole,
        email: formEmail,
        phone: formPhone,
        isPrimary: contacts.length === 0,
      };
      setContacts([...contacts, newContact]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove this contact?')) {
        setContacts(contacts.filter(c => c.id !== id));
      }
    } else {
      Alert.alert(
        'Remove Contact',
        'Are you sure you want to remove this contact?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => setContacts(contacts.filter(c => c.id !== id)) },
        ]
      );
    }
  };

  const setPrimary = (id: string) => {
    setContacts(contacts.map(c => ({ ...c, isPrimary: c.id === id })));
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background.secondary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.neutral[0], borderBottomColor: themeColors.border.light }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Contacts</Text>
        <ThemeToggle color={themeColors.text.primary} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionDescription}>
          Manage contacts who can submit charter requests and receive flight updates on behalf of your organization.
        </Text>

        {contacts.map((contact) => (
          <Card key={contact.id} variant="outlined" style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <View style={styles.contactNameRow}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.isPrimary && (
                    <Badge label="Primary" variant="success" size="sm" />
                  )}
                </View>
                <Text style={styles.contactRole}>{contact.role}</Text>
              </View>
            </View>

            <View style={styles.contactDetails}>
              <View style={styles.contactDetailRow}>
                <Ionicons name="mail-outline" size={16} color={colors.neutral[400]} />
                <Text style={styles.contactDetailText}>{contact.email}</Text>
              </View>
              <View style={styles.contactDetailRow}>
                <Ionicons name="call-outline" size={16} color={colors.neutral[400]} />
                <Text style={styles.contactDetailText}>{contact.phone}</Text>
              </View>
            </View>

            <View style={styles.contactActions}>
              {!contact.isPrimary && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setPrimary(contact.id)}
                >
                  <Ionicons name="star-outline" size={18} color={colors.secondary[500]} />
                  <Text style={[styles.actionBtnText, { color: colors.secondary[500] }]}>
                    Set as Primary
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => openEditModal(contact)}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.primary[500]} />
                <Text style={[styles.actionBtnText, { color: colors.primary[500] }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDelete(contact.id)}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text style={[styles.actionBtnText, { color: colors.error }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        <TouchableOpacity style={styles.addContactBtn} onPress={openAddModal}>
          <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
          <Text style={styles.addContactText}>Add New Contact</Text>
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
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Full Name"
              placeholder="Enter full name"
              value={formName}
              onChangeText={setFormName}
              leftIcon="person-outline"
            />
            <Input
              label="Role / Title"
              placeholder="e.g., Travel Coordinator"
              value={formRole}
              onChangeText={setFormRole}
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
  contactCard: {
    marginBottom: spacing[4],
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  contactAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  contactAvatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.secondary[700],
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  contactName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  contactRole: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  contactDetails: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  contactDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  contactDetailText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginLeft: spacing[2],
  },
  contactActions: {
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
  addContactBtn: {
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
  addContactText: {
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
});

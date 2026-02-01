import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, Button } from '@/components';
import { colors, typography, spacing, borderRadius } from '@/theme';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

type ModalType = 'password' | '2fa' | 'biometric' | 'download' | 'delete' | null;

export default function SecurityScreen() {
  // Security Settings State
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Modal State
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 2FA State
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorStep, setTwoFactorStep] = useState<'setup' | 'verify' | 'complete'>('setup');

  // Download Data State
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // Delete Account State
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'email' | 'pending'>('confirm');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Loading States
  const [isLoading, setIsLoading] = useState(false);

  const [sessions] = useState<Session[]>([
    { id: '1', device: 'iPhone 15 Pro', location: 'Dallas, TX', lastActive: 'Now', isCurrent: true },
    { id: '2', device: 'MacBook Pro', location: 'Dallas, TX', lastActive: '2 hours ago', isCurrent: false },
    { id: '3', device: 'iPad Air', location: 'New York, NY', lastActive: 'Yesterday', isCurrent: false },
  ]);

  // Password Change Handler
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert('Error', 'Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showAlert('Error', 'Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setActiveModal(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showAlert('Success', 'Your password has been updated successfully');
    }, 1500);
  };

  // Biometric Toggle Handler
  const handleBiometricToggle = (value: boolean) => {
    if (value) {
      setActiveModal('biometric');
    } else {
      setBiometricEnabled(false);
    }
  };

  const confirmBiometricEnable = () => {
    setBiometricEnabled(true);
    setActiveModal(null);
    showAlert('Success', 'Biometric login has been enabled');
  };

  // 2FA Handlers
  const handleTwoFactorToggle = (value: boolean) => {
    if (value) {
      setTwoFactorStep('setup');
      setActiveModal('2fa');
    } else {
      if (Platform.OS === 'web') {
        if (window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
          setTwoFactorEnabled(false);
        }
      } else {
        Alert.alert(
          'Disable Two-Factor Authentication',
          'Are you sure you want to disable 2FA? This will make your account less secure.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Disable', style: 'destructive', onPress: () => setTwoFactorEnabled(false) },
          ]
        );
      }
    }
  };

  const handleSendVerificationCode = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setTwoFactorStep('verify');
      showAlert('Code Sent', 'A verification code has been sent to your phone number ending in ***-4567');
    }, 1000);
  };

  const handleVerify2FA = () => {
    if (verificationCode.length !== 6) {
      showAlert('Error', 'Please enter a valid 6-digit code');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setTwoFactorEnabled(true);
      setTwoFactorStep('complete');
    }, 1000);
  };

  // Download Data Handlers
  const handleDownloadData = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setDownloadComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  // Delete Account Handlers
  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      showAlert('Error', 'Please type DELETE to confirm');
      return;
    }
    setDeleteStep('email');
  };

  const handleSendDeleteEmail = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setDeleteStep('pending');
    }, 1500);
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const terminateSession = (sessionId: string) => {
    showAlert('Session Terminated', 'The session has been terminated successfully');
  };

  const renderPasswordModal = () => (
    <Modal
      visible={activeModal === 'password'}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setActiveModal(null)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Change Password</Text>
          <TouchableOpacity onPress={handlePasswordChange} disabled={isLoading}>
            <Text style={[styles.modalSave, isLoading && styles.modalSaveDisabled]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.passwordRequirements}>
            <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
            <Text style={styles.passwordRequirementsText}>
              Password must be at least 8 characters and include uppercase, lowercase, and numbers.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={colors.neutral[400]}
              />
              <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <Ionicons
                  name={showCurrentPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.neutral[400]}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={colors.neutral[400]}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <Ionicons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.neutral[400]}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showNewPassword}
                placeholder="Confirm new password"
                placeholderTextColor={colors.neutral[400]}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderBiometricModal = () => (
    <Modal
      visible={activeModal === 'biometric'}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setActiveModal(null)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Biometric Login</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.centeredIcon}>
            <Ionicons name="finger-print" size={64} color={colors.primary[500]} />
          </View>

          <Text style={styles.modalSectionTitle}>Enable Face ID / Touch ID</Text>
          <Text style={styles.modalDescription}>
            Use biometric authentication for faster, more secure login to your Sports Media Charter account.
          </Text>

          <Card variant="outlined" style={styles.policyCard}>
            <Text style={styles.policyTitle}>Biometric Authentication Policy</Text>
            <View style={styles.policyItem}>
              <Ionicons name="shield-checkmark" size={16} color={colors.accent[600]} />
              <Text style={styles.policyText}>
                Biometric data is stored securely on your device only
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Ionicons name="shield-checkmark" size={16} color={colors.accent[600]} />
              <Text style={styles.policyText}>
                Sports Media Charter never receives or stores your biometric information
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Ionicons name="shield-checkmark" size={16} color={colors.accent[600]} />
              <Text style={styles.policyText}>
                Authentication uses your device's secure enclave
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Ionicons name="shield-checkmark" size={16} color={colors.accent[600]} />
              <Text style={styles.policyText}>
                Password login remains available as backup
              </Text>
            </View>
          </Card>

          <Button
            title="Enable Biometric Login"
            onPress={confirmBiometricEnable}
            variant="primary"
            size="lg"
          />

          <TouchableOpacity
            style={styles.learnMoreLink}
            onPress={() => router.push('/legal/privacy-policy')}
          >
            <Text style={styles.learnMoreText}>Learn more about our privacy practices</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  const render2FAModal = () => (
    <Modal
      visible={activeModal === '2fa'}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        setActiveModal(null);
        setTwoFactorStep('setup');
        setVerificationCode('');
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            setActiveModal(null);
            setTwoFactorStep('setup');
            setVerificationCode('');
          }}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {twoFactorStep === 'setup' && (
            <>
              <View style={styles.centeredIcon}>
                <Ionicons name="shield-half" size={64} color={colors.primary[500]} />
              </View>

              <Text style={styles.modalSectionTitle}>Secure Your Account</Text>
              <Text style={styles.modalDescription}>
                Two-factor authentication adds an extra layer of security by requiring a verification
                code in addition to your password.
              </Text>

              <Card variant="outlined" style={styles.policyCard}>
                <Text style={styles.policyTitle}>2FA Policy</Text>
                <View style={styles.policyItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.accent[600]} />
                  <Text style={styles.policyText}>
                    Codes are sent via SMS to your registered phone
                  </Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.accent[600]} />
                  <Text style={styles.policyText}>
                    Verification codes expire after 5 minutes
                  </Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.accent[600]} />
                  <Text style={styles.policyText}>
                    Recovery codes provided for emergency access
                  </Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.accent[600]} />
                  <Text style={styles.policyText}>
                    Admin may require 2FA for your organization
                  </Text>
                </View>
              </Card>

              <Button
                title="Send Verification Code"
                onPress={handleSendVerificationCode}
                variant="primary"
                size="lg"
                loading={isLoading}
              />
            </>
          )}

          {twoFactorStep === 'verify' && (
            <>
              <View style={styles.centeredIcon}>
                <Ionicons name="keypad" size={64} color={colors.primary[500]} />
              </View>

              <Text style={styles.modalSectionTitle}>Enter Verification Code</Text>
              <Text style={styles.modalDescription}>
                Enter the 6-digit code sent to your phone number ending in ***-4567
              </Text>

              <View style={styles.codeInputContainer}>
                <TextInput
                  style={styles.codeInput}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  placeholderTextColor={colors.neutral[300]}
                />
              </View>

              <Button
                title="Verify Code"
                onPress={handleVerify2FA}
                variant="primary"
                size="lg"
                loading={isLoading}
              />

              <TouchableOpacity style={styles.resendCode}>
                <Text style={styles.resendCodeText}>Didn't receive a code? Resend</Text>
              </TouchableOpacity>
            </>
          )}

          {twoFactorStep === 'complete' && (
            <>
              <View style={[styles.centeredIcon, { backgroundColor: colors.accent[50] }]}>
                <Ionicons name="checkmark-circle" size={64} color={colors.accent[600]} />
              </View>

              <Text style={styles.modalSectionTitle}>2FA Enabled!</Text>
              <Text style={styles.modalDescription}>
                Your account is now protected with two-factor authentication.
              </Text>

              <Card variant="outlined" style={[styles.policyCard, { backgroundColor: colors.secondary[50] }]}>
                <Text style={[styles.policyTitle, { color: colors.secondary[700] }]}>Recovery Codes</Text>
                <Text style={styles.recoveryDescription}>
                  Save these codes securely. You can use them to access your account if you
                  lose access to your phone.
                </Text>
                <View style={styles.recoveryCodesContainer}>
                  <Text style={styles.recoveryCode}>XKCD-1234-ABCD</Text>
                  <Text style={styles.recoveryCode}>EFGH-5678-IJKL</Text>
                  <Text style={styles.recoveryCode}>MNOP-9012-QRST</Text>
                  <Text style={styles.recoveryCode}>UVWX-3456-YZAB</Text>
                </View>
              </Card>

              <Button
                title="Done"
                onPress={() => {
                  setActiveModal(null);
                  setTwoFactorStep('setup');
                  setVerificationCode('');
                }}
                variant="primary"
                size="lg"
              />
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderDownloadModal = () => (
    <Modal
      visible={activeModal === 'download'}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        setActiveModal(null);
        setDownloadProgress(0);
        setIsDownloading(false);
        setDownloadComplete(false);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            setActiveModal(null);
            setDownloadProgress(0);
            setIsDownloading(false);
            setDownloadComplete(false);
          }}>
            <Text style={styles.modalCancel}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Download My Data</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {!isDownloading && !downloadComplete && (
            <>
              <View style={styles.centeredIcon}>
                <Ionicons name="cloud-download" size={64} color={colors.primary[500]} />
              </View>

              <Text style={styles.modalSectionTitle}>Request Your Data</Text>
              <Text style={styles.modalDescription}>
                Download a copy of all personal data associated with your Sports Media Charter account.
              </Text>

              <Card variant="outlined" style={styles.policyCard}>
                <Text style={styles.policyTitle}>Your Data Package Includes:</Text>
                <View style={styles.policyItem}>
                  <Ionicons name="person" size={16} color={colors.primary[500]} />
                  <Text style={styles.policyText}>Account information & profile data</Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons name="airplane" size={16} color={colors.primary[500]} />
                  <Text style={styles.policyText}>Trip history & booking records</Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons name="card" size={16} color={colors.primary[500]} />
                  <Text style={styles.policyText}>Payment history (card numbers redacted)</Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons name="notifications" size={16} color={colors.primary[500]} />
                  <Text style={styles.policyText}>Communication preferences</Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons name="time" size={16} color={colors.primary[500]} />
                  <Text style={styles.policyText}>Activity logs & usage history</Text>
                </View>
              </Card>

              <Text style={styles.downloadNote}>
                Your data will be prepared in JSON and PDF formats. This process may take up to
                30 days for large accounts. You'll receive an email when your data is ready.
              </Text>

              <Button
                title="Request Data Download"
                onPress={handleDownloadData}
                variant="primary"
                size="lg"
                icon="download"
              />
            </>
          )}

          {isDownloading && (
            <>
              <View style={styles.centeredIcon}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
              </View>

              <Text style={styles.modalSectionTitle}>Preparing Your Data</Text>
              <Text style={styles.modalDescription}>
                We're compiling your data package. Please wait...
              </Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
                </View>
                <Text style={styles.progressText}>{downloadProgress}%</Text>
              </View>
            </>
          )}

          {downloadComplete && (
            <>
              <View style={[styles.centeredIcon, { backgroundColor: colors.accent[50] }]}>
                <Ionicons name="checkmark-circle" size={64} color={colors.accent[600]} />
              </View>

              <Text style={styles.modalSectionTitle}>Data Ready!</Text>
              <Text style={styles.modalDescription}>
                Your data package has been prepared and is ready for download.
              </Text>

              <Card variant="elevated" style={styles.downloadReadyCard}>
                <View style={styles.downloadFileRow}>
                  <Ionicons name="document" size={24} color={colors.primary[500]} />
                  <View style={styles.downloadFileInfo}>
                    <Text style={styles.downloadFileName}>smcharter_data_export.zip</Text>
                    <Text style={styles.downloadFileSize}>2.4 MB</Text>
                  </View>
                  <TouchableOpacity style={styles.downloadFileBtn}>
                    <Ionicons name="download" size={20} color={colors.neutral[0]} />
                  </TouchableOpacity>
                </View>
              </Card>

              <Text style={styles.downloadNote}>
                This link will expire in 7 days. A copy has also been sent to your email.
              </Text>

              <Button
                title="Download Now"
                onPress={() => showAlert('Download Started', 'Your data is being downloaded')}
                variant="primary"
                size="lg"
                icon="download"
              />
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderDeleteModal = () => (
    <Modal
      visible={activeModal === 'delete'}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        setActiveModal(null);
        setDeleteStep('confirm');
        setDeleteConfirmText('');
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            setActiveModal(null);
            setDeleteStep('confirm');
            setDeleteConfirmText('');
          }}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Delete Account</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {deleteStep === 'confirm' && (
            <>
              <View style={[styles.centeredIcon, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="warning" size={64} color={colors.error} />
              </View>

              <Text style={styles.deleteTitle}>Delete Your Account?</Text>
              <Text style={styles.modalDescription}>
                This action is permanent and cannot be undone. All your data will be deleted
                after a 14-day cooling off period.
              </Text>

              <Card variant="outlined" style={styles.deleteWarningCard}>
                <Text style={styles.deleteWarningTitle}>What will be deleted:</Text>
                <View style={styles.policyItem}>
                  <Ionicons name="close-circle" size={16} color={colors.error} />
                  <Text style={styles.deleteWarningText}>Your profile and account settings</Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons name="close-circle" size={16} color={colors.error} />
                  <Text style={styles.deleteWarningText}>Active bookings and trip history</Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons name="close-circle" size={16} color={colors.error} />
                  <Text style={styles.deleteWarningText}>Saved payment methods</Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons name="close-circle" size={16} color={colors.error} />
                  <Text style={styles.deleteWarningText}>All authorized personnel access</Text>
                </View>
              </Card>

              <Card variant="outlined" style={styles.retainedDataCard}>
                <Text style={styles.retainedTitle}>Data retained for legal compliance:</Text>
                <Text style={styles.retainedText}>
                  • Tax records (7 years){'\n'}
                  • Aviation security records (as required by law){'\n'}
                  • Transaction records for financial regulations
                </Text>
              </Card>

              <Text style={styles.deleteInstructions}>
                Type <Text style={styles.deleteKeyword}>DELETE</Text> to confirm:
              </Text>
              <TextInput
                style={styles.deleteInput}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="Type DELETE"
                placeholderTextColor={colors.neutral[400]}
                autoCapitalize="characters"
              />

              <Button
                title="Continue to Email Verification"
                onPress={handleDeleteAccount}
                variant="danger"
                size="lg"
                disabled={deleteConfirmText !== 'DELETE'}
              />
            </>
          )}

          {deleteStep === 'email' && (
            <>
              <View style={styles.centeredIcon}>
                <Ionicons name="mail" size={64} color={colors.primary[500]} />
              </View>

              <Text style={styles.modalSectionTitle}>Email Verification Required</Text>
              <Text style={styles.modalDescription}>
                For your security, we need to verify your identity via email before proceeding
                with account deletion.
              </Text>

              <Card variant="outlined" style={styles.policyCard}>
                <View style={styles.emailVerifyRow}>
                  <Ionicons name="mail-outline" size={20} color={colors.primary[500]} />
                  <Text style={styles.emailVerifyText}>dan@dakdan.com</Text>
                </View>
                <Text style={styles.emailVerifyNote}>
                  A verification link will be sent to this email address.
                </Text>
              </Card>

              <Button
                title="Send Verification Email"
                onPress={handleSendDeleteEmail}
                variant="primary"
                size="lg"
                loading={isLoading}
                icon="mail"
              />
            </>
          )}

          {deleteStep === 'pending' && (
            <>
              <View style={[styles.centeredIcon, { backgroundColor: colors.secondary[50] }]}>
                <Ionicons name="hourglass" size={64} color={colors.secondary[500]} />
              </View>

              <Text style={styles.modalSectionTitle}>Verification Email Sent</Text>
              <Text style={styles.modalDescription}>
                We've sent a verification link to your email address. Click the link to confirm
                account deletion.
              </Text>

              <Card variant="outlined" style={styles.policyCard}>
                <Text style={styles.policyTitle}>What happens next:</Text>
                <View style={styles.pendingStep}>
                  <View style={styles.pendingStepNumber}>
                    <Text style={styles.pendingStepNumberText}>1</Text>
                  </View>
                  <Text style={styles.pendingStepText}>Check your email and click the verification link</Text>
                </View>
                <View style={styles.pendingStep}>
                  <View style={styles.pendingStepNumber}>
                    <Text style={styles.pendingStepNumberText}>2</Text>
                  </View>
                  <Text style={styles.pendingStepText}>14-day cooling off period begins</Text>
                </View>
                <View style={styles.pendingStep}>
                  <View style={styles.pendingStepNumber}>
                    <Text style={styles.pendingStepNumberText}>3</Text>
                  </View>
                  <Text style={styles.pendingStepText}>Account permanently deleted after 14 days</Text>
                </View>
              </Card>

              <Text style={styles.downloadNote}>
                You can cancel the deletion request anytime during the cooling off period by
                logging back into your account.
              </Text>

              <Button
                title="Done"
                onPress={() => {
                  setActiveModal(null);
                  setDeleteStep('confirm');
                  setDeleteConfirmText('');
                }}
                variant="outline"
                size="lg"
              />
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security & Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Password Section */}
        <Text style={styles.sectionLabel}>PASSWORD</Text>
        <Card variant="outlined" padding="none">
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setActiveModal('password')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="key-outline" size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Change Password</Text>
              <Text style={styles.menuDescription}>Last changed 30 days ago</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        </Card>

        {/* Authentication Section */}
        <Text style={styles.sectionLabel}>AUTHENTICATION</Text>
        <Card variant="outlined" padding="none">
          <View style={[styles.settingItem, styles.settingItemBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: colors.accent[50] }]}>
              <Ionicons name="finger-print" size={20} color={colors.accent[600]} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Biometric Login</Text>
              <Text style={styles.menuDescription}>Use Face ID or fingerprint</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: colors.neutral[200], true: colors.accent[200] }}
              thumbColor={biometricEnabled ? colors.accent[500] : colors.neutral[400]}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={[styles.menuIcon, { backgroundColor: colors.secondary[50] }]}>
              <Ionicons name="shield-half" size={20} color={colors.secondary[600]} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Two-Factor Authentication</Text>
              <Text style={styles.menuDescription}>
                {twoFactorEnabled ? 'Enabled via SMS' : 'Add extra security'}
              </Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleTwoFactorToggle}
              trackColor={{ false: colors.neutral[200], true: colors.secondary[200] }}
              thumbColor={twoFactorEnabled ? colors.secondary[500] : colors.neutral[400]}
            />
          </View>
        </Card>

        {/* Login Alerts */}
        <Text style={styles.sectionLabel}>SECURITY ALERTS</Text>
        <Card variant="outlined" padding="none">
          <View style={styles.settingItem}>
            <View style={[styles.menuIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>New Login Alerts</Text>
              <Text style={styles.menuDescription}>Get notified of new device logins</Text>
            </View>
            <Switch
              value={loginAlerts}
              onValueChange={setLoginAlerts}
              trackColor={{ false: colors.neutral[200], true: colors.primary[200] }}
              thumbColor={loginAlerts ? colors.primary[500] : colors.neutral[400]}
            />
          </View>
        </Card>

        {/* Active Sessions */}
        <Text style={styles.sectionLabel}>ACTIVE SESSIONS</Text>
        <Card variant="outlined" padding="none">
          {sessions.map((session, index) => (
            <View
              key={session.id}
              style={[
                styles.sessionItem,
                index < sessions.length - 1 && styles.sessionItemBorder,
              ]}
            >
              <View style={styles.sessionIcon}>
                <Ionicons
                  name={session.device.includes('iPhone') ? 'phone-portrait' : session.device.includes('iPad') ? 'tablet-portrait' : 'laptop'}
                  size={20}
                  color={session.isCurrent ? colors.accent[600] : colors.neutral[500]}
                />
              </View>
              <View style={styles.sessionInfo}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDevice}>{session.device}</Text>
                  {session.isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sessionDetails}>
                  {session.location} · {session.lastActive}
                </Text>
              </View>
              {!session.isCurrent && (
                <TouchableOpacity onPress={() => terminateSession(session.id)}>
                  <Text style={styles.terminateText}>End</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </Card>

        {/* Privacy Section */}
        <Text style={styles.sectionLabel}>PRIVACY</Text>
        <Card variant="outlined" padding="none">
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => setActiveModal('download')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="cloud-download-outline" size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Download My Data</Text>
              <Text style={styles.menuDescription}>Get a copy of your information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/legal/privacy-policy')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.neutral[100] }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.neutral[600]} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Privacy Policy</Text>
              <Text style={styles.menuDescription}>How we handle your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        </Card>

        {/* Danger Zone */}
        <Text style={styles.sectionLabel}>DANGER ZONE</Text>
        <Card variant="outlined" padding="none" style={styles.dangerCard}>
          <TouchableOpacity
            style={styles.deleteAccountItem}
            onPress={() => setActiveModal('delete')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.deleteLabel}>Delete Account</Text>
              <Text style={styles.menuDescription}>
                Permanently delete your account and data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.error} />
          </TouchableOpacity>
        </Card>

        {/* Support Contact */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            Contact our security team at{'\n'}
            security@sportsmedia.net{'\n'}
            +1 (970) 436-0580
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      {renderPasswordModal()}
      {renderBiometricModal()}
      {render2FAModal()}
      {renderDownloadModal()}
      {renderDeleteModal()}
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
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: spacing[3],
    marginTop: spacing[4],
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  settingItemBorder: {
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
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  menuDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  sessionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDevice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  currentBadge: {
    backgroundColor: colors.accent[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing[2],
  },
  currentBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent[700],
  },
  sessionDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  terminateText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
  },
  dangerCard: {
    borderColor: colors.error + '30',
  },
  deleteAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  deleteLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
  },
  supportSection: {
    alignItems: 'center',
    marginTop: spacing[8],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  supportTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  supportText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Modal Styles
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
  modalSaveDisabled: {
    color: colors.neutral[400],
  },
  modalContent: {
    flex: 1,
    padding: spacing[4],
  },
  modalSectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  modalDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing[6],
  },
  centeredIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: spacing[6],
  },
  passwordRequirements: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[6],
  },
  passwordRequirementsText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    marginLeft: spacing[2],
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
  },
  passwordInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    paddingVertical: spacing[4],
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  policyCard: {
    marginBottom: spacing[6],
  },
  policyTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  policyText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
    lineHeight: 20,
  },
  learnMoreLink: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  learnMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  codeInputContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  codeInput: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: colors.neutral[0],
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    width: 200,
  },
  resendCode: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  resendCodeText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  recoveryDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary[600],
    marginBottom: spacing[3],
    lineHeight: 20,
  },
  recoveryCodesContainer: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  recoveryCode: {
    fontSize: typography.fontSize.base,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  downloadNote: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: spacing[6],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  downloadReadyCard: {
    marginBottom: spacing[4],
  },
  downloadFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadFileInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  downloadFileName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  downloadFileSize: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  downloadFileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  deleteWarningCard: {
    borderColor: colors.error + '30',
    marginBottom: spacing[4],
  },
  deleteWarningTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    marginBottom: spacing[3],
  },
  deleteWarningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  retainedDataCard: {
    backgroundColor: colors.neutral[50],
    marginBottom: spacing[6],
  },
  retainedTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  retainedText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  deleteInstructions: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  deleteKeyword: {
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  deleteInput: {
    backgroundColor: colors.neutral[0],
    borderWidth: 2,
    borderColor: colors.error + '50',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  emailVerifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  emailVerifyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginLeft: spacing[2],
  },
  emailVerifyNote: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  pendingStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  pendingStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  pendingStepNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
  pendingStepText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

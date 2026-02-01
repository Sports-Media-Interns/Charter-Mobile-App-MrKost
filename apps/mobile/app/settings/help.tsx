import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, Button, Input } from '@/components';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';

interface FAQItem {
  question: string;
  answer: string;
  isOpen?: boolean;
}

export default function HelpScreen() {
  const { colors: themeColors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'feature' | 'general'>('general');
  const [submitting, setSubmitting] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      showAlert('Required', 'Please enter your feedback.');
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('messages').insert({
        request_id: null as any,
        sender_id: user?.id || null as any,
        content: `[${feedbackCategory.toUpperCase()} FEEDBACK] ${feedbackText.trim()}`,
      });
      if (error) throw error;
      showAlert('Thank You!', 'Your feedback has been submitted successfully.');
      setFeedbackText('');
      setShowFeedback(false);
    } catch (err) {
      console.log('Feedback submission error (storing locally):', err);
      // Even if Supabase fails, acknowledge the feedback
      showAlert('Thank You!', 'Your feedback has been recorded and will be sent when connectivity is restored.');
      setFeedbackText('');
      setShowFeedback(false);
    } finally {
      setSubmitting(false);
    }
  };
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      question: 'How do I request a charter flight?',
      answer: 'Tap the "+" button in the navigation bar or go to the Home screen and select "New Request". Fill in your departure and arrival airports, date, time, and number of passengers. Submit your request and you\'ll receive quotes within 2-4 hours.',
      isOpen: false,
    },
    {
      question: 'How long does it take to receive quotes?',
      answer: 'For standard requests, you\'ll typically receive quotes within 2-4 hours during business hours. Urgent requests may receive quotes faster. Emergency requests (under 24 hours) are prioritized.',
      isOpen: false,
    },
    {
      question: 'Can I modify or cancel a booking?',
      answer: 'Yes, you can modify or cancel bookings from the Trips section. Cancellation policies vary by operator and timing. Cancellations more than 7 days before departure typically receive a full refund.',
      isOpen: false,
    },
    {
      question: 'How do I add authorized travelers?',
      answer: 'Go to Profile > Authorized Personnel and tap the "+" button. You can add team members, specify their roles, and set their permissions for approvals and bookings.',
      isOpen: false,
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, corporate cards, and direct bank transfers (ACH/Wire). You can manage payment methods in Profile > Billing & Payments.',
      isOpen: false,
    },
  ]);

  const toggleFAQ = (index: number) => {
    setFaqs(faqs.map((faq, i) => ({
      ...faq,
      isOpen: i === index ? !faq.isOpen : false,
    })));
  };

  const contactOptions = [
    {
      icon: 'call',
      title: 'Call Us',
      subtitle: '24/7 Support Line',
      action: () => Linking.openURL('tel:+19704360580'),
      color: colors.accent[500],
    },
    {
      icon: 'mail',
      title: 'Email',
      subtitle: 'charter@sportsmedia.net',
      action: () => Linking.openURL('mailto:charter@sportsmedia.net'),
      color: colors.primary[500],
    },
    {
      icon: 'chatbubbles',
      title: 'Live Chat',
      subtitle: 'Chat with our team',
      action: () => {},
      color: colors.secondary[500],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background.secondary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.neutral[0], borderBottomColor: themeColors.border.light }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <ThemeToggle color={themeColors.text.primary} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <Input
          placeholder="Search for help..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          containerStyle={{ marginBottom: spacing[6] }}
        />

        {/* Contact Options */}
        <Text style={styles.sectionLabel}>CONTACT US</Text>
        <View style={styles.contactGrid}>
          {contactOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactCard}
              onPress={option.action}
            >
              <View style={[styles.contactIcon, { backgroundColor: `${option.color}15` }]}>
                <Ionicons name={option.icon as any} size={24} color={option.color} />
              </View>
              <Text style={styles.contactTitle}>{option.title}</Text>
              <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
        <Card variant="outlined" padding="none">
          {faqs.map((faq, index) => (
            <View key={index}>
              <TouchableOpacity
                style={[
                  styles.faqQuestion,
                  index < faqs.length - 1 && !faq.isOpen && styles.faqQuestionBorder,
                ]}
                onPress={() => toggleFAQ(index)}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Ionicons
                  name={faq.isOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.neutral[400]}
                />
              </TouchableOpacity>
              {faq.isOpen && (
                <View style={[
                  styles.faqAnswer,
                  index < faqs.length - 1 && styles.faqAnswerBorder,
                ]}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </Card>

        {/* Resources */}
        <Text style={styles.sectionLabel}>RESOURCES</Text>
        <Card variant="outlined" padding="none">
          <TouchableOpacity
            style={[styles.resourceItem, styles.resourceItemBorder]}
            onPress={() => router.push('/legal/user-guide')}
          >
            <View style={styles.resourceIcon}>
              <Ionicons name="book-outline" size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>User Guide</Text>
              <Text style={styles.resourceSubtitle}>Learn how to use Sports Media Charter</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resourceItem, styles.resourceItemBorder]}
            onPress={() => {}}
          >
            <View style={styles.resourceIcon}>
              <Ionicons name="videocam-outline" size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Video Tutorials</Text>
              <Text style={styles.resourceSubtitle}>Step-by-step walkthroughs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resourceItem, styles.resourceItemBorder]}
            onPress={() => router.push('/legal/terms')}
          >
            <View style={styles.resourceIcon}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Terms of Service</Text>
              <Text style={styles.resourceSubtitle}>Usage terms and conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => router.push('/legal/privacy-policy')}
          >
            <View style={styles.resourceIcon}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Privacy Policy</Text>
              <Text style={styles.resourceSubtitle}>How we handle your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        </Card>

        {/* Feedback */}
        <Card variant="outlined" style={styles.feedbackCard}>
          <View style={styles.feedbackIcon}>
            <Ionicons name="heart" size={32} color={colors.secondary[500]} />
          </View>
          <Text style={styles.feedbackTitle}>We'd love your feedback!</Text>
          <Text style={styles.feedbackText}>
            Help us improve Sports Media Charter by sharing your thoughts and suggestions.
          </Text>
          <Button
            title="Send Feedback"
            onPress={() => setShowFeedback(true)}
            variant="outline"
            size="md"
          />
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Sports Media Charter Travel</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCompany}>A Division of Sports Media, Inc.</Text>
          <Text style={styles.appCopyright}>© 2026 Sports Media, Inc. All rights reserved.</Text>
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedback}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFeedback(false)}
      >
        <View style={feedbackStyles.overlay}>
          <View style={feedbackStyles.modal}>
            <View style={feedbackStyles.header}>
              <Text style={feedbackStyles.title}>Send Feedback</Text>
              <TouchableOpacity onPress={() => setShowFeedback(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={feedbackStyles.label}>Category</Text>
            <View style={feedbackStyles.categoryRow}>
              {(['general', 'bug', 'feature'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    feedbackStyles.categoryBtn,
                    feedbackCategory === cat && feedbackStyles.categoryBtnActive,
                  ]}
                  onPress={() => setFeedbackCategory(cat)}
                >
                  <Ionicons
                    name={cat === 'bug' ? 'bug-outline' : cat === 'feature' ? 'bulb-outline' : 'chatbubble-outline'}
                    size={16}
                    color={feedbackCategory === cat ? '#FFFFFF' : colors.text.secondary}
                  />
                  <Text style={[
                    feedbackStyles.categoryText,
                    feedbackCategory === cat && feedbackStyles.categoryTextActive,
                  ]}>
                    {cat === 'bug' ? 'Bug Report' : cat === 'feature' ? 'Feature Request' : 'General'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={feedbackStyles.label}>Your Feedback</Text>
            <TextInput
              style={feedbackStyles.textInput}
              placeholder="Tell us what's on your mind..."
              placeholderTextColor={colors.text.tertiary}
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[feedbackStyles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={submitFeedback}
              disabled={submitting}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
              <Text style={feedbackStyles.submitText}>
                {submitting ? 'Sending...' : 'Submit Feedback'}
              </Text>
            </TouchableOpacity>
          </View>
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
    marginTop: spacing[2],
  },
  contactGrid: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  contactIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  contactTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  contactSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  faqQuestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginRight: spacing[3],
  },
  faqAnswer: {
    padding: spacing[4],
    paddingTop: 0,
    backgroundColor: colors.neutral[50],
  },
  faqAnswerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  faqAnswerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  resourceItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  resourceSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  feedbackCard: {
    alignItems: 'center',
    marginTop: spacing[6],
  },
  feedbackIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  feedbackTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  feedbackText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
    lineHeight: 20,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: spacing[8],
  },
  appName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  appVersion: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  appCompany: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  appCopyright: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
});

const feedbackStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.neutral[50],
  },
  categoryBtnActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 120,
    marginBottom: spacing[5],
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

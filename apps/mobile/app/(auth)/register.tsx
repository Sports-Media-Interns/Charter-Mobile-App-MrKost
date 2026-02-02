import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/utils/validation-schemas';
import { supabase } from "@/services/supabase";
import { useCRMTracker } from "@/hooks/useCRMTracker";
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function RegisterScreen() {
  const { control, handleSubmit: rhfHandleSubmit, formState: { errors }, setError: setFormError } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', organizationName: '', email: '', password: '', confirmPassword: '' },
  });
  const [isLoading, setIsLoading] = useState(false);
  const { trackEvent, trackButtonClick, trackError } = useCRMTracker();
  const { colors: themeColors, isDark } = useTheme();

  const handleRegister = async (formData: RegisterInput) => {
    setIsLoading(true);
    trackButtonClick("create_account_button");

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.fullName, organization_name: formData.organizationName } },
      });

      if (authError) throw authError;

      trackEvent("user_registered", { properties: { method: "email" } });

      if (Platform.OS === "web") {
        window.alert("Registration successful! Please check your email to verify.");
      }
      router.replace("/(auth)/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setFormError('root', { message });
      trackError(message, "REGISTRATION_ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
          </TouchableOpacity>
          <ThemeToggle color={themeColors.text.primary} />
        </View>

        <Text style={[styles.title, { color: themeColors.text.primary }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>Join Sports Media Charter for seamless travel</Text>

        {errors.root?.message ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errors.root.message}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Full Name</Text>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.fullName && { borderColor: '#DC2626' }]}
              placeholder="John Smith"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.fullName && <Text style={styles.fieldError}>{errors.fullName.message}</Text>}

        <Text style={styles.label}>Organization Name</Text>
        <Controller
          control={control}
          name="organizationName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.organizationName && { borderColor: '#DC2626' }]}
              placeholder="e.g. Dallas Mavericks"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.organizationName && <Text style={styles.fieldError}>{errors.organizationName.message}</Text>}

        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.email && { borderColor: '#DC2626' }]}
              placeholder="you@email.com"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}

        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.password && { borderColor: '#DC2626' }]}
              placeholder="Create a password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
            />
          )}
        />
        {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}

        <Text style={styles.label}>Confirm Password</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.confirmPassword && { borderColor: '#DC2626' }]}
              placeholder="Confirm your password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
            />
          )}
        />
        {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword.message}</Text>}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={rhfHandleSubmit(handleRegister)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.legalFooter}>
          <Text style={styles.legalText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/legal/terms')}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/legal/privacy-policy')}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { padding: 24, paddingTop: 64 },
  backBtn: { width: 40, height: 40, justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1E3A5F", marginBottom: 8 },
  subtitle: { color: "#6B7280", marginBottom: 32 },
  errorBox: { backgroundColor: "#FEE2E2", padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: "#DC2626", textAlign: "center" },
  label: { fontSize: 14, color: "#374151", marginBottom: 8, fontWeight: "500" },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
    fontSize: 16,
  },
  fieldError: { color: "#DC2626", fontSize: 12, marginTop: -12, marginBottom: 12 },
  button: {
    height: 56,
    backgroundColor: "#1E3A5F",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: "#93C5FD" },
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#6B7280" },
  footerLink: { color: "#1E3A5F", fontWeight: "600" },
  legalFooter: { marginTop: 24, paddingHorizontal: 16 },
  legalText: { fontSize: 12, color: "#9CA3AF", textAlign: "center", lineHeight: 18 },
  legalLink: { color: "#1E3A5F", fontWeight: "500" },
});

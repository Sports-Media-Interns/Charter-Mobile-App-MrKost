import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from '@/components/ThemeToggle';

export default function RequestsScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background.primary, borderBottomColor: colors.border.light }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={[styles.title, { color: colors.text.primary }]}>Requests</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Manage your charter requests</Text>
          </View>
          <ThemeToggle color={colors.text.primary} />
        </View>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color={colors.neutral[300]} />
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No requests found</Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primary[500] }]}
            onPress={() => router.push("/(tabs)/new-request")}
          >
            <Text style={styles.ctaButtonText}>Create New Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { marginTop: 4 },
  content: { flex: 1, padding: 16 },
  emptyState: { alignItems: "center", paddingVertical: 64 },
  emptyText: { marginTop: 16, textAlign: "center" },
  ctaButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaButtonText: { color: "#FFFFFF", fontWeight: "600" },
});

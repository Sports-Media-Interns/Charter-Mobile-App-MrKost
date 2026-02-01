import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Index() {
  const { isDark } = useTheme();
  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', top: 50, right: 20 }}>
        <ThemeToggle />
      </View>
      <Image
        source={require('../assets/images/sports-media-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>
        Sports Media Charter
      </Text>
      <Text style={styles.subtitle}>
        Private Aviation for Professional Sports
      </Text>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/(auth)/register" asChild>
        <TouchableOpacity style={styles.createAccountButton}>
          <Text style={styles.createAccountText}>Create Account</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E3A5F",
    padding: 20,
  },
  logo: {
    width: 260,
    height: 116,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#A0C4E8",
    marginBottom: 40,
  },
  signInButton: {
    backgroundColor: "white",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  signInText: {
    color: "#1E3A5F",
    fontSize: 18,
    fontWeight: "600",
  },
  createAccountButton: {
    borderColor: "white",
    borderWidth: 2,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  createAccountText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

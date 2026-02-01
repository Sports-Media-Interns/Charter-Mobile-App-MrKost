import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { logger } from "@/utils/logger";

interface ThemeColors {
  background: { dark: string };
  text: { primary: string; secondary: string };
  secondary: { 500: string };
  neutral: { 0: string };
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  colors?: ThemeColors;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const bg = this.props.colors?.background.dark ?? "#0F1A2E";
      const titleColor = this.props.colors?.text.primary ?? "#FFFFFF";
      const msgColor = this.props.colors?.text.secondary ?? "#94A3B8";
      const btnBg = this.props.colors?.secondary[500] ?? "#C9A227";
      const btnText = this.props.colors?.neutral[0] ?? "#0F1A2E";

      return (
        <View style={[styles.container, { backgroundColor: bg }]}>
          <Text style={[styles.title, { color: titleColor }]}>Something went wrong</Text>
          <Text style={[styles.message, { color: msgColor }]}>
            {__DEV__ ? this.state.error?.message : "An unexpected error occurred."}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: btnBg }]}
            onPress={this.handleReset}
            accessibilityLabel="Try again"
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { color: btnText }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Wrapper that can consume theme context
// Since ErrorBoundary wraps ThemeProvider, it can't use useTheme
// Instead, accept colors as optional prop
export function ErrorBoundary({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <ErrorBoundaryInner fallback={fallback}>{children}</ErrorBoundaryInner>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

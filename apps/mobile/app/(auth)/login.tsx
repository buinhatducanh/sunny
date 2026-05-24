// apps/mobile/app/(auth)/login.tsx

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setError("");
    try {
      await login(email, password);
      router.replace("/tutorial");
    } catch (e) {
      setError("Email hoặc mật khẩu không đúng");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.logoArea}>
        <Text style={styles.logo}>☀️</Text>
        <Text style={styles.title}>Project Sunny</Text>
        <Text style={styles.subtitle}>Khởi nghiệp từ con số không</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#666"
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Đăng ký</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A1E",
    padding: 24,
    justifyContent: "center",
  },
  logoArea: { alignItems: "center", marginBottom: 48 },
  logo: { fontSize: 64, marginBottom: 12 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6C63FF",
    marginBottom: 4,
  },
  subtitle: { fontSize: 16, color: "#888" },
  form: { gap: 16 },
  label: { fontSize: 14, color: "#aaa", marginBottom: 4 },
  input: {
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#2a2a5e",
  },
  error: { color: "#FF4757", fontSize: 14, textAlign: "center" },
  button: {
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: { color: "#888", fontSize: 14 },
  link: { color: "#6C63FF", fontSize: 14, fontWeight: "bold" },
});

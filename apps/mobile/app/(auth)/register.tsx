// apps/mobile/app/(auth)/register.tsx

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

export default function RegisterScreen() {
  const { register, isLoading } = useAuthStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister() {
    if (!username || !email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    setError("");
    try {
      await register(email, username, password);
      router.replace("/tutorial");
    } catch (e) {
      setError("Email hoặc tên người dùng đã tồn tại");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoArea}>
          <Text style={styles.logo}>☀️</Text>
          <Text style={styles.title}>Tạo tài khoản</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Tên người dùng</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="SunnyPlayer"
            placeholderTextColor="#666"
            autoCapitalize="none"
          />

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
            placeholder="Ít nhất 8 ký tự"
            placeholderTextColor="#666"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Tạo tài khoản</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Đăng nhập</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A1E" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoArea: { alignItems: "center", marginBottom: 40 },
  logo: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
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
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  footerText: { color: "#888", fontSize: 14 },
  link: { color: "#6C63FF", fontSize: 14, fontWeight: "bold" },
});

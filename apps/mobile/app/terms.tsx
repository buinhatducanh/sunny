// apps/mobile/app/terms.tsx

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { router } from "expo-router";

const SECTIONS = [
  {
    title: "1. Chấp nhận điều khoản",
    body: "Bằng việc sử dụng ứng dụng Project Sunny, bạn đồng ý tuân thủ các điều khoản sử dụng này. Nếu bạn không đồng ý, vui lòng ngừng sử dụng ứng dụng.",
  },
  {
    title: "2. Mô tả dịch vụ",
    body: "Project Sunny là một ứng dụng game di động thuộc sở hữu và vận hành bởi LOOP Solutions. Game cho phép người dùng chơi game xây dựng doanh nghiệp theo lượt với người dùng khác.",
  },
  {
    title: "3. Tài khoản người dùng",
    body: "Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình. Bạn phải từ 13 tuổi trở lên để sử dụng dịch vụ. Tài khoản không được chuyển nhượng.",
  },
  {
    title: "4. Mua sắm trong ứng dụng",
    body: "Các giao dịch mua trong ứng dụng (IAP) không hoàn tiền trừ khi pháp luật quy định. Coins và Gems không có giá trị tiền tệ thực tế và không thể đổi thành tiền mặt.",
  },
  {
    title: "5. Quy tắc ứng xử",
    body: "Người dùng cam kết không sử dụng ngôn từ phản cảm, quấy rối, hoặc hành vi gây hại đến người dùng khác trong game.",
  },
  {
    title: "6. Giới hạn trách nhiệm",
    body: "LOOP Solutions không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng ứng dụng. Dịch vụ được cung cấp 'as is'.",
  },
  {
    title: "7. Thay đổi điều khoản",
    body: "Chúng tôi có quyền thay đổi các điều khoản này. Thông báo sẽ được gửi qua ứng dụng khi có thay đổi quan trọng.",
  },
  {
    title: "8. Liên hệ",
    body: "Mọi thắc mắc vui lòng liên hệ: admin@loopsolutions.vn",
  },
];

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Điều khoản sử dụng</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content}>
        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
        <Text style={styles.footer}>Cập nhật: 01/01/2026 · © 2026 LOOP Solutions</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A1E" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 60,
  },
  back: { fontSize: 24, color: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#6C63FF", marginBottom: 8 },
  sectionBody: { fontSize: 14, color: "#aaa", lineHeight: 22 },
  footer: { fontSize: 12, color: "#555", textAlign: "center", marginTop: 16 },
});

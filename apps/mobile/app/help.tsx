// apps/mobile/app/help.tsx

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";

const FAQS = [
  {
    q: "Làm sao để chơi game?",
    a: "Nhấn 'Tạo phòng' hoặc 'Chơi ngay' từ trang chủ. Bạn cần ít nhất 2 người chơi để bắt đầu một ván.",
  },
  {
    q: "Năng lượng là gì?",
    a: "Mỗi lá bài cần năng lượng để đánh. Năng lượng hồi đầy mỗi vòng. Dùng gems để hồi nhanh.",
  },
  {
    q: "Làm sao kiếm thêm coins?",
    a: "Thắng ván đấu, hoàn thành achievement, mở gói thẻ bán lại, hoặc tham gia sự kiện.",
  },
  {
    q: "Nghề nghiệp có ảnh hưởng gì?",
    a: "Mỗi nghề có bonus năng lượng và doanh thu khác nhau. Chọn nghề phù hợp phong cách chơi của bạn.",
  },
  {
    q: "Pity system là gì?",
    a: "Nếu bạn không mở được thẻ hiếm sau nhiều lần, tỷ lệ sẽ tăng dần cho đến khi có thẻ hiếm.",
  },
  {
    q: "Liên hệ hỗ trợ?",
    a: "Email: admin@loopsolutions.vn",
  },
];

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Trợ giúp & FAQ</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content}>
        {FAQS.map((faq, i) => (
          <View key={i} style={styles.faqCard}>
            <Text style={styles.faqQ}>{faq.q}</Text>
            <Text style={styles.faqA}>{faq.a}</Text>
          </View>
        ))}
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
  faqCard: {
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQ: { fontSize: 15, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  faqA: { fontSize: 14, color: "#aaa", lineHeight: 20 },
});

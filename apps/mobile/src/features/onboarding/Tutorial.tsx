// apps/mobile/src/features/onboarding/Tutorial.tsx

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../api/client";
import type { ProfessionType } from "@sunny-game/types/player.types";
import { PROFESSION_DATA, PROFESSION_COLORS, PROFESSION_ICONS } from "@sunny-game/constants/profession.data";

const { width } = Dimensions.get("window");
const PROFESSION_KEYS = Object.keys(PROFESSION_DATA) as ProfessionType[];

interface TutorialProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: "welcome",
    emoji: "☀️",
    title: "Chào mừng đến với Sunny!",
    subtitle: "Khởi nghiệp từ con số không",
    description:
      "Bạn sẽ cùng 4 người chơi khác điều khiển cửa hàng, đối phó rủi ro thị trường, và cùng nhau sống sót đến Vòng 20.\n\nMỗi vòng là một tháng kinh doanh. Hãy sử dụng lá bài thông minh để tối ưu doanh thu!",
    cta: "Bắt đầu",
  },
  {
    id: "profession",
    emoji: "💼",
    title: "Chọn nghề nghiệp",
    subtitle: "Mỗi nghề có điểm mạnh riêng",
    description: "Chọn nghề chính và nghề phụ phù hợp với phong cách chơi của bạn:",
    cta: "Tiếp tục",
  },
  {
    id: "demo",
    emoji: "🎮",
    title: "Demo Round",
    subtitle: "Xem cách chơi hoạt động",
    description:
      "Trong mỗi vòng, bạn sẽ:\n\n📤 Nhận 5 lá bài mới\n🃏 Kéo thả bài vào 5 slot trên bàn\n⚡ Quản lý năng lượng\n🎯 Nhấn 'Sẵn sàng' khi xong\n\nServer sẽ tính kết quả và cập nhật cho cả nhóm!",
    cta: "Vào game",
  },
];

export default function Tutorial({ onComplete }: TutorialProps) {
  const [step, setStep] = useState(0);
  const [mainProf, setMainProf] = useState<ProfessionType | null>(null);
  const [secondaryProf, setSecondaryProf] = useState<ProfessionType | null>(null);
  const [selectingSecondary, setSelectingSecondary] = useState(false);

  const currentStep = STEPS[step]!;

  function handleNext() {
    if (step === 1 && !selectingSecondary) {
      setSelectingSecondary(true);
      return;
    }
    if (step === 1 && mainProf && !secondaryProf) return;
    if (step === 1 && mainProf && secondaryProf) {
      saveProfessions(mainProf, secondaryProf);
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finishTutorial();
    }
  }

  async function saveProfessions(main: ProfessionType, secondary: ProfessionType) {
    try {
      await AsyncStorage.setItem("tutorial_professions", JSON.stringify({ main, secondary }));
      await api.patch("/users/me", { mainProfession: main, secondaryProfession: secondary });
    } catch {}
  }

  async function finishTutorial() {
    try {
      await AsyncStorage.setItem("tutorial_completed", "true");
    } catch {}
    onComplete();
  }

  function selectMainProf(prof: ProfessionType) {
    setMainProf(prof);
    setSecondaryProf(null);
    setSelectingSecondary(false);
  }

  function selectSecondaryProf(prof: ProfessionType) {
    if (prof === mainProf) return;
    setSecondaryProf(prof);
  }

  const canContinue =
    step === 0 ||
    (step === 1 && mainProf !== null && secondaryProf !== null) ||
    step === 2;

  const professions = selectingSecondary
    ? PROFESSION_KEYS.filter((k) => k !== mainProf)
    : PROFESSION_KEYS;

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Progress dots */}
          <View style={styles.progress}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          {/* Content */}
          {step === 1 && (
            <Text style={styles.stepLabel}>
              {selectingSecondary ? "Chọn nghề phụ (bổ trợ)" : "Chọn nghề chính"}
            </Text>
          )}

          <Text style={styles.emoji}>{currentStep.emoji}</Text>
          <Text style={styles.title}>{currentStep.title}</Text>
          {step === 1 && (
            <Text style={styles.subtitle}>
              {selectingSecondary ? "Nghề phụ cho thêm lợi thế" : currentStep.subtitle}
            </Text>
          )}
          <Text style={styles.description}>{currentStep.description}</Text>

          {/* Profession grid */}
          {step === 1 && (
            <View style={styles.profGrid}>
              {professions.map((profKey) => {
                const prof = PROFESSION_DATA[profKey];
                const isSelected =
                  (selectingSecondary ? secondaryProf : mainProf) === profKey;
                const color = PROFESSION_COLORS[profKey];
                const icon = PROFESSION_ICONS[profKey];
                return (
                  <TouchableOpacity
                    key={profKey}
                    style={[
                      styles.profCard,
                      isSelected && { borderColor: color, borderWidth: 2 },
                    ]}
                    onPress={() =>
                      selectingSecondary
                        ? selectSecondaryProf(profKey)
                        : selectMainProf(profKey)
                    }
                  >
                    <Text style={styles.profIcon}>{icon}</Text>
                    <Text style={styles.profName}>{prof.nameVi}</Text>
                    <Text style={styles.profStats}>
                      ⚡{prof.energyBonus} · 🎯{prof.revenueMult > 1 ? "+" : ""}
                      {Math.round((prof.revenueMult - 1) * 100)}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Selected summary */}
          {step === 1 && mainProf && (
            <View style={styles.selectionSummary}>
              <Text style={styles.selectionText}>
                Đã chọn:{" "}
                <Text style={{ color: PROFESSION_COLORS[mainProf] }}>
                  {PROFESSION_DATA[mainProf].nameVi}
                </Text>
                {secondaryProf ? (
                  <>
                    {" "}
                    +{" "}
                    <Text style={{ color: PROFESSION_COLORS[secondaryProf] }}>
                      {PROFESSION_DATA[secondaryProf].nameVi}
                    </Text>
                  </>
                ) : (
                  " · Chọn nghề phụ"
                )}
              </Text>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, !canContinue && styles.ctaBtnDisabled]}
            onPress={handleNext}
            disabled={!canContinue}
          >
            <Text style={styles.ctaText}>{currentStep.cta}</Text>
          </TouchableOpacity>

          {/* Skip */}
          {step > 0 && (
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={finishTutorial}
            >
              <Text style={styles.skipText}>Bỏ qua tutorial</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: "#0F0F2E",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
  },
  progress: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2a2a5e",
  },
  dotActive: {
    backgroundColor: "#6C63FF",
    width: 24,
  },
  stepLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 12,
    fontWeight: "600",
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6C63FF",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  profGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    justifyContent: "center",
  },
  profCard: {
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 12,
    width: (width - 80) / 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a5e",
  },
  profIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  profName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  profStats: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  selectionSummary: {
    backgroundColor: "#1a1a3e",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    width: "100%",
  },
  selectionText: {
    color: "#aaa",
    fontSize: 13,
    textAlign: "center",
  },
  ctaBtn: {
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    width: "100%",
    alignItems: "center",
  },
  ctaBtnDisabled: {
    backgroundColor: "#2a2a5e",
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipBtn: {
    marginTop: 12,
  },
  skipText: {
    color: "#666",
    fontSize: 14,
  },
});

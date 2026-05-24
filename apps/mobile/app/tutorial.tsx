// apps/mobile/app/tutorial.tsx

import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Tutorial from "../src/features/onboarding/Tutorial";

export default function TutorialScreen() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTutorial();
  }, []);

  async function checkTutorial() {
    try {
      const completed = await AsyncStorage.getItem("tutorial_completed");
      if (completed === "true") {
        router.replace("/(tabs)/home");
      } else {
        setShowTutorial(true);
      }
    } catch {
      router.replace("/(tabs)/home");
    }
    setLoading(false);
  }

  function handleComplete() {
    setShowTutorial(false);
    router.replace("/(tabs)/home");
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A1E", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!showTutorial) return null;

  return <Tutorial onComplete={handleComplete} />;
}

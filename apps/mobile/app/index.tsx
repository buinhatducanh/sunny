// apps/mobile/app/index.tsx

import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../src/store/authStore";

export default function Index() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      setChecked(true);
    }
  }, [isInitialized]);

  if (!checked) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A1E", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/tutorial" />;
  }

  return <Redirect href="/(auth)/login" />;
}

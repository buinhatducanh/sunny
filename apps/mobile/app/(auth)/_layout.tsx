// apps/mobile/app/(auth)/_layout.tsx

import { Stack } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { Redirect } from "expo-router";

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0A0A1E" },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}

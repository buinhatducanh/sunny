// apps/mobile/app/_layout.tsx

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import "../src/theme/globals.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              contentStyle: { backgroundColor: "#0A0A1E" },
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="tutorial" />
            <Stack.Screen name="game/[roomId]" options={{ animation: "fade" }} />
            <Stack.Screen name="lobby/[roomId]" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="settings/notifications" />
            <Stack.Screen name="help" />
            <Stack.Screen name="terms" />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A1E",
  },
});

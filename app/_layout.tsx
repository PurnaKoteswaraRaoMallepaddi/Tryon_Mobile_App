import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/auth";
import { colors } from "../src/theme";

function Gate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "login" || segments[0] === "signup";
    if (!user && !inAuth) router.replace("/login");
    else if (user && inAuth) router.replace("/(tabs)");
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Gate />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

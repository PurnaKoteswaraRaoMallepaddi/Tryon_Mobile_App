import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../src/auth";
import { Button, Eyebrow, Field, Notice } from "../src/ui";
import { colors } from "../src/theme";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 80, flexGrow: 1 }}>
        <Text style={{ fontSize: 34, fontWeight: "800", color: colors.accent, marginBottom: 28 }}>Atelier</Text>
        <Eyebrow>Welcome back</Eyebrow>
        <Text style={{ fontSize: 28, fontWeight: "700", color: colors.ink, marginBottom: 24 }}>Sign in</Text>

        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />

        {err ? <Notice>{err}</Notice> : null}
        <Button label="Sign in" onPress={submit} loading={busy} />

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
          <Text style={{ color: colors.inkSoft }}>New here? </Text>
          <Link href="/signup" style={{ color: colors.accent, fontWeight: "700" }}>Create an account</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

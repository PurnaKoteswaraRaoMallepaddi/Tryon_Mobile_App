import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../src/auth";
import { api } from "../src/api";
import { Button, Eyebrow, Field, Notice } from "../src/ui";
import { colors } from "../src/theme";

export default function Signup() {
  const { signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState("");
  const [inviteRequired, setInviteRequired] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.authConfig().then((c) => setInviteRequired(c.inviteRequired)).catch(() => {});
  }, []);

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      await signup(email.trim(), password, invite.trim() || undefined);
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
        <Eyebrow>Create your account</Eyebrow>
        <Text style={{ fontSize: 28, fontWeight: "700", color: colors.ink, marginBottom: 24 }}>Join the atelier</Text>

        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Field label="Password (8+ characters)" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password-new" />
        {inviteRequired || invite ? (
          <Field label="Invite code" value={invite} onChangeText={setInvite} autoCapitalize="none" placeholder="your invite code" />
        ) : null}

        {err ? <Notice>{err}</Notice> : null}
        <Button label="Create account" onPress={submit} loading={busy} />

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
          <Text style={{ color: colors.inkSoft }}>Already have an account? </Text>
          <Link href="/login" style={{ color: colors.accent, fontWeight: "700" }}>Sign in</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

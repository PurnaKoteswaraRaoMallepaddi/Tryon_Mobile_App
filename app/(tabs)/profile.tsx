import { useCallback, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../src/auth";
import { api, imageUrl, type Photo } from "../../src/api";
import { Button, Eyebrow, Notice } from "../../src/ui";
import { colors, radius } from "../../src/theme";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.listPhotos();
      setPhoto(r.photos.find((p) => p.isDefault) ?? r.photos[0] ?? null);
    } catch {
      /* ignore */
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function setReference(source: "camera" | "library") {
    setErr(null);
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setErr("Camera permission is needed to take your photo.");
          return;
        }
      }
      const res =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 })
          : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions.Images });
      if (res.canceled || !res.assets?.[0]?.base64) return;
      const a = res.assets[0];
      const dataUrl = `data:${a.mimeType ?? "image/jpeg"};base64,${a.base64}`;
      setBusy(true);
      const { photo } = await api.uploadPhoto(dataUrl, true);
      setPhoto(photo);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save your photo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Eyebrow>Your profile</Eyebrow>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.ink, marginBottom: 4 }}>You</Text>
        <Text style={{ color: colors.inkSoft, marginBottom: 24 }}>{user?.email}</Text>

        <Text style={{ fontWeight: "700", color: colors.ink, marginBottom: 10 }}>Your reference photo</Text>
        <Text style={{ color: colors.muted, marginBottom: 14 }}>
          This is the photo we fit garments onto. A clear, full-length photo works best.
        </Text>

        {err ? <Notice>{err}</Notice> : null}

        <View style={{ alignItems: "center", marginBottom: 18 }}>
          {photo ? (
            <Image source={{ uri: imageUrl(photo.url) }} style={{ width: 200, aspectRatio: 0.72, borderRadius: radius.lg, backgroundColor: "#eee" }} resizeMode="cover" />
          ) : (
            <View style={{ width: 200, aspectRatio: 0.72, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: colors.muted }}>No photo yet</Text>
            </View>
          )}
        </View>

        <View style={{ gap: 10 }}>
          <Button label={busy ? "Saving…" : photo ? "Replace photo" : "Take your photo"} loading={busy} onPress={() => setReference("camera")} />
          <Button label="Choose from library" variant="ghost" onPress={() => setReference("library")} />
        </View>

        <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 26 }} />
        <Button
          label="Sign out"
          variant="ghost"
          onPress={async () => {
            await logout();
            router.replace("/login");
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

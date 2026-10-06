import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { api, imageUrl, type Applied, type CatalogItem } from "../../src/api";
import { Button, Eyebrow, Notice } from "../../src/ui";
import { colors, radius } from "../../src/theme";

type Stage =
  | { k: "idle" }
  | { k: "extracting" }
  | { k: "extracted"; item: CatalogItem }
  | { k: "fitting"; item: CatalogItem }
  | { k: "done"; applied: Applied };

export default function Capture() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>({ k: "idle" });
  const [err, setErr] = useState<string | null>(null);
  const [needsPhoto, setNeedsPhoto] = useState(false);

  async function pick(source: "camera" | "library") {
    setErr(null);
    setNeedsPhoto(false);
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setErr("Camera permission is needed to photograph a garment.");
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

      setStage({ k: "extracting" });
      const { item } = await api.addCatalogItem(dataUrl, { garmentType: "dresses" });
      setStage({ k: "extracted", item });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not process that photo");
      setStage({ k: "idle" });
    }
  }

  async function tryOn(item: CatalogItem) {
    setErr(null);
    setNeedsPhoto(false);
    setStage({ k: "fitting", item });
    try {
      const { applied } = await api.tryOnCatalogItem(item.id);
      setStage({ k: "done", applied });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Try-on failed";
      if (/reference photo/i.test(msg)) setNeedsPhoto(true);
      setErr(msg);
      setStage({ k: "extracted", item });
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Eyebrow>In-store try-on</Eyebrow>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.ink, marginBottom: 4 }}>See it on you</Text>
        <Text style={{ color: colors.inkSoft, marginBottom: 20 }}>
          Photograph any dress — on a rack, a mannequin, or someone wearing it. We pull out just the
          garment, then fit it on your photo.
        </Text>

        {err ? <Notice>{err}</Notice> : null}
        {needsPhoto ? (
          <View style={{ marginBottom: 14 }}>
            <Button label="Add your photo first →" variant="ghost" onPress={() => router.push("/(tabs)/profile")} />
          </View>
        ) : null}

        {stage.k === "idle" ? (
          <View style={{ gap: 12 }}>
            <View style={styles_card}>
              <Text style={{ color: colors.muted, textAlign: "center" }}>
                Point your camera at the dress and snap.
              </Text>
            </View>
            <Button label="Photograph a dress" onPress={() => pick("camera")} />
            <Button label="Pick from library" variant="ghost" onPress={() => pick("library")} />
          </View>
        ) : null}

        {stage.k === "extracting" ? (
          <Centered label="Extracting the garment…" />
        ) : null}

        {stage.k === "extracted" || stage.k === "fitting" ? (
          <View style={{ gap: 14 }}>
            <Preview uri={imageUrl(stage.item.garmentImageUrl)} caption="Extracted garment" />
            {stage.k === "fitting" ? (
              <Centered label="Fitting it on you…" />
            ) : (
              <>
                <Button label="Try it on me" onPress={() => tryOn(stage.item)} />
                <Button label="Start over" variant="ghost" onPress={() => setStage({ k: "idle" })} />
              </>
            )}
          </View>
        ) : null}

        {stage.k === "done" ? (
          <View style={{ gap: 14 }}>
            <Preview uri={imageUrl(stage.applied.tryonImageUrl)} caption="On you" />
            {stage.applied.isMock ? (
              <Notice kind="ok">Preview render (offline engine). On the live server this is a real try-on.</Notice>
            ) : (
              <Notice kind="ok">Saved to your wardrobe.</Notice>
            )}
            <Button label="See my wardrobe" onPress={() => router.push("/(tabs)/wardrobe")} />
            <Button label="Try another" variant="ghost" onPress={() => setStage({ k: "idle" })} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Preview({ uri, caption }: { uri: string; caption: string }) {
  return (
    <View>
      <Image source={{ uri }} style={{ width: "100%", aspectRatio: 0.8, borderRadius: radius.lg, backgroundColor: "#eee" }} resizeMode="cover" />
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6, textAlign: "center" }}>{caption}</Text>
    </View>
  );
}

function Centered({ label }: { label: string }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 40, gap: 12 }}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text style={{ color: colors.inkSoft }}>{label}</Text>
    </View>
  );
}

const styles_card = {
  backgroundColor: colors.card,
  borderColor: colors.line,
  borderWidth: 1,
  borderRadius: radius.lg,
  padding: 28,
  marginBottom: 2,
} as const;

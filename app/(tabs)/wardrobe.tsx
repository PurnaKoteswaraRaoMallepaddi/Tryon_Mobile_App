import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, imageUrl, type Applied } from "../../src/api";
import { Eyebrow } from "../../src/ui";
import { colors, radius } from "../../src/theme";

export default function Wardrobe() {
  const [items, setItems] = useState<Applied[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api.listApplied();
      setItems(r.applied);
    } catch {
      setItems([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function toggleBought(it: Applied) {
    setItems((list) => list?.map((x) => (x.id === it.id ? { ...x, purchased: !x.purchased } : x)) ?? null);
    try {
      await api.updateApplied(it.id, { purchased: !it.purchased });
    } catch {
      load();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={["top"]}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 }}>
        <Eyebrow>Your wardrobe</Eyebrow>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.ink }}>Fittings</Text>
      </View>

      <FlatList
        data={items ?? []}
        keyExtractor={(i) => i.id}
        numColumns={2}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        columnWrapperStyle={{ gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          items === null ? null : (
            <View style={{ alignItems: "center", paddingVertical: 80, paddingHorizontal: 30 }}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>👗</Text>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.ink, marginBottom: 6 }}>No fittings yet</Text>
              <Text style={{ color: colors.muted, textAlign: "center" }}>
                Photograph a dress on the Try on tab — your renders land here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1, marginBottom: 12, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: "hidden" }}>
            <Image source={{ uri: imageUrl(item.tryonImageUrl) }} style={{ width: "100%", aspectRatio: 0.72, backgroundColor: "#eee" }} resizeMode="cover" />
            <View style={{ padding: 10 }}>
              <Text numberOfLines={1} style={{ fontWeight: "600", color: colors.ink }}>{item.productTitle}</Text>
              <Pressable onPress={() => toggleBought(item)} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
                <Ionicons name={item.purchased ? "checkmark-circle" : "cart-outline"} size={16} color={item.purchased ? colors.ok : colors.muted} />
                <Text style={{ fontSize: 13, color: item.purchased ? colors.ok : colors.muted }}>
                  {item.purchased ? "In wardrobe" : "Mark as bought"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

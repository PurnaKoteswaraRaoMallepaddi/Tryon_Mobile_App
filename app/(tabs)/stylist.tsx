import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { chatStylist, type ChatMessage } from "../../src/api";
import { Eyebrow } from "../../src/ui";
import { colors, radius } from "../../src/theme";

export default function Stylist() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi — I'm your stylist. Ask me what suits you, how to style a piece, or what colours work for you." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const reply = await chatStylist(next.filter((m) => m.role === "user" || m.role === "assistant"));
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: e instanceof Error ? e.message : "Something went wrong." }]);
    } finally {
      setBusy(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={["top"]}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 }}>
        <Eyebrow>Your stylist</Eyebrow>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.ink }}>Ask the atelier</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <Bubble msg={item} />}
          ListFooterComponent={busy ? <View style={{ padding: 10 }}><ActivityIndicator color={colors.accent} /></View> : null}
        />

        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.card }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Would this suit me?"
            placeholderTextColor={colors.muted}
            multiline
            style={{ flex: 1, maxHeight: 120, minHeight: 44, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, paddingHorizontal: 14, paddingTop: 12, color: colors.ink, backgroundColor: colors.paper }}
          />
          <Pressable onPress={send} disabled={busy || !input.trim()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", opacity: busy || !input.trim() ? 0.5 : 1 }}>
            <Ionicons name="arrow-up" size={22} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  const mine = msg.role === "user";
  return (
    <View style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "86%", backgroundColor: mine ? colors.accent : colors.card, borderWidth: mine ? 0 : 1, borderColor: colors.line, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 10 }}>
      <Text style={{ color: mine ? "#fff" : colors.ink, fontSize: 15, lineHeight: 21 }}>{msg.content}</Text>
    </View>
  );
}

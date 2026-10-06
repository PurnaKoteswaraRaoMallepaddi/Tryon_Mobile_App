import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { colors, radius } from "./theme";

export function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost";
}) {
  const isGhost = variant === "ghost";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        isGhost ? styles.btnGhost : styles.btnPrimary,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.ink : "#fff"} />
      ) : (
        <Text style={[styles.btnText, isGhost ? { color: colors.ink } : { color: "#fff" }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label?: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

export function Notice({ kind = "error", children }: { kind?: "error" | "ok"; children: ReactNode }) {
  return (
    <View style={[styles.notice, kind === "ok" ? styles.noticeOk : styles.noticeErr]}>
      <Text style={{ color: kind === "ok" ? colors.ok : colors.danger, fontSize: 13 }}>{children}</Text>
    </View>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  btnPrimary: { backgroundColor: colors.accent },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.line },
  btnText: { fontSize: 16, fontWeight: "700" },
  label: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.inkSoft,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: "#fff",
  },
  notice: { padding: 12, borderRadius: radius.md, borderWidth: 1, marginBottom: 14 },
  noticeErr: { backgroundColor: "#fbeaee", borderColor: "#eecad3" },
  noticeOk: { backgroundColor: "#e8f2ec", borderColor: "#c7e0d2" },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.gilt,
    fontWeight: "700",
    marginBottom: 6,
  },
});

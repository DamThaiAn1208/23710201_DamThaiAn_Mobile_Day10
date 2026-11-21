import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme";

export function Loading({ label = "Đang tải…" }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.indigo} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={{ fontSize: 40 }}>⚠️</Text>
      <Text style={styles.msg}>{message}</Text>
      <TouchableOpacity style={styles.btn} onPress={onRetry} testID="retry-btn">
        <Text style={styles.btnText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  muted: { color: colors.muted },
  msg: { color: colors.text, textAlign: "center" },
  btn: { backgroundColor: colors.indigo, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "800" },
});

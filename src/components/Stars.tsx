import React from "react";
import { Text } from "react-native";

// value 1–5 → ★★★☆☆
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return <Text style={{ fontSize: size, color: "#F5A623" }}>{"★".repeat(full)}{"☆".repeat(5 - full)}</Text>;
}

import { Alert, Platform } from "react-native";

// Alert.alert không chạy trên bản web → dùng window.confirm khi chạy web
export function confirmDialog(title: string, message: string, confirmText: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Huỷ", style: "cancel" },
    { text: confirmText, style: "destructive", onPress: onConfirm },
  ]);
}

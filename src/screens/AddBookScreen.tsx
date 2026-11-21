import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { useAppDispatch } from "../store/hooks";
import { addBook } from "../store/booksSlice";
import { colors } from "../theme";

export function AddBookScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "AddBook">) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const priceNumber = Number(price);
  const valid = title.trim() !== "" && author.trim() !== "" && category.trim() !== "" && Number.isFinite(priceNumber) && priceNumber > 0;

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await dispatch(
        addBook({
          title: title.trim(), author: author.trim(), category: category.trim(), price: priceNumber,
          rating: 8, inStock: true, description: "Sách mới thêm.", cover: `https://picsum.photos/seed/${encodeURIComponent(title.trim())}/300/450`,
        })
      ).unwrap(); // unwrap(): thành công → trả payload, thất bại → ném lỗi (rejectValue)
      navigation.goBack();
    } catch (e) {
      setError(typeof e === "string" ? e : "Không thêm được sách.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.box}>
      <TextInput style={styles.input} placeholder="Tên sách" value={title} onChangeText={setTitle} testID="in-title" />
      <TextInput style={styles.input} placeholder="Tác giả" value={author} onChangeText={setAuthor} testID="in-author" />
      <TextInput style={styles.input} placeholder="Thể loại (ví dụ: Văn học)" value={category} onChangeText={setCategory} testID="in-category" />
      <TextInput style={styles.input} placeholder="Giá (đ)" keyboardType="numeric" value={price} onChangeText={setPrice} testID="in-price" />
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <TouchableOpacity style={[styles.btn, (!valid || saving) && { opacity: 0.4 }]} disabled={!valid || saving} onPress={submit} testID="save-btn">
        <Text style={styles.btnText}>{saving ? "Đang lưu…" : "Lưu sách"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box: { padding: 16, gap: 10 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  err: { color: colors.red },
  btn: { backgroundColor: colors.indigo, borderRadius: 10, paddingVertical: 13, alignItems: "center", marginTop: 6 },
  btnText: { color: "#fff", fontWeight: "800" },
});

import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { deleteBook, selectBookById, updateBook } from "../store/booksSlice";
import { addToCart } from "../store/cartSlice";
import { errorText, useAddReviewMutation, useDeleteReviewMutation, useGetReviewsQuery } from "../store/reviewsApi";
import { Stars } from "../components/Stars";
import { ErrorBox, Loading } from "../components/StateView";
import { confirmDialog } from "../utils/confirm";
import { formatPrice } from "../types";
import { colors } from "../theme";

export function DetailScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, "Detail">) {
  const { id } = route.params;
  const dispatch = useAppDispatch();
  const book = useAppSelector(selectBookById(id));

  // RTK Query: chỉ cần gọi hook
  const { data: reviews = [], isLoading, isError, error, refetch } = useGetReviewsQuery(id);
  const [addReview, { isLoading: sending }] = useAddReviewMutation();
  const [removeReview] = useDeleteReviewMutation();

  const [user, setUser] = useState("");
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");

  const average = useMemo(() => (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0), [reviews]);

  if (!book) return <Text style={{ padding: 20 }}>Không tìm thấy sách.</Text>;

  const confirmDelete = () =>
    confirmDialog("Xoá sách", `Xoá “${book.title}”?`, "Xoá", async () => {
      await dispatch(deleteBook(book.id));
      navigation.goBack();
    });

  const submitReview = async () => {
    await addReview({ bookId: id, user: user.trim(), rating: stars, comment: comment.trim() }).unwrap().catch(() => {});
    setComment("");
  };

  return (
    <ScrollView contentContainerStyle={styles.box}>
      <Image source={{ uri: book.cover }} style={styles.cover} resizeMode="cover" />
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.sub}>{book.author} · {book.category}</Text>
      <Text style={styles.price}>{formatPrice(book.price)}  {book.inStock ? "✅ Còn hàng" : "❌ Hết hàng"}</Text>
      <Text style={styles.desc}>{book.description}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, !book.inStock && { opacity: 0.4 }]} disabled={!book.inStock} onPress={() => dispatch(addToCart(book))} testID="add-cart">
          <Text style={styles.btnText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={confirmDelete} testID="delete-book">
          <Text style={styles.btnText}>Xoá sách</Text>
        </TouchableOpacity>
      </View>
      {/* BT10.C2: PATCH giá mới, reducer thay sách cùng id */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnSale]}
          onPress={() => dispatch(updateBook({ id: book.id, changes: { price: Math.round(book.price * 0.9) } }))}
          testID="discount"
        >
          <Text style={styles.btnText}>Giảm giá 10%</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.h2}>Đánh giá {reviews.length > 0 && <Text style={styles.sub}>({average.toFixed(1)} / 5 · {reviews.length} lượt)</Text>}</Text>
      {isLoading ? (
        <Loading label="Đang tải đánh giá…" />
      ) : isError ? (
        <ErrorBox message={errorText(error)} onRetry={refetch} />
      ) : reviews.length === 0 ? (
        <Text style={styles.sub}>Chưa có đánh giá nào.</Text>
      ) : (
        reviews.map((r) => (
          <View key={r.id} style={styles.review} testID={`review-${r.id}`}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewUser}>{r.user}  <Stars value={r.rating} size={13} /></Text>
              <Text style={styles.desc}>{r.comment}</Text>
            </View>
            <TouchableOpacity onPress={() => removeReview({ id: r.id, bookId: id })} testID={`del-review-${r.id}`}><Text>🗑️</Text></TouchableOpacity>
          </View>
        ))
      )}

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Tên của bạn" value={user} onChangeText={setUser} testID="rv-user" />
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setStars(n)} testID={`star-${n}`}>
              <Text style={{ fontSize: 26, color: n <= stars ? "#F5A623" : "#C9CED9" }}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput style={styles.input} placeholder="Nhận xét" value={comment} onChangeText={setComment} testID="rv-comment" />
        <TouchableOpacity style={[styles.btn, (!user.trim() || !comment.trim() || sending) && { opacity: 0.4 }]} disabled={!user.trim() || !comment.trim() || sending} onPress={submitReview} testID="rv-send">
          <Text style={styles.btnText}>{sending ? "Đang gửi…" : "Gửi đánh giá"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box: { padding: 16, gap: 8, paddingBottom: 40 },
  cover: { width: "100%", aspectRatio: 1.4, borderRadius: 14, backgroundColor: colors.indigo },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 6 },
  sub: { color: colors.muted, fontSize: 13, fontWeight: "400" },
  price: { color: colors.indigo, fontWeight: "800", fontSize: 17 },
  desc: { color: colors.text, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 10, marginVertical: 6 },
  btn: { flex: 1, backgroundColor: colors.indigo, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  btnDanger: { backgroundColor: colors.red },
  btnSale: { backgroundColor: colors.cyan },
  btnText: { color: "#fff", fontWeight: "800" },
  h2: { fontSize: 18, fontWeight: "800", color: colors.navy, marginTop: 12 },
  review: { flexDirection: "row", backgroundColor: "#fff", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.line, gap: 8, alignItems: "center" },
  reviewUser: { fontWeight: "700", color: colors.text },
  form: { gap: 8, marginTop: 8, backgroundColor: "#fff", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.line },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: colors.bg },
  starRow: { flexDirection: "row", gap: 4 },
});

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList, TabParamList } from "../navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchBooks, selectBooks, selectBooksError, selectBooksStatus, selectCategories, selectFilteredBooks, selectInStockCount } from "../store/booksSlice";
import { useDebounce } from "../hooks/useDebounce";
import BookCard from "../components/BookCard";
import { ErrorBox, Loading } from "../components/StateView";
import { colors } from "../theme";

type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, "Home">, NativeStackScreenProps<RootStackParamList>>;

export function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectBooksStatus);
  const error = useAppSelector(selectBooksError);
  const categories = useAppSelector(selectCategories);

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [isTile, setIsTile] = useState(false); // Switch "Dạng lưới"
  const [refreshing, setRefreshing] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false); // BT10.C1

  // BT10.3: chờ ngừng gõ 400 ms rồi mới lọc
  const debounced = useDebounce(keyword, 400);
  // selector tạo theo tham số → bọc useMemo để không tạo lại mỗi lần render
  const filteredSelector = useMemo(
    () => selectFilteredBooks(debounced, category, onlyInStock),
    [debounced, category, onlyInStock]
  );
  const books = useAppSelector(filteredSelector);

  // Câu 5: đếm sách còn hàng bằng createSelector
  const allBooks = useAppSelector(selectBooks);
  const inStock = useAppSelector(selectInStockCount);

  // BT10.5c: gọi API lần đầu đúng một lần
  useEffect(() => {
    if (status === "idle") dispatch(fetchBooks());
  }, [status, dispatch]);

  // BT10.2b: kéo để làm mới → gọi lại GET, giữ nguyên chế độ cột
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchBooks());
    setRefreshing(false);
  }, [dispatch]);

  const onSelect = useCallback((id: string) => navigation.navigate("Detail", { id }), [navigation]);

  // BT10.2a: 2 cột khi bật lưới
  const numColumns = isTile ? 2 : 1;
  const firstLoad = (status === "loading" || status === "idle") && books.length === 0;
  const failed = status === "failed" && books.length === 0;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>📚 BookStore</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("AddBook")} testID="open-add">
            <Text style={styles.addText}>＋ Thêm</Text>
          </TouchableOpacity>
        </View>
        <TextInput style={styles.search} placeholder="Tìm theo tên sách hoặc tác giả…" placeholderTextColor="#9AA3B8" value={keyword} onChangeText={setKeyword} />
        <View style={styles.switchRow}>
          <Text style={styles.countText} testID="instock-count">Còn {inStock}/{allBooks.length} cuốn</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.switchLabel}>Chỉ còn hàng</Text>
          <Switch value={onlyInStock} onValueChange={setOnlyInStock} testID="instock-switch" />
          <Text style={styles.switchLabel}>Dạng lưới</Text>
          <Switch value={isTile} onValueChange={setIsTile} testID="grid-switch" />
        </View>
      </View>

      {/* Chip danh mục */}
      <View style={styles.chips}>
        {[null, ...categories].map((c) => (
          <TouchableOpacity key={c ?? "all"} style={[styles.chip, category === c && styles.chipOn]} onPress={() => setCategory(c)} testID={`chip-${c ?? "all"}`}>
            <Text style={[styles.chipText, category === c && styles.chipTextOn]}>{c ?? "Tất cả"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {firstLoad ? (
        <Loading label="Đang tải sách…" />
      ) : failed ? (
        <ErrorBox message={error ?? "Đã có lỗi xảy ra."} onRetry={() => dispatch(fetchBooks())} />
      ) : (
        <FlatList
          key={String(numColumns)} // đổi số cột bắt buộc đổi key
          data={books}
          keyExtractor={(b) => b.id}
          numColumns={numColumns}
          columnWrapperStyle={isTile ? styles.columnWrapper : undefined}
          renderItem={({ item }) => <BookCard book={item} layout={isTile ? "tile" : "row"} onSelect={onSelect} />}
          contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy sách phù hợp.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.navy, paddingHorizontal: 14, paddingBottom: 12, paddingTop: 6, gap: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  addBtn: { backgroundColor: colors.cyan, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addText: { color: colors.navy, fontWeight: "800" },
  search: { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  switchLabel: { color: "#D5DDF7", fontWeight: "600" },
  countText: { color: colors.cyan, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 14, paddingTop: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  chipText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  chipTextOn: { color: "#fff" },
  columnWrapper: { justifyContent: "space-between" }, // tạo khoảng cách giữa 2 cột
  empty: { textAlign: "center", color: colors.muted, marginTop: 30 },
});

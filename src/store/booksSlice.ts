import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../api/config";
import type { Book, NewBook } from "../types";
import { normalize } from "../utils/text";
import type { RootState } from "./index";

const http = axios.create({ baseURL: API_URL, timeout: 8000 });
const NETWORK_ERROR = "Không kết nối được máy chủ. Kiểm tra json-server đã chạy chưa.";
type Cfg = { rejectValue: string };

// ───── Thunk: mỗi thao tác gọi API = 1 createAsyncThunk ─────
export const fetchBooks = createAsyncThunk<Book[], void, Cfg>("books/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await http.get<Book[]>("/books"); // BT10.5a
    return res.data;
  } catch {
    return rejectWithValue(NETWORK_ERROR);
  }
});

export const addBook = createAsyncThunk<Book, NewBook, Cfg>("books/add", async (body, { rejectWithValue }) => {
  try {
    const res = await http.post<Book>("/books", body);
    return res.data;
  } catch {
    return rejectWithValue("Không thêm được sách.");
  }
});

export const deleteBook = createAsyncThunk<string, string, Cfg>("books/delete", async (id, { rejectWithValue }) => {
  try {
    await http.delete(`/books/${id}`);
    return id;
  } catch {
    return rejectWithValue("Không xoá được sách.");
  }
});

// BT10.C2: PATCH /books/:id, json-server trả về sách đã sửa
export const updateBook = createAsyncThunk<Book, { id: string; changes: Partial<NewBook> }, Cfg>(
  "books/update",
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const res = await http.patch<Book>(`/books/${id}`, changes);
      return res.data;
    } catch {
      return rejectWithValue("Không sửa được sách.");
    }
  }
);

// ───── Slice ─────
interface BooksState {
  items: Book[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
const initialState: BooksState = { items: [], status: "idle", error: null };

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // BT10.5b: ba giai đoạn của fetchBooks
      .addCase(fetchBooks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Đã có lỗi xảy ra.";
      })
      // BT10.6: cập nhật danh sách sau khi API thành công
      .addCase(addBook.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      })
      // BT10.C2: thay đúng phần tử có cùng id
      .addCase(updateBook.fulfilled, (state, action) => {
        const i = state.items.findIndex((b) => b.id === action.payload.id);
        if (i >= 0) state.items[i] = action.payload;
      });
  },
});
export default booksSlice.reducer;

// ───── Selector ─────
export const selectBooks = (s: RootState) => s.books.items;
export const selectBooksStatus = (s: RootState) => s.books.status;
export const selectBooksError = (s: RootState) => s.books.error;
export const selectBookById = (id: string) => (s: RootState) => s.books.items.find((b) => b.id === id);

// Danh mục suy ra từ dữ liệu sách (không cần resource riêng)
export const selectCategories = createSelector(selectBooks, (books) => Array.from(new Set(books.map((b) => b.category))));

// Lọc kết hợp: từ khoá (tên/tác giả, không dấu) + danh mục + chỉ còn hàng (BT10.C1)
export const selectFilteredBooks = (keyword: string, category: string | null, onlyInStock = false) =>
  createSelector(selectBooks, (books) => {
    const k = normalize(keyword);
    return books.filter(
      (b) =>
        (category === null || b.category === category) &&
        (!onlyInStock || b.inStock) &&
        (k === "" || normalize(b.title).includes(k) || normalize(b.author).includes(k))
    );
  });

// Câu 5: đếm số sách còn hàng, chỉ tính lại khi danh sách sách đổi
export const selectInStockCount = createSelector(selectBooks, (books) => books.filter((b) => b.inStock).length);

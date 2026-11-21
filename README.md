# BookStore · Buổi 10 (bản Starter, làm bài)

Bản có sẵn khung, một số chỗ để trống cho bạn làm. Bài hướng dẫn: BaiThucHanh_Buoi10_BookStore_ReduxToolkit_BatDongBo.docx.

| Nội dung | Làm ở đâu | Bài |
|---|---|---|
| `SafeAreaProvider`, `SafeAreaView`, header | `App.tsx`, `screens/HomeScreen.tsx` | 10.1 |
| Component `BookCard` (props, kiểu, `TouchableOpacity`, `React.memo`, `export default`) | `components/BookCard.tsx` | 10.1 |
| Một component hai bố cục `row` / `tile` (style ghép theo mảng) | `components/BookCard.tsx` | 10.1 |
| `FlatList` + `keyExtractor` + `ActivityIndicator` | `screens/HomeScreen.tsx`, `components/StateView.tsx` | 10.2, 10.5 |
| Switch "Dạng lưới": `numColumns`, `key`, `columnWrapperStyle` | `screens/HomeScreen.tsx` | 10.2 |
| Kéo để làm mới `RefreshControl` | `screens/HomeScreen.tsx` | 10.2 |
| Tìm kiếm (debounce, không dấu), lọc theo thể loại | `hooks/useDebounce.ts`, `utils/text.ts`, `store/booksSlice.ts` | 10.3 |
| Redux Toolkit: store, slice (giỏ hàng), hook có kiểu | `store/index.ts`, `store/hooks.ts`, `store/cartSlice.ts` | 10.4 |
| `createAsyncThunk`: tải danh sách sách | `store/booksSlice.ts`, `screens/HomeScreen.tsx` | 10.5 |
| `createAsyncThunk`: thêm, xoá sách (POST, DELETE) | `store/booksSlice.ts`, `screens/AddBookScreen.tsx` | 10.6 |
| RTK Query: đánh giá sách (GET, POST, DELETE + tag) | `store/reviewsApi.ts`, `screens/DetailScreen.tsx` | 10.7 |
| JSON DB cục bộ (json-server) | `db.json`, `src/api/config.ts` | tất cả |

## Chạy
```bash
npm install
npm run api         # Terminal 1: json-server tại http://localhost:3000 (dữ liệu trong db.json)
npx expo start      # Terminal 2: quét QR bằng Expo Go; nhấn w để mở bản web
npm run typecheck   # tsc --noEmit
```
- Điện thoại thật: máy tính và điện thoại cùng Wi-Fi. Nếu không gọi được API, chạy
  `EXPO_PUBLIC_API_URL=http://<IP-máy-tính>:3000 npx expo start -c`.
- Android emulator dùng `10.0.2.2` thay cho `localhost` (đã xử lý trong `src/api/config.ts`).
- json-server ghi thẳng vào `db.json`. Muốn trả dữ liệu về ban đầu: chép đè `db.seed.json` lên `db.json`.
- Ảnh bìa lấy từ mạng (picsum.photos). Không có mạng thì ô ảnh hiện nền xanh, app vẫn chạy.

## Cài thư viện từ đầu (nếu tự tạo project)
```bash
npx create-expo-app@latest BookStore --template blank-typescript
cd BookStore
npm install @reduxjs/toolkit react-redux axios
npx expo install react-native-safe-area-context react-native-screens @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install -D json-server@0.17.4
```

## Cấu trúc
```
App.tsx                 Provider (Redux) + SafeAreaProvider + NavigationContainer
db.json                 books ×10, reviews ×6 cho json-server
docs/                   UI.md và ảnh giao diện đích
src/
├─ types.ts             Book, Review, CartItem, formatPrice
├─ api/config.ts        địa chỉ API
├─ hooks/useDebounce.ts
├─ utils/               text.ts (bỏ dấu), confirm.ts (hộp xác nhận, chạy cả web)
├─ store/               index, hooks, booksSlice (thunk), cartSlice, reviewsApi (RTK Query)
├─ components/          BookCard, StateView, Stars
├─ navigation/index.tsx Stack + Tab
└─ screens/             Home, Detail, AddBook, Cart
```

## Việc cần làm (bản Starter)
Tìm bằng `Ctrl+Shift+F`, gõ `TODO BT10`. Starter chạy được ngay nhưng thiếu các phần sau, nên chưa có tìm kiếm, giỏ hàng, danh sách và đánh giá hoạt động đúng.

| Mã | File | Việc |
|---|---|---|
| BT10.1a, 10.1b | `components/BookCard.tsx` | Ghép style theo `layout` (hai kiểu row / tile) |
| BT10.2a | `screens/HomeScreen.tsx` | `numColumns`, `key`, `columnWrapperStyle` |
| BT10.2b | `screens/HomeScreen.tsx` | `onRefresh` cho `RefreshControl` |
| BT10.3 | `screens/HomeScreen.tsx` | `useDebounce` và `selectFilteredBooks` |
| BT10.4a, 10.4b | `store/cartSlice.ts` | Reducer `addToCart`, `decrease` |
| BT10.5a | `store/booksSlice.ts` | Thân thunk `fetchBooks` |
| BT10.5b | `store/booksSlice.ts` | `extraReducers` cho pending / fulfilled / rejected |
| BT10.5c | `screens/HomeScreen.tsx` | `dispatch(fetchBooks())` khi `status === "idle"` |
| BT10.6 | `store/booksSlice.ts` | `addBook.fulfilled`, `deleteBook.fulfilled` |
| BT10.7a | `store/reviewsApi.ts` | `providesTags`, `invalidatesTags` |
| BT10.7b | `store/index.ts` | Thêm reducer và middleware của RTK Query |

Đáp án nằm ở bản Full.

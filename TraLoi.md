# Buổi 10 — Câu hỏi bổ sung

**Họ tên:** Đàm Thái An · **MSSV:** 23710201

## Câu 1. Key của FlatList
FlatList không hỗ trợ đổi `numColumns` khi đang chạy, vì cách chia hàng của nó được dựng theo số cột ban đầu. Đổi `key` thì React coi đó là một component khác: huỷ FlatList cũ và dựng FlatList mới với `numColumns` mới. Nếu bỏ `key={String(numColumns)}` thì vừa bật Switch là màn hình báo lỗi đỏ “Changing numColumns on the fly is not supported”.

## Câu 2. Thunk hay reducer thường
Dựa vào việc thao tác có phải chờ bên ngoài (máy chủ) hay không. Giỏ hàng chỉ đổi state ngay trong app nên dùng reducer thường. Danh sách sách phải gọi GET/POST/DELETE, có ba giai đoạn pending/fulfilled/rejected nên dùng `createAsyncThunk` (hoặc RTK Query). “Đánh dấu yêu thích” chỉ đổi state trong app thì dùng reducer thường; nếu phải lưu lên server thì mới cần thunk.

## Câu 3. unwrap
`dispatch(thunk)` luôn trả về một Promise thành công, kể cả khi thunk bị rejected (giá trị là action rejected). Bỏ `.unwrap()` thì `catch` không bao giờ chạy: khi json-server tắt, app vẫn `goBack()` như đã thêm thành công, không hiện dòng lỗi đỏ, trong khi sách không được lưu và cũng không xuất hiện ở Home.

## Câu 4. Tag
Với `{ type: "Reviews", id: body.bookId }`, gửi đánh giá cho sách số 1 chỉ làm hết hạn cache đánh giá của sách 1, nên chỉ danh sách đó được tải lại. Nếu chỉ ghi `"Reviews"` thì mọi danh sách đánh giá đang có trong cache đều bị tải lại, tốn thêm lần gọi không cần thiết. Bỏ hẳn `invalidatesTags` thì dữ liệu vẫn lên server nhưng cache cũ được giữ, màn hình không đổi cho tới khi thoát ra vào lại.

## Câu 5. Code bổ sung
```ts
// src/store/booksSlice.ts
export const selectInStockCount = createSelector(selectBooks, (books) => books.filter((b) => b.inStock).length);
```
```tsx
// src/screens/HomeScreen.tsx
const allBooks = useAppSelector(selectBooks);
const inStock = useAppSelector(selectInStockCount);
...
<Text style={styles.countText}>Còn {inStock}/{allBooks.length} cuốn</Text>
```
`createSelector` ghi nhớ kết quả nên chỉ tính lại khi danh sách sách đổi. Ảnh chụp kết quả nằm trong file báo cáo.

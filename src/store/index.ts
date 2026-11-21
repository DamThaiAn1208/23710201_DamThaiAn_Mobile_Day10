import { configureStore } from "@reduxjs/toolkit";
import booksReducer from "./booksSlice";
import cartReducer from "./cartSlice";
import { reviewsApi } from "./reviewsApi";

export const store = configureStore({
  reducer: {
    books: booksReducer, // thunk (bất đồng bộ)
    cart: cartReducer, // reducer thường (đồng bộ)
    [reviewsApi.reducerPath]: reviewsApi.reducer, // BT10.7b: cache của RTK Query
  },
  // BT10.7b: middleware lo việc gọi API và tải lại theo tag
  middleware: (getDefault) => getDefault().concat(reviewsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

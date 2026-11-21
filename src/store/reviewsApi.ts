import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/config";
import type { NewReview, Review } from "../types";

// RTK Query cho phần Đánh giá: khai báo endpoint, hook được sinh tự động
export const reviewsApi = createApi({
  reducerPath: "reviewsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["Reviews"],
  endpoints: (builder) => ({
    // GET /reviews?bookId=1 — mỗi sách một "nhãn" riêng
    getReviews: builder.query<Review[], string>({
      query: (bookId) => `/reviews?bookId=${bookId}`,
      providesTags: (_result, _err, bookId) => [{ type: "Reviews", id: bookId }], // BT10.7a
    }),
    addReview: builder.mutation<Review, NewReview>({
      query: (body) => ({ url: "/reviews", method: "POST", body }),
      // BT10.7a: chỉ làm mới danh sách đánh giá của ĐÚNG cuốn sách đó
      invalidatesTags: (_result, _err, body) => [{ type: "Reviews", id: body.bookId }],
    }),
    deleteReview: builder.mutation<unknown, { id: string; bookId: string }>({
      query: ({ id }) => ({ url: `/reviews/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _err, arg) => [{ type: "Reviews", id: arg.bookId }],
    }),
  }),
});

export const { useGetReviewsQuery, useAddReviewMutation, useDeleteReviewMutation } = reviewsApi;

export function errorText(error: unknown): string {
  const e = error as { status?: number | string } | undefined;
  if (e?.status === "FETCH_ERROR") return "Không kết nối được máy chủ. Kiểm tra json-server đã chạy chưa.";
  return "Đã có lỗi xảy ra.";
}

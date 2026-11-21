export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  rating: number; // 0–10
  category: string;
  inStock: boolean;
  description: string;
  cover: string; // URL ảnh bìa
}
export type NewBook = Omit<Book, "id">;

export interface Review {
  id: string;
  bookId: string;
  user: string;
  rating: number; // 1–5
  comment: string;
}
export type NewReview = Omit<Review, "id">;

export interface CartItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
}

export const formatPrice = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";

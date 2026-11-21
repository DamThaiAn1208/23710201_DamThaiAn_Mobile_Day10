import { useEffect, useState } from "react";

// Chỉ cập nhật giá trị sau khi người dùng ngừng gõ `delay` ms
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t); // gõ tiếp → huỷ hẹn giờ cũ
  }, [value, delay]);
  return debounced;
}

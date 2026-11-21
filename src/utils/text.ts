// Bỏ dấu tiếng Việt để "nha gia" tìm ra "Nhà Giả Kim"
export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

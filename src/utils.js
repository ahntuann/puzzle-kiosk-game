// utils.js

// Tạo bản sao mới của mảng trước khi xáo trộn
export const shuffleArray = (array) => {
  const newArr = [...array]; // <--- TẠO BẢN SAO MỚI Ở ĐÂY
  let current = newArr.length,
    random;

  // Thuật toán Fisher-Yates shuffle
  while (current !== 0) {
    random = Math.floor(Math.random() * current);
    current--;
    // Hoán đổi vị trí trong bản sao mới
    [newArr[current], newArr[random]] = [newArr[random], newArr[current]];
  }
  return newArr; // Trả về mảng mới đã xáo trộn
};

export const KIOSK_WIDTH = 1080;
export const KIOSK_HEIGHT = 1920;

// CẤU HÌNH CẮT ẢNH GỐC (BOARD): 2 Cột x 3 Hàng (Ảnh dọc)
export const GRID_COLS = 2;
export const GRID_ROWS = 3;

export const SNAP_TOLERANCE = 150;
export const BOARD_MAX_WIDTH = 900;
export const BOARD_MAX_HEIGHT = 1000;

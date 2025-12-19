// MainMenu.jsx
import React from "react";

export default function MainMenu({ onSelectGame, audioEnabled }) {
  const handleSelect = (mode) => {
    if (audioEnabled) {
      const audio = new Audio("/sounds/click.mp3");
      audio.volume = 0.5;
      audio.play().catch((e) => {});
    }
    onSelectGame(mode);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden", // Cắt hết phần thừa
        margin: 0,
        padding: 0,
      }}
    >
      {/* 1. ẢNH NỀN FULL MÀN HÌNH - Ép dãn ra cho vừa khít */}
      <img
        src="/images/menu_full.jpg" // <-- NHỚ ĐỔI TÊN FILE ẢNH CỦA BẠN
        alt="Menu Background"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "fill", // Ép ảnh dãn ra lấp đầy 100% màn hình, không giữ tỷ lệ gốc (để khớp mọi màn)
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />

      {/* 2. VÙNG BẤM TÀNG HÌNH CHO GAME 1 (Ở trên) */}
      <div
        onClick={() => handleSelect("puzzle")}
        style={{
          position: "absolute",
          zIndex: 10,
          // Căn chỉnh vị trí bằng % để màn nào cũng đúng chỗ đó
          top: "32%", // Cách đỉnh khoảng 32%
          left: "10%", // Cách trái 10%
          width: "80%", // Rộng 80% màn hình
          height: "22%", // Cao 22% màn hình
          // background: "rgba(255, 0, 0, 0.3)", // <--- MỞ DÒNG NÀY ĐỂ CANH VỊ TRÍ (Màu đỏ mờ), canh xong thì đóng lại
          cursor: "pointer",
        }}
      />

      {/* 3. VÙNG BẤM TÀNG HÌNH CHO GAME 2 (Ở dưới) */}
      <div
        onClick={() => handleSelect("sequence")}
        style={{
          position: "absolute",
          zIndex: 10,
          // Vị trí cho nút dưới
          top: "56%",
          left: "10%",
          width: "80%",
          height: "22%",
          // background: "rgba(0, 0, 255, 0.3)", // <--- MỞ DÒNG NÀY ĐỂ CANH VỊ TRÍ (Màu xanh mờ)
          cursor: "pointer",
        }}
      />
    </div>
  );
}

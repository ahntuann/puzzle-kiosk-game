// src/components/WinScreen.jsx
import React from "react";

export default function WinScreen({ onReset }) {
  return (
    <div
      style={{
        position: "fixed", // Dùng fixed để đè lên mọi thứ khác
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999, // Đảm bảo nó nổi lên trên cùng
        backgroundColor: "#000",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* 1. ẢNH NỀN FULL (Là ảnh chụp màn hình Win của bạn) */}
      <img
        src="/images/win_full.jpg" // <-- NHỚ ĐỔI TÊN FILE
        alt="Big Win"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "fill", // Ép dãn ảnh ra cho vừa khít màn hình 1080x1920
          display: "block",
        }}
      />

      {/* 2. NÚT BẤM TÀNG HÌNH (Đè lên vị trí nút CHƠI LẠI) */}
      <div
        onClick={onReset}
        style={{
          position: "absolute",
          zIndex: 10,
          // Canh vị trí dựa trên ảnh bạn gửi:
          top: "84%", // Nút nằm gần đáy
          left: "35%", // Căn giữa (khoảng 30% từ trái qua)
          width: "30%", // Chiều rộng nút khoảng 30% màn hình
          height: "8%", // Chiều cao nút
          cursor: "pointer",
          // background: "rgba(255, 0, 0, 0.3)", // <-- MỞ DÒNG NÀY ĐỂ CANH VỊ TRÍ, xong thì đóng lại
        }}
      />
    </div>
  );
}

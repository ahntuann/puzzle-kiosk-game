// MainMenu.jsx
import React from "react";
import "./styles/effects.css";

export default function MainMenu({ onSelectGame, audioEnabled }) {
  const handleSelect = (mode) => {
    if (audioEnabled) {
      // Âm thanh click nhẹ nhàng hơn
      const audio = new Audio("/sounds/click.mp3");
      audio.volume = 0.5;
      audio.play().catch((e) => {});
    }
    onSelectGame(mode);
  };

  return (
    <div className="upload-screen">
      {/* Giữ lại khung chứa nội dung */}
      <div
        className="upload-content menu-content"
        style={{
          maxWidth: "700px", // Mở rộng xíu để nút to hơn
          background: "rgba(10, 20, 40, 0.6)", // Nền mờ hơn cho thoáng
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="title-container" style={{ marginBottom: "30px" }}>
          <h1 className="main-title glitch" data-text="EMMIÉ KIOSK">
            Vũ trụ trò chơi
          </h1>
          <p className="subtitle">Chọn thử thách để nhận quà</p>
        </div>

        {/* Grid chứa 2 nút vuông */}
        <div className="game-button-grid">
          {/* NÚT 1: GAME PUZZLE (Màu Xanh Cyan sáng) */}
          <div
            className="kiosk-btn btn-cyan"
            onClick={() => handleSelect("puzzle")}
          >
            <h3 className="btn-subtitle">GAME 01</h3>
            <h2 className="btn-title">
              HÀNH TINH
              <br />
              THIẾT BỊ LÀM ĐẸP
            </h2>
          </div>

          {/* NÚT 2: GAME SEQUENCE (Màu Hồng Tím sáng) */}
          <div
            className="kiosk-btn btn-pink"
            onClick={() => handleSelect("sequence")}
          >
            <h3 className="btn-subtitle">GAME 02</h3>
            <h2 className="btn-title">
              XẾP ROUTINE
              <br />
              CHUẨN GLOW
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

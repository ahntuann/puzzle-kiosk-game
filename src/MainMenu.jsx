// MainMenu.jsx
import React from "react";
import "./styles/effects.css";

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
    // Đảm bảo container cha có position relative hoặc fixed để làm mốc
    <div
      className="upload-screen main-menu-bg"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Khung chứa nội dung chính (Buttons, Title) */}
      <div
        className="upload-content menu-content"
        style={{
          maxWidth: "700px",
          background: "rgba(10, 20, 40, 0.6)",
          border: "1px solid rgba(255,255,255,0.1)",
          // Thêm z-index để đảm bảo nội dung luôn nổi trên ảnh trang trí nếu có đè nhau
          position: "relative",
          zIndex: 10,
          // marginBottom: "150px", // Đẩy nội dung lên trên một chút để nhường chỗ cho ảnh đáy
        }}
      >
        <div className="title-container" style={{ marginBottom: "30px" }}>
          <h1 className="main-title glitch" data-text="EMMIÉ KIOSK">
            Vũ trụ trò chơi
          </h1>
          <p className="subtitle">Chọn thử thách để nhận quà</p>
        </div>

        <div className="game-button-grid">
          {/* NÚT 1 */}
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

          {/* NÚT 2 */}
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

      {/* --- PHẦN ẢNH TRANG TRÍ DƯỚI ĐÁY (MỚI THÊM) --- */}

      {/* 1. Ảnh sóng trừu tượng (Nằm lớp dưới) */}
      {/* <img
        src="/images/decoration_wave.png" // <-- HÃY ĐỔI LẠI ĐÚNG ĐƯỜNG DẪN FILE CỦA BẠN
        alt=""
        className="bottom-decoration-wave"
      /> */}

      {/* 2. Ảnh chữ Skinverse (Nằm lớp trên) */}
      <img
        src="/images/skinverse_text.png" // <-- HÃY ĐỔI LẠI ĐÚNG ĐƯỜNG DẪN FILE CỦA BẠN
        alt="The New Skinverse"
        className="bottom-skinverse-text"
      />
    </div>
  );
}

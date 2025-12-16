// MainMenu.jsx
import React from "react";
import "./styles/effects.css";

export default function MainMenu({ onSelectGame, audioEnabled }) {
  const handleSelect = (mode) => {
    if (audioEnabled) {
      const audio = new Audio("/sounds/click.mp3");
      audio.volume = 0.3;
      audio.play().catch((e) => {});
    }
    onSelectGame(mode);
  };

  return (
    <div className="upload-screen">
      <div className="cyber-grid"></div>
      <div className="floating-particles"></div>

      <div
        className="upload-content menu-content"
        style={{ maxWidth: "600px" }}
      >
        <div className="title-container">
          <h1 className="main-title glitch" data-text="EMMIÉ KIOSK">
            EMMIÉ KIOSK
          </h1>
          <p className="subtitle">Chọn thử thách của bạn</p>
        </div>

        <div
          className="game-selection-grid"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            marginTop: "40px",
          }}
        >
          {/* Nút chọn Game 1 */}
          <div
            className="gallery-item"
            onClick={() => handleSelect("puzzle")}
            style={{ width: "100%" }}
          >
            <div
              className="img-wrapper"
              style={{ aspectRatio: "3/1", border: "2px solid #00d4ff" }}
            >
              {/* Thay ảnh bìa game 1 ở đây */}
              <img src="/images/cover_game1.jpg" alt="Puzzle Game" />
              <div className="overlay">
                <span className="start-btn">DEVICE VERSE</span>
              </div>
            </div>
            <div className="item-label">GAME 01: GHÉP HÌNH SÁNG TẠO</div>
          </div>

          {/* Nút chọn Game 2 */}
          <div
            className="gallery-item"
            onClick={() => handleSelect("sequence")}
            style={{ width: "100%" }}
          >
            <div
              className="img-wrapper"
              style={{ aspectRatio: "3/1", border: "2px solid #ff00d4" }}
            >
              {/* Thay ảnh bìa game 2 ở đây */}
              <img src="/images/cover_game2.jpg" alt="Sequence Game" />
              <div className="overlay">
                <span
                  className="start-btn"
                  style={{
                    borderColor: "#ff00d4",
                    boxShadow: "0 0 15px #ff00d4",
                  }}
                >
                  SKIN VERSE
                </span>
              </div>
            </div>
            <div className="item-label" style={{ color: "#ff99eb" }}>
              GAME 02: QUY TRÌNH CHUẨN
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/WinScreen.jsx
import React from "react";

export default function WinScreen({ onReset }) {
  return (
    <div className="win-screen-overlay">
      <div className="win-content-container">
        <h1 className="glitch big-win-title" data-text="BIG WIN!">
          BIG WIN!
        </h1>

        <div className="win-subtitle">
          Bạn đã nhận được 01
          <br />
          <span className="special-prize-text">BAO LÌ XÌ!</span>
        </div>

        {/* --- THÊM ẢNH BAO LÌ XÌ TẠI ĐÂY --- */}
        <img
          src="/images/lixi.png" // Nhớ thay đúng tên file ảnh của bạn
          alt="Bao Lì Xì"
          className="prize-image"
        />
        {/* ---------------------------------- */}

        <button
          onClick={onReset}
          className="btn-upload"
          // Giảm marginTop từ 120 xuống 40 hoặc 50 cho cân đối
          style={{ marginTop: 50, transform: "scale(1.3)" }}
        >
          CHƠI LẠI
        </button>
      </div>
    </div>
  );
}

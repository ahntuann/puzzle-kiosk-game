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
          {/* Phần chữ đặc biệt */}
          <span className="special-prize-text">BAO LÌ XÌ!</span>
        </div>

        <button
          onClick={onReset}
          className="btn-upload"
          style={{ marginTop: 120, transform: "scale(1.3)" }}
        >
          CHƠI LẠI
        </button>
      </div>
    </div>
  );
}

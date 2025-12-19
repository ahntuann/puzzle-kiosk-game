// App.jsx
import { useState, useEffect } from "react";
import MainMenu from "./MainMenu";
import PuzzleFlow from "./PuzzleFlow";
import SequenceGame from "./SequenceGame";
import "./styles/effects.css";

// Icon đơn giản (SVG) cho nút phóng to/thu nhỏ
const IconMaximize = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);
const IconMinimize = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
  </svg>
);

export default function App() {
  const [currentMode, setCurrentMode] = useState("menu");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false); // State theo dõi trạng thái

  // Kích hoạt âm thanh
  useEffect(() => {
    const enableAudio = () => {
      setAudioEnabled(true);
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };
    document.addEventListener("click", enableAudio);
    document.addEventListener("touchstart", enableAudio);
    return () => {
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };
  }, []);

  // --- HÀM XỬ LÝ FULLSCREEN ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error(`Lỗi khi bật full screen: ${err.message}`);
        });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Lắng nghe sự kiện (phòng trường hợp người dùng bấm ESC bàn phím)
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const handleBackToMenu = () => {
    setCurrentMode("menu");
  };

  return (
    <>
      <img
        src="/images/logo1.png"
        alt="Logo"
        className={`game-logo ${
          currentMode === "menu" ? "game-logo-main-menu" : ""
        }`}
      />

      {/* --- NÚT CHUYỂN CHẾ ĐỘ FULLSCREEN (Luôn nổi trên cùng) --- */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px", // Góc trên bên phả
          zIndex: 9999, // Luôn nằm trên cùng
          background: "rgba(0, 0, 0, 0.5)", // Bán trong suốt
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(5px)",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        }}
      >
        {isFullscreen ? <IconMinimize /> : <IconMaximize />}
      </button>
      {/* -------------------------------------------------------- */}

      {currentMode === "menu" && (
        <MainMenu
          onSelectGame={(mode) => setCurrentMode(mode)}
          audioEnabled={audioEnabled}
        />
      )}

      {currentMode === "puzzle" && (
        <PuzzleFlow onBack={handleBackToMenu} audioEnabled={audioEnabled} />
      )}

      {currentMode === "sequence" && (
        <SequenceGame onBack={handleBackToMenu} audioEnabled={audioEnabled} />
      )}
    </>
  );
}

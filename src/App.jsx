// App.jsx
import { useState, useEffect } from "react";
import MainMenu from "./MainMenu";
import PuzzleFlow from "./PuzzleFlow";
import SequenceGame from "./SequenceGame";
import "./styles/effects.css";

export default function App() {
  // state: 'menu' | 'puzzle' | 'sequence'
  const [currentMode, setCurrentMode] = useState("menu");
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Kích hoạt âm thanh lần đầu chạm màn hình (giữ nguyên logic cũ)
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

  const handleBackToMenu = () => {
    setCurrentMode("menu");
  };

  return (
    <>
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

// PuzzleFlow.jsx
import { useState } from "react";
import JigsawGame from "./JigsawGame"; // File JigsawGame cũ của bạn
import "./styles/effects.css";

const GALLERY_IMAGES = [
  "/images/1.png",
  "/images/2.png",
  "/images/3.png",
  "/images/4.png",
  "/images/5.png",
  "/images/6.png",
];

export default function PuzzleFlow({ onBack, audioEnabled }) {
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectImage = (imgSrc) => {
    setIsLoading(true);
    if (audioEnabled) {
      const audio = new Audio("/sounds/click.mp3");
      audio.play().catch(() => {});
    }
    setTimeout(() => {
      setSelected(imgSrc);
      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      {!selected ? (
        <div className="upload-screen">
          <button
            onClick={onBack}
            className="btn-upload"
            style={{ position: "absolute", top: 40, left: 40, zIndex: 100 }}
          >
            ⬅ MENU
          </button>
          {/* <div className="cyber-grid"></div> */}

          <div className="upload-content menu-content">
            <div className="title-container">
              <h1 className="main-title glitch" data-text="CHỌN MẪU GHÉP">
                Chọn hành tinh "máy"<div></div>bạn muốn khám phá
              </h1>
            </div>
            <div className="gallery-grid">
              {GALLERY_IMAGES.map((img, index) => (
                <div
                  key={index}
                  className="gallery-item"
                  onClick={() => selectImage(img)}
                >
                  <div className="img-wrapper">
                    <img src={img} alt={`Puzzle ${index + 1}`} />
                    <div className="overlay">
                      <span className="start-btn">START</span>
                    </div>
                  </div>
                  <div className="item-label">MODULE {index + 1}</div>
                </div>
              ))}
            </div>
          </div>
          {isLoading && <div className="loading-overlay">...Loading...</div>}
        </div>
      ) : (
        <JigsawGame
          userImage={selected}
          onReset={() => setSelected(null)}
          // Cần sửa JigsawGame một chút để nhận onBack về Menu nếu muốn thoát hẳn
        />
      )}
    </>
  );
}

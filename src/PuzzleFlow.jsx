// PuzzleFlow.jsx
import { useState } from "react";
import JigsawGame from "./JigsawGame";
// import "./styles/effects.css"; // Có thể bỏ hoặc giữ, nhưng ta sẽ style trực tiếp inline để override hết

const GALLERY_IMAGES = [
  "/images/1.png",
  "/images/2.png",
  "/images/3.png",
  "/images/4.png",
  "/images/5.png",
  "/images/6.png",
];

// Cấu hình tọa độ các vùng bấm (Hitboxes) dựa trên ảnh mẫu
// Đơn vị là % để tự co giãn theo màn hình
const HITBOX_CONFIG = [
  // Hàng trên (Module 1, 2, 3)
  { index: 0, top: "28%", left: "5%" },
  { index: 1, top: "28%", left: "36%" },
  { index: 2, top: "28%", left: "67%" },
  // Hàng dưới (Module 4, 5, 6)
  { index: 3, top: "57%", left: "5%" },
  { index: 4, top: "57%", left: "36%" },
  { index: 5, top: "57%", left: "67%" },
];

export default function PuzzleFlow({ onBack, audioEnabled }) {
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectImage = (imgSrc) => {
    if (isLoading) return;
    setIsLoading(true);

    if (audioEnabled) {
      const audio = new Audio("/sounds/click.mp3");
      audio.play().catch(() => {});
    }

    // Delay giả lập 1 xíu cho mượt
    setTimeout(() => {
      setSelected(imgSrc);
      setIsLoading(false);
    }, 500);
  };

  // Hàm xử lý quay lại từ JigsawGame
  const handleResetGame = () => {
    setSelected(null);
  };

  return (
    <>
      {!selected ? (
        <div
          style={{
            width: "100vw",
            height: "100vh",
            position: "relative",
            overflow: "hidden",
            margin: 0,
            padding: 0,
            backgroundColor: "#000",
          }}
        >
          {/* 1. ẢNH NỀN FULL (Thay thế toàn bộ UI code cũ) */}
          <img
            src="/images/puzzle_menu_full.jpg" // <-- NHỚ ĐỔI TÊN FILE ẢNH ĐÚNG
            alt="Select Puzzle Background"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "fill", // Ép dãn 100%
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          />

          {/* 2. VÙNG BẤM TÀNG HÌNH: NÚT BACK (Góc trái trên) */}
          <div
            onClick={onBack}
            style={{
              position: "absolute",
              zIndex: 20,
              top: "2%", // Căn chỉnh theo vị trí nút MENU trong ảnh
              left: "3%",
              width: "20%", // Vùng bấm khá rộng để dễ bấm
              height: "8%",
              cursor: "pointer",
              // background: "rgba(255, 0, 0, 0.3)", // <-- Bật dòng này để debug vị trí nút Back
            }}
          />

          {/* 3. VÙNG BẤM TÀNG HÌNH: 6 MODULE */}
          {HITBOX_CONFIG.map((box) => (
            <div
              key={box.index}
              onClick={() => selectImage(GALLERY_IMAGES[box.index])}
              style={{
                position: "absolute",
                zIndex: 10,
                top: box.top,
                left: box.left,
                width: "28%", // Chiều rộng mỗi ô khoảng 1/3 màn hình trừ khoảng cách
                height: "23%", // Chiều cao ước lượng theo ảnh
                cursor: "pointer",
                // background: "rgba(0, 255, 0, 0.2)", // <-- Bật dòng này để debug vị trí 6 ô
              }}
            />
          ))}

          {/* Loading Indicator đơn giản nếu cần */}
          {isLoading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "30px",
              }}
            >
              Loading...
            </div>
          )}
        </div>
      ) : (
        // Render Game Jigsaw khi đã chọn
        <JigsawGame
          userImage={selected}
          onReset={handleResetGame}
          // Nếu bạn muốn nút Back trong JigsawGame quay về Menu chính luôn thì gọi onBack
          // Nếu muốn quay về màn chọn ảnh thì gọi handleResetGame (như code này)
        />
      )}
    </>
  );
}

import React, { useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Group, Text } from "react-konva";
import useImage from "use-image";
import useSound from "use-sound";
import Konva from "konva";
import { KIOSK_WIDTH, KIOSK_HEIGHT, shuffleArray } from "./utils";
import NumberPiece from "./components/NumberPiece";

import "./styles/effects.css";
import "./styles/SequenceGame.css";

// --- CẤU HÌNH ---
// ... (GIỮ NGUYÊN PHẦN DATA COMBOS CỦA BẠN Ở ĐÂY) ...
const COMBOS = {
  COMBO_1: [
    {
      stepId: 1,
      img: "/images/routine/c1_1.png",
      text: "Tẩy Trang 2 Lớp\nEmmie by HappySkin\n3 in 1 Bi-Phase\nMicellar Water",
    },
    {
      stepId: 2,
      img: "/images/routine/c1_2.png",
      text: "Gel Rửa Mặt\nSạch Sâu\nKiểm Soát Mụn",
    },
    {
      stepId: 3,
      img: "/images/routine/C1_3.png",
      text: "Máy Rửa Mặt\nEmmie Premium\nFacial Cleansing Brush",
    },
    {
      stepId: 4,
      img: "/images/routine/C1_4.png",
      text: "Nước Thần 5% Nia\nBright & Plump Probi\nFerment Solution",
    },
    {
      stepId: 5,
      img: "/images/routine/C1_5.png",
      text: "Mandelic 10%\nTrẻ Hóa Và\nCăng Bóng Da",
    },
    {
      stepId: 6,
      img: "/images/routine/C1_6.png",
      text: "Mặt Nạ Biomecare\n& Rebalance Bio\nCellulose B5 + Peptides",
    },
    {
      stepId: 7,
      img: "/images/routine/C1_7.png",
      text: "Biomecare & Repair\nWater Cream B5\nKem Dưỡng Ẩm\nVà Phục Hồi",
    },
  ],
  COMBO_2: [
    {
      stepId: 1,
      img: "/images/routine/C2_1.png",
      text: "Nước Tẩy Trang\nSoothing Polluclear\nMicellar Water",
    },
    {
      stepId: 2,
      img: "/images/routine/C2_2.png",
      text: "Gel Rửa Mặt Dịu Nhẹ\nCấp Ẩm Sâu Emmié\nSoothing & Hydrating",
    },
    {
      stepId: 3,
      img: "/images/routine/C2_3.png",
      text: "Máy Rửa Mặt Đa Năng\nEmmie Glowmaster\n7-in-1 Beauty Device",
    },
    {
      stepId: 4,
      img: "/images/routine/C2_4.png",
      text: "Nước Thần 5% Nia\nBright & Plump Probi\nFerment Solution",
    },
    {
      stepId: 5,
      img: "/images/routine/C2_5.png",
      text: "Mandelic 12%\nTinh Chất Trẻ Hóa\nDa Ban Đêm",
    },
    {
      stepId: 6,
      img: "/images/routine/C2_6.png",
      text: "Mặt Nạ Microfiber\nĐu Đủ Dưỡng Trắng Da",
    },
    {
      stepId: 7,
      img: "/images/routine/C2_7.png",
      text: "Biomecare & Repair\nWater Cream B5\nKem Dưỡng Ẩm\nVà Phục Hồi",
    },
  ],
};

const CARD_W = 220;
const CARD_H = 340;
const DROP_SIZE = 120;
const NUMBER_SIZE = 100;

const SLOT_COORDS = [
  { x: 140, y: 350 },
  { x: 430, y: 350 },
  { x: 720, y: 350 },
  { x: 20, y: 900 },
  { x: 280, y: 900 },
  { x: 540, y: 900 },
  { x: 800, y: 900 },
];

const GAME_DURATION = 180;
const SNAP_TOLERANCE = 120;

export default function SequenceGame({ onBack, audioEnabled }) {
  const [slots, setSlots] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState("playing");

  // --- ÂM THANH (QUAN TRỌNG: KHAI BÁO ID ĐỂ QUẢN LÝ) ---
  const [playBgm, { stop: stopBgm, isPlaying: isBgmPlaying }] = useSound(
    "/sounds/bgm.mp3",
    {
      volume: 0.5,
      loop: true,
      interrupt: true,
    }
  );

  const [playSnap] = useSound("/sounds/snap.mp3");
  const [playPop] = useSound("/sounds/pop.mp3");
  const [playWrong] = useSound("/sounds/buzz.mp3");
  const [playWin, { stop: stopWin }] = useSound("/sounds/win.mp3");

  const [bgImage] = useImage("/images/skinverse_bg.png");

  // --- HÀM XỬ LÝ THOÁT GAME AN TOÀN ---
  // Gọi hàm này khi bấm Back hoặc Chơi lại để đảm bảo tắt tiếng trước
  const handleExit = () => {
    stopBgm(); // Tắt nhạc nền
    stopWin(); // Tắt nhạc chiến thắng
    onBack(); // Sau đó mới thoát ra menu
  };

  // --- AUTO PLAY & CLEANUP ---
  useEffect(() => {
    // Chỉ bật nhạc nếu đang playing và chưa có nhạc
    if (audioEnabled && gameState === "playing" && !isBgmPlaying) {
      // Delay nhẹ để tránh xung đột
      const timeout = setTimeout(() => {
        playBgm();
      }, 500);
      return () => clearTimeout(timeout);
    }

    // CLEANUP TUYỆT ĐỐI: Khi component bị hủy (unmount), tắt hết âm thanh
    return () => {
      stopBgm();
      stopWin();
    };
  }, [audioEnabled, gameState, playBgm, stopBgm, stopWin, isBgmPlaying]);

  // SETUP GAME
  useEffect(() => {
    const rawCombo = [...COMBOS.COMBO_1];
    const shuffledProducts = shuffleArray(rawCombo);

    const newSlots = SLOT_COORDS.map((coord, index) => {
      const dropZoneY_Offset = CARD_H + 10;
      const dropZoneX_Offset = (CARD_W - DROP_SIZE) / 2;

      return {
        ...coord,
        product: shuffledProducts[index],
        frameX: coord.x + dropZoneX_Offset,
        frameY: coord.y + dropZoneY_Offset,
        snapCenterX: coord.x + dropZoneX_Offset + DROP_SIZE / 2,
        snapCenterY: coord.y + dropZoneY_Offset + DROP_SIZE / 2,
      };
    });
    setSlots(newSlots);

    const newPieces = Array.from({ length: 7 }, (_, i) => {
      const id = i + 1;
      const spawnX = 80 + i * 140;
      const spawnY = 1450;
      return {
        id: id,
        img: `/images/numbers/${id}.png`,
        spawnX: spawnX,
        spawnY: spawnY,
        currentX: spawnX,
        currentY: spawnY,
        isLocked: false,
      };
    });
    setPieces(newPieces);
  }, []);

  // TIMER LOGIC
  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setGameState("lost");
          stopBgm(); // Hết giờ cũng tắt nhạc nền
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, stopBgm]);

  // DRAG & DROP
  const handleDragStart = () => playPop();

  const handleDragEnd = (e, pieceId) => {
    const pieceNode = e.target;
    const { x, y } = pieceNode.position();
    const centerX = x + NUMBER_SIZE / 2;
    const centerY = y + NUMBER_SIZE / 2;

    let isCorrect = false;
    let targetSlot = null;

    for (let slot of slots) {
      const dist = Math.hypot(
        centerX - slot.snapCenterX,
        centerY - slot.snapCenterY
      );
      if (dist < SNAP_TOLERANCE) {
        if (pieceId === slot.product.stepId) {
          isCorrect = true;
          targetSlot = slot;
          break;
        }
      }
    }

    if (isCorrect && targetSlot) {
      playSnap();
      const centeredX = targetSlot.frameX + (DROP_SIZE - NUMBER_SIZE) / 2;
      const centeredY = targetSlot.frameY + (DROP_SIZE - NUMBER_SIZE) / 2;

      pieceNode.to({
        x: centeredX,
        y: centeredY,
        duration: 0.2,
        easing: Konva.Easings.BackEaseOut,
      });

      setPieces((prev) =>
        prev.map((p) =>
          p.id === pieceId
            ? { ...p, currentX: centeredX, currentY: centeredY, isLocked: true }
            : p
        )
      );
      checkWin(pieceId);
    } else {
      playWrong();
      const originalPiece = pieces.find((p) => p.id === pieceId);
      pieceNode.to({
        x: originalPiece.spawnX,
        y: originalPiece.spawnY,
        duration: 0.4,
        easing: Konva.Easings.StrongEaseOut,
      });
    }
  };

  const checkWin = (lastPieceId) => {
    setPieces((currentPieces) => {
      const allLocked = currentPieces.every(
        (p) => p.isLocked || p.id === lastPieceId
      );
      if (allLocked) {
        setTimeout(() => {
          stopBgm(); // Tắt nhạc nền trước khi phát nhạc win
          playWin();
          setGameState("won");
        }, 500);
      }
      return currentPieces;
    });
  };

  return (
    <div className="sequence-background">
      <img src="/images/logo1.png" alt="Logo" className="game-logo" />

      <FunTimer timeLeft={timeLeft} />

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={window.innerWidth / KIOSK_WIDTH}
        scaleY={window.innerHeight / KIOSK_HEIGHT}
      >
        <Layer>
          {slots.map((slot, i) => (
            <ProductSlot
              key={i}
              x={slot.x}
              y={slot.y}
              product={slot.product}
              frameX={slot.frameX}
              frameY={slot.frameY}
            />
          ))}

          {pieces.map((piece) => (
            <NumberPiece
              key={piece.id}
              data={piece}
              size={NUMBER_SIZE}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </Layer>
      </Stage>

      {/* Truyền hàm handleExit vào prop onReset thay vì onBack trực tiếp */}
      {gameState === "won" && <ResultOverlay type="win" onReset={handleExit} />}
      {gameState === "lost" && (
        <ResultOverlay type="lose" onReset={handleExit} />
      )}

      {/* Nút Back ở góc cũng dùng handleExit */}
      <button
        onClick={handleExit}
        className="btn-upload"
        style={{ position: "absolute", top: 40, left: 40, zIndex: 10 }}
      >
        ⬅ BACK
      </button>
    </div>
  );
}

// --- SUB-COMPONENTS ---
const FunTimer = ({ timeLeft }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes < 10 ? "0" : ""}${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
  const isUrgent = timeLeft <= 10;

  return (
    <div className={`fun-timer-container ${isUrgent ? "timer-urgent" : ""}`}>
      <div className="timer-icon">⏳</div>
      <div className="timer-text">{formattedTime}</div>
    </div>
  );
};

const ProductSlot = ({ x, y, product, frameX, frameY }) => {
  const [cardBg] = useImage("/images/frames/rect2.png");
  const [frameBg] = useImage("/images/frames/rect1.png");
  const [prodImg] = useImage(product.img);

  return (
    <Group>
      <Group x={x} y={y}>
        <KonvaImage image={cardBg} width={CARD_W} height={CARD_H} />
        <Text
          text={product.text}
          x={10}
          y={20}
          width={CARD_W - 20}
          align="center"
          fontFamily="Bai Jamjuree"
          fontSize={18}
          fontStyle="bold"
          fill="#1a3a7a"
          lineHeight={1.3}
        />
        <KonvaImage
          image={prodImg}
          width={120}
          height={180}
          x={(CARD_W - 120) / 2}
          y={130}
        />
      </Group>
      <KonvaImage
        image={frameBg}
        x={frameX}
        y={frameY}
        width={DROP_SIZE}
        height={DROP_SIZE}
      />
    </Group>
  );
};

const ResultOverlay = ({ type, onReset }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(0,10,30,0.95)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      fontFamily: "Bai Jamjuree",
      color: "white",
    }}
  >
    <h1
      className="glitch"
      style={{
        fontSize: "6rem",
        color: type === "win" ? "#00d4ff" : "#ff3333",
      }}
    >
      {type === "win" ? "BIG WIN!" : "GAME OVER"}
    </h1>
    {type === "win" && (
      <div className="text" style={{ fontSize: "2rem", margin: "20px" }}>
        Bạn đã nhận được 01 Bao Lì Xì!
      </div>
    )}

    {/* Nút này sẽ gọi handleExit để tắt nhạc trước khi thoát */}
    <button onClick={onReset} className="btn-upload" style={{ marginTop: 50 }}>
      {type === "win" ? "CHƠI LẠI" : "THỬ LẠI"}
    </button>
  </div>
);

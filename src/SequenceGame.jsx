import React, { useState, useEffect } from "react";
import { Stage, Layer } from "react-konva";
import useImage from "use-image";
import useSound from "use-sound";
import Konva from "konva";
import { KIOSK_WIDTH, KIOSK_HEIGHT, shuffleArray } from "./utils";
import NumberPiece from "./components/NumberPiece";
import ProductSlot from "./components/ProductSlot";
import "./styles/effects.css";
import "./styles/SequenceGame.css";

// --- CẤU HÌNH ---
// ... (GIỮ NGUYÊN PHẦN DATA COMBOS NHƯ CŨ) ...
const COMBOS = {
  COMBO_1: [
    { stepId: 1, img: "/images/routine/c1_1.png", text: "Tẩy Trang..." },
    { stepId: 2, img: "/images/routine/c1_2.png", text: "Gel Rửa Mặt..." },
    { stepId: 3, img: "/images/routine/C1_3.png", text: "Máy Rửa Mặt..." },
    { stepId: 4, img: "/images/routine/C1_4.png", text: "Nước Thần..." },
    { stepId: 5, img: "/images/routine/C1_5.png", text: "Mandelic 10%..." },
    { stepId: 6, img: "/images/routine/C1_6.png", text: "Mặt Nạ..." },
    { stepId: 7, img: "/images/routine/C1_7.png", text: "Kem Dưỡng..." },
  ],
  // ... Combo 2 (nếu có)
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

const SNAP_TOLERANCE = 120;

export default function SequenceGame({ onBack, audioEnabled }) {
  const [slots, setSlots] = useState([]);
  const [pieces, setPieces] = useState([]);
  // BỎ STATE TIMER VÀ GAME STATE LOST
  const [isWin, setIsWin] = useState(false); // Chỉ cần biết thắng hay chưa

  // --- ÂM THANH ---
  const [playBgm, { stop: stopBgm, isPlaying: isBgmPlaying }] = useSound(
    "/sounds/bgm.mp3",
    { volume: 0.5, loop: true, interrupt: true }
  );
  const [playSnap] = useSound("/sounds/snap.mp3");
  const [playPop] = useSound("/sounds/pop.mp3");
  const [playWrong] = useSound("/sounds/buzz.mp3");
  const [playWin, { stop: stopWin }] = useSound("/sounds/win.mp3");

  const handleExit = () => {
    stopBgm();
    stopWin();
    onBack();
  };

  // --- SETUP ---
  useEffect(() => {
    // Chỉ bật nhạc nếu chưa thắng và chưa có nhạc
    if (audioEnabled && !isWin && !isBgmPlaying) {
      const timeout = setTimeout(() => playBgm(), 500);
      return () => clearTimeout(timeout);
    }
    return () => {
      stopBgm();
      stopWin();
    };
  }, [audioEnabled, isWin, playBgm, stopBgm, stopWin, isBgmPlaying]);

  useEffect(() => {
    // 1. Setup Slots (Giữ nguyên)
    const rawCombo = [...COMBOS.COMBO_1];
    const shuffledProducts = shuffleArray(rawCombo);

    const newSlots = SLOT_COORDS.map((coord, index) => {
      const dropZoneY_Offset = CARD_H + 10;
      const dropZoneX_Offset = (CARD_W - DROP_SIZE) / 2;
      return {
        ...coord,
        product: shuffledProducts[index] || {},
        frameX: coord.x + dropZoneX_Offset,
        frameY: coord.y + dropZoneY_Offset,
        snapCenterX: coord.x + dropZoneX_Offset + DROP_SIZE / 2,
        snapCenterY: coord.y + dropZoneY_Offset + DROP_SIZE / 2,
      };
    });
    setSlots(newSlots);

    // 2. Setup Pieces (Giữ nguyên)
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

  // --- ĐÃ XÓA HOÀN TOÀN LOGIC TIMER Ở ĐÂY ---

  // --- DRAG HANDLERS ---
  const handleDragStart = (e) => {
    playPop();
  };

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

      // ĐÚNG: Giữ nguyên scale to (1.2) cho đẹp
      pieceNode.to({
        x: centeredX,
        y: centeredY,
        scaleX: 1.2,
        scaleY: 1.2,
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

      // SAI: Thu nhỏ về 1
      pieceNode.to({
        x: originalPiece.spawnX,
        y: originalPiece.spawnY,
        scaleX: 1,
        scaleY: 1,
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
          stopBgm();
          playWin();
          setIsWin(true);
        }, 500);
      }
      return currentPieces;
    });
  };

  return (
    <div className="sequence-background">
      <img src="/images/logo1.png" alt="Logo" className="game-logo" />

      {/* ĐÃ XÓA COMPONENT FunTimer */}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={window.innerWidth / KIOSK_WIDTH}
        scaleY={window.innerHeight / KIOSK_HEIGHT}
        pixelRatio={1} // Tối ưu
      >
        {/* LAYER 1: TĨNH */}
        <Layer listening={false}>
          {slots.map((slot, i) => (
            <ProductSlot
              key={i}
              x={slot.x}
              y={slot.y}
              product={slot.product}
              frameX={slot.frameX}
              frameY={slot.frameY}
              cardW={CARD_W}
              cardH={CARD_H}
              dropSize={DROP_SIZE}
            />
          ))}
        </Layer>

        {/* LAYER 2: ĐỘNG */}
        <Layer>
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

      {/* Chỉ còn màn hình Win, không còn Lose */}
      {isWin && <ResultOverlay onReset={handleExit} />}

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

// Giản lược ResultOverlay vì chỉ còn 1 trường hợp thắng
const ResultOverlay = ({ onReset }) => (
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
    <h1 className="glitch" style={{ fontSize: "6rem", color: "#00d4ff" }}>
      BIG WIN!
    </h1>
    <div className="text" style={{ fontSize: "2rem", margin: "20px" }}>
      Bạn đã nhận được 01 Bao Lì Xì!
    </div>
    <button onClick={onReset} className="btn-upload" style={{ marginTop: 50 }}>
      CHƠI LẠI
    </button>
  </div>
);

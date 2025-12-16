import { useEffect, useState } from "react";
import { Stage, Layer, Rect, Text, Group, Circle } from "react-konva";
import useImage from "use-image";
import useSound from "use-sound";
import Konva from "konva";
import { generateJigsawGrid } from "./puzzlePath";
import {
  shuffleArray,
  KIOSK_WIDTH,
  KIOSK_HEIGHT,
  GRID_COLS,
  GRID_ROWS,
  SNAP_TOLERANCE,
  BOARD_MAX_WIDTH,
  BOARD_MAX_HEIGHT,
} from "./utils";
import PuzzleBoard from "./components/PuzzleBoard";
import EmmieFrame from "./components/EmmieFrame";
import ModernStars from "./components/ModernStars";

const TRAY_CONFIG = {
  y: 1400,
  cols: 3,
  rows: 2,
  scale: 0.5,
  cellWidth: 320,
  cellHeight: 220,
};

export default function JigsawGame({ userImage, onReset }) {
  const [pieces, setPieces] = useState([]);
  const [isWin, setIsWin] = useState(false);

  const [layout, setLayout] = useState({
    boardW: 0,
    boardH: 0,
    boardX: 0,
    boardY: 0,
    pieceW: 0,
    pieceH: 0,
    padding: 0,
  });

  const [imageObj] = useImage(userImage);

  // --- ÂM THANH (SỬA LỖI TẠI ĐÂY) ---
  const [playBgm, { stop: stopBgm }] = useSound("/sounds/bgm.mp3", {
    volume: 0.7,
    loop: true,
    interrupt: true,
  });
  const [playPop] = useSound("/sounds/pop.mp3", { volume: 1.0 });
  const [playSnap] = useSound("/sounds/snap.mp3", { volume: 1.0 });

  // Lấy thêm hàm stopWin để tắt nhạc khi reset
  const [playWin, { stop: stopWin }] = useSound("/sounds/win.mp3", {
    volume: 1.0,
  });

  useEffect(() => {
    playBgm();
    return () => {
      stopBgm();
      stopWin(); // Đảm bảo tắt nhạc win khi unmount
    };
  }, [playBgm, stopBgm, stopWin]);

  // 1. TÍNH TOÁN KÍCH THƯỚC
  useEffect(() => {
    if (imageObj) {
      const imgRatio = imageObj.width / imageObj.height;
      let finalW, finalH;

      if (imgRatio > BOARD_MAX_WIDTH / BOARD_MAX_HEIGHT) {
        finalW = BOARD_MAX_WIDTH;
        finalH = finalW / imgRatio;
      } else {
        finalH = BOARD_MAX_HEIGHT;
        finalW = finalH * imgRatio;
      }

      const pW = finalW / GRID_COLS;
      const pH = finalH / GRID_ROWS;

      setLayout({
        boardW: finalW,
        boardH: finalH,
        boardX: (KIOSK_WIDTH - finalW) / 2,
        boardY: 250,
        pieceW: pW,
        pieceH: pH,
        padding: Math.max(pW, pH) * 0.25,
      });
    }
  }, [imageObj]);

  // 2. SPAWN MẢNH GHÉP
  useEffect(() => {
    if (layout.boardW > 0) {
      const grid = generateJigsawGrid(GRID_COLS, GRID_ROWS);
      const shuffledIndices = shuffleArray([...Array(grid.length).keys()]);

      const totalTrayWidth = TRAY_CONFIG.cols * TRAY_CONFIG.cellWidth;
      const startTrayX = (KIOSK_WIDTH - totalTrayWidth) / 2;

      const newPieces = grid.map((p, i) => {
        const slotIdx = shuffledIndices[i];
        const rowInTray = Math.floor(slotIdx / TRAY_CONFIG.cols);
        const colInTray = slotIdx % TRAY_CONFIG.cols;

        const centerX =
          startTrayX +
          colInTray * TRAY_CONFIG.cellWidth +
          TRAY_CONFIG.cellWidth / 2 -
          40;
        const centerY =
          TRAY_CONFIG.y +
          rowInTray * TRAY_CONFIG.cellHeight +
          TRAY_CONFIG.cellHeight / 2 -
          50;

        const visualW = layout.pieceW * TRAY_CONFIG.scale;
        const visualH = layout.pieceH * TRAY_CONFIG.scale;

        const spawnX = centerX - visualW / 2;
        const spawnY = centerY - visualH / 2;

        return {
          id: i,
          ...p,
          correctX: layout.boardX + p.c * layout.pieceW,
          correctY: layout.boardY + p.r * layout.pieceH,
          spawnX: spawnX + layout.padding,
          spawnY: spawnY + layout.padding,
          currentX: spawnX + layout.padding,
          currentY: spawnY + layout.padding,
          currentScale: TRAY_CONFIG.scale,
          isLocked: false,
        };
      });

      setPieces(newPieces);
      setIsWin(false);
    }
  }, [layout]);

  const onDragStart = () => playPop();

  const onDragEnd = (e, id) => {
    const piece = pieces.find((p) => p.id === id);
    if (!piece) return;

    const x = e.target.x() + layout.padding;
    const y = e.target.y() + layout.padding;
    const dist = Math.hypot(x - piece.correctX, y - piece.correctY);

    if (dist < SNAP_TOLERANCE) {
      playSnap();
      e.target.to({
        x: piece.correctX - layout.padding,
        y: piece.correctY - layout.padding,
        scaleX: 1,
        scaleY: 1,
        duration: 0.2,
        easing: Konva.Easings.BackEaseOut,
      });

      setPieces((old) => {
        const newState = old.map((p) =>
          p.id === id
            ? {
                ...p,
                currentX: piece.correctX,
                currentY: piece.correctY,
                isLocked: true,
                currentScale: 1,
              }
            : p
        );
        if (newState.every((p) => p.isLocked)) {
          stopBgm();
          playWin();
          setTimeout(() => setIsWin(true), 500);
        }
        return newState;
      });
    } else {
      e.target.to({
        x: piece.spawnX - layout.padding,
        y: piece.spawnY - layout.padding,
        scaleX: TRAY_CONFIG.scale,
        scaleY: TRAY_CONFIG.scale,
        duration: 0.3,
        easing: Konva.Easings.StrongEaseOut,
      });

      setPieces((old) =>
        old.map((p) =>
          p.id === id
            ? {
                ...p,
                currentX: piece.spawnX,
                currentY: piece.spawnY,
                currentScale: TRAY_CONFIG.scale,
              }
            : p
        )
      );
    }
  };

  if (!imageObj || layout.boardW === 0) return null;

  return (
    <div className="game-scene">
      <div className="cyber-grid"></div>
      <div className="floating-particles"></div>

      <img src="/images/logo1.png" alt="Brand Logo" className="game-logo" />

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={window.innerWidth / KIOSK_WIDTH}
        scaleY={window.innerHeight / KIOSK_HEIGHT}
      >
        <Layer>
          {/* --- FIX LỖI XUYÊN THẤU TẠI ĐÂY --- */}

          {/* 1. NỀN ĐẶC (BLOCKER): Che lưới sọc bên dưới */}
          <Rect
            x={layout.boardX - 20}
            y={layout.boardY - 20}
            width={layout.boardW + 40}
            height={layout.boardH + 40}
            fill="#050a1f" // Màu xanh đen đậm nhất của theme, không dùng rgba trong suốt
            cornerRadius={20}
            // Thêm hiệu ứng tỏa sáng (Glow) để tách biệt bảng ra khỏi nền
            shadowColor="#00d4ff"
            shadowBlur={20}
            shadowOpacity={0.3}
            stroke="#00d4ff" // Viền mỏng xanh neon
            strokeWidth={1}
          />

          {/* 2. KHAY CHỨA (Giữ nguyên, nhưng chỉnh lại fill cho đồng bộ) */}
          <Group>
            <Rect
              x={40}
              y={TRAY_CONFIG.y - 40}
              width={KIOSK_WIDTH - 80}
              height={500}
              fill="#08102b" // Nền đặc màu tối
              cornerRadius={40}
              stroke="rgba(0, 212, 255, 0.3)"
              strokeWidth={2}
              shadowColor="black"
              shadowBlur={20}
            />

            {Array.from({ length: 6 }).map((_, i) => {
              const r = Math.floor(i / TRAY_CONFIG.cols);
              const c = i % TRAY_CONFIG.cols;
              const totalW = TRAY_CONFIG.cols * TRAY_CONFIG.cellWidth;
              const sX = (KIOSK_WIDTH - totalW) / 2;

              const cX =
                sX + c * TRAY_CONFIG.cellWidth + TRAY_CONFIG.cellWidth / 2;
              const cY =
                TRAY_CONFIG.y +
                r * TRAY_CONFIG.cellHeight +
                TRAY_CONFIG.cellHeight / 2;

              return (
                <Group key={i} x={cX} y={cY}>
                  <Circle
                    radius={50}
                    fill="rgba(255,255,255,0.05)"
                    stroke="rgba(255,255,255,0.1)"
                    dash={[5, 5]}
                  />
                  <Rect
                    x={-10}
                    y={-1}
                    width={20}
                    height={2}
                    fill="rgba(255,255,255,0.2)"
                  />
                  <Rect
                    x={-1}
                    y={-10}
                    width={2}
                    height={20}
                    fill="rgba(255,255,255,0.2)"
                  />
                </Group>
              );
            })}

            {/* <Text
              text="KHO MẢNH GHÉP"
              x={0}
              y={TRAY_CONFIG.y - 80}
              width={KIOSK_WIDTH}
              align="center"
              fill="#00d4ff"
              fontFamily="'Exo 2', sans-serif"
              fontSize={28}
              fontStyle="bold"
            /> */}
          </Group>

          <EmmieFrame width={KIOSK_WIDTH} height={KIOSK_HEIGHT} />
          <ModernStars />

          {/* 3. ẢNH HINT & MẢNH GHÉP: Nằm đè lên lớp nền đặc ở trên */}
          {/* PuzzleBoard đã có sẵn logic opacity=0.15 cho ảnh hint, nên nó sẽ mờ trên nền #050a1f */}
          <PuzzleBoard
            img={userImage}
            boardX={layout.boardX}
            boardY={layout.boardY}
            boardWidth={layout.boardW}
            boardHeight={layout.boardH}
            pieces={pieces}
            pieceWidth={layout.pieceW}
            pieceHeight={layout.pieceH}
            padding={layout.padding}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        </Layer>
      </Stage>

      {/* --- NÚT BACK (Thêm stopWin) --- */}
      <button
        onClick={() => {
          stopBgm();
          stopWin(); // Tắt nhạc Win
          onReset();
        }}
        className="btn-upload"
        style={{ position: "absolute", top: 40, left: 40, zIndex: 10 }}
      >
        ⬅ BACK
      </button>

      {isWin && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,10,30,0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "Orbitron",
            zIndex: 20,
          }}
        >
          <h1 style={{ fontSize: "6rem", textShadow: "0 0 20px #00d4ff" }}>
            HOÀN THÀNH!
          </h1>
          {/* --- NÚT CHƠI LẠI (Thêm stopWin) --- */}
          <button
            onClick={() => {
              stopBgm();
              stopWin(); // Tắt nhạc Win
              onReset();
            }}
            className="btn-upload"
            style={{ marginTop: 60, transform: "scale(1.5)" }}
          >
            CHƠI LẠI
          </button>
        </div>
      )}
    </div>
  );
}

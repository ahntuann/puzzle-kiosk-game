import { useEffect, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Group,
  Circle,
  Text, // Nhớ import Text để vẽ chữ
  Image as KonvaImage,
} from "react-konva";
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
import WinScreen from "./components/WinScreen";

// --- DANH SÁCH TÊN SẢN PHẨM (Sửa text ở đây) ---
const PRODUCT_NAMES = {
  // Điền đúng đường dẫn ảnh bạn dùng
  "/images/1.png": "Máy Triệt Lông IPL Sapphire ICE Unlimited",
  "/images/2.png": "Máy Rửa Mặt Đa Năng  5-in-1 Mini UPGRADE",
  "/images/3.png": "Máy Triệt Lông IPL Pro ICE Infinite Glide",
  "/images/4.png": "Máy Rửa Mặt Premium Đạt Chứng Nhận FDA",
  "/images/5.png": "Máy Triệt Lông IPL MAX POWER",
  "/images/6.png": "Máy Rửa Mặt Đa Năng Glowmaster 7-in-1 ",
};

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

  // --- ÂM THANH ---
  const [playBgm, { stop: stopBgm }] = useSound("/sounds/bgm.mp3", {
    volume: 0.7,
    loop: true,
    interrupt: true,
  });
  const [playPop] = useSound("/sounds/pop.mp3", { volume: 1.0 });
  const [playSnap] = useSound("/sounds/snap.mp3", { volume: 1.0 });
  const [playWin, { stop: stopWin }] = useSound("/sounds/win.mp3", {
    volume: 1.0,
  });

  useEffect(() => {
    playBgm();
    return () => {
      stopBgm();
      stopWin();
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
      <img src="/images/logo1.png" alt="Brand Logo" className="game-logo" />

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={window.innerWidth / KIOSK_WIDTH}
        scaleY={window.innerHeight / KIOSK_HEIGHT}
        pixelRatio={1}
        listening={true}
      >
        <Layer listening={false}>
          {/* 1. NỀN ĐẶC (Giữ nguyên như bạn muốn) */}
          <Rect
            x={layout.boardX - 20}
            y={layout.boardY - 20}
            width={layout.boardW + 40}
            height={layout.boardH + 40}
            fill="#050a1f" // Màu nền tối
            cornerRadius={20}
            stroke="#00d4ff" // Viền xanh
            strokeWidth={1}
            opacity={0.8}
            shadowColor="#00d4ff"
            shadowBlur={15}
            shadowOpacity={0.3}
          />

          {/* 2. ẢNH HINT MỜ */}
          <KonvaImage
            image={imageObj}
            x={layout.boardX}
            y={layout.boardY}
            width={layout.boardW}
            height={layout.boardH}
            opacity={0.2}
          />

          {/* 3. TÊN SẢN PHẨM */}
          <Group x={0} y={layout.boardY + layout.boardH + 60}>
            <Text
              text={PRODUCT_NAMES[userImage] || ""}
              width={KIOSK_WIDTH}
              align="center"
              fontFamily="Bai Jamjuree"
              // Giảm size đi 1 xíu cho tinh tế hơn, to quá trông hơi thô
              fontSize={34}
              // Dùng font weight nặng nhất để chữ dày dặn
              fontStyle="900"
              // --- HIỆU ỨNG NEON HIỆN ĐẠI ---
              fill="white" // Ruột chữ trắng tinh
              // Tạo viền sáng mỏng để định hình chữ
              stroke="#00d4ff" // Viền màu xanh cyan neon
              strokeWidth={1} // Viền mỏng thôi
              // Hiệu ứng phát sáng lan tỏa (Glow)
              shadowColor="#00d4ff" // Màu phát sáng cũng là xanh cyan
              shadowBlur={30} // Độ lan tỏa rộng ra như ánh sáng
              shadowOpacity={1} // Độ sáng tối đa
              shadowOffsetX={0} // Ánh sáng tỏa đều từ trung tâm
              shadowOffsetY={0}
            />
          </Group>

          {/* 4. KHAY CHỨA (Giữ nguyên) */}
          <Group>
            <Rect
              x={40}
              y={TRAY_CONFIG.y - 40}
              width={KIOSK_WIDTH - 80}
              height={500}
              fill="#08102b"
              cornerRadius={40}
              stroke="rgba(0, 212, 255, 0.3)"
              strokeWidth={2}
              opacity={0.6}
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
          </Group>
        </Layer>

        <Layer>
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

      <button
        onClick={() => {
          stopBgm();
          stopWin();
          onReset();
        }}
        className="btn-upload"
        style={{ position: "absolute", top: 40, left: 40, zIndex: 10 }}
      >
        ⬅ BACK
      </button>

      {isWin && (
        <WinScreen
          onReset={() => {
            stopBgm();
            stopWin();
            onReset();
          }}
        />
      )}
    </div>
  );
}

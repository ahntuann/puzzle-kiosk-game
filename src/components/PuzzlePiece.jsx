import React, { useMemo, useRef } from "react";
import { Group, Path } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { getPiecePath } from "../puzzlePath";
import { GRID_COLS, GRID_ROWS } from "../utils"; // Import config mới

// --- GIẢM ĐỘ DÀY XUỐNG CÒN 4PX (Vừa phải, tinh tế) ---
const THICKNESS_OFFSET = 4;

export default function PuzzlePiece({
  piece,
  img,
  width, // Nhận chiều rộng mảnh
  height, // Nhận chiều cao mảnh
  padding,
  onDragStart,
  onDragEnd,
}) {
  const [image] = useImage(img);
  const groupRef = useRef(null);

  const pathData = useMemo(() => {
    return getPiecePath(
      width,
      height, // Dùng kích thước chữ nhật
      piece.top,
      piece.right,
      piece.bottom,
      piece.left,
      padding
    );
  }, [width, height, piece, padding]);

  // Tính toán tỷ lệ ảnh nguồn
  const sourceItemWidth = image ? image.width / GRID_COLS : 0;
  const sourceItemHeight = image ? image.height / GRID_ROWS : 0;
  const scaleX = sourceItemWidth ? width / sourceItemWidth : 1;
  const scaleY = sourceItemHeight ? height / sourceItemHeight : 1;

  if (!image) return null;

  return (
    <Group
      ref={groupRef}
      id={piece.id.toString()}
      x={piece.currentX - padding}
      y={piece.currentY - padding}
      draggable={!piece.isLocked}
      scaleX={piece.currentScale || 1}
      scaleY={piece.currentScale || 1}
      perfectDrawEnabled={false}
      onDragStart={(e) => {
        if (piece.isLocked) return;
        e.target.moveToTop();
        e.target.to({
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 0.2,
          easing: Konva.Easings.BackEaseOut,
        });

        // Bóng bay lên vừa phải
        const shadowLayer = e.target.findOne(".drop-shadow");
        if (shadowLayer) {
          shadowLayer.to({
            offsetX: -15,
            offsetY: -15,
            opacity: 0.4,
            blur: 15,
            duration: 0.2,
          });
        }
        onDragStart(e, piece.id);
      }}
      onDragEnd={(e) => {
        if (piece.isLocked) return;
        const shadowLayer = e.target.findOne(".drop-shadow");
        if (shadowLayer) {
          shadowLayer.to({
            offsetX: 0,
            offsetY: 0,
            opacity: 0.5,
            blur: 5,
            duration: 0.2,
          });
        }
        onDragEnd(e, piece.id);
      }}
    >
      {/* 1. BÓNG ĐỔ NỀN (Nhẹ nhàng hơn) */}
      <Path
        name="drop-shadow"
        data={pathData}
        fill="black"
        shadowColor="#000"
        shadowBlur={5}
        shadowOpacity={0.5}
        shadowOffsetX={THICKNESS_OFFSET + 2}
        shadowOffsetY={THICKNESS_OFFSET + 2}
      />

      {/* 2. ĐỘ DÀY (Giả 3D mỏng) */}
      <Path
        data={pathData}
        fill="#2c3e50"
        x={THICKNESS_OFFSET}
        y={THICKNESS_OFFSET}
      />
      <Path
        data={pathData}
        fill="#34495e"
        x={THICKNESS_OFFSET / 2}
        y={THICKNESS_OFFSET / 2}
      />

      {/* 3. ẢNH CHÍNH */}
      <Path
        data={pathData}
        fillPatternImage={image}
        fillPatternScale={{ x: scaleX, y: scaleY }}
        fillPatternOffset={{
          x: piece.c * sourceItemWidth - padding / scaleX,
          y: piece.r * sourceItemHeight - padding / scaleY,
        }}
        fillPatternRepeat="no-repeat"
      />

      {/* 4. VIỀN SÁNG (Highlight) */}
      <Path
        data={pathData}
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1}
        listening={false}
      />
    </Group>
  );
}

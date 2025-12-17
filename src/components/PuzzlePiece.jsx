import React, { useMemo, useRef, useEffect } from "react";
import { Group, Path } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { getPiecePath } from "../puzzlePath";
import { GRID_COLS, GRID_ROWS } from "../utils";

const THICKNESS_OFFSET = 4;

const PuzzlePiece = React.memo(
  ({ piece, img, width, height, padding, onDragStart, onDragEnd }) => {
    const [image] = useImage(img);
    const groupRef = useRef(null);

    const pathData = useMemo(() => {
      return getPiecePath(
        width,
        height,
        piece.top,
        piece.right,
        piece.bottom,
        piece.left,
        padding
      );
    }, [width, height, piece, padding]);

    const sourceItemWidth = image ? image.width / GRID_COLS : 0;
    const sourceItemHeight = image ? image.height / GRID_ROWS : 0;
    const scaleX = sourceItemWidth ? width / sourceItemWidth : 1;
    const scaleY = sourceItemHeight ? height / sourceItemHeight : 1;

    // --- HÀM CACHE TỰ ĐỘNG (SỬA LỖI CẮT HÌNH) ---
    const cachePiece = () => {
      const node = groupRef.current;
      if (!node) return;

      // Bước 1: Xóa cache cũ nếu có
      node.clearCache();

      try {
        // Bước 2: Tự động lấy kích thước bao quanh của tất cả các hình vẽ bên trong
        // (Bao gồm cả Path, Shadow, Stroke...)
        // skipTransform: true để lấy kích thước gốc chưa bị scale
        const rect = node.getClientRect({ skipTransform: true });

        // Bước 3: Cache dựa trên kích thước thật đó + mở rộng thêm vùng an toàn (buffer)
        // Mở rộng thêm 20px mỗi chiều để chắc chắn bóng đổ không bị cắt
        const buffer = 20;

        node.cache({
          x: rect.x - buffer,
          y: rect.y - buffer,
          width: rect.width + buffer * 2,
          height: rect.height + buffer * 2,
          // Giữ pixelRatio=1 để nhẹ máy, nhưng vẫn đủ nét
          pixelRatio: 1,
        });
      } catch (e) {
        console.error("Cache failed", e);
      }
    };

    useEffect(() => {
      if (image) {
        // Gọi hàm cache khi ảnh đã load xong hoặc kích thước thay đổi
        // Dùng setTimeout để đảm bảo render xong mới chụp hình
        const timer = setTimeout(() => {
          cachePiece();
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [image, width, height, padding, piece.isLocked]);

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

          // Khi kéo: Xóa cache để hiện Vector gốc (nét nhất, mượt nhất)
          e.target.clearCache();

          e.target.to({
            scaleX: 1,
            scaleY: 1,
            duration: 0.1,
            easing: Konva.Easings.EaseOut,
          });

          onDragStart(e, piece.id);
        }}
        onDragEnd={(e) => {
          if (piece.isLocked) return;

          // Khi thả tay: Để yên Vector, useEffect sẽ tự động chạy lại cachePiece
          // sau khi component cha cập nhật props

          onDragEnd(e, piece.id);
        }}
        // dragDistance={3}
        // TỐI ƯU 2: Vùng chạm giả (Hit Region)
        hitFunc={(context, shape) => {
          context.beginPath();
          // Vẽ một hình chữ nhật đơn giản bao quanh mảnh ghép để bắt sự kiện
          // Cộng thêm padding để dễ bấm trúng hơn trên màn cảm ứng
          context.rect(
            -padding,
            -padding,
            width + padding * 2,
            height + padding * 2
          );
          context.closePath();
          // Quan trọng: Hàm này giúp Konva biết đây là vùng tương tác
          context.fillStrokeShape(shape);
        }}
      >
        {/* 1. BÓNG ĐỔ */}
        <Path
          data={pathData}
          fill="#000"
          offsetX={-4}
          offsetY={-4}
          opacity={0.3}
          listening={false}
        />

        {/* 2. ĐỘ DÀY (Giả 3D) */}
        <Path
          data={pathData}
          fill="#2c3e50"
          x={THICKNESS_OFFSET}
          y={THICKNESS_OFFSET}
          listening={false}
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
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1}
        />
      </Group>
    );
  }
);

export default PuzzlePiece;

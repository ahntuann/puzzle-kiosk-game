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

    // 1. TÍNH TOÁN PATH (HÌNH DÁNG MẢNH GHÉP)
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

    // 2. TÍNH TOÁN TỈ LỆ ẢNH FILL
    const sourceItemWidth = image ? image.width / GRID_COLS : 0;
    const sourceItemHeight = image ? image.height / GRID_ROWS : 0;
    const scaleX = sourceItemWidth ? width / sourceItemWidth : 1;
    const scaleY = sourceItemHeight ? height / sourceItemHeight : 1;

    // 3. HÀM CACHE (SNAPSHOT THÀNH ẢNH BITMAP ĐỂ NHẸ MÁY)
    const cachePiece = () => {
      const node = groupRef.current;
      if (!node) return;

      // Xóa cache cũ trước khi tạo mới
      node.clearCache();

      try {
        // Lấy kích thước thực tế của mảnh ghép (bao gồm cả phần lồi lõm)
        const rect = node.getClientRect({ skipTransform: true });

        // Vùng đệm an toàn để không bị cắt mất bóng đổ
        const buffer = 20;

        node.cache({
          x: rect.x - buffer,
          y: rect.y - buffer,
          width: rect.width + buffer * 2,
          height: rect.height + buffer * 2,
          offset: buffer,
          // QUAN TRỌNG: Để 1 cho nhẹ máy Kiosk.
          // Nếu máy khỏe hơn có thể tăng lên 1.2 cho nét, nhưng máy yếu thì 1 là an toàn nhất.
          pixelRatio: 1,
        });
      } catch (e) {
        console.error("Cache failed", e);
      }
    };

    // 4. KÍCH HOẠT CACHE KHI ẢNH LOAD XONG HOẶC RESIZE
    useEffect(() => {
      if (image) {
        const timer = setTimeout(() => {
          cachePiece();
        }, 100); // Delay nhẹ để đảm bảo render xong mới chụp
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
        // Tối ưu hiệu năng: Tắt vẽ chính xác tuyệt đối
        perfectDrawEnabled={false}
        // Chống rung tay: Kéo quá 3px mới tính là di chuyển
        dragDistance={3}
        // --- SỰ KIỆN KÉO THẢ TỐI ƯU ---
        onDragStart={(e) => {
          if (piece.isLocked) return;
          e.target.moveToTop();

          // TỐI ƯU QUAN TRỌNG: KHÔNG clearCache() ở đây nữa.
          // Giữ nguyên Cache (Bitmap) để di chuyển mượt mà.

          // Hiệu ứng nhấc lên: Phóng to nhẹ (1.05)
          e.target.to({
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 0.1,
            easing: Konva.Easings.EaseOut,
          });

          onDragStart(e, piece.id);
        }}
        onDragEnd={(e) => {
          if (piece.isLocked) return;

          // Hiệu ứng thả xuống: Trở về bình thường
          e.target.to({
            scaleX: 1,
            scaleY: 1,
            duration: 0.1,
            easing: Konva.Easings.EaseOut,
          });

          onDragEnd(e, piece.id);
        }}
        // --- VÙNG CHẠM TỐI ƯU CHO CẢM ỨNG ---
        hitFunc={(context, shape) => {
          context.beginPath();
          // Vẽ vùng chạm hình chữ nhật bao quanh (dễ bấm trúng hơn hình ghép phức tạp)
          context.rect(
            -padding,
            -padding,
            width + padding * 2,
            height + padding * 2
          );
          context.closePath();
          context.fillStrokeShape(shape);
        }}
      >
        {/* LỚP 1: BÓNG ĐỔ (Dùng Path đen thay vì ShadowBlur để nhẹ máy) */}
        <Path
          data={pathData}
          fill="#000"
          offsetX={-4}
          offsetY={-4}
          opacity={0.2} // Bóng mờ nhẹ
          listening={false} // Không bắt sự kiện chuột
        />

        {/* LỚP 2: ĐỘ DÀY GIẢ 3D */}
        <Path
          data={pathData}
          fill="#2c3e50"
          x={THICKNESS_OFFSET}
          y={THICKNESS_OFFSET}
          listening={false}
        />

        {/* LỚP 3: ẢNH MẢNH GHÉP */}
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

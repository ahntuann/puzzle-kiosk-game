import React, { useRef, useEffect } from "react";
import { Group, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

const NumberPiece = React.memo(
  ({ data, size = 100, onDragStart, onDragEnd }) => {
    const [image] = useImage(data.img);
    const groupRef = useRef(null);

    // Cache giữ nguyên như tối ưu trước
    useEffect(() => {
      if (image && groupRef.current) {
        const node = groupRef.current;
        node.cache({
          pixelRatio: 1,
          x: -10,
          y: -10,
          width: size + 20,
          height: size + 20,
        });
      }
    }, [image, size]);

    return (
      <Group
        ref={groupRef}
        id={data.id.toString()}
        x={data.currentX}
        y={data.currentY}
        draggable={!data.isLocked}
        dragDistance={3}
        perfectDrawEnabled={false}
        // QUAN TRỌNG: Scale lấy từ props data (do cha quản lý)
        // Nếu đang Locked (đúng ô) thì to 1.2, còn ở spawn thì 1
        scaleX={data.isLocked ? 1.2 : 1}
        scaleY={data.isLocked ? 1.2 : 1}
        onDragStart={(e) => {
          // e.target.clearCache(); // Nếu cần mượt hơn khi scale
          e.target.moveToTop();
          e.target.to({
            scaleX: 1.2, // Kéo lên thì to ra
            scaleY: 1.2,
            shadowOffsetX: 10,
            shadowOffsetY: 10,
            shadowBlur: 0,
            shadowOpacity: 0.3,
            duration: 0.1,
            easing: Konva.Easings.EaseOut,
          });
          onDragStart(e);
        }}
        onDragEnd={(e) => {
          // SỬA TẠI ĐÂY: Chỉ tắt bóng, KHÔNG THU NHỎ (để cha quyết định)
          e.target.to({
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowOpacity: 0,
            duration: 0.2,
          });
          onDragEnd(e, data.id);
        }}
      >
        <KonvaImage
          image={image}
          width={size}
          height={size}
          shadowBlur={0}
          listening={true}
        />
      </Group>
    );
  }
);

export default NumberPiece;

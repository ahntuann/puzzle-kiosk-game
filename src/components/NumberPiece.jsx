import React, { useRef, useState } from "react";
import { Group, Image as KonvaImage, Rect } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

const NumberPiece = React.memo(
  ({ data, size = 100, onDragStart, onDragEnd }) => {
    const [image] = useImage(data.img);
    const groupRef = useRef(null);

    // State nội bộ để xử lý hiệu ứng, tránh render lại cả Game cha
    const [isDragging, setIsDragging] = useState(false);

    return (
      <Group
        ref={groupRef}
        id={data.id.toString()}
        x={data.currentX}
        y={data.currentY}
        draggable={!data.isLocked}
        // Chống rung tay: Kéo quá 3px mới tính là drag
        dragDistance={3}
        // Tối ưu quan trọng:
        perfectDrawEnabled={false}
        scaleX={isDragging ? 1.2 : data.isLocked ? 1.2 : 1}
        scaleY={isDragging ? 1.2 : data.isLocked ? 1.2 : 1}
        onDragStart={(e) => {
          setIsDragging(true);
          e.target.moveToTop();
          onDragStart(e);
        }}
        onDragEnd={(e) => {
          setIsDragging(false);
          onDragEnd(e, data.id);
        }}
      >
        {/* 1. HÌNH ẢNH (Chỉ để nhìn, không bắt sự kiện - listening=false) */}
        <KonvaImage
          image={image}
          width={size}
          height={size}
          listening={false} // Tối ưu: CPU bỏ qua ảnh này
          // Chỉ đổ bóng khi đang kéo -> Tiết kiệm tài nguyên lúc đứng im
          shadowColor="black"
          shadowBlur={0} // Luôn tắt blur để mượt
          shadowOffsetX={isDragging ? 10 : 0}
          shadowOffsetY={isDragging ? 10 : 0}
          shadowOpacity={isDragging ? 0.3 : 0}
        />

        {/* 2. TẤM KHIÊN TRONG SUỐT (Để bắt sự kiện kéo) 
          Đây là cách fix lỗi "không kéo được" hiệu quả nhất.
      */}
        <Rect
          width={size}
          height={size}
          fill="transparent" // Trong suốt
          listening={true} // Bắt sự kiện chuột ở đây
        />
      </Group>
    );
  }
);

export default NumberPiece;

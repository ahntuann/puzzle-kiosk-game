// components/NumberPiece.jsx
import React, { useRef } from "react";
import { Group, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

const NumberPiece = ({ data, size = 100, onDragStart, onDragEnd }) => {
  const [image] = useImage(data.img);
  const groupRef = useRef(null);

  return (
    <Group
      ref={groupRef}
      id={data.id.toString()}
      x={data.currentX}
      y={data.currentY}
      draggable={!data.isLocked}
      onDragStart={(e) => {
        e.target.moveToTop();
        e.target.to({
          scaleX: 1.2,
          scaleY: 1.2,
          shadowOffsetX: 15,
          shadowOffsetY: 15,
          shadowBlur: 20,
          shadowOpacity: 0.3,
          duration: 0.2,
          easing: Konva.Easings.BackEaseOut,
        });
        onDragStart(e);
      }}
      onDragEnd={(e) => {
        e.target.to({
          shadowOffsetX: 5,
          shadowOffsetY: 5,
          shadowBlur: 5,
          shadowOpacity: 0.5,
          duration: 0.2,
        });
        onDragEnd(e, data.id);
      }}
    >
      <KonvaImage
        image={image}
        width={size}
        height={size}
        // KHÔNG set cornerRadius nếu dùng ảnh 7.png đã bo góc sẵn
        // Nếu ảnh vuông thì set cornerRadius={15}
        shadowColor="black"
        shadowBlur={5}
        shadowOffsetX={5}
        shadowOffsetY={5}
        shadowOpacity={0.5}
      />
    </Group>
  );
};

export default NumberPiece;

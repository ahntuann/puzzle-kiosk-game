import React from "react";
import { Group, Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";

const ProductSlot = React.memo(
  ({ x, y, product, frameX, frameY, cardW, cardH, dropSize }) => {
    const [cardBg] = useImage("/images/frames/rect2.png");
    const [frameBg] = useImage("/images/frames/rect1.png");
    const [prodImg] = useImage(product.img);

    // --- ĐÃ XÓA ĐOẠN CACHE GÂY LỖI ---

    return (
      <Group
        // listening={false} là tối ưu quan trọng nhất:
        // Nó bảo CPU: "Đừng quan tâm chuột có đi qua đây không", tiết kiệm cực nhiều tài nguyên
        listening={false}
      >
        <Group x={x} y={y}>
          <KonvaImage
            image={cardBg}
            width={cardW}
            height={cardH}
            perfectDrawEnabled={false} // Tối ưu GPU
          />

          <Text
            text={product.text}
            x={10}
            y={20}
            width={cardW - 20}
            align="center"
            fontFamily="Bai Jamjuree"
            fontSize={18}
            fontStyle="bold"
            fill="#1a3a7a"
            lineHeight={1.3}
            // Text vẽ rất nặng, listening={false} giúp nó nhẹ đi nhiều
            listening={false}
          />

          <KonvaImage
            image={prodImg}
            width={120}
            height={180}
            x={(cardW - 120) / 2}
            y={130}
            perfectDrawEnabled={false}
          />
        </Group>

        {/* Khung drop zone */}
        <KonvaImage
          image={frameBg}
          x={frameX}
          y={frameY}
          width={dropSize}
          height={dropSize}
          perfectDrawEnabled={false}
        />
      </Group>
    );
  }
);

export default ProductSlot;

import React, { useMemo } from "react";
import { Group, Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";

const ProductSlot = React.memo(
  ({ x, y, product, frameX, frameY, cardW, cardH, dropSize }) => {
    const [cardBg] = useImage("/images/frames/rect2.png");
    const [frameBg] = useImage("/images/frames/rect1.png");
    const [prodImg] = useImage(product.img);

    // --- LOGIC TÍNH TOÁN TỈ LỆ ẢNH (OBJECT-FIT: CONTAIN) ---
    const imgLayout = useMemo(() => {
      if (!prodImg) return { width: 0, height: 0, x: 0, y: 0 };

      const MAX_W = 200; // Chiều rộng tối đa cho phép
      const MAX_H = 250; // Chiều cao tối đa cho phép
      const START_X = (cardW - MAX_W) / 2; // Vị trí bắt đầu của khung chứa
      const START_Y = 130; // Vị trí bắt đầu Y

      // Tính tỉ lệ gốc của ảnh
      const ratio = Math.min(MAX_W / prodImg.width, MAX_H / prodImg.height);

      // Kích thước mới (đảm bảo không bị méo)
      const newW = prodImg.width * ratio;
      const newH = prodImg.height * ratio;

      // Tính toán để căn giữa ảnh trong khung 120x180
      const centerOffsetX = (MAX_W - newW) / 2;
      const centerOffsetY = (MAX_H - newH) / 2 - 35;

      return {
        width: newW,
        height: newH,
        x: START_X + centerOffsetX,
        y: START_Y + centerOffsetY,
      };
    }, [prodImg, cardW]);
    // -------------------------------------------------------

    return (
      <Group listening={false}>
        <Group x={x} y={y}>
          {/* Ảnh nền thẻ */}
          <KonvaImage
            image={cardBg}
            width={cardW}
            height={cardH}
            perfectDrawEnabled={false}
          />

          {/* Tên sản phẩm */}
          <Text
            text={product.text}
            x={10}
            y={30}
            width={cardW - 20}
            align="center"
            fontFamily="Bai Jamjuree"
            fontSize={18}
            fontStyle="bold"
            fill="#1a3a7a"
            lineHeight={1.3}
            listening={false}
          />

          {/* Ảnh sản phẩm (Đã sửa để không bị méo) */}
          {prodImg && (
            <KonvaImage
              image={prodImg}
              // Sử dụng các thông số đã tính toán ở trên
              width={imgLayout.width}
              height={imgLayout.height}
              x={imgLayout.x}
              y={imgLayout.y}
              perfectDrawEnabled={false}
            />
          )}
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

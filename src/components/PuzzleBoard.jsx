import { Group, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import PuzzlePiece from "./PuzzlePiece";

export default function PuzzleBoard({
  img,
  boardX,
  boardY,
  boardWidth, // Thay boardSize bằng Width
  boardHeight, // và Height riêng biệt
  pieces,
  pieceWidth, // Kích thước mảnh cũng tách ra
  pieceHeight,
  padding,
  onDragStart,
  onDragEnd,
}) {
  const [image] = useImage(img);

  return (
    <Group>
      {/* Ảnh nền mờ để hint */}
      {/* <KonvaImage
        image={image}
        x={boardX}
        y={boardY}
        width={boardWidth}
        height={boardHeight}
        opacity={0.1} // Tăng nhẹ opacity cho dễ nhìn form
      /> */}

      {pieces.map((p) => (
        <PuzzlePiece
          key={p.id}
          piece={p}
          img={img}
          width={pieceWidth} // Truyền width
          height={pieceHeight} // Truyền height
          padding={padding}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </Group>
  );
}

import { Rect, Group, Text } from "react-konva";

export default function EmmieFrame({ x, y, width, height }) {
  return (
    <Group x={x} y={y}>
      <Rect
        width={width}
        height={height}
        cornerRadius={40}
        stroke="white"
        strokeWidth={3}
        opacity={0.9}
      />

      <Group x={width / 2 - 300} y={-90}>
        <Rect width={600} height={90} cornerRadius={30}
          fill="rgba(255,255,255,0.12)"
          stroke="white"
          strokeWidth={2}
        />
        <Text
          text="GHÉP THÀNH 1 MÁY HOÀN CHỈNH"
          width={600}
          height={90}
          align="center"
          verticalAlign="middle"
          fill="white"
          fontSize={32}
          fontStyle="bold"
        />
      </Group>
    </Group>
  );
}

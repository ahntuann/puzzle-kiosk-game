import React, { useEffect, useRef, useMemo } from "react";
import { Group, Shape } from "react-konva";
import Konva from "konva";
import { KIOSK_WIDTH, KIOSK_HEIGHT } from "../utils";

const STAR_COUNT = 25;

const StarShape = ({ x, y, size, duration, delay }) => {
  const shapeRef = useRef(null);

  useEffect(() => {
    const node = shapeRef.current;
    if (!node) return;

    // Khai báo biến anim để cleanup function có thể truy cập
    let anim = null;

    // Chạy animation
    anim = node.to({
      opacity: 0.1,
      scaleX: 0.2,
      scaleY: 0.2,
      duration: duration,
      yoyo: true,
      repeat: -1,
      easing: Konva.Easings.EaseInOut,
      delay: delay,
    });

    // Cleanup an toàn
    return () => {
      if (anim) {
        anim.pause();
        // Hủy luôn tween để giải phóng bộ nhớ, tránh rò rỉ
        anim.destroy();
      }
    };
  }, [duration, delay]);

  return (
    <Shape
      ref={shapeRef}
      x={x}
      y={y}
      opacity={0.8}
      sceneFunc={(context, shape) => {
        context.beginPath();
        context.moveTo(0, -size);
        context.quadraticCurveTo(0, -size / 5, size, 0);
        context.quadraticCurveTo(0, size / 5, 0, size);
        context.quadraticCurveTo(0, size / 5, -size, 0);
        context.quadraticCurveTo(0, -size / 5, 0, -size);
        context.closePath();
        context.fillStrokeShape(shape);
      }}
      fill="#fff"
      shadowColor="#fff"
      shadowBlur={15}
    />
  );
};

export default function ModernStars() {
  const stars = useMemo(() => {
    return Array.from({ length: STAR_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * KIOSK_WIDTH,
      y: Math.random() * KIOSK_HEIGHT,
      size: Math.random() * 12 + 4,
      duration: Math.random() * 2 + 1.5,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <Group>
      {stars.map((s) => (
        <StarShape key={s.id} {...s} />
      ))}
    </Group>
  );
}

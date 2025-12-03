"use client";

import { useEffect, useRef } from "react";

export default function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const snowflakes = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1,
      speed: Math.random() * 1 + 0.5,
      drift: Math.random() * 0.5 - 0.25
    }));

    const update = () => {
      ctx.clearRect(0, 0, width, height);

      snowflakes.forEach((s) => {
        s.y += s.speed;
        s.x += s.drift;

        if (s.y > height) {
          s.y = -5;
          s.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.5 ? "#ff3b3b" : "#2ecc71";
        ctx.fill();
      });

      requestAnimationFrame(update);
    };

    update();

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}

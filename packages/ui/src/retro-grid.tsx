"use client";
import { useEffect, useRef, useState } from "react";

type Direction = "horizontal" | "vertical" | "both";
type GridType = "standard" | "diamond" | "diagonal" | "hexagonal";

export function RetroGrid({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lineColor = "var(--s-border)",
  backgroundColor = "transparent",
  animationSpeed = 2.5,
  perspective = 200,
  fadeHeight = 90,
  fadeColor = "var(--s-bg-base)",
  animationDirection = "both",
  gridType = "standard",
}: {
  angle?: number;
  cellSize?: number;
  opacity?: number;
  lineColor?: string;
  backgroundColor?: string;
  animationSpeed?: number;
  perspective?: number;
  fadeHeight?: number;
  fadeColor?: string;
  animationDirection?: Direction;
  gridType?: GridType;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ col: number; row: number } | null>(null);
  const [clickedCell, setClickedCell] = useState<{ col: number; row: number } | null>(null);

  useEffect(() => {
    const animationName = `gridMove-${Date.now()}`;
    let translation = "";
    if (animationDirection === "horizontal") {
      translation = `to { background-position: ${cellSize + 1}px 0, ${cellSize + 1}px 0; }`;
    } else if (animationDirection === "vertical") {
      translation = `to { background-position: 0 ${cellSize + 1}px, 0 ${cellSize + 1}px; }`;
    } else {
      translation = `to { background-position: ${cellSize + 1}px ${cellSize + 1}px, ${cellSize + 1}px ${cellSize + 1}px; }`;
    }
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `@keyframes ${animationName} { from { background-position: 0 0, 0 0; } ${translation} }`;
    document.head.appendChild(styleSheet);
    if (gridRef.current) {
      gridRef.current.style.animation = `${animationName} ${animationSpeed}s linear infinite`;
    }
    return () => {
      try {
        document.head.removeChild(styleSheet);
      } catch {
        /* already removed */
      }
    };
  }, [cellSize, animationSpeed, animationDirection]);

  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current) {
        gridRef.current.style.width = "100%";
        gridRef.current.style.height = "100%";
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const gridBackground = () => {
    if (gridType === "diamond") {
      const size = cellSize;
      const svg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
          <polygon points="${size / 2},0 ${size},${size / 2} ${size / 2},${size} 0,${size / 2}"
            fill="none" stroke="${lineColor}" stroke-width="1"/>
        </svg>`
      );
      return `url('data:image/svg+xml,${svg}')`;
    }
    if (gridType === "hexagonal") {
      const size = cellSize;
      const hexHeight = Math.sqrt(3) * size;
      const svg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size * 1.5}" height="${hexHeight}">
          <polygon points="${size * 0.5},0 ${size * 1.5},0 ${size * 2},${hexHeight / 2} ${size * 1.5},${hexHeight} ${size * 0.5},${hexHeight} 0,${hexHeight / 2}"
            fill="none" stroke="${lineColor}" stroke-width="1"/>
        </svg>`
      );
      return `url('data:image/svg+xml,${svg}')`;
    }
    if (gridType === "diagonal") {
      return `repeating-linear-gradient(45deg, ${lineColor}, ${lineColor} 1px, transparent 1px, transparent ${cellSize}px)`;
    }
    return `linear-gradient(to right, ${lineColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`;
  };

  const handleCellHover = (e: React.MouseEvent) => {
    if (gridType !== "standard") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);
    setHoveredCell({ col, row });
  };
  const handleCellLeave = () => setHoveredCell(null);
  const handleCellClick = (e: React.MouseEvent) => {
    if (gridType !== "standard") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);
    setClickedCell({ col, row });
    setTimeout(() => setClickedCell(null), 300);
  };

  const cell = clickedCell || hoveredCell;

  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        perspective: `${perspective}px`,
        opacity,
        backgroundColor,
        minWidth: 0,
        minHeight: 0,
        boxSizing: "border-box",
        display: "block",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotateX(${angle}deg)`,
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          display: "block",
        }}
      >
        <div
          ref={gridRef}
          onMouseMove={handleCellHover}
          onMouseLeave={handleCellLeave}
          onClick={handleCellClick}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            backgroundImage: gridBackground(),
            backgroundRepeat: "repeat",
            backgroundSize: `${cellSize}px ${cellSize}px`,
            pointerEvents: "auto",
            cursor: "pointer",
            display: "block",
          }}
        />
        {gridType === "standard" && cell && (
          <div
            style={{
              position: "absolute",
              left: cell.col * cellSize,
              top: cell.row * cellSize,
              width: cellSize,
              height: cellSize,
              background: clickedCell ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)",
              borderRadius: 6,
              pointerEvents: "none",
              transition: "background 0.2s",
              zIndex: 2,
            }}
          />
        )}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to top, ${fadeColor}, transparent ${fadeHeight}%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
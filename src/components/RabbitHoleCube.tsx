"use client";

import React, { useState } from "react";

interface RabbitHoleCubeProps {
  isRolling: boolean;
  onClick?: () => void;
}

export function RabbitHoleCube({ isRolling, onClick }: RabbitHoleCubeProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Size of the dice: 140px (half is 70px for translateZ)
  const faceStyle: React.CSSProperties = {
    position: "absolute",
    width: "140px",
    height: "140px",
    top: 0,
    left: 0,
    borderRadius: "1.25rem",
    border: "1.5px solid rgba(0, 0, 0, 0.08)",
    backgroundColor: "#ffffff",
    boxShadow:
      "0 12px 30px rgba(0, 0, 0, 0.08), inset 0 0 12px rgba(255, 255, 255, 0.95)",
    backfaceVisibility: "visible",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
  };

  const pipStyle = "w-3.5 h-3.5 rounded-full bg-neutral-800 shadow-inner";
  const amberPipStyle = "w-5 h-5 rounded-full bg-amber-500 shadow-inner";

  return (
    <div className="flex flex-col items-center justify-center select-none py-6">
      {/* 3D Perspective Wrapper */}
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer p-6 group transition-transform"
        style={{ perspective: "1000px" }}
        title="Click to roll dice"
      >
        {/* 3D Rotating Cube Container */}
        <div
          className={isRolling ? "animate-dice-fast" : "animate-dice-slow"}
          style={{
            position: "relative",
            width: "140px",
            height: "140px",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Face 1 (Front): 1 Center Pip (Amber Accent) */}
          <div
            style={{
              ...faceStyle,
              transform: "translateZ(70px)",
            }}
          >
            <div className={amberPipStyle} />
          </div>

          {/* Face 6 (Back): 6 Pips (2 columns of 3) */}
          <div
            style={{
              ...faceStyle,
              transform: "rotateY(180deg) translateZ(70px)",
            }}
          >
            <div className="flex justify-between w-full h-full p-4">
              <div className="flex flex-col justify-between">
                <div className={pipStyle} />
                <div className={pipStyle} />
                <div className={pipStyle} />
              </div>
              <div className="flex flex-col justify-between">
                <div className={pipStyle} />
                <div className={pipStyle} />
                <div className={pipStyle} />
              </div>
            </div>
          </div>

          {/* Face 3 (Right): 3 Pips (Diagonal) */}
          <div
            style={{
              ...faceStyle,
              transform: "rotateY(90deg) translateZ(70px)",
            }}
          >
            <div className="flex flex-col justify-between w-full h-full p-4">
              <div className={pipStyle} />
              <div className={`self-center ${pipStyle}`} />
              <div className={`self-end ${pipStyle}`} />
            </div>
          </div>

          {/* Face 4 (Left): 4 Pips (4 Corners) */}
          <div
            style={{
              ...faceStyle,
              transform: "rotateY(-90deg) translateZ(70px)",
            }}
          >
            <div className="flex justify-between w-full h-full p-4">
              <div className="flex flex-col justify-between">
                <div className={pipStyle} />
                <div className={pipStyle} />
              </div>
              <div className="flex flex-col justify-between">
                <div className={pipStyle} />
                <div className={pipStyle} />
              </div>
            </div>
          </div>

          {/* Face 5 (Top): 5 Pips (4 Corners + 1 Center) */}
          <div
            style={{
              ...faceStyle,
              transform: "rotateX(90deg) translateZ(70px)",
            }}
          >
            <div className="relative w-full h-full p-4 flex justify-between">
              <div className="flex flex-col justify-between">
                <div className={pipStyle} />
                <div className={pipStyle} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={pipStyle} />
              </div>
              <div className="flex flex-col justify-between">
                <div className={pipStyle} />
                <div className={pipStyle} />
              </div>
            </div>
          </div>

          {/* Face 2 (Bottom): 2 Pips (Diagonal) */}
          <div
            style={{
              ...faceStyle,
              transform: "rotateX(-90deg) translateZ(70px)",
            }}
          >
            <div className="flex flex-col justify-between w-full h-full p-4">
              <div className={pipStyle} />
              <div className={`self-end ${pipStyle}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Ground Contact Shadow */}
      <div
        className={`w-32 h-3.5 bg-neutral-900/10 rounded-full blur-sm transition-all duration-500 ${
          isHovered ? "scale-90 opacity-40" : "scale-100 opacity-80"
        }`}
      />

      <span className="mt-4 text-xs font-normal text-neutral-400 group-hover:text-neutral-700 transition-colors">
        {isRolling ? "Rolling..." : "Click dice to roll topic"}
      </span>
    </div>
  );
}

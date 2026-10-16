"use client";

import React from "react";

export function GradualBlur() {
  return (
    <div
      className="pointer-events-none fixed top-0 left-0 right-0 z-40 h-24 sm:h-28 w-full isolate overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative w-full h-full">
        <div
          className="absolute inset-0"
          style={{
            maskImage: "linear-gradient(to top, transparent 0%, black 20%, black 40%, transparent 60%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 20%, black 40%, transparent 60%)",
            backdropFilter: "blur(0.167rem)",
            WebkitBackdropFilter: "blur(0.167rem)",
            opacity: 1,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            maskImage: "linear-gradient(to top, transparent 20%, black 40%, black 60%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 20%, black 40%, black 60%, transparent 80%)",
            backdropFilter: "blur(0.332rem)",
            WebkitBackdropFilter: "blur(0.332rem)",
            opacity: 1,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            maskImage: "linear-gradient(to top, transparent 40%, black 60%, black 80%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 40%, black 60%, black 80%, transparent 100%)",
            backdropFilter: "blur(0.754rem)",
            WebkitBackdropFilter: "blur(0.754rem)",
            opacity: 1,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            maskImage: "linear-gradient(to top, transparent 60%, black 80%, black 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 60%, black 80%, black 100%)",
            backdropFilter: "blur(1.499rem)",
            WebkitBackdropFilter: "blur(1.499rem)",
            opacity: 1,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            maskImage: "linear-gradient(to top, transparent 80%, black 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 80%, black 100%)",
            backdropFilter: "blur(2.000rem)",
            WebkitBackdropFilter: "blur(2.000rem)",
            opacity: 1,
          }}
        />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { AuroraFlow } from "@/components/ui/aurora-flow";

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden pointer-events-none">
      <AuroraFlow
        preset="ocean"
        colors={["#020817", "#062a55", "#0b62b4", "#39bfe6", "#d9f6ff"]}
        speed={1}
        intensity={1}
        opacity={1}
        blur={1}
        contrast={1.04}
        brightness={1}
        grain={true}
        grainOpacity={0.22}
        layers={6}
        flowScale={1}
        flowStrength={1}
        flowDirection={-18}
        animationSpeed={1}
        pointerInteraction={true}
        pointerStrength={0.7}
        scrollInteraction={false}
        parallaxStrength={0.5}
        lighting={true}
        lightingIntensity={0.8}
        lightingRadius={1}
        lightingSpeed={0.8}
        ambientGlow={true}
        ambientOpacity={0.7}
        noise={true}
        noiseOpacity={0.16}
        noiseScale={1}
        vignette={true}
        vignetteStrength={0.55}
        borderRadius="0px"
        className="h-full w-full"
      />
    </div>
  );
}

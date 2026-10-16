install -
npx shadcn@latest add @componentry/aurora-flow


Usage-

Aurora Flow renders one WebGL quad, caps pixel density, pauses outside the viewport, and draws only a static frame when reduced motion is requested.


import { AuroraFlow } from "@/components/ui/aurora-flow"
<AuroraFlow
  preset="ocean"
  colors={["#020817","#062a55","#0b62b4","#39bfe6","#d9f6ff"]}
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
  className="min-h-[560px]"
/>
API Reference
Prop	Type	Default
colors	
readonly string[]
Up to five custom hex colors overriding the selected preset.

—
preset	
AuroraFlowPreset
Production palette: ocean, aurora, sky, cloud, sunset, midnight, ice, dream, nebula, emerald, lavender, or mono.

"ocean"
speed	
number
Global motion speed multiplier.

1
intensity	
number
Strength of flowing color and silk highlights.

1
opacity	
number
Final canvas opacity.

1
blur	
number
Diffusion softness applied to atmospheric fields.

1
contrast	
number
Final color contrast.

1.04
brightness	
number
Final scene brightness.

1
grain	
boolean
Enables fine film-inspired grain.

true
grainOpacity	
number
Strength of fine grain.

0.22
layers	
number
Procedural FBM depth, clamped from 3 to 7.

6
flowScale	
number
Scale of the broad atmospheric structures.

1
flowStrength	
number
Strength of domain warping and silk folds.

1
flowDirection	
number
Primary flow direction in degrees.

-18
animationSpeed	
number
Fine multiplier for procedural evolution.

1
pointerInteraction	
boolean
Enables restrained pointer-driven flow bending.

true
pointerStrength	
number
Maximum pointer influence.

0.7
scrollInteraction	
boolean
Enables subtle scroll-driven depth movement.

false
parallaxStrength	
number
Strength of scroll parallax.

0.5
lighting	
boolean
Enables the broad traveling bloom.

true
lightingIntensity	
number
Brightness of traveling light.

0.8
lightingRadius	
number
Diffusion radius of traveling light.

1
lightingSpeed	
number
Independent light movement speed.

0.8
ambientGlow	
boolean
Enables the broad central ambient lift.

true
ambientOpacity	
number
Strength of ambient illumination.

0.7
noise	
boolean
Enables low-frequency atmospheric haze.

true
noiseOpacity	
number
Strength of atmospheric haze.

0.16
noiseScale	
number
Scale of the haze field.

1
vignette	
boolean
Enables soft edge falloff.

true
vignetteStrength	
number
Strength of edge falloff.

0.55
borderRadius	
CSSProperties['borderRadius']
Radius applied to the background container.

0
className	
string
Additional classes for sizing and placement.

—
style	
CSSProperties
Additional inline styles for the root container.

—
children	
ReactNode
Optional content rendered above the atmospheric canvas.

—
Keep in mind

This component is inspired by various open-source projects and patterns. Please verify licenses and implementation details before using in production.
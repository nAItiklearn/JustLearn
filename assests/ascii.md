install -

npx shadcn@latest add @componentry/ascii-effect


Usage-

import { AsciiEffect } from "@/components/ui/ascii-effect"
<div className="h-[520px] overflow-hidden rounded-2xl">
  <AsciiEffect
    variant="image"
    imageSrc="/images/portrait.jpg"
    fontSize={9}
    scale={1.15}
  />
</div>
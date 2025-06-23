"use client"

import { AnimatedTabs } from "./animated-tabs"

export function DemoAnimatedTabs() {
  return (
    <div className="p-8 flex justify-center">
      <AnimatedTabs
        tabs={[
          { label: "Início" },
          { label: "Torneios" },
          { label: "Times" },
          { label: "Resultados" },
          { label: "Classificação" },
        ]}
      />
    </div>
  )
}

export default DemoAnimatedTabs

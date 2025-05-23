"use client"

import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

// Thailand and Southeast Asia focused markers
const THAILAND_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 3.5,
  // Center on Thailand region
  theta: 0.6,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  // Teal color for markers to match site theme
  markerColor: [0 / 255, 180 / 255, 180 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [13.7563, 100.5018], size: 0.1 },       // Thailand - Bangkok
    { location: [18.7883, 98.9853], size: 0.05 },       // Thailand - Chiang Mai
    { location: [7.9519, 98.3381], size: 0.05 },        // Thailand - Phuket
    { location: [7.0086, 100.4747], size: 0.04 },       // Thailand - Hat Yai
    { location: [3.1390, 101.6869], size: 0.05 },       // Malaysia - Kuala Lumpur
    { location: [1.3521, 103.8198], size: 0.04 },       // Singapore
    { location: [10.8231, 106.6297], size: 0.05 },      // Vietnam - Ho Chi Minh City
    { location: [11.5564, 104.9282], size: 0.04 },      // Cambodia - Phnom Penh
    { location: [17.9757, 102.6331], size: 0.04 },      // Laos - Vientiane
    { location: [16.8661, 96.1951], size: 0.05 },       // Myanmar - Yangon
  ],
}

export function ThailandGlobe({
  className,
  config = THAILAND_GLOBE_CONFIG,
}: {
  className?: string
  config?: COBEOptions
}) {
  const phi = 3.5
  const widthRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)
  const phiRef = useRef(phi)

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state: Record<string, number>) => {
      if (!pointerInteracting.current) phiRef.current += 0.003
      state.phi = phiRef.current + r
      state.width = widthRef.current * 2
      state.height = widthRef.current * 2
    },
    [r]
  )

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth
      }
    }

    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender,
    })

    setTimeout(() => (canvasRef.current!.style.opacity = "1"))

    return () => {
      window.removeEventListener("resize", onResize)
      globe.destroy()
    }
  }, [config, onRender])

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}

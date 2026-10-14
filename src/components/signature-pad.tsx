import * as React from 'react'
import { Eraser, PenLine } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function SignaturePad({
  value,
  onChange,
}: {
  value?: string
  onChange: (dataUrl: string | undefined) => void
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const drawing = React.useRef(false)
  const last = React.useRef<{ x: number; y: number } | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio || 1
    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = width * ratio
    canvas.height = height * ratio
    const ctx = canvas.getContext('2d')!
    ctx.scale(ratio, ratio)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2.6
    ctx.strokeStyle = '#1e2257'
  }, [])

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = point(e)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return
    const ctx = e.currentTarget.getContext('2d')!
    const p = point(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
  }

  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    onChange(canvasRef.current?.toDataURL('image/png'))
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    onChange(undefined)
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl border-2 border-dashed bg-card overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block w-full h-44 touch-none cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          aria-label="Signature area"
        />
        {!value && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-muted-foreground text-sm">
            <span className="inline-flex items-center gap-2">
              <PenLine className="size-4" /> Guest signs here with finger or stylus
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute left-6 right-6 bottom-8 border-b border-muted-foreground/30" />
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={!value}>
        <Eraser /> Clear signature
      </Button>
    </div>
  )
}

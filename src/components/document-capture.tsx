import * as React from 'react'
import { Camera, ImagePlus, ScanText, Sparkles, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MAX_PHOTOS } from '@/lib/fixtures'
import { cn } from '@/lib/utils'

// Shrinks a photo before keeping it so four document shots stay light.
async function downscale(src: string, max = 1400): Promise<string> {
  const img = new Image()
  img.src = src
  await img.decode()
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = img.width * scale
  canvas.height = img.height * scale
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.82)
}

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export function DocumentCapture({
  photos,
  onPhotosChange,
  onScan,
  scanningIndex,
}: {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  onScan: (index: number) => void
  scanningIndex: number | null
}) {
  const cameraInput = React.useRef<HTMLInputElement>(null)
  const galleryInput = React.useRef<HTMLInputElement>(null)
  const [liveOpen, setLiveOpen] = React.useState(false)
  const remaining = MAX_PHOTOS - photos.length

  const addFiles = async (files: FileList | null, scanFirst = false) => {
    if (!files?.length) return
    const picked = Array.from(files).slice(0, remaining)
    const next = await Promise.all(picked.map(async (f) => downscale(await readFile(f))))
    const all = [...photos, ...next]
    onPhotosChange(all)
    if (scanFirst && photos.length === 0) onScan(0)
  }

  const addCapture = (dataUrl: string) => {
    const index = photos.length
    onPhotosChange([...photos, dataUrl])
    setLiveOpen(false)
    onScan(index)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: MAX_PHOTOS }, (_, i) => {
          const src = photos[i]
          const scanning = scanningIndex === i
          return (
            <div
              key={i}
              className={cn(
                'relative aspect-[4/3] rounded-xl overflow-hidden',
                src ? 'bg-muted' : 'border-2 border-dashed grid place-items-center text-muted-foreground',
              )}
            >
              {src ? (
                <>
                  <img src={src} alt={`Document photo ${i + 1}`} className="size-full object-cover" />
                  {scanning && (
                    <div className="absolute inset-0 bg-primary/30">
                      <div className="scan-line absolute inset-x-0 top-0 h-1 bg-accent shadow-[0_0_16px_4px] shadow-accent" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onPhotosChange(photos.filter((_, j) => j !== i))}
                    className="absolute top-1.5 right-1.5 grid place-items-center size-7 rounded-full bg-background/90 text-foreground"
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <X className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={scanningIndex !== null}
                    onClick={() => onScan(i)}
                    className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-2.5 py-1 text-xs font-semibold disabled:opacity-60"
                  >
                    <Sparkles className="size-3.5" /> {scanning ? 'Reading…' : 'Auto-fill'}
                  </button>
                </>
              ) : (
                <span className="text-xs">Photo {i + 1}</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" className="h-11" disabled={remaining === 0} onClick={() => setLiveOpen(true)}>
          <ScanText /> AI text scanner
        </Button>
        <Button type="button" variant="outline" className="h-11" disabled={remaining === 0} onClick={() => cameraInput.current?.click()}>
          <Camera /> Take photo
        </Button>
        <Button type="button" variant="outline" className="h-11" disabled={remaining === 0} onClick={() => galleryInput.current?.click()}>
          <ImagePlus /> From gallery
        </Button>
        <span className="self-center text-xs text-muted-foreground ml-auto">
          {photos.length}/{MAX_PHOTOS} photos
        </span>
      </div>

      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          addFiles(e.target.files, true)
          e.target.value = ''
        }}
      />
      <input
        ref={galleryInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files, true)
          e.target.value = ''
        }}
      />

      <LiveScanner open={liveOpen} onOpenChange={setLiveOpen} onCapture={addCapture} />
    </div>
  )
}

function LiveScanner({
  open,
  onOpenChange,
  onCapture,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (dataUrl: string) => void
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    let stream: MediaStream | undefined
    setError(null)
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } } })
      .then((s) => {
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setError('Camera permission is needed to scan documents. Allow camera access in your browser settings, or use “Take photo”.'))
    if (!navigator.mediaDevices) setError('This device does not support live camera scanning. Use “Take photo” instead.')
    return () => stream?.getTracks().forEach((t) => t.stop())
  }, [open])

  const capture = () => {
    const video = videoRef.current
    if (!video?.videoWidth) return
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, 1400 / video.videoWidth)
    canvas.width = video.videoWidth * scale
    canvas.height = video.videoHeight * scale
    canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height)
    onCapture(canvas.toDataURL('image/jpeg', 0.85))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">AI text scanner</DialogTitle>
          <DialogDescription>
            Hold the Aadhaar card or ID inside the frame. Name, DOB, address and number fill in automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-foreground">
          {error ? (
            <p className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-background">{error}</p>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" />
              <div className="absolute inset-[12%] rounded-2xl border-2 border-accent shadow-[0_0_0_9999px] shadow-black/40" />
            </>
          )}
        </div>
        <Button className="h-12 bg-accent text-accent-foreground hover:bg-accent/90" disabled={!!error} onClick={capture}>
          <ScanText /> Capture &amp; extract
        </Button>
      </DialogContent>
    </Dialog>
  )
}

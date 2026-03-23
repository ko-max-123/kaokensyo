import { forwardRef } from 'react'
import type { NormalizedLandmark } from '@/lib/math/faceMetrics'

interface OverlayCanvasProps {
  landmarksRef: React.RefObject<NormalizedLandmark[] | null>
  width: number
  height: number
}

const OverlayCanvas = forwardRef<HTMLCanvasElement, OverlayCanvasProps>(
  function OverlayCanvas({ width, height }, ref) {
    return (
      <canvas
        ref={ref}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 'auto',
          pointerEvents: 'none',
        }}
      />
    )
  }
)

export default OverlayCanvas

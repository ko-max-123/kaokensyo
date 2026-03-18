import { forwardRef } from 'react'

interface CameraPreviewProps {
  stream: MediaStream | null
  isRunning: boolean
  errorMessage: string | null
}

const CameraPreview = forwardRef<HTMLVideoElement, CameraPreviewProps>(
  function CameraPreview({ stream, isRunning, errorMessage }, ref) {
    return (
      <div style={{ position: 'relative' }}>
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          width={640}
          height={480}
          style={{ display: 'block', background: '#000' }}
        />
        {errorMessage && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            {errorMessage}
          </div>
        )}
        {!errorMessage && stream && !isRunning && (
          <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
            カメラ準備完了
          </div>
        )}
      </div>
    )
  }
)

export default CameraPreview

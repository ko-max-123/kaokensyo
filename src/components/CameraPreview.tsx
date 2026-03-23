import { forwardRef } from 'react'

interface CameraPreviewProps {
  stream: MediaStream | null
  isRunning: boolean
  errorMessage: string | null
  /** 実解像度が分かったとき（オーバーレイ・解析キャンバスと同期） */
  onVideoDimensions?: (width: number, height: number) => void
}

const CameraPreview = forwardRef<HTMLVideoElement, CameraPreviewProps>(
  function CameraPreview({ stream, isRunning, errorMessage, onVideoDimensions }, ref) {
    return (
      <div style={{ position: 'relative', width: '100%', maxWidth: 640 }}>
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            maxHeight: '80vh',
            background: '#000',
            objectFit: 'contain',
          }}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            if (v.videoWidth && v.videoHeight) {
              onVideoDimensions?.(v.videoWidth, v.videoHeight)
            }
          }}
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

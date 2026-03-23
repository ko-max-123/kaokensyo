import { useRef, useCallback } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import type { FaceMetrics } from '@/types/metrics'
import { landmarksToMetrics } from '@/lib/math/faceMetrics'
import type { NormalizedLandmark } from '@/lib/math/faceMetrics'

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

export function useFaceAnalysis() {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const rafRef = useRef<number>(0)
  const runningRef = useRef(false)
  const lastVideoTimeRef = useRef<number>(-1)
  const landmarksRef = useRef<NormalizedLandmark[] | null>(null)
  const metricsRef = useRef<FaceMetrics | null>(null)

  const runAnalysis = useCallback(
    async (
      video: HTMLVideoElement,
      canvas: HTMLCanvasElement,
      _stream: MediaStream,
      onFrame: (metrics: FaceMetrics | null) => void
    ) => {
      if (!video || !canvas) return
      try {
        if (!faceLandmarkerRef.current) {
          const vision = await FilesetResolver.forVisionTasks(WASM_URL)
          faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL },
            runningMode: 'VIDEO',
            numFaces: 1,
            // スマホ・暗所でも検出しやすくする（誤検出はやや増えるが未検出を優先）
            minFaceDetectionConfidence: 0.35,
            minFacePresenceConfidence: 0.35,
            minTrackingConfidence: 0.35,
          })
        }
      } catch (e) {
        console.error('FaceLandmarker init failed', e)
        onFrame(null)
        return
      }
      const faceLandmarker = faceLandmarkerRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      runningRef.current = true
      lastVideoTimeRef.current = -1

      const tick = () => {
        if (!runningRef.current) {
          rafRef.current = requestAnimationFrame(tick)
          return
        }
        // スマホはメタデータ読み込みまで videoWidth が 0 のことがある
        if (!video.videoWidth) {
          rafRef.current = requestAnimationFrame(tick)
          return
        }
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }
        const videoTime = video.currentTime * 1000
        if (videoTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = videoTime
          try {
            const result = faceLandmarker.detectForVideo(video, videoTime)
            const faces = result.faceLandmarks ?? []
            if (faces.length > 0) {
              const lm = faces[0] as NormalizedLandmark[]
              landmarksRef.current = lm
              const metrics = landmarksToMetrics(lm)
              metricsRef.current = metrics
              onFrame(metrics)
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                const w = canvas.width
                const h = canvas.height
                ctx.strokeStyle = 'rgba(0,255,0,0.8)'
                ctx.lineWidth = 2
                ctx.beginPath()
                for (const p of lm) {
                  ctx.lineTo(p.x * w, p.y * h)
                }
                ctx.closePath()
                ctx.stroke()
              }
            } else {
              landmarksRef.current = null
              metricsRef.current = null
              onFrame(null)
              if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
          } catch (err) {
            landmarksRef.current = null
            metricsRef.current = null
            onFrame(null)
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    []
  )

  const stopAnalysis = useCallback(() => {
    runningRef.current = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    landmarksRef.current = null
    metricsRef.current = null
  }, [])

  return { runAnalysis, stopAnalysis, landmarksRef, metricsRef }
}

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import type { Session, SessionSample } from '@/types/session'
import type { AppSettings } from '@/types/settings'
import type { FaceMetrics } from '@/types/metrics'
import { useFaceAnalysis } from '@/features/face-analysis/useFaceAnalysis'
import { useAudioAnalysis } from '@/features/audio/useAudioAnalysis'
import CameraPreview from '@/components/CameraPreview'
import OverlayCanvas from '@/components/OverlayCanvas'
import MetricCard from '@/components/MetricCard'
import { saveSession, getAllSessions, getSettings, deleteSession } from '@/lib/storage/db'

const APP_VERSION = '0.1.0'

function createEmptySample(timestampMs: number): SessionSample {
  return {
    timestampMs,
    faceDetected: false,
    faceYaw: 0,
    facePitch: 0,
    faceRoll: 0,
    gazeHorizontalScore: 0,
    gazeVerticalScore: 0,
    cameraFocusScore: 0,
    leftEyeOpen: 0,
    rightEyeOpen: 0,
    mouthOpen: 0,
    mouthWidth: 0,
    smileScore: 0,
    leftCornerLift: 0,
    rightCornerLift: 0,
    leftBrowRaise: 0,
    rightBrowRaise: 0,
    voiceLoudness: 0,
    voiceActive: false,
    speakingRate: 0,
  }
}

function computeSummary(samples: SessionSample[], settings: AppSettings) {
  const valid = samples.filter((s) => s.faceDetected)
  const n = valid.length
  const total = samples.length
  const thY = settings.frontFaceYawThreshold
  const thP = settings.frontFacePitchThreshold
  const front = valid.filter((s) => Math.abs(s.faceYaw) <= thY && Math.abs(s.facePitch) <= thP).length
  const left = valid.filter((s) => s.faceYaw < -thY).length
  const right = valid.filter((s) => s.faceYaw > thY).length
  const up = valid.filter((s) => s.facePitch > thP).length
  const down = valid.filter((s) => s.facePitch < -thP).length
  const gazeCenter = valid.filter((s) => s.cameraFocusScore >= settings.gazeCenterThreshold).length
  const avgSmile = n ? valid.reduce((a, s) => a + s.smileScore, 0) / n : 0
  const avgEye = n ? valid.reduce((a, s) => a + (s.leftEyeOpen + s.rightEyeOpen) / 2, 0) / n : 0
  let blinkCount = 0
  let prevClosed = false
  for (const s of valid) {
    const closed = (s.leftEyeOpen + s.rightEyeOpen) / 2 < settings.blinkCloseThreshold
    if (closed && !prevClosed) blinkCount++
    prevClosed = closed
  }
  const avgBrow = n ? valid.reduce((a, s) => a + (s.leftBrowRaise + s.rightBrowRaise) / 2, 0) / n : 0
  // 音声集計
  const voiced = samples.filter((s) => s.voiceActive)
  const loudnessValues = voiced.map((s) => s.voiceLoudness)
  const avgVoiceLoudness = loudnessValues.length ? loudnessValues.reduce((a, v) => a + v, 0) / loudnessValues.length : 0
  const meanL = avgVoiceLoudness
  const voiceLoudnessVar =
    loudnessValues.length > 1
      ? loudnessValues.reduce((a, v) => a + (v - meanL) * (v - meanL), 0) / loudnessValues.length
      : 0
  const speechRatio = total ? voiced.length / total : 0
  const speakingRatePerMin = total && samples[total - 1]
    ? (samples[total - 1]!.speakingRate / ((samples[total - 1]!.timestampMs - samples[0]!.timestampMs) / 60_000 || 1))
    : 0
  const notes: string[] = []
  if (total > 0 && n / total < 0.5) notes.push('顔が検出されない時間が多めでした')
  return {
    validFrameRatio: total ? n / total : 0,
    frontFaceRatio: n ? front / n : 0,
    leftFaceRatio: n ? left / n : 0,
    rightFaceRatio: n ? right / n : 0,
    upFaceRatio: n ? up / n : 0,
    downFaceRatio: n ? down / n : 0,
    gazeCenterRatio: n ? gazeCenter / n : 0,
    avgSmileScore: avgSmile,
    avgEyeOpen: avgEye,
    blinkCount,
    avgBrowMovement: avgBrow,
    avgVoiceLoudness,
    voiceLoudnessVar,
    speechRatio,
    speakingRatePerMin,
    notes,
  }
}

export default function AnalyzePage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const samplesRef = useRef<SessionSample[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const { analysisStatus, setAnalysisStatus, setError, setCurrentSession, setLatestMetrics, settings, setHistoryList } = useAppStore()
  const latestMetrics = useAppStore((s) => s.latestMetrics)
  const errorMessage = useAppStore((s) => s.errorMessage)
  const { runAnalysis, stopAnalysis, landmarksRef, metricsRef } = useFaceAnalysis()
  const audio = useAudioAnalysis()

  useEffect(() => {
    let s: MediaStream | null = null
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 }, audio: true })
      .then((mediaStream) => {
        s = mediaStream
        setStream(mediaStream)
        if (videoRef.current) videoRef.current.srcObject = mediaStream
        setAnalysisStatus('camera_ready')
        setError(null)
      })
      .catch(() => {
        setError('カメラへのアクセスが拒否されました')
        setAnalysisStatus('error')
      })
    return () => {
      audio.stop()
      s?.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
  }, [audio, setAnalysisStatus, setError])

  const handleStart = () => {
    if (!videoRef.current || !stream || !canvasRef.current) return
    setAnalysisStatus('running')
    setError(null)
    samplesRef.current = []
    const intervalMs = settings.sampleIntervalMs
    let lastLogTime = 0

    const onFrame = (metrics: FaceMetrics | null) => {
      setLatestMetrics(metrics)
      const now = performance.now()
      const nowMs = Date.now()
      if (now - lastLogTime >= intervalMs) {
        lastLogTime = now
        const audioMetrics = audio.metricsRef.current
        const base = metrics
          ? {
              timestampMs: nowMs,
              faceDetected: true,
              faceYaw: metrics.faceYaw,
              facePitch: metrics.facePitch,
              faceRoll: metrics.faceRoll,
              gazeHorizontalScore: metrics.cameraFocusScore,
              gazeVerticalScore: metrics.cameraFocusScore,
              cameraFocusScore: metrics.cameraFocusScore,
              leftEyeOpen: metrics.leftEyeOpen,
              rightEyeOpen: metrics.rightEyeOpen,
              mouthOpen: metrics.mouthOpen,
              mouthWidth: metrics.mouthWidth,
              smileScore: metrics.smileScore,
              leftCornerLift: 0,
              rightCornerLift: 0,
              leftBrowRaise: metrics.leftBrowRaise,
              rightBrowRaise: metrics.rightBrowRaise,
            }
          : createEmptySample(nowMs)
        const sample: SessionSample = {
          ...base,
          voiceLoudness: audioMetrics?.loudness ?? 0,
          voiceActive: audioMetrics?.isSpeaking ?? false,
          speakingRate: audioMetrics?.speakingEvents ?? 0,
        }
        samplesRef.current.push(sample)
      }
    }

    audio.start(stream)
    runAnalysis(videoRef.current, canvasRef.current, stream, onFrame)
  }

  const handleStop = async () => {
    stopAnalysis()
    audio.stop()
    setAnalysisStatus('stopped')
    const samples = [...samplesRef.current]
    if (samples.length === 0) return
    const startedAt = new Date(samples[0]!.timestampMs).toISOString()
    const endedAt = new Date(samples[samples.length - 1]!.timestampMs).toISOString()
    const sessionId = `session_${samples[0]!.timestampMs}`
    const validCount = samples.filter((s) => s.faceDetected).length
    const durationMs = samples[samples.length - 1]!.timestampMs - samples[0]!.timestampMs
    const summary = computeSummary(samples, settings)
    const session: Session = {
      id: sessionId,
      startedAt,
      endedAt,
      durationMs,
      sampleCount: samples.length,
      validSampleCount: validCount,
      summary,
      samples,
      appVersion: APP_VERSION,
    }
    setCurrentSession(session)
    try {
      await saveSession(session)
      const all = await getAllSessions()
      const settingsDb = await getSettings()
      if (all.length > settingsDb.maxSessionsStored) {
        const toRemove = all.slice(settingsDb.maxSessionsStored)
        for (const s of toRemove) await deleteSession(s.id)
      }
      const updated = await getAllSessions()
      setHistoryList(updated)
    } catch (e) {
      console.error('Save failed', e)
    }
    navigate(`/result/${sessionId}`)
  }

  const metrics = latestMetrics ?? metricsRef.current
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>解析</h1>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
        <CameraPreview ref={videoRef} stream={stream} isRunning={analysisStatus === 'running'} errorMessage={errorMessage} />
        {settings.overlayVisible && <OverlayCanvas ref={canvasRef} landmarksRef={landmarksRef} width={640} height={480} />}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <MetricCard label="顔向き" value={metrics ? `${metrics.faceYaw.toFixed(0)}° / ${metrics.facePitch.toFixed(0)}°` : '-'} />
        <MetricCard label="カメラ向き" value={metrics ? (metrics.cameraFocusScore * 100).toFixed(0) + '%' : '-'} />
        <MetricCard label="口角" value={metrics ? (metrics.smileScore * 100).toFixed(0) : '-'} />
        <MetricCard label="目の開き" value={metrics ? (((metrics.leftEyeOpen + metrics.rightEyeOpen) / 2) * 100).toFixed(0) : '-'} />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={handleStart} disabled={analysisStatus !== 'camera_ready' && analysisStatus !== 'stopped'} style={{ padding: '10px 20px', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: 8 }}>
          スタート
        </button>
        <button onClick={handleStop} disabled={analysisStatus !== 'running'} style={{ padding: '10px 20px', background: 'var(--error)', color: '#fff', border: 'none', borderRadius: 8 }}>
          停止
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {analysisStatus === 'idle' && 'カメラを準備中...'}
          {analysisStatus === 'camera_ready' && '顔を映してスタートを押してください'}
          {analysisStatus === 'running' && '解析中'}
          {analysisStatus === 'stopped' && '停止しました'}
          {analysisStatus === 'error' && errorMessage}
        </span>
      </div>
      <p style={{ marginTop: 16 }}>
        <a href="/">ホームへ戻る</a>
      </p>
    </div>
  )
}

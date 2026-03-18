import type { Session, SessionSample } from '@/types/session'

export interface ScoreBreakdownItem {
  key: 'front' | 'focus' | 'stability' | 'smile' | 'blink' | 'eye'
  label: string
  points: number
  maxPoints: number
  detail: string
}

export interface SessionScoreResult {
  score: number // 0-100
  breakdown: ScoreBreakdownItem[]
  note: string
}

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0
  return Math.max(0, Math.min(1, x))
}

function clamp(x: number, min: number, max: number): number {
  if (Number.isNaN(x)) return min
  return Math.max(min, Math.min(max, x))
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, v) => a + v, 0) / values.length
}

function stddev(values: number[]): number {
  if (values.length <= 1) return 0
  const m = mean(values)
  const v = mean(values.map((x) => (x - m) ** 2))
  return Math.sqrt(v)
}

function validSamples(session: Session): SessionSample[] {
  return session.samples.filter((s) => s.faceDetected)
}

/**
 * 0〜100 の参考スコア（練習用）を算出。
 * - 診断用途ではなく「見返しやすさ」優先の簡易スコア
 * - 値は後から調整しやすいよう、内訳（breakdown）も返す
 */
export function computeSessionScore(session: Session): SessionScoreResult {
  const summary = session.summary
  const valid = validSamples(session)
  const durationMin = session.durationMs > 0 ? session.durationMs / 60_000 : 0

  // 1) 正面維持（0-40）
  const frontMax = 40
  const frontPts = Math.round(clamp01(summary.frontFaceRatio) * frontMax)

  // 2) カメラ向き（視線近似）（0-30）
  const focusMax = 30
  const focusPts = Math.round(clamp01(summary.gazeCenterRatio) * focusMax)

  // 3) 安定度（時系列の揺れ: yaw/pitch/focus の分散）（0-15）
  // yaw/pitch は度数（大きいほど揺れ）として std を見て、0〜1 に正規化
  const stabilityMax = 15
  const yawStd = stddev(valid.map((s) => s.faceYaw))
  const pitchStd = stddev(valid.map((s) => s.facePitch))
  const focusStd = stddev(valid.map((s) => s.cameraFocusScore))
  // 目安: yaw/pitch の std が 15° 前後なら十分安定、30°超は不安定寄り
  const angleInstability = clamp((yawStd + pitchStd) / 60, 0, 1)
  // focus の std は 0.15 くらいまでを安定とし、0.35 で不安定寄り
  const focusInstability = clamp(focusStd / 0.35, 0, 1)
  const stabilityScore01 = 1 - clamp(0.7 * angleInstability + 0.3 * focusInstability, 0, 1)
  const stabilityPts = Math.round(stabilityScore01 * stabilityMax)

  // 4) 口角（平均）（0-10）
  // 高いほど良いが、0.0〜1.0 をそのまま点数へ
  const smileMax = 10
  const smilePts = Math.round(clamp01(summary.avgSmileScore) * smileMax)

  // 5) まばたき（頻度が極端でない）（0-4）
  // 目安: 10〜25 回/分を満点、そこから外れるほど減点（0まで）
  const blinkMax = 4
  const bpm = durationMin > 0 ? summary.blinkCount / durationMin : 0
  const blinkScore01 =
    durationMin <= 0
      ? 0
      : bpm >= 10 && bpm <= 25
        ? 1
        : bpm < 10
          ? clamp01(bpm / 10)
          : clamp01(1 - (bpm - 25) / 25)
  const blinkPts = Math.round(blinkScore01 * blinkMax)

  // 6) 目の開き（平均）（0-1）
  // 極端に低い/高いの検知用。スコア寄与は小さくする。
  const eyeMax = 1
  const eyePts = Math.round(clamp01(summary.avgEyeOpen) * eyeMax)

  const breakdown: ScoreBreakdownItem[] = [
    { key: 'front', label: '正面維持', points: frontPts, maxPoints: frontMax, detail: `${(summary.frontFaceRatio * 100).toFixed(1)}%` },
    { key: 'focus', label: 'カメラ向き', points: focusPts, maxPoints: focusMax, detail: `${(summary.gazeCenterRatio * 100).toFixed(1)}%` },
    { key: 'stability', label: '安定度(揺れ)', points: stabilityPts, maxPoints: stabilityMax, detail: `yawσ=${yawStd.toFixed(1)}°, pitchσ=${pitchStd.toFixed(1)}°` },
    { key: 'smile', label: '口角', points: smilePts, maxPoints: smileMax, detail: `avg=${(summary.avgSmileScore * 100).toFixed(0)}` },
    { key: 'blink', label: 'まばたき', points: blinkPts, maxPoints: blinkMax, detail: durationMin > 0 ? `${bpm.toFixed(1)}/分` : '-' },
    { key: 'eye', label: '目の開き', points: eyePts, maxPoints: eyeMax, detail: `avg=${(summary.avgEyeOpen * 100).toFixed(0)}` },
  ]

  const score = breakdown.reduce((a, b) => a + b.points, 0)
  const note =
    valid.length === 0
      ? '顔がほとんど検出できなかったため、参考値として扱ってください'
      : '参考スコアです（診断・合否判定ではありません）'

  return { score, breakdown, note }
}


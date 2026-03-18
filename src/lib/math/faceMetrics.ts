import type { FaceMetrics, GazeHorizontal, GazeVertical } from '@/types/metrics'

export interface NormalizedLandmark {
  x: number
  y: number
  z: number
  visibility?: number
}

const NOSE_TIP = 4
const LEFT_EYE_TOP = 159
const LEFT_EYE_BOTTOM = 145
const LEFT_EYE_INNER = 133
const RIGHT_EYE_TOP = 386
const RIGHT_EYE_BOTTOM = 374
const RIGHT_EYE_INNER = 362
const LEFT_MOUTH = 61
const RIGHT_MOUTH = 291
const UPPER_LIP = 13
const LOWER_LIP = 14
const LEFT_BROW = 70
const RIGHT_BROW = 300

function dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function eyeOpenness(
  top: NormalizedLandmark,
  bottom: NormalizedLandmark,
  inner: NormalizedLandmark
): number {
  const d = dist(top, bottom)
  const ref = Math.max(dist(inner, top), dist(inner, bottom), 0.01)
  return Math.min(1, Math.max(0, d / ref / 0.4))
}

export function landmarksToMetrics(landmarks: NormalizedLandmark[]): FaceMetrics {
  const get = (i: number) => landmarks[i] ?? { x: 0.5, y: 0.5, z: 0 }
  const nose = get(NOSE_TIP)
  const leftEyeOpen = eyeOpenness(get(LEFT_EYE_TOP), get(LEFT_EYE_BOTTOM), get(LEFT_EYE_INNER))
  const rightEyeOpen = eyeOpenness(get(RIGHT_EYE_TOP), get(RIGHT_EYE_BOTTOM), get(RIGHT_EYE_INNER))
  const mouthLeft = get(LEFT_MOUTH)
  const mouthRight = get(RIGHT_MOUTH)
  const upperLip = get(UPPER_LIP)
  const lowerLip = get(LOWER_LIP)
  const mouthOpen = Math.min(1, Math.max(0, dist(upperLip, lowerLip) * 8))
  const mouthWidth = Math.min(1, dist(mouthLeft, mouthRight) * 2.5)
  const smileY = (mouthLeft.y + mouthRight.y) / 2
  const smileScore = Math.min(1, Math.max(0, (0.5 - smileY) * 3 + mouthWidth * 0.5))
  const yaw = (0.5 - nose.x) * 90
  const pitch = (0.5 - nose.y) * 90
  const leftBrowY = get(LEFT_BROW).y
  const rightBrowY = get(RIGHT_BROW).y
  const browBase = (get(LEFT_EYE_TOP).y + get(RIGHT_EYE_TOP).y) / 2
  const leftBrowRaise = Math.max(0, browBase - leftBrowY) * 20
  const rightBrowRaise = Math.max(0, browBase - rightBrowY) * 20
  const cameraFocusScore = Math.max(0, 1 - (Math.abs(yaw) + Math.abs(pitch)) / 90)
  const gazeH: GazeHorizontal = yaw < -15 ? 'left' : yaw > 15 ? 'right' : 'center'
  const gazeV: GazeVertical = pitch > 15 ? 'up' : pitch < -15 ? 'down' : 'center'
  return {
    faceYaw: yaw,
    facePitch: pitch,
    faceRoll: 0,
    gazeHorizontal: gazeH,
    gazeVertical: gazeV,
    cameraFocusScore,
    leftEyeOpen,
    rightEyeOpen,
    mouthOpen,
    mouthWidth,
    smileScore,
    leftBrowRaise,
    rightBrowRaise,
  }
}

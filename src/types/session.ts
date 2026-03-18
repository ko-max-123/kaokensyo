export interface SessionSample {
  timestampMs: number
  faceDetected: boolean
  faceYaw: number
  facePitch: number
  faceRoll: number
  gazeHorizontalScore: number
  gazeVerticalScore: number
  cameraFocusScore: number
  leftEyeOpen: number
  rightEyeOpen: number
  mouthOpen: number
  mouthWidth: number
  smileScore: number
  leftCornerLift: number
  rightCornerLift: number
  leftBrowRaise: number
  rightBrowRaise: number
  // 音声指標
  voiceLoudness: number // 0-1 正規化音量
  voiceActive: boolean // 発話フレームかどうか
  speakingRate: number // 推定話速（1分あたりの発話イベント数の近似）
}

export interface SessionSummary {
  validFrameRatio: number
  frontFaceRatio: number
  leftFaceRatio: number
  rightFaceRatio: number
  upFaceRatio: number
  downFaceRatio: number
  gazeCenterRatio: number
  avgSmileScore: number
  avgEyeOpen: number
  blinkCount: number
  avgBrowMovement: number
  // 音声集計
  avgVoiceLoudness: number
  voiceLoudnessVar: number
  speechRatio: number // 発話していた時間の割合
  speakingRatePerMin: number
  notes: string[]
}

export interface Session {
  id: string
  startedAt: string
  endedAt: string
  durationMs: number
  sampleCount: number
  validSampleCount: number
  summary: SessionSummary
  samples: SessionSample[]
  appVersion: string
}

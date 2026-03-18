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

export type GazeHorizontal = 'left' | 'center' | 'right'
export type GazeVertical = 'up' | 'center' | 'down'

export interface FaceMetrics {
  faceYaw: number
  facePitch: number
  faceRoll: number
  gazeHorizontal: GazeHorizontal
  gazeVertical: GazeVertical
  cameraFocusScore: number
  leftEyeOpen: number
  rightEyeOpen: number
  mouthOpen: number
  mouthWidth: number
  smileScore: number
  leftBrowRaise: number
  rightBrowRaise: number
}

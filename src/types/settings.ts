export interface AppSettings {
  sampleIntervalMs: number
  graphTimeRangeMs: number
  maxSessionsStored: number
  frontFaceYawThreshold: number
  frontFacePitchThreshold: number
  gazeCenterThreshold: number
  blinkCloseThreshold: number
  overlayVisible: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  sampleIntervalMs: 200,
  graphTimeRangeMs: 60_000,
  maxSessionsStored: 30,
  frontFaceYawThreshold: 15,
  frontFacePitchThreshold: 15,
  gazeCenterThreshold: 0.7,
  blinkCloseThreshold: 0.25,
  overlayVisible: true,
}

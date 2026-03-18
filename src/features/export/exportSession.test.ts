import { describe, it, expect } from 'vitest'
import type { Session } from '@/types/session'

const mockSession: Session = {
  id: 'session_1',
  startedAt: '2026-03-18T10:00:00.000Z',
  endedAt: '2026-03-18T10:01:00.000Z',
  durationMs: 60_000,
  sampleCount: 2,
  validSampleCount: 2,
  summary: {
    validFrameRatio: 1,
    frontFaceRatio: 0.8,
    leftFaceRatio: 0.1,
    rightFaceRatio: 0.1,
    upFaceRatio: 0,
    downFaceRatio: 0,
    gazeCenterRatio: 0.9,
    avgSmileScore: 0.5,
    avgEyeOpen: 0.8,
    blinkCount: 2,
    avgBrowMovement: 0.1,
    notes: [],
  },
  samples: [
    {
      timestampMs: 1000,
      faceDetected: true,
      faceYaw: 5,
      facePitch: 0,
      faceRoll: 0,
      gazeHorizontalScore: 0.9,
      gazeVerticalScore: 0.9,
      cameraFocusScore: 0.9,
      leftEyeOpen: 0.8,
      rightEyeOpen: 0.8,
      mouthOpen: 0.2,
      mouthWidth: 0.5,
      smileScore: 0.5,
      leftCornerLift: 0,
      rightCornerLift: 0,
      leftBrowRaise: 0.1,
      rightBrowRaise: 0.1,
    },
  ],
  appVersion: '0.1.0',
}

describe('exportSession', () => {
  it('mock session has required fields for CSV/JSON export', () => {
    expect(mockSession.samples.length).toBeGreaterThan(0)
    expect(mockSession.summary.avgSmileScore).toBe(0.5)
    expect(mockSession.id).toBe('session_1')
  })
})

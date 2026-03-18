import type { Session } from '@/types/session'

function escapeCsvCell(v: string | number | boolean): string {
  const s = String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function exportSessionCSV(session: Session): void {
  const headers = [
    'timestamp_ms',
    'face_detected',
    'face_yaw',
    'face_pitch',
    'gaze_horizontal_score',
    'gaze_vertical_score',
    'camera_focus_score',
    'left_eye_open',
    'right_eye_open',
    'mouth_open',
    'smile_score',
    'left_brow_raise',
    'right_brow_raise',
  ]
  const rows = session.samples.map((s) => [
    s.timestampMs,
    s.faceDetected,
    s.faceYaw,
    s.facePitch,
    s.gazeHorizontalScore,
    s.gazeVerticalScore,
    s.cameraFocusScore,
    s.leftEyeOpen,
    s.rightEyeOpen,
    s.mouthOpen,
    s.smileScore,
    s.leftBrowRaise,
    s.rightBrowRaise,
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.map(escapeCsvCell).join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `session_${session.startedAt.slice(0, 10)}_${session.startedAt.slice(11, 19).replace(/:/g, '')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportSessionJSON(session: Session): void {
  const json = JSON.stringify(session, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `session_${session.startedAt.slice(0, 10)}_${session.startedAt.slice(11, 19).replace(/:/g, '')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

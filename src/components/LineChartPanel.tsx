import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { SessionSample } from '@/types/session'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface LineChartPanelProps {
  samples: SessionSample[]
}

const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' as const },
  },
  scales: {
    x: { display: true, title: { display: true, text: '時間' } },
    y: { min: 0, max: 1 },
  },
}

export default function LineChartPanel({ samples }: LineChartPanelProps) {
  const valid = useMemo(() => samples.filter((s) => s.faceDetected), [samples])
  const labels = useMemo(() => valid.map((_, i) => `${Math.floor((valid[i]!.timestampMs - (valid[0]?.timestampMs ?? 0)) / 1000)}s`), [valid])
  const faceYaw = useMemo(() => valid.map((s) => (s.faceYaw + 90) / 180), [valid])
  const facePitch = useMemo(() => valid.map((s) => (s.facePitch + 90) / 180), [valid])
  const cameraFocus = useMemo(() => valid.map((s) => s.cameraFocusScore), [valid])
  const smile = useMemo(() => valid.map((s) => s.smileScore), [valid])
  const eyeOpen = useMemo(() => valid.map((s) => (s.leftEyeOpen + s.rightEyeOpen) / 2), [valid])

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        { label: '顔左右', data: faceYaw, borderColor: 'rgb(37, 99, 235)', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true },
        { label: '顔上下', data: facePitch, borderColor: 'rgb(234, 88, 12)', backgroundColor: 'rgba(234, 88, 12, 0.1)', fill: true },
        { label: 'カメラ向き', data: cameraFocus, borderColor: 'rgb(22, 163, 74)', backgroundColor: 'rgba(22, 163, 74, 0.1)', fill: true },
        { label: '口角', data: smile, borderColor: 'rgb(168, 85, 247)', backgroundColor: 'rgba(168, 85, 247, 0.1)', fill: true },
        { label: '目の開き', data: eyeOpen, borderColor: 'rgb(14, 165, 233)', backgroundColor: 'rgba(14, 165, 233, 0.1)', fill: true },
      ],
    }),
    [labels, faceYaw, facePitch, cameraFocus, smile, eyeOpen]
  )

  if (valid.length === 0) return <div style={{ padding: 16, background: 'var(--surface)', borderRadius: 8 }}>表示するデータがありません</div>

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>時系列</h2>
      <Line data={data} options={options} />
    </div>
  )
}

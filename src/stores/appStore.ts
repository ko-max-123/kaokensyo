import { create } from 'zustand'
import type { Session } from '@/types/session'
import type { FaceMetrics } from '@/types/metrics'
import type { AppSettings } from '@/types/settings'

export type AnalysisStatus = 'idle' | 'camera_ready' | 'running' | 'stopped' | 'error'

interface AppState {
  analysisStatus: AnalysisStatus
  errorMessage: string | null
  currentSession: Session | null
  latestMetrics: FaceMetrics | null
  settings: AppSettings
  historyList: Session[]
  setAnalysisStatus: (s: AnalysisStatus) => void
  setError: (msg: string | null) => void
  setCurrentSession: (s: Session | null) => void
  setLatestMetrics: (m: FaceMetrics | null) => void
  setSettings: (s: AppSettings) => void
  setHistoryList: (list: Session[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  analysisStatus: 'idle',
  errorMessage: null,
  currentSession: null,
  latestMetrics: null,
  settings: {
    sampleIntervalMs: 200,
    graphTimeRangeMs: 60_000,
    maxSessionsStored: 30,
    frontFaceYawThreshold: 15,
    frontFacePitchThreshold: 15,
    gazeCenterThreshold: 0.7,
    blinkCloseThreshold: 0.25,
    overlayVisible: true,
  },
  historyList: [],
  setAnalysisStatus: (analysisStatus) => set({ analysisStatus }),
  setError: (errorMessage) => set({ errorMessage }),
  setCurrentSession: (currentSession) => set({ currentSession }),
  setLatestMetrics: (latestMetrics) => set({ latestMetrics }),
  setSettings: (settings) => set({ settings }),
  setHistoryList: (historyList) => set({ historyList }),
}))

export interface AudioMetrics {
  loudness: number // 0-1
  isSpeaking: boolean
  speakingEvents: number // 累積の発話イベント数
}

export function useAudioAnalysis() {
  const metricsRef = { current: null as AudioMetrics | null }
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let source: MediaStreamAudioSourceNode | null = null
  let rafId: number | null = null
  let speaking = false
  let speakingEvents = 0

  const stop = () => {
    if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    analyser = null
    source?.disconnect()
    source = null
    audioContext?.close()
    audioContext = null
    metricsRef.current = null
    speaking = false
    speakingEvents = 0
  }

  const start = async (stream: MediaStream) => {
    stop()
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    source = audioContext.createMediaStreamSource(stream)
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 1024
    source.connect(analyser)
    const buffer = new Float32Array(analyser.fftSize)

    const tick = () => {
      if (!analyser) {
        rafId = requestAnimationFrame(tick)
        return
      }
      analyser.getFloatTimeDomainData(buffer)
      let sumSq = 0
      for (let i = 0; i < buffer.length; i++) {
        const v = buffer[i]!
        sumSq += v * v
      }
      const rms = Math.sqrt(sumSq / buffer.length)
      // 0〜1 にざっくり正規化（会話レベルを 0.1〜0.3 付近に収める）
      const loudness = Math.max(0, Math.min(1, rms * 10))
      const speakingThreshold = 0.08
      const nowSpeaking = loudness >= speakingThreshold
      if (nowSpeaking && !speaking) {
        speakingEvents++
      }
      speaking = nowSpeaking
      metricsRef.current = {
        loudness,
        isSpeaking: nowSpeaking,
        speakingEvents,
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  }

  return { metricsRef, start, stop }
}


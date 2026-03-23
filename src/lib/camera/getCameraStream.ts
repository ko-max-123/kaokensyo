/**
 * スマホ（縦向き・インカメ優先）でも取りやすい getUserMedia 制約。
 * 固定 640x480 は多くの端末で拒否・不適合になりやすい。
 */
export async function getCameraAndMicStream(): Promise<MediaStream> {
  const videoPreferred = {
    facingMode: 'user' as const,
    width: { ideal: 1280, min: 320 },
    height: { ideal: 720, min: 240 },
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: videoPreferred,
    })
  } catch {
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: 'user' },
      })
    } catch {
      return await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      })
    }
  }
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import type { AppSettings } from '@/types/settings'
import { getSettings, saveSettings } from '@/lib/storage/db'

export default function SettingsPage() {
  const storeSettings = useAppStore((s) => s.settings)
  const setSettings = useAppStore((s) => s.setSettings)
  const [form, setForm] = useState<AppSettings>(storeSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings().then((s) => {
      setForm(s)
      setSettings(s)
    })
  }, [setSettings])

  const update = (patch: Partial<AppSettings>) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSettings(form)
    await saveSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>設定</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>サンプリング間隔 (ms)</span>
          <input
            type="number"
            min={100}
            max={1000}
            step={50}
            value={form.sampleIntervalMs}
            onChange={(e) => update({ sampleIntervalMs: Number(e.target.value) })}
            style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>グラフ表示期間 (ms)</span>
          <input
            type="number"
            min={10000}
            max={300000}
            step={10000}
            value={form.graphTimeRangeMs}
            onChange={(e) => update({ graphTimeRangeMs: Number(e.target.value) })}
            style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>ローカル保存上限 (件)</span>
          <input
            type="number"
            min={5}
            max={100}
            value={form.maxSessionsStored}
            onChange={(e) => update({ maxSessionsStored: Number(e.target.value) })}
            style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>正面顔 左右閾値 (度)</span>
          <input
            type="number"
            min={5}
            max={45}
            value={form.frontFaceYawThreshold}
            onChange={(e) => update({ frontFaceYawThreshold: Number(e.target.value) })}
            style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>正面顔 上下閾値 (度)</span>
          <input
            type="number"
            min={5}
            max={45}
            value={form.frontFacePitchThreshold}
            onChange={(e) => update({ frontFacePitchThreshold: Number(e.target.value) })}
            style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>視線中央判定閾値 (0–1)</span>
          <input
            type="number"
            min={0.3}
            max={1}
            step={0.1}
            value={form.gazeCenterThreshold}
            onChange={(e) => update({ gazeCenterThreshold: Number(e.target.value) })}
            style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>まばたき閉じ判定閾値 (0–1)</span>
          <input
            type="number"
            min={0.1}
            max={0.5}
            step={0.05}
            value={form.blinkCloseThreshold}
            onChange={(e) => update({ blinkCloseThreshold: Number(e.target.value) })}
            style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.overlayVisible} onChange={(e) => update({ overlayVisible: e.target.checked })} />
          <span>オーバーレイ表示</span>
        </label>
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={handleSave} style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8 }}>
          保存
        </button>
        {saved && <span style={{ color: 'var(--success)', fontSize: 14 }}>保存しました</span>}
      </div>
      <p style={{ marginTop: 24 }}>
        <Link to="/">ホームへ戻る</Link>
      </p>
    </div>
  )
}

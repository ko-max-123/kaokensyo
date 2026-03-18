import type { SessionSummary } from '@/types/session'
import type { SessionScoreResult } from '@/lib/math/sessionScore'

interface SummaryPanelProps {
  summary: SessionSummary
  durationMs: number
  validCount: number
  totalCount: number
  score?: SessionScoreResult
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}分${s % 60}秒` : `${s}秒`
}

export default function SummaryPanel({ summary, durationMs, score }: SummaryPanelProps) {
  const cards = [
    { label: '計測時間', value: formatDuration(durationMs) },
    { label: '正面顔割合', value: `${(summary.frontFaceRatio * 100).toFixed(1)}%` },
    { label: '視線中央割合', value: `${(summary.gazeCenterRatio * 100).toFixed(1)}%` },
    { label: '平均口角スコア', value: (summary.avgSmileScore * 100).toFixed(0) },
    { label: '平均目開き', value: (summary.avgEyeOpen * 100).toFixed(0) },
    { label: 'まばたき回数', value: summary.blinkCount },
    { label: '眉の動き平均', value: summary.avgBrowMovement.toFixed(2) },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
      {score && (
        <div
          style={{
            gridColumn: '1 / -1',
            padding: 14,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>参考スコア</div>
            <div style={{ fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{score.score}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>{score.note}</div>
          </div>
          <div style={{ minWidth: 260, flex: '1 1 320px' }}>
            {score.breakdown.map((b) => (
              <div key={b.key} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 64px', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.label}</div>
                <div style={{ height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 999 }}>
                  <div
                    style={{
                      width: `${Math.round((b.points / b.maxPoints) * 100)}%`,
                      height: '100%',
                      background: 'var(--accent)',
                      borderRadius: 999,
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                  {b.points}/{b.maxPoints}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {cards.map((c) => (
        <div key={c.label} style={{ padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.label}</div>
          <div style={{ fontWeight: 600 }}>{c.value}</div>
        </div>
      ))}
      {summary.notes.length > 0 && (
        <div style={{ gridColumn: '1 / -1', padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>メモ</div>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>{summary.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </div>
      )}
    </div>
  )
}

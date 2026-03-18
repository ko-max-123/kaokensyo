import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { getSession } from '@/lib/storage/db'
import type { Session } from '@/types/session'
import SummaryPanel from '@/components/SummaryPanel'
import LineChartPanel from '@/components/LineChartPanel'
import { exportSessionCSV, exportSessionJSON } from '@/features/export/exportSession'

export default function ResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const currentSession = useAppStore((s) => s.currentSession)
  const [session, setSession] = useState<Session | null>(currentSession ?? null)

  useEffect(() => {
    if (currentSession && currentSession.id === sessionId) {
      setSession(currentSession)
      return
    }
    if (sessionId) {
      getSession(sessionId).then((s) => setSession(s ?? null))
    }
  }, [sessionId, currentSession])

  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <p>セッションを読み込んでいます...</p>
        <Link to="/history">履歴へ戻る</Link>
      </div>
    )
  }

  const handleDownloadCSV = () => exportSessionCSV(session)
  const handleDownloadJSON = () => exportSessionJSON(session)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>セッション結果</h1>
      <SummaryPanel summary={session.summary} durationMs={session.durationMs} validCount={session.validSampleCount} totalCount={session.sampleCount} />
      <LineChartPanel samples={session.samples} />
      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <button onClick={handleDownloadCSV} style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8 }}>
          CSV ダウンロード
        </button>
        <button onClick={handleDownloadJSON} style={{ padding: '10px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
          JSON ダウンロード
        </button>
        <Link to="/history" style={{ padding: '10px 20px', color: 'var(--text-muted)' }}>
          履歴一覧へ
        </Link>
      </div>
    </div>
  )
}

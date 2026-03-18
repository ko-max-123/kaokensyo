import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { getAllSessions, deleteSession } from '@/lib/storage/db'

export default function HistoryPage() {
  const historyList = useAppStore((s) => s.historyList)
  const setHistoryList = useAppStore((s) => s.setHistoryList)

  useEffect(() => {
    getAllSessions().then(setHistoryList)
  }, [setHistoryList])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('このセッションを削除しますか？')) return
    await deleteSession(id)
    const list = await getAllSessions()
    setHistoryList(list)
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>履歴</h1>
      {historyList.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>保存されたセッションはありません。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {historyList.map((s) => (
            <li key={s.id} style={{ padding: 16, marginBottom: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontWeight: 600 }}>{new Date(s.endedAt).toLocaleDateString('ja-JP')}</span>
                <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>{new Date(s.endedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                <span style={{ marginLeft: 12, fontSize: 14 }}>口角平均 {(s.summary.avgSmileScore * 100).toFixed(0)} / 正面 {(s.summary.frontFaceRatio * 100).toFixed(0)}%</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/result/${s.id}`} style={{ padding: '6px 12px', background: 'var(--accent)', color: '#fff', borderRadius: 6, fontSize: 14 }}>
                  詳細
                </Link>
                <button onClick={(e) => handleDelete(s.id, e)} style={{ padding: '6px 12px', background: 'transparent', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: 6, fontSize: 14 }}>
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: 24 }}>
        <Link to="/">ホームへ戻る</Link>
      </p>
    </div>
  )
}

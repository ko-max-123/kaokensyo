import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Face Habit Viewer</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        面接・会話練習時の表情や顔の向き、視線の傾向を可視化するツールです。診断ではなく、ご自身のクセを把握するための補助としてお使いください。
      </p>
      <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid var(--border)' }}>
        <strong>カメラについて</strong>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
          解析にはカメラへのアクセスが必要です。映像はサーバーに送信されず、ブラウザ内でのみ処理されます。保存されるのは数値ログと集計結果のみで、動画は保存しません。
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/analyze" style={{ padding: '12px 24px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontWeight: 600 }}>
          解析を開始
        </Link>
        <Link to="/history" style={{ padding: '12px 24px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8 }}>
          履歴を見る
        </Link>
        <Link to="/settings" style={{ padding: '12px 24px', color: 'var(--text-muted)', fontSize: 14 }}>
          設定
        </Link>
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
}

export default function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, minWidth: 100 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  )
}

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 15

function ZTABadge({ decision }) {
  const map = {
    ALLOW:  'badge-allow',
    VERIFY: 'badge-verify',
    DENY:   'badge-deny',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold tracking-wide ${map[decision] ?? ''}`}>
      {decision === 'ALLOW'  && '✅ '}
      {decision === 'VERIFY' && '⚠️ '}
      {decision === 'DENY'   && '🚫 '}
      {decision}
    </span>
  )
}

function AnomalyBadge({ val }) {
  return val
    ? <span className="text-cyber-rose font-bold">Anomaly</span>
    : <span className="text-cyber-green">Normal</span>
}

export default function DataTable({ rows = [], loading }) {
  const [page, setPage] = useState(1)
  const total = rows.length
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const COLS = [
    { key: 'user_id',           label: 'User ID' },
    { key: 'timestamp',         label: 'Timestamp' },
    { key: 'location',          label: 'Location' },
    { key: 'device_type',       label: 'Device' },
    { key: 'login_status',      label: 'Login' },
    { key: 'activity_count',    label: 'Activity' },
    { key: 'anomaly_score',     label: 'Score' },
    { key: 'predicted_anomaly', label: 'Prediction' },
    { key: 'zta_decision',      label: 'ZTA Decision' },
  ]

  const hasPredictions = rows.length > 0 && rows[0]?.zta_decision !== undefined

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-cyber-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Activity Log
          {total > 0 && <span className="ml-2 text-xs text-cyber-muted font-normal">({total.toLocaleString()} rows)</span>}
        </h3>
        {!hasPredictions && total > 0 && (
          <span className="text-xs text-cyber-amber">Run Detection to show ZTA decisions</span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-cyber-muted text-sm gap-2">
            <div className="w-4 h-4 border-2 border-cyber-teal/30 border-t-cyber-teal rounded-full animate-spin" />
            Loading data...
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-cyber-muted gap-2">
            <span className="text-2xl">📂</span>
            <span className="text-sm">No data. Upload a dataset to begin.</span>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                {COLS.filter(c => hasPredictions || !['anomaly_score', 'predicted_anomaly', 'zta_decision'].includes(c.key))
                    .map(c => <th key={c.key} className="text-left whitespace-nowrap">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {slice.map((row, i) => (
                <tr key={i} className={row.predicted_anomaly === 1 ? 'bg-cyber-rose/5' : ''}>
                  {COLS.filter(c => hasPredictions || !['anomaly_score', 'predicted_anomaly', 'zta_decision'].includes(c.key))
                       .map(c => (
                    <td key={c.key} className="whitespace-nowrap text-white/80">
                      {c.key === 'zta_decision'      ? <ZTABadge decision={row[c.key]} /> :
                       c.key === 'predicted_anomaly' ? <AnomalyBadge val={row[c.key]} /> :
                       c.key === 'anomaly_score'     ? <ScoreBar score={row[c.key]} /> :
                       c.key === 'login_status'      ? <LoginBadge val={row[c.key]} /> :
                       c.key === 'timestamp'         ? <span className="text-cyber-muted">{String(row[c.key]).slice(0, 19)}</span> :
                       String(row[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="px-5 py-3 border-t border-cyber-border flex items-center justify-between text-xs text-cyber-muted">
          <span>Page {page} of {pages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1 rounded hover:bg-cyber-border disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-1 rounded hover:bg-cyber-border disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreBar({ score }) {
  const pct   = Math.round((score ?? 0) * 100)
  const color = score > 0.7 ? '#f43f5e' : score >= 0.5 ? '#fbbf24' : '#34d399'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-cyber-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ color }} className="text-xs font-mono">{(score ?? 0).toFixed(3)}</span>
    </div>
  )
}

function LoginBadge({ val }) {
  return (
    <span className={val === 'success' ? 'text-cyber-green' : 'text-cyber-rose'}>
      {val}
    </span>
  )
}

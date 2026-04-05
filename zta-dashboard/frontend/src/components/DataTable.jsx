import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'

const PAGE_SIZE = 15

function ZTABadge({ decision }) {
  const map = {
    ALLOW:  'bg-cyber-green/10 text-cyber-green border-cyber-green/50',
    VERIFY: 'bg-cyber-amber/10 text-cyber-amber border-cyber-amber/50',
    DENY:   'bg-cyber-rose/10 text-cyber-rose border-cyber-rose/50',
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-extrabold tracking-widest ${map[decision] ?? ''}`}>
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
  const [search, setSearch] = useState('')
  const [filterZTA, setFilterZTA] = useState('ALL')
  
  // Filter Logic
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      // ZTA Filter
      if (filterZTA !== 'ALL' && r.zta_decision !== filterZTA) return false
      
      // Search Filter (User ID or Location)
      if (search) {
        const q = search.toLowerCase()
        const user = String(r.user_id || '').toLowerCase()
        const loc = String(r.location || '').toLowerCase()
        if (!user.includes(q) && !loc.includes(q)) return false
      }
      return true
    })
  }, [rows, search, filterZTA])

  const total = filteredRows.length
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const slice = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
      {/* Header and Filters */}
      <div className="px-5 py-4 border-b border-cyber-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Activity Log</h3>
          <p className="text-xs text-cyber-muted mt-1">Showing {total.toLocaleString()} records</p>
        </div>
        
        {hasPredictions && (
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
              <input 
                type="text" 
                placeholder="Search user or location..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-sm text-white placeholder:text-cyber-muted focus:border-cyber-teal focus:ring-1 focus:ring-cyber-teal outline-none transition-all w-60"
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
              <select 
                value={filterZTA}
                onChange={e => { setFilterZTA(e.target.value); setPage(1); }}
                className="pl-9 pr-8 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-sm text-white appearance-none focus:border-cyber-teal outline-none"
              >
                <option value="ALL">All Decisions</option>
                <option value="ALLOW">ALLOW</option>
                <option value="VERIFY">VERIFY</option>
                <option value="DENY">DENY</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px]">
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
            <thead className="sticky top-0 bg-cyber-card/95 backdrop-blur z-10 border-b border-cyber-border shadow-sm">
              <tr>
                {COLS.filter(c => hasPredictions || !['anomaly_score', 'predicted_anomaly', 'zta_decision'].includes(c.key))
                    .map(c => <th key={c.key} className="text-left whitespace-nowrap px-4 py-3 text-xs font-bold text-cyber-muted uppercase tracking-wider">{c.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border border-b border-cyber-border">
              {slice.map((row, i) => (
                <tr key={i} className={`h-12 hover:bg-cyber-teal/5 transition-colors ${i % 2 === 0 ? 'bg-cyber-bg/20' : 'bg-cyber-card'}`}>
                  {COLS.filter(c => hasPredictions || !['anomaly_score', 'predicted_anomaly', 'zta_decision'].includes(c.key))
                       .map(c => (
                    <td key={c.key} className="whitespace-nowrap px-4 py-3 text-sm text-white/80">
                      {c.key === 'zta_decision'      ? <ZTABadge decision={row[c.key]} /> :
                       c.key === 'predicted_anomaly' ? <AnomalyBadge val={row[c.key]} /> :
                       c.key === 'anomaly_score'     ? <ScoreBar score={row[c.key]} /> :
                       c.key === 'login_status'      ? <LoginBadge val={row[c.key]} /> :
                       c.key === 'timestamp'         ? <span className="text-cyber-muted font-mono text-xs">{String(row[c.key]).slice(0, 19)}</span> :
                       c.key === 'user_id'           ? <span className="font-semibold">{String(row[c.key])}</span> :
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

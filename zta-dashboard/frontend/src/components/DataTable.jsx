import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PAGE_SIZE = 15

function ZTABadge({ decision, t }) {
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
      {decision === 'ALLOW' ? t('dashboard.charts.allow') : decision === 'VERIFY' ? t('dashboard.charts.verify') : decision === 'DENY' ? t('dashboard.charts.deny') : decision}
    </span>
  )
}

function AnomalyBadge({ val, t }) {
  return val
    ? <span className="text-cyber-rose font-bold">{t('table.anomaly')}</span>
    : <span className="text-cyber-green">{t('table.normal')}</span>
}

export default function DataTable({ rows = [], loading }) {
  const { t } = useTranslation()
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
    { key: 'user_id',           label: t('table.cols.user_id') },
    { key: 'timestamp',         label: t('table.cols.timestamp') },
    { key: 'location',          label: t('table.cols.location') },
    { key: 'device_type',       label: t('table.cols.device') },
    { key: 'login_status',      label: t('table.cols.login') },
    { key: 'activity_count',    label: t('table.cols.activity') },
    { key: 'anomaly_score',     label: t('table.cols.score') },
    { key: 'predicted_anomaly', label: t('table.cols.prediction') },
    { key: 'zta_decision',      label: t('table.cols.zta') },
  ]

  const hasPredictions = rows.length > 0 && rows[0]?.zta_decision !== undefined

  return (
    <div className="bg-cyber-card/80 backdrop-blur border border-cyber-border rounded-xl overflow-hidden animate-fade-in shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-cyber-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cyber-bg/20">
        <div>
          <h3 className="text-sm font-semibold text-white">{t('table.title')}</h3>
          <p className="text-xs text-cyber-muted mt-1">{t('table.showing', { num: total.toLocaleString() })}</p>
        </div>
        
        {hasPredictions && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
              <input 
                type="text" 
                placeholder={t('table.search')}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 bg-cyber-bg/50 border border-cyber-border rounded-lg text-sm text-white placeholder:text-cyber-muted focus:border-cyber-teal focus:ring-1 focus:ring-cyber-teal outline-none transition-all w-full md:w-64"
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
              <select 
                value={filterZTA}
                onChange={e => { setFilterZTA(e.target.value); setPage(1); }}
                className="pl-9 pr-8 py-2 bg-cyber-bg/50 border border-cyber-border rounded-lg text-sm text-white appearance-none focus:border-cyber-teal outline-none"
              >
                <option value="ALL">{t('table.all_decisions')}</option>
                <option value="ALLOW">{t('dashboard.charts.allow')}</option>
                <option value="VERIFY">{t('dashboard.charts.verify')}</option>
                <option value="DENY">{t('dashboard.charts.deny')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-cyber-border scrollbar-track-transparent">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-cyber-muted text-sm gap-3">
            <div className="w-5 h-5 border-2 border-cyber-teal/30 border-t-cyber-teal rounded-full animate-spin" />
            {t('table.loading')}
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-cyber-muted gap-3">
            <span className="text-3xl opacity-50">📂</span>
            <span className="text-sm font-medium">{t('table.no_data')}</span>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead className="sticky top-0 bg-cyber-card/95 backdrop-blur z-10 border-b border-cyber-border shadow-sm">
              <tr>
                {COLS.filter(c => hasPredictions || !['anomaly_score', 'predicted_anomaly', 'zta_decision'].includes(c.key))
                    .map(c => <th key={c.key} className="text-left whitespace-nowrap px-4 py-3.5 text-[11px] font-bold text-cyber-muted uppercase tracking-wider">{c.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/50 border-b border-cyber-border/50">
              {slice.map((row, i) => (
                <tr key={i} className={`h-12 hover:bg-cyber-teal/5 transition-colors ${i % 2 === 0 ? 'bg-cyber-bg/30' : 'bg-transparent'}`}>
                  {COLS.filter(c => hasPredictions || !['anomaly_score', 'predicted_anomaly', 'zta_decision'].includes(c.key))
                       .map(c => (
                    <td key={c.key} className="whitespace-nowrap px-4 py-3 text-sm text-white/80">
                      {c.key === 'zta_decision'      ? <ZTABadge decision={row[c.key]} t={t} /> :
                       c.key === 'predicted_anomaly' ? <AnomalyBadge val={row[c.key]} t={t} /> :
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
        <div className="px-5 py-3 border-t border-cyber-border/50 flex items-center justify-between text-xs text-cyber-muted bg-cyber-bg/20">
          <span>{t('table.page', { page, pages })}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1 rounded hover:bg-cyber-border hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-1 rounded hover:bg-cyber-border hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
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
    <div className="flex items-center gap-2.5">
      <div className="w-16 h-1.5 bg-cyber-border/50 rounded-full overflow-hidden shadow-inner flex-shrink-0">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ color }} className="text-xs font-mono font-medium">{(score ?? 0).toFixed(3)}</span>
    </div>
  )
}

function LoginBadge({ val }) {
  return (
    <span className={val === 'success' ? 'text-cyber-green font-medium' : 'text-cyber-rose font-medium'}>
      {val}
    </span>
  )
}

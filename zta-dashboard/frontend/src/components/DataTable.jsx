import { useState, useMemo } from 'react'
import { 
  ChevronLeft, ChevronRight, Search, Filter, 
  MoreVertical, Eye, ShieldAlert, CheckCircle, X,
  Activity, MapPin, Cpu, Clock, Terminal, Globe, User
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PAGE_SIZE = 12

function ZTABadge({ decision, t }) {
  const map = {
    ALLOW:  'badge-low',
    VERIFY: 'badge-medium',
    DENY:   'badge-critical',
  }
  return (
    <span className={`badge ${map[decision] || 'badge-low'}`}>
      {decision}
    </span>
  )
}

function StatusBadge({ val, type = 'anomaly' }) {
  if (type === 'anomaly') {
    return val 
      ? <span className="text-[#f85149] font-bold flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#f85149] animate-pulse"></div> ANOMALY</span>
      : <span className="text-[#3fb950] font-medium uppercase tracking-tighter">✔ Normal</span>
  }
  
  const colors = val === 'success' ? 'text-[#3fb950]' : 'text-[#f85149]'
  return <span className={`${colors} font-bold uppercase text-[10px]`}>{val}</span>
}

function DetailsModal({ row, onClose }) {
  if (!row) return null
  
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0d1117]/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-[#30363d] flex items-center justify-between bg-gradient-to-r from-[#161b22] to-[#0d1117]">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-[#58a6ff10] rounded-lg border border-[#58a6ff30]">
                <Terminal className="w-5 h-5 text-[#58a6ff]" />
             </div>
             <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Asset Intelligence Record</h3>
                <p className="text-[10px] text-[#8b949e] font-bold uppercase tracking-tighter">Instance ID: {row.user_id}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#30363d] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#8b949e]" />
          </button>
        </div>
        
        <div className="p-8 grid grid-cols-2 gap-8">
           <div className="space-y-6">
              <div>
                 <label className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-2 block">Identity Information</label>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-[#f0f6fc]">
                       <User className="w-3.5 h-3.5 text-[#58a6ff]" /> <span className="font-mono">{row.user_id}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#f0f6fc]">
                       <MapPin className="w-3.5 h-3.5 text-[#3fb950]" /> {row.location}
                    </div>
                 </div>
              </div>
              <div>
                 <label className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-2 block">Vulnerability Metrics</label>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                       <span className="text-[#8b949e]">Anomaly Score</span>
                       <span className="font-mono text-white">{(row.anomaly_score || 0).toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                       <span className="text-[#8b949e]">Activity Count</span>
                       <span className="text-white">{row.activity_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                       <span className="text-[#8b949e]">Session Duration</span>
                       <span className="text-white">{row.session_duration}m</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div>
                 <label className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-2 block">Access Logic</label>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-[#f0f6fc]">
                       <Cpu className="w-3.5 h-3.5 text-[#58a6ff]" /> {row.device_type || row.device_id}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#f0f6fc]">
                       <Activity className="w-3.5 h-3.5 text-[#3fb950]" /> {row.access_resource}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#f0f6fc]">
                       <Clock className="w-3.5 h-3.5 text-[#bc8cff]" /> {String(row.timestamp).slice(0, 19)}
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-[#8b949e] uppercase tracking-widest">Policy Enforcement</span>
                    <ZTABadge decision={row.zta_decision} />
                 </div>
                 <p className="text-[10px] text-[#484f58] italic">
                    The zero-trust engine has evaluated this request based on behavioral anomalies and device heuristics.
                 </p>
              </div>
           </div>
        </div>

        <div className="p-6 bg-[#0d1117] border-t border-[#30363d] flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-xs font-black text-white hover:bg-[#30363d] transition-all">
              DISMISS VIEWER
           </button>
        </div>
      </div>
    </div>
  )
}

export default function DataTable({ rows = [], loading, onAction }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterZTA, setFilterZTA] = useState('ALL')
  const [selectedRow, setSelectedRow] = useState(null)
  
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      if (filterZTA !== 'ALL' && r.zta_decision !== filterZTA) return false
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

  return (
    <div className="security-card overflow-hidden flex flex-col h-full animate-fade-in relative">
      <DetailsModal row={selectedRow} onClose={() => setSelectedRow(null)} />
      
      {/* Table Header / Toolbar */}
      <div className="security-card-header flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <span className="security-card-title">{t('table.title')}</span>
          <span className="bg-[#21262d] text-[#8b949e] px-2 py-0.5 rounded text-[10px] font-mono">
            {total.toLocaleString()} ASSETS
          </span>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#484f58]" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-1.5 h-8 bg-[#0d1117] border-[#30363d] rounded text-[11px] w-full sm:w-48 placeholder:text-[#484f58]"
            />
          </div>
          
          <select 
            value={filterZTA}
            onChange={e => { setFilterZTA(e.target.value); setPage(1); }}
            className="h-8 py-0 pl-2 pr-8 bg-[#0d1117] border-[#30363d] rounded text-[11px] text-[#f0f6fc] appearance-none"
          >
            <option value="ALL">ALL EVENTS</option>
            <option value="ALLOW">ALLOWED</option>
            <option value="VERIFY">VERIFICATION</option>
            <option value="DENY">DENIED</option>
          </select>
          
          <button className="h-8 w-8 flex items-center justify-center bg-[#21262d] border border-[#30363d] rounded text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
             <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-6 h-6 border-2 border-transparent border-t-[#58a6ff] rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-[#484f58] uppercase tracking-widest">Querying Neural Records...</span>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#484f58] gap-2">
            <Search className="w-8 h-8 opacity-20" />
            <span className="text-[11px] font-bold uppercase tracking-widest">No matching assets identified</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#161b22] border-b border-[#30363d] z-10">
              <tr>
                {['Asset ID', 'Timestamp', 'Geo-Location', 'Access Vector', 'Prediction', 'ZTA Decision', 'Actions'].map((h, idx) => (
                  <th key={idx} className="px-4 py-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/50">
              {slice.map((row, i) => (
                <tr key={i} className="hover:bg-[#161b22]/50 transition-colors group">
                  <td className="px-4 py-3 text-[11px] font-mono font-bold text-[#f0f6fc]">
                    {row.user_id}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-[#8b949e] font-mono">
                    {String(row.timestamp || '').slice(11, 19)} <span className="opacity-50 ml-1">{String(row.timestamp || '').slice(0, 10)}</span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-[#f0f6fc] font-medium">
                    {row.location}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-[#8b949e]">
                    <div className="flex flex-col">
                       <span className="text-[#f0f6fc] font-bold">{row.device_type}</span>
                       <span className="text-[9px] opacity-70 italic">{row.access_resource}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[10px]">
                    <StatusBadge val={row.predicted_anomaly} type="anomaly" />
                  </td>
                  <td className="px-4 py-3">
                    <ZTABadge decision={row.zta_decision} t={t} />
                  </td>
                  <td className="px-4 py-3">
                     <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setSelectedRow(row)}
                          title="View Intelligence Detail"
                          className="p-1.5 rounded bg-[#21262d] border border-transparent hover:border-[#30363d] text-[#8b949e] hover:text-[#58a6ff] transition-all"
                        >
                           <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onAction?.(row, 'block')}
                          title="Block Identity"
                          disabled={row.zta_decision === 'DENY'}
                          className="p-1.5 rounded bg-[#21262d] border border-transparent hover:border-[#f8514930] text-[#8b949e] hover:text-[#f85149] transition-all disabled:opacity-20"
                        >
                           <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onAction?.(row, 'dismiss')}
                          title="Acknowledge/Dismiss"
                          className="p-1.5 rounded bg-[#21262d] border border-transparent hover:border-[#3fb95030] text-[#8b949e] hover:text-[#3fb950] transition-all"
                        >
                           <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="security-card-header h-12 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between px-4">
        <span className="text-[10px] font-bold text-[#8b949e]">
          PAGE <span className="text-[#f0f6fc]">{page}</span> OF {pages}
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            className="h-7 px-3 bg-[#21262d] border border-[#30363d] rounded text-[10px] font-bold text-[#f0f6fc] disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" /> PREV
          </button>
          <button 
            onClick={() => setPage(p => Math.min(pages, p + 1))} 
            disabled={page === pages}
            className="h-7 px-3 bg-[#21262d] border border-[#30363d] rounded text-[10px] font-bold text-[#f0f6fc] disabled:opacity-30 flex items-center gap-1"
          >
            NEXT <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

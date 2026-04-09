import { useState, useMemo } from 'react'
import { 
  ChevronLeft, ChevronRight, Search, Filter, 
  MoreVertical, Eye, ShieldAlert, CheckCircle, X,
  Activity, MapPin, Cpu, Clock, Terminal, Globe, User,
  ExternalLink, Trash2, AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PAGE_SIZE = 12

function ZTABadge({ decision, t }) {
  const map = {
    ALLOW:  'badge-success text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800',
    VERIFY: 'badge-warning text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800',
    DENY:   'badge-danger text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800',
  }
  return (
    <span className={`badge-pill border ${map[decision] || 'badge-info text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800'} shadow-sm`}>
      <div className={`status-dot ${decision === 'ALLOW' ? 'bg-emerald-500' : decision === 'DENY' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
      {decision}
    </span>
  )
}

function StatusBadge({ val, type = 'anomaly' }) {
  if (type === 'anomaly') {
    return val 
      ? <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/40 rounded-xl border border-rose-100 dark:border-rose-800 shadow-sm text-[11px]"><AlertCircle className="w-4 h-4" /> ANOMALY</span>
      : <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm text-[11px]"><CheckCircle className="w-4 h-4" /> NORMAL</span>
  }
  
  const colors = val === 'success' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 border-emerald-100 dark:border-emerald-800' : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/40 border-rose-100 dark:border-rose-800'
  return <span className={`${colors} font-black uppercase text-[10px] px-2.5 py-1 rounded-lg border shadow-sm tracking-widest`}>{val}</span>
}

function DetailsModal({ row, onClose }) {
  if (!row) return null
  
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm animate-px-fade">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-premium w-full max-w-2xl overflow-hidden animate-slide-up transition-colors duration-300">
        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-5">
             <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm">
                <Terminal className="w-7 h-7 text-blue-600 dark:text-blue-400" />
             </div>
             <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Security Intelligence</h3>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Device Identity: {row.user_id}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all group">
            <X className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white" />
          </button>
        </div>
        
        <div className="p-10 grid grid-cols-2 gap-10 bg-slate-50/30 dark:bg-slate-950/20">
           <div className="space-y-10">
              <div>
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Asset Context</label>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                       <User className="w-5 h-5 text-blue-500" /> <span className="font-bold text-slate-900 dark:text-white">{row.user_id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                       <MapPin className="w-5 h-5 text-emerald-500" /> {row.location}
                    </div>
                 </div>
              </div>
              <div>
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Neural Risk Scores</label>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-5">
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-slate-500 dark:text-slate-400 font-bold">Anomaly Score</span>
                       <span className="font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/40 px-3 py-1 rounded-xl border border-rose-100 dark:border-rose-800">{(row.anomaly_score || 0).toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-slate-500 dark:text-slate-400 font-bold">Activity Count</span>
                       <span className="text-slate-900 dark:text-white font-black">{row.activity_count} events</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-slate-500 dark:text-slate-400 font-bold">Duration</span>
                       <span className="text-slate-900 dark:text-white font-black">{row.session_duration} min</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-10">
              <div>
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Encapsulated Telemetry</label>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-5">
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                       <Cpu className="w-5 h-5 text-indigo-500" /> 
                       <span className="font-bold">{row.device_type || row.device_id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                       <Activity className="w-5 h-5 text-amber-500" /> 
                       <span className="font-bold">{row.access_resource}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                       <Clock className="w-5 h-5 text-violet-500" /> 
                       <span className="font-mono">{String(row.timestamp).slice(0, 19).replace('T', ' ')}</span>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] shadow-lg shadow-blue-200/20 relative overflow-hidden group">
                 <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                 <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[11px] font-black text-white/70 uppercase tracking-[0.2em]">Decision Matrix</span>
                    <ZTABadge decision={row.zta_decision} />
                 </div>
                 <p className="text-sm text-blue-50 leading-relaxed font-bold relative z-10">
                    AI Analysis: Unified telemetry patterns suggest active ZTA policy invocation based on behavioral drift.
                 </p>
              </div>
           </div>
        </div>

        <div className="px-10 py-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-white dark:bg-slate-900">
           <button onClick={onClose} className="px-8 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest">
              Close Detail
           </button>
           <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-[11px] font-black text-white transition-all shadow-premium flex items-center gap-3 uppercase tracking-widest">
              <ExternalLink className="w-4 h-4" /> Full Audit Log
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
    <div className="px-card overflow-hidden flex flex-col h-full animate-px-fade group/table transition-all duration-300">
      <DetailsModal row={selectedRow} onClose={() => setSelectedRow(null)} />
      
      {/* Table Header / Toolbar */}
      <div className="px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-2xl border border-blue-100 dark:border-blue-800">
             <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
             <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Fleet Intelligence Stream</h2>
             <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
               Active Assets: <span className="text-blue-600 dark:text-blue-400">{total.toLocaleString()}</span>
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/search:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search ID or Location..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-12 pr-6 h-12 bg-slate-50 dark:bg-slate-800 border-transparent dark:border-slate-700 rounded-2xl text-sm w-full sm:w-72 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-200 dark:focus:border-blue-900 transition-all font-bold placeholder:text-slate-400"
            />
          </div>
          
          <div className="relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
             <select 
               value={filterZTA}
               onChange={e => { setFilterZTA(e.target.value); setPage(1); }}
               className="h-12 pl-12 pr-12 bg-slate-50 dark:bg-slate-800 border-transparent dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-500 dark:text-slate-400 appearance-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-200 dark:focus:border-blue-900 transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 tracking-widest uppercase"
             >
               <option value="ALL">FILTER: ALL</option>
               <option value="ALLOW">FILTER: ALLOWED</option>
               <option value="VERIFY">FILTER: VERIFY</option>
               <option value="DENY">FILTER: DENIED</option>
             </select>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-5">
            <div className="w-12 h-12 border-[5px] border-slate-100 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Intelligence Nodes...</span>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-slate-300 gap-6">
            <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-full border border-dashed border-slate-200 dark:border-slate-700">
               <Search className="w-12 h-12 opacity-30" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">No Intelligence Records Match Search</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                {['Identity', 'Timestamp', 'Geo Location', 'Resources', 'AI Prediction', 'ZTA Policy', ''].map((h, idx) => (
                  <th key={idx} className="px-10 py-5 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {slice.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-300 group/row border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-black shadow-sm">
                          {row.user_id?.slice(0, 2).toUpperCase() || '??'}
                       </div>
                       <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{row.user_id}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                       <span className="text-[14px] text-slate-900 dark:text-white font-bold font-mono">{String(row.timestamp || '').split(' ')[1] || String(row.timestamp || '').slice(11, 19)}</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{String(row.timestamp || '').split(' ')[0] || String(row.timestamp || '').slice(0, 10)}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-extrabold uppercase tracking-tight">
                       <MapPin className="w-4 h-4 text-emerald-500" />
                       {row.location}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                       <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm text-slate-900 dark:text-white font-black">{row.device_type}</span>
                       </div>
                       <span className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-[0.15em]">{row.access_resource}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <StatusBadge val={row.predicted_anomaly} type="anomaly" />
                  </td>
                  <td className="px-10 py-6">
                    <ZTABadge decision={row.zta_decision} t={t} />
                  </td>
                  <td className="px-10 py-6">
                     <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all duration-300">
                        <button 
                          onClick={() => setSelectedRow(row)}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-lg transition-all shadow-sm"
                          title="View Intelligence"
                        >
                           <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onAction?.(row, 'block')}
                          disabled={row.zta_decision === 'DENY'}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 hover:shadow-lg transition-all shadow-sm disabled:opacity-20 disabled:cursor-not-allowed"
                          title="Revoke Access"
                        >
                           <ShieldAlert className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onAction?.(row, 'dismiss')}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-900 hover:shadow-lg transition-all shadow-sm"
                          title="Authorize Exception"
                        >
                           <CheckCircle className="w-5 h-5" />
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
      <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
          INTELLIGENCE VIEW: <span className="text-slate-900 dark:text-white">{slice.length}</span> / {total} ASSETS
        </div>
        <div className="flex items-center gap-4">
           <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mr-6">
              PAGE {page} OF {pages}
           </div>
           <div className="flex gap-2.5">
             <button 
               onClick={() => setPage(p => Math.max(1, p - 1))} 
               disabled={page === 1}
               className="h-11 w-11 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button 
               onClick={() => setPage(p => Math.min(pages, p + 1))} 
               disabled={page === pages}
               className="h-11 w-11 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>
    </div>
  )
}

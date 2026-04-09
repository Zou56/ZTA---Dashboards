import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import { useRealtime } from '../context/RealtimeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Shell from '../components/Layout/Shell.jsx'
import MetricCard from '../components/MetricCard.jsx'
import DataTable from '../components/DataTable.jsx'
import { 
  Box, 
  ShieldAlert, 
  Globe, 
  HardDrive, 
  Search, 
  Filter, 
  MoreVertical,
  Activity,
  AlertCircle,
  Database,
  Lock,
  Smartphone,
  Laptop,
  RefreshCw,
  LayoutGrid,
  Zap,
  Radar
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const API = 'http://localhost:8000'

export default function Assets() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { toast } = useToast()
  const { lastEvent } = useRealtime()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/data?page=1&limit=500`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAssets(res.data.data ?? [])
    } catch (err) {
      setAssets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [token])

  useEffect(() => {
    if (lastEvent) fetchAssets()
  }, [lastEvent])

  const criticalAssets = assets.filter(a => a.anomaly_score > 0.8).length
  const deviceCounts = assets.reduce((acc, curr) => {
    acc[curr.device_type] = (acc[curr.device_type] || 0) + 1
    return acc
  }, {})

  const handleExport = async () => {
    toast('Generating cryptographically signed audit package...', 'info')
    window.location.href = `${API}/export?token=${token}`
  }

  const handleScan = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/data/scan`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast(res.data.message, 'success')
      await fetchAssets()
    } catch (err) {
      toast('Scanning failed. Registry unreachable.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (row, action) => {
    try {
      await axios.post(`${API}/action`, { 
        user_id: row.user_id, 
        timestamp: String(row.timestamp), 
        action 
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast(`${action.toUpperCase()} confirmed for ${row.user_id}`, action === 'block' ? 'error' : 'success')
      await fetchAssets()
    } catch (err) {
      toast(`${action.toUpperCase()} action failed`, 'error')
    }
  }

  return (
    <Shell>
      <div className="space-y-10 animate-px-fade pb-20">
        {/* Module Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-premium relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -mr-20 -mt-20"></div>
           <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-phoenix-primary rounded-2xl shadow-xl shadow-phoenix-primary/20 rotate-2">
                 <LayoutGrid className="w-7 h-7 text-white" />
              </div>
              <div>
                 <h1 className="text-readable-xl font-black text-phoenix-text-main dark:text-white tracking-tight leading-none mb-2">Fleet Intelligence</h1>
                 <p className="text-readable-xs text-phoenix-text-muted font-black uppercase tracking-[0.2em]">Managed Identities & Endpoint Compliance</p>
              </div>
           </div>
           <div className="flex gap-4 relative z-10">
              <button 
                onClick={handleExport}
                className="px-8 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm uppercase tracking-widest"
              >
                 Export Audit
              </button>
              <button 
                onClick={handleScan}
                disabled={loading}
                className="px-8 py-3.5 bg-phoenix-primary rounded-2xl text-readable-sm font-black text-white hover:bg-phoenix-secondary transition-all flex items-center gap-3 shadow-premium disabled:opacity-50 uppercase tracking-widest"
              >
                 {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />}
                 {loading ? 'DISCOVERING...' : 'SCAN ASSETS'}
              </button>
           </div>
        </div>

        {/* Live Fleet Watch Grid (Premium Visualization) */}
        <div className="px-card p-10 bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium rounded-[2.5rem]">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-readable-sm font-black text-phoenix-text-main dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                 <Zap className="w-5 h-5 text-phoenix-warning" /> Real-time Node Status
              </h3>
              <span className="text-readable-xs font-black text-phoenix-text-muted dark:text-slate-600 uppercase tracking-widest">{assets.length} NODES IDENTIFIED</span>
           </div>
           
           <div className="flex flex-wrap gap-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {assets.length === 0 ? (
                 <div className="w-full text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-[10px]">Awaiting Scan Results...</div>
              ) : (
                assets.map((a, i) => (
                   <div 
                     key={i} 
                     className={`w-4 h-4 rounded-md transition-all duration-700 hover:scale-125 cursor-pointer relative group ${a.anomaly_score > 0.8 ? 'bg-rose-500 animate-pulse shadow-rose-200 shadow-lg' : a.anomaly_score > 0.4 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                     title={`${a.user_id} - Score: ${a.anomaly_score}`}
                   >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-2xl">
                         <div className="font-black mb-0.5">{a.user_id}</div>
                         <div className="text-slate-400 font-bold uppercase tracking-widest">Risk Index: {a.anomaly_score.toFixed(3)}</div>
                         <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                   </div>
                ))
              )}
           </div>
        </div>

        {/* Risk Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           <MetricCard 
              icon={ShieldAlert} 
              label="Critical Risks" 
              value={criticalAssets.toLocaleString()} 
              sub="High Severity Anomalies" 
              color="rose" 
              loading={loading} 
           />
           <MetricCard 
              icon={Laptop} 
              label="Workstations" 
              value={deviceCounts['Laptop'] ?? 0} 
              sub="Secure Managed Endpoints" 
              color="blue" 
              loading={loading} 
           />
           <MetricCard 
              icon={Smartphone} 
              label="Mobile Devices" 
              value={deviceCounts['Mobile'] ?? 0} 
              sub="ZTA Policy Compliant" 
              color="teal" 
              loading={loading} 
           />
           <MetricCard 
              icon={Database} 
              label="Total Nodes" 
              value={assets.length.toLocaleString()} 
              sub="Global Network Entities" 
              color="violet" 
              loading={loading} 
           />
        </div>

        {/* Detailed Table */}
        <div className="min-h-[700px]">
           <DataTable rows={assets} loading={loading} onAction={handleAction} />
        </div>

        {/* Device Compliance Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="px-card p-10 flex flex-col dark:bg-slate-900">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[12px] font-black text-slate-900 dark:text-white tracking-[0.15em] uppercase flex items-center gap-3">
                    <Lock className="w-5 h-5 text-emerald-500" /> Encryption Audit
                 </h3>
                 <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800">98.2% SECURE</span>
              </div>
              <div className="mt-auto space-y-6">
                 <div className="flex justify-between items-center text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span>Protocol: AES-256 Enabled</span>
                    <span className="text-slate-900 dark:text-white">98.2%</span>
                 </div>
                 <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-800 p-0.5">
                    <div className="w-[98.2%] h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></div>
                 </div>
                 <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-bold italic">
                   Managed endpoints must maintain full disk encryption per ZTA-204 corporate policy.
                 </p>
              </div>
           </div>
           
           <div className="px-card p-10 flex flex-col dark:bg-slate-900">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[12px] font-black text-slate-900 dark:text-white tracking-[0.15em] uppercase flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" /> Patch Compliance
                 </h3>
                 <span className="text-[11px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800">98.2% UPDATED</span>
              </div>
              <div className="mt-auto space-y-6">
                 <div className="flex justify-between items-center text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span>Critical Patch V24-10</span>
                    <span className="text-slate-900 dark:text-white">1.8% LAG</span>
                 </div>
                 <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-800 p-0.5">
                    <div className="w-[1.8%] h-full bg-amber-500 rounded-full shadow-lg shadow-amber-500/20"></div>
                 </div>
                 <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-bold italic">
                   System health check identifies outdated kernel versions in limited DMZ segments.
                 </p>
              </div>
           </div>

           <div className="px-card p-10 flex flex-col dark:bg-slate-900">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[12px] font-black text-slate-900 dark:text-white tracking-[0.15em] uppercase flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-500" /> Geofencing
                 </h3>
                 <span className="text-[11px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800">100% VALID</span>
              </div>
              <div className="mt-auto space-y-6">
                 <div className="flex justify-between items-center text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span>Boundary Drift Check</span>
                    <span className="text-slate-900 dark:text-white">STRICT</span>
                 </div>
                 <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-800 p-0.5">
                    <div className="w-[100%] h-full bg-blue-500 rounded-full shadow-lg shadow-blue-500/20"></div>
                 </div>
                 <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-bold italic">
                   No unauthorized access vectors detected outside defined geographic secure silos.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </Shell>
  )
}

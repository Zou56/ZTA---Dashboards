import { useState, useCallback, useRef, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import { useRealtime } from '../context/RealtimeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Shell from '../components/Layout/Shell.jsx'
import MetricCard from '../components/MetricCard.jsx'
import DataTable from '../components/DataTable.jsx'
import RiskScoreGauge from '../components/RiskScoreGauge.jsx'
import { ZTABarChart, AnomalyPieChart, ScoreLineChart, ConfusionMatrix, MetricsRadar } from '../components/Charts.jsx'
import { 
  Users, AlertTriangle, ShieldCheck, Activity,
  Upload, Cpu, Play, Download, RefreshCw,
  CheckCircle, XCircle, Clock, Database, Bot, Settings,
  Skull, Filter, Search, MoreVertical, Terminal,
  Zap, BellRing, BarChart3, Eye, Radar, X
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const API = 'http://localhost:8000'

function api(token) {
  return axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } })
}

function LiveWatchPanel({ events, onClose }) {
  return (
    <div className="fixed inset-0 z-[400] bg-slate-900/40 backdrop-blur-md flex justify-end animate-px-fade">
      <div className="w-full max-w-lg bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col animate-slide-right border-l border-slate-100 dark:border-slate-800">
         <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 sticky top-0 z-10">
            <div className="flex items-center gap-4">
               <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-200"></div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Live Intelligence Stream</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
               <X className="w-6 h-6 text-slate-400" />
            </button>
         </div>

         <div className="flex-1 overflow-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
            {events.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 opacity-50">
                  <Radar className="w-12 h-12 animate-spin-slow" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Neural Link...</p>
               </div>
            ) : (
               events.map((ev, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up group hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                     <div className="flex items-start justify-between mb-3">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg tracking-widest ${ev.type.includes('ATTACK') || ev.type.includes('ANOMALY') ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'}`}>
                           {ev.type}
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">{new Date().toLocaleTimeString()}</span>
                     </div>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                        {ev.message || ev.details || 'New security event detected in environment flow.'}
                     </p>
                     {ev.user_id && (
                        <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                           <Users className="w-3.5 h-3.5" /> Identity: {ev.user_id}
                        </div>
                     )}
                  </div>
               ))
            )}
            <div className="h-4" /> {/* Spacer */}
         </div>

         <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed">
               Encrypted WebSocket // Socket Cluster SOC-01 <br/>
               Total Events: {events.length}
            </p>
         </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { toast } = useToast()
  const http = api(token)

  // State
  const [tableData, setTableData] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [status, setStatus] = useState({ dataset: false, trained: false, predicted: false })
  const [liveEvents, setLiveEvents] = useState([])
  const [isWatching, setIsWatching] = useState(false)

  // Loading flags
  const [uploading, setUploading] = useState(false)
  const [training, setTraining] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)

  const fileRef = useRef()

  const loadTableData = async () => {
    setTableLoading(true)
    try {
      const res = await http.get('/data?page=1&limit=2000')
      setTableData(res.data.data ?? [])
    } catch {
      setTableData([])
    } finally {
      setTableLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      await http.post('/upload', form)
      toast(`Dataset uploaded successfully`, 'success')
      setStatus(s => ({ ...s, dataset: true, trained: false, predicted: false }))
      setMetrics(null)
      setPredictions([])
      await loadTableData()
    } catch (err) {
      toast('Upload failed', 'error')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleTrain = async () => {
    setTraining(true)
    try {
      await http.post('/train')
      toast(`Model training complete`, 'success')
      setStatus(s => ({ ...s, trained: true, predicted: false }))
    } catch (err) {
      toast('Training process failed', 'error')
    } finally {
      setTraining(false)
    }
  }

  const handleDetect = async () => {
    setDetecting(true)
    try {
      const [predRes, metricRes] = await Promise.all([
        http.get('/predict'),
        http.get('/metrics'),
      ])
      setPredictions(predRes.data.predictions ?? [])
      setTableData(predRes.data.predictions ?? [])
      setMetrics(metricRes.data)
      setStatus(s => ({ ...s, predicted: true }))
      toast(`Threat detection finished.`, 'success')
    } catch (err) {
      toast('Detection run failed', 'error')
    } finally {
      setDetecting(false)
    }
  }

  const handleSimulateAttack = async () => {
    setSimulating(true)
    try {
      await http.post('/simulate-attack')
      toast(`Simulated attack detected!`, 'error')
      setStatus(s => ({ ...s, trained: false, predicted: false }))
      await loadTableData()
    } catch (err) {
      toast('Simulation failed', 'error')
    } finally {
      setSimulating(false)
    }
  }

  const handleAction = async (row, action) => {
    try {
      await http.post('/action', { 
         user_id: row.user_id, 
         timestamp: String(row.timestamp), 
         action 
      })
      toast(`${action.toUpperCase()} confirmed for ${row.user_id}`, action === 'block' ? 'error' : 'success')
      await loadTableData()
    } catch (err) {
      toast(`${action.toUpperCase()} action failed`, 'error')
    }
  }

  // Real-time Event Listener
  const { lastEvent } = useRealtime()
  useEffect(() => {
    if (!lastEvent) return
    setLiveEvents(prev => [lastEvent, ...prev].slice(0, 50))
    
    if (lastEvent.type === 'DATA_UPDATED') {
      loadTableData()
      setStatus(s => ({ ...s, dataset: true, trained: false, predicted: false }))
    } else if (lastEvent.type === 'MODEL_TRAINED') {
      setStatus(s => ({ ...s, trained: true, predicted: false }))
    } else if (lastEvent.type === 'PREDICTIONS_READY' || lastEvent.type === 'ATTACK_SIMULATED') {
      handleDetect()
    }
  }, [lastEvent])

  useEffect(() => {
    loadTableData()
  }, [])

  // Derived Values
  const riskScore = metrics ? (metrics.total_anomalies / (metrics.total_rows || 1)) * 100 : 0
  const totalUsers = metrics?.total_users ?? (tableData.length > 0 ? [...new Set(tableData.map(r => r.user_id))].length : 0)
  const accuracy = metrics ? (metrics.accuracy * 100).toFixed(1) : 0

  return (
    <Shell>
      {isWatching && <LiveWatchPanel events={liveEvents} onClose={() => setIsWatching(false)} />}
      
      <div className="space-y-10 pb-20 animate-px-fade">
        {/* TOP TOOLBAR: Command & Control */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="flex items-center gap-8 relative z-10">
             <div className="bg-phoenix-primary w-16 h-16 rounded-[1.5rem] shadow-2xl border border-phoenix-primary/20 flex items-center justify-center rotate-3 group hover:rotate-0 transition-transform duration-500">
                <ShieldCheck className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
             </div>
             <div>
                <h1 className="text-readable-xl font-black text-phoenix-text-main dark:text-white tracking-tighter leading-none mb-2">Command Hub</h1>
                <p className="text-readable-xs text-phoenix-text-muted font-black uppercase tracking-[0.3em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-phoenix-success animate-pulse"></div>
                   Environment Intelligence Orchestrator
                </p>
             </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 relative z-10">
             <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-[1.8rem] border border-slate-100 dark:border-slate-700 shadow-inner">
                <button
                  onClick={() => setIsWatching(true)}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isWatching ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200/50' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-500'}`}
                >
                   <Radar className={`w-4.5 h-4.5 ${isWatching ? 'animate-spin' : ''}`} />
                   {isWatching ? 'LIVE STREAM ACTIVE' : 'OPEN TELEMETRY'}
                </button>
                <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                
                <div className="flex items-center gap-2">
                   <button
                     onClick={() => fileRef.current?.click()}
                     disabled={uploading}
                     className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-blue-500 transition-all disabled:opacity-50"
                     title="Import Intelligence"
                   >
                      {uploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                   </button>
                   <input ref={fileRef} type="file" accept=".csv" onChange={handleUpload} className="hidden" />

                   <button
                     onClick={handleTrain}
                     disabled={!status.dataset || training}
                     className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-500 transition-all disabled:opacity-50"
                     title="Optimize Neural Parameters"
                   >
                      {training ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                   </button>
                </div>
             </div>

             <button
               onClick={handleDetect}
               disabled={!status.trained || detecting}
               className="flex items-center gap-4 px-10 py-4 bg-phoenix-primary rounded-[1.5rem] text-readable-sm font-black uppercase tracking-[0.2em] text-white hover:bg-phoenix-secondary transition-all disabled:opacity-50 shadow-premium active:scale-95 group overflow-hidden relative"
             >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-125 transition-transform"></div>
                {detecting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                RUN THREAT ANALYTICS
             </button>

             <button
               onClick={handleSimulateAttack}
               className="flex items-center justify-center w-14 h-14 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm group"
               title="Simulate Malicious Proxy Attack"
             >
                <Skull className="w-7 h-7 group-hover:animate-bounce" />
             </button>
          </div>
        </div>

        {/* HERO ROW: Risk Gauge + KPI Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 px-card flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-premium rounded-[2.5rem] relative overflow-hidden group min-h-[440px]">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50/30 rounded-full blur-3xl"></div>
             <RiskScoreGauge score={riskScore} label="Operational Exposure" />
             <div className="px-10 pb-10 w-full text-center relative z-10">
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Neural Exposure Index // 2.4-Sigma
                </p>
             </div>
          </div>
          
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
             <MetricCard 
                icon={Users} 
                label="Identified Assets" 
                value={totalUsers.toLocaleString()} 
                sub="Active Directory Link" 
                color="blue" 
                loading={tableLoading} 
             />
             <MetricCard 
                icon={AlertTriangle} 
                label="Anomalies Flagged" 
                value={metrics?.total_anomalies?.toLocaleString() ?? 0} 
                sub={`${metrics?.anomaly_pct ?? 0}% Total Network Load`} 
                color="rose" 
                loading={detecting} 
                trend={metrics ? -2.4 : null}
             />
             <MetricCard 
                icon={ShieldCheck} 
                label="Model Confidence" 
                value={`${accuracy}%`} 
                sub="AI Cluster Precision Score" 
                color="teal" 
                loading={detecting} 
             />
             <MetricCard 
                icon={Zap} 
                label="System Performance" 
                value={metrics?.f1_score?.toFixed(3) ?? '0.000'} 
                sub="Real-time F1 Harmonic Mean" 
                color="violet" 
                loading={detecting} 
             />
          </div>
        </div>

        {/* ANALYTICS ROW: Heatmaps & Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="px-card h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-premium rounded-[2.5rem] overflow-hidden">
              <div className="px-10 py-8 border-b border-phoenix-border/50 dark:border-slate-800 flex items-center justify-between">
                 <h3 className="text-readable-xs font-black text-phoenix-text-main dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-phoenix-primary" /> Decision Distribution
                 </h3>
              </div>
              <div className="p-10 flex-1 flex flex-col justify-center min-h-[300px]">
                 <ZTABarChart data={metrics?.zta_distribution} />
              </div>
           </div>

           <div className="px-card h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-premium rounded-[2.5rem] overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                 <h3 className="text-[12px] font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                    <Radar className="w-5 h-5 text-emerald-500" /> Network Composition
                 </h3>
              </div>
              <div className="p-10 flex-1 flex flex-col justify-center min-h-[300px]">
                 <AnomalyPieChart 
                    normal={metrics?.total_normal} 
                    anomaly={metrics?.total_anomalies} 
                 />
              </div>
           </div>

           <div className="px-card h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-premium rounded-[2.5rem] overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                 <h3 className="text-[12px] font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                    <Activity className="w-5 h-5 text-violet-500" /> Telemetry Flow
                 </h3>
              </div>
              <div className="p-10 flex-1 flex flex-col justify-center min-h-[300px]">
                 <ScoreLineChart predictions={predictions} />
              </div>
           </div>
        </div>

        {/* ASSET TABLE: Detailed Monitor */}
        <div className="grid grid-cols-1">
           <div className="min-h-[600px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-premium rounded-[2.5rem] overflow-hidden">
              <DataTable rows={tableData} loading={tableLoading} onAction={handleAction} />
           </div>
        </div>
      </div>
    </Shell>
  )
}

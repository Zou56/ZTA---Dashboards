import { useState, useCallback, useRef, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import { useRealtime } from '../context/RealtimeContext.jsx'
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
  Zap, BellRing, BarChart3
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const API = 'http://localhost:8000'

function api(token) {
  return axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } })
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const http = api(token)

  // State
  const [tableData, setTableData] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [toasts, setToasts] = useState([])
  const [status, setStatus] = useState({ dataset: false, trained: false, predicted: false })

  // Loading flags
  const [uploading, setUploading] = useState(false)
  const [training, setTraining] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)

  const fileRef = useRef()
  const toastId = useRef(0)

  const toast = useCallback((message, type = 'info') => {
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

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
      const res = await http.post('/upload', form)
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
      toast(`Threat detection finished. Identifed anomalies.`, 'success')
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
      toast(`Simulated attack detected! System state updated.`, 'error')
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
      toast(`${action.toUpperCase()} action confirmed for ${row.user_id}`, action === 'block' ? 'error' : 'success')
      await loadTableData()
    } catch (err) {
      toast(`${action.toUpperCase()} action failed`, 'error')
    }
  }

  useEffect(() => {
    setSimulating(false)
  }, [])

  // Real-time Event Listener
  const { lastEvent } = useRealtime()
  useEffect(() => {
    if (!lastEvent) return
    console.log('[Real-time] System Event:', lastEvent.type)
    
    if (lastEvent.type === 'DATA_UPDATED') {
      loadTableData()
      setStatus(s => ({ ...s, dataset: true, trained: false, predicted: false }))
      toast('Remote Dataset Update Detected', 'info')
    } else if (lastEvent.type === 'MODEL_TRAINED') {
      setStatus(s => ({ ...s, trained: true, predicted: false }))
      toast('Remote Model Training Complete', 'info')
    } else if (lastEvent.type === 'PREDICTIONS_READY' || lastEvent.type === 'ATTACK_SIMULATED') {
      handleDetect()
    }
  }, [lastEvent, toast])

  // Derived Values
  const riskScore = metrics ? (metrics.total_anomalies / (metrics.total_rows || 1)) * 100 : 0
  const totalUsers = metrics?.total_users ?? (tableData.length > 0 ? [...new Set(tableData.map(r => r.user_id))].length : 0)
  const accuracy = metrics ? (metrics.accuracy * 100).toFixed(1) : 0

  return (
    <Shell>
      <div className="p-6 space-y-6">
        {/* TOP TOOLBAR: Command & Control */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#161b22] border border-[#30363d] p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-4">
             <div className="bg-[#58a6ff10] p-2 rounded-lg border border-[#58a6ff30]">
                <ShieldCheck className="w-5 h-5 text-[#58a6ff]" />
             </div>
             <div>
                <h1 className="text-sm font-black text-white uppercase tracking-widest">Operations Center</h1>
                <p className="text-[10px] text-[#8b949e] font-bold uppercase tracking-tighter">Unified Anomaly & ZTA Orchestrator</p>
             </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
             {/* Upload Action */}
             <button
               onClick={() => fileRef.current?.click()}
               disabled={uploading}
               className="flex items-center gap-2 px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[11px] font-black text-[#f0f6fc] hover:bg-[#30363d] transition-all disabled:opacity-50"
             >
                {uploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                {uploading ? 'INGESTING...' : 'IMPORT ASSETS'}
             </button>
             <input ref={fileRef} type="file" accept=".csv" onChange={handleUpload} className="hidden" />

             {/* Train Action */}
             <button
               onClick={handleTrain}
               disabled={!status.dataset || training}
               className="flex items-center gap-2 px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[11px] font-black text-[#f0f6fc] hover:bg-[#30363d] transition-all disabled:opacity-50"
             >
                {training ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Cpu className="w-3 h-3 text-[#bc8cff]" />}
                TRAIN MODEL
             </button>

             {/* Detect Action */}
             <button
               onClick={handleDetect}
               disabled={!status.trained || detecting}
               className="flex items-center gap-2 px-4 py-2 bg-[#58a6ff] rounded-lg text-[11px] font-black text-[#0d1117] hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-[#58a6ff20]"
             >
                {detecting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                RUN DETECTION
             </button>

             <div className="w-[1px] h-6 bg-[#30363d] mx-2 hidden sm:block"></div>

             {/* Simulation Action */}
             <button
               onClick={handleSimulateAttack}
               className="flex items-center gap-2 px-3 py-2 bg-[#f8514915] border border-[#f8514930] rounded-lg text-[10px] font-black text-[#f85149] hover:bg-[#f8514925] transition-all"
             >
                <Skull className="w-3 h-3" />
                STRESS TEST
             </button>
          </div>
        </div>

        {/* HERO ROW: Risk Gauge + KPI Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 security-card flex items-center justify-center bg-gradient-to-br from-[#161b22] to-[#0d1117]">
             <RiskScoreGauge score={riskScore} label="Operational Exposure" />
          </div>
          
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <MetricCard 
                icon={Users} 
                label="Active Identities" 
                value={totalUsers.toLocaleString()} 
                sub="Global User Directory" 
                color="blue" 
                loading={tableLoading} 
             />
             <MetricCard 
                icon={AlertTriangle} 
                label="Identified Threats" 
                value={metrics?.total_anomalies?.toLocaleString() ?? 0} 
                sub={`${metrics?.anomaly_pct ?? 0}% Detection Rate`} 
                color="rose" 
                loading={detecting} 
                trend={metrics ? -2.4 : null}
             />
             <MetricCard 
                icon={ShieldCheck} 
                label="Model Precision" 
                value={`${accuracy}%`} 
                sub="Isolation Forest Confidence" 
                color="teal" 
                loading={detecting} 
             />
             <MetricCard 
                icon={Zap} 
                label="Avg Risk Score" 
                value={metrics?.f1_score?.toFixed(3) ?? '0.000'} 
                sub="Weighted ZTA Score" 
                color="violet" 
                loading={detecting} 
             />
          </div>
        </div>

        {/* ANALYTICS ROW: Heatmaps & Trends */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="security-card p-0">
              <div className="security-card-header">
                 <span className="security-card-title">Policy Distribution</span>
                 <BarChart3 className="w-3.5 h-3.5 text-[#8b949e]" />
              </div>
              <div className="p-4">
                 <ZTABarChart data={metrics?.zta_distribution} />
              </div>
           </div>

           <div className="security-card p-0">
              <div className="security-card-header">
                 <span className="security-card-title">Exposure Breakdown</span>
                 <BellRing className="w-3.5 h-3.5 text-[#8b949e]" />
              </div>
              <div className="p-4">
                 <AnomalyPieChart 
                    normal={metrics?.total_normal} 
                    anomaly={metrics?.total_anomalies} 
                 />
              </div>
           </div>

           <div className="security-card p-0">
              <div className="security-card-header">
                 <span className="security-card-title">Threat Timeline</span>
                 <Activity className="w-3.5 h-3.5 text-[#8b949e]" />
              </div>
              <div className="p-4">
                 <ScoreLineChart predictions={predictions} />
              </div>
           </div>
        </div>

        {/* ASSET TABLE: Detailed Monitor */}
        <div className="grid grid-cols-1">
           <div className="h-[500px]">
              <DataTable rows={tableData} loading={tableLoading} onAction={handleAction} />
           </div>
        </div>
      </div>

      {/* Global Notifications (Toast) */}
      <div className="fixed bottom-6 right-6 space-y-2 z-[200]">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl animate-fade-in backdrop-blur-md transition-all
            ${t.type === 'success' ? 'bg-[#3fb95015] border-[#3fb95030] text-[#3fb950]' : 
              t.type === 'error' ? 'bg-[#f8514915] border-[#f8514930] text-[#f85149]' : 
              'bg-[#58a6ff15] border-[#58a6ff30] text-[#58a6ff]'}`}>
            <Terminal className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-widest">{t.message}</span>
          </div>
        ))}
      </div>
    </Shell>
  )
}

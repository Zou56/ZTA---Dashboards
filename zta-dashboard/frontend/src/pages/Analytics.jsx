import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useRealtime } from '../context/RealtimeContext.jsx'
import Shell from '../components/Layout/Shell.jsx'
import MetricCard from '../components/MetricCard.jsx'
import { 
  ZTABarChart, 
  AnomalyPieChart, 
  ScoreLineChart, 
  ConfusionMatrix, 
  MetricsRadar 
} from '../components/Charts.jsx'
import { 
  BarChart3, 
  Target, 
  Zap, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  FileSearch,
  LineChart,
  Boxes,
  RefreshCw,
  TrendingUp,
  Microscope,
  BoxSelect
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const API = 'http://localhost:8000'

export default function Analytics() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { toast } = useToast()
  const { lastEvent } = useRealtime()
  const [metrics, setMetrics] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const [mRes, pRes] = await Promise.all([
        axios.get(`${API}/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/predict`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      setMetrics(mRes.data)
      setPredictions(pRes.data.predictions ?? [])
    } catch (err) {
      setMetrics(null)
      setPredictions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchMetrics()
  }, [token])

  useEffect(() => {
    if (lastEvent) fetchMetrics()
  }, [lastEvent])

  const handleAggregate = async () => {
    setLoading(true)
    try {
      await axios.post(`${API}/train`, {}, { headers: { Authorization: `Bearer ${token}` } })
      toast('Neural parameters recalculated. Aggregate updated.', 'success')
      await fetchMetrics()
    } catch (err) {
      toast('Recalculation error. Check infrastructure.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell>
      <div className="space-y-10 animate-px-fade pb-20">
        {/* Module Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-premium relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
           <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-phoenix-secondary rounded-2xl shadow-xl shadow-phoenix-secondary/20 -rotate-2">
                 <Microscope className="w-7 h-7 text-white" />
              </div>
              <div>
                 <h1 className="text-readable-xl font-black text-phoenix-text-main dark:text-white tracking-tight leading-none mb-2">Neural Intelligence</h1>
                 <p className="text-readable-xs text-phoenix-text-muted font-black uppercase tracking-[0.2em]">Inference Engine Performance & Anomaly Trends</p>
              </div>
           </div>
           <div className="relative z-10">
              <button 
                onClick={handleAggregate}
                disabled={loading}
                className="px-8 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-readable-sm font-black text-phoenix-text-muted dark:text-slate-300 hover:text-phoenix-primary dark:hover:text-white transition-all shadow-sm uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95"
              >
                 {loading ? <RefreshCw className="w-4 h-4 animate-spin text-phoenix-secondary" /> : <BoxSelect className="w-4 h-4 text-phoenix-secondary" />}
                 {loading ? 'RECALCULATING...' : 'FORCE AGGREGATE'}
              </button>
           </div>
        </div>

        {/* Top KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           <MetricCard 
              icon={Target} 
              label="Model Accuracy" 
              value={`${(metrics?.accuracy * 100 || 0).toFixed(1)}%`} 
              sub="Isolation Forest Confidence" 
              color="blue" 
              loading={loading} 
           />
           <MetricCard 
              icon={Activity} 
              label="F1 Harmonic Mean" 
              value={(metrics?.f1_score || 0).toFixed(3)} 
              sub="Precision/Recall Balance" 
              color="teal" 
              loading={loading} 
           />
           <MetricCard 
              icon={Zap} 
              label="Inference Lag" 
              value="4.2ms" 
              sub="Real-time Flow Speed" 
              color="rose" 
              loading={loading} 
           />
           <MetricCard 
              icon={Cpu} 
              label="Sample Integrity" 
              value={(metrics?.total_rows || 0).toLocaleString()} 
              sub="Secure Records Processed" 
              color="violet" 
              loading={loading} 
           />
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Radar Chart (Model Balance) */}
           <div className="px-card flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium">
              <div className="px-8 py-6 border-b border-phoenix-border/30 dark:border-slate-800 flex items-center justify-between mb-4">
                 <h3 className="text-readable-xs font-black text-phoenix-text-main dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                    <CheckCircle2 className="w-4.5 h-4.5 text-phoenix-success" /> Model Capability Radar
                 </h3>
                 <TrendingUp className="w-4 h-4 text-phoenix-text-muted" />
              </div>
              <div className="p-8 flex-1">
                 <MetricsRadar metrics={metrics} />
              </div>
           </div>

           {/* Confusion Matrix */}
           <div className="px-card flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium">
              <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between mb-4">
                 <h3 className="text-[11px] font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-500" /> Identification Matrix
                 </h3>
                 <BoxSelect className="w-4 h-4 text-slate-300" />
              </div>
              <div className="p-8 flex-1">
                 <ConfusionMatrix matrix={metrics?.confusion_matrix} />
              </div>
           </div>
        </div>

        {/* Bottom Wide Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
           <div className="lg:col-span-2 px-card flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium">
              <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between mb-4">
                 <h3 className="text-[11px] font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                    <LineChart className="w-4.5 h-4.5 text-blue-500" /> Anomaly Probability Waves
                 </h3>
                 <span className="text-[10px] text-slate-400 font-bold">LIVE TELEMETRY</span>
              </div>
              <div className="p-8 flex-1">
                 <ScoreLineChart predictions={predictions} />
              </div>
           </div>
           
           <div className="px-card flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium">
              <div className="px-8 py-6 border-b border-phoenix-border/30 dark:border-slate-800 flex items-center justify-between mb-4">
                 <h3 className="text-readable-xs font-black text-phoenix-text-main dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                    <BarChart3 className="w-4.5 h-4.5 text-phoenix-primary" /> Network Decisioning
                 </h3>
              </div>
              <div className="p-8 flex-1">
                 <ZTABarChart data={metrics?.zta_distribution} />
              </div>
           </div>
        </div>
      </div>
    </Shell>
  )
}

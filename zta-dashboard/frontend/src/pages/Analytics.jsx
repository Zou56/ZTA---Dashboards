import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
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
  Boxes
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const API = 'http://localhost:8000'

export default function Analytics() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { lastEvent } = useRealtime()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMetrics(res.data)
    } catch (err) {
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [token])

  // Real-time listener
  useEffect(() => {
    if (lastEvent) fetchMetrics()
  }, [lastEvent])

  return (
    <Shell>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Module Header */}
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-xl font-black text-white uppercase tracking-[0.2em]">Security Analytics</h1>
              <p className="text-xs text-[#8b949e] font-bold uppercase tracking-widest mt-1">Machine Learning Performance & Anomaly Trends</p>
           </div>
           <button className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[11px] font-black text-[#f0f6fc] hover:bg-[#30363d] transition-all flex items-center gap-2">
              <Boxes className="w-3.5 h-3.5" /> AGGREGATE LOGS
           </button>
        </div>

        {/* Top KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              label="F1 Score" 
              value={(metrics?.f1_score || 0).toFixed(3)} 
              sub="Detection Balance" 
              color="teal" 
              loading={loading} 
           />
           <MetricCard 
              icon={Zap} 
              label="Inference Latency" 
              value="4.2ms" 
              sub="Real-time Performance" 
              color="violet" 
              loading={loading} 
           />
           <MetricCard 
              icon={Cpu} 
              label="Total Train Recs" 
              value={(metrics?.total_rows || 0).toLocaleString()} 
              sub="Dataset Sample Size" 
              color="amber" 
              loading={loading} 
           />
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Radar Chart (Model Balance) */}
           <div className="security-card p-6">
              <div className="flex items-center justify-between mb-6">
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3fb950]" /> Model Performance Radar
                 </span>
              </div>
              <MetricsRadar metrics={metrics} />
           </div>

           {/* Confusion Matrix */}
           <div className="security-card p-6">
              <div className="flex items-center justify-between mb-6">
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#f85149]" /> Detection Matrix
                 </span>
              </div>
              <ConfusionMatrix matrix={metrics?.confusion_matrix} />
           </div>
        </div>

        {/* Bottom Wide Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 security-card p-6">
              <div className="flex items-center justify-between mb-6">
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <LineChart className="w-3.5 h-3.5 text-[#58a6ff]" /> Anomaly Probability Waves
                 </span>
              </div>
              <ScoreLineChart predictions={[]} /> {/* Empty for now or fetch specific samples */}
           </div>
           
           <div className="security-card p-6">
              <div className="flex items-center justify-between mb-6">
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-[#bc8cff]" /> Decision Frequency
                 </span>
              </div>
              <ZTABarChart data={metrics?.zta_distribution} />
           </div>
        </div>
      </div>
    </Shell>
  )
}

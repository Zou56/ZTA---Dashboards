import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import { useRealtime } from '../context/RealtimeContext.jsx'
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
  RefreshCw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const API = 'http://localhost:8000'

export default function Assets() {
  const { t } = useTranslation()
  const { token } = useAuth()
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

  // Real-time listener
  useEffect(() => {
    if (lastEvent) fetchAssets()
  }, [lastEvent])

  // Fake count for demo
  const criticalAssets = assets.filter(a => a.anomaly_score > 0.7).length
  const deviceCounts = assets.reduce((acc, curr) => {
    acc[curr.device_type] = (acc[curr.device_type] || 0) + 1
    return acc
  }, {})

  const handleExport = async () => {
    window.location.href = `${API}/export?token=${token}`
  }

  const handleScan = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/data/scan`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert(res.data.message)
      await fetchAssets()
    } catch (err) {
      alert('Scanning Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Module Header */}
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-xl font-black text-white uppercase tracking-[0.2em]">Asset Inventory</h1>
              <p className="text-xs text-[#8b949e] font-bold uppercase tracking-widest mt-1">Managed Identites & Endpoint Compliance</p>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={handleExport}
                className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[11px] font-black text-[#f0f6fc] hover:bg-[#30363d] transition-all"
              >
                 EXPORT INVENTORY
              </button>
              <button 
                onClick={handleScan}
                disabled={loading}
                className="px-4 py-2 bg-[#58a6ff] rounded-lg text-[11px] font-black text-[#0d1117] hover:opacity-90 transition-all shadow-lg shadow-[#58a6ff20] flex items-center gap-2"
              >
                 {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                 SCAN NEW ASSET
              </button>
           </div>
        </div>

        {/* Risk Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              label="ZTA Data Nodes" 
              value={assets.length.toLocaleString()} 
              sub="Total Monitored Units" 
              color="violet" 
              loading={loading} 
           />
        </div>

        {/* Detailed Table */}
        <div className="security-card p-0 bg-transparent border-none">
           <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-1 shadow-2xl">
              <DataTable rows={assets} loading={loading} />
           </div>
        </div>

        {/* Device Compliance Panel (Optional) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="security-card p-5">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#3fb950]" /> Encryption Status
                 </span>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#8b949e] font-bold">AES-256 Enabled</span>
                    <span className="text-[#3fb950] font-mono">98.2%</span>
                 </div>
                 <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="w-[98.2%] h-full bg-[#3fb950]"></div>
                 </div>
              </div>
           </div>
           
           <div className="security-card p-5">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#f0883e]" /> OS Compliance
                 </span>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#8b949e] font-bold">Outdated Versions</span>
                    <span className="text-[#f0883e] font-mono">1.8%</span>
                 </div>
                 <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="w-[1.8%] h-full bg-[#f0883e]"></div>
                 </div>
              </div>
           </div>

           <div className="security-card p-5">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#58a6ff]" /> GEO Geofencing
                 </span>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#8b949e] font-bold">Authorized Regions</span>
                    <span className="text-[#58a6ff] font-mono">100%</span>
                 </div>
                 <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="w-[100%] h-full bg-[#58a6ff]"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Shell>
  )
}

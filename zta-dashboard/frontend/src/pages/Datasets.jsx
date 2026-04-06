import { useState, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import Shell from '../components/Layout/Shell.jsx'
import MetricCard from '../components/MetricCard.jsx'
import { 
  Database, 
  Upload, 
  Cpu, 
  History, 
  CheckCircle2, 
  RefreshCw,
  HardDrive,
  FileCode,
  Layers,
  Terminal
} from 'lucide-react'

const API = 'http://localhost:8000'

export default function Datasets() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [training, setTraining] = useState(false)
  const [integrating, setIntegrating] = useState(false)
  const [ingestLog, setIngestLog] = useState([])
  const fileRef = useRef()

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      await axios.post(`${API}/upload`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Dataset Ingested Successfully')
    } catch (err) {
      alert('Upload Failed')
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleTrain = async () => {
    setTraining(true)
    try {
      await axios.post(`${API}/train`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Machine Learning Model Updated')
    } catch (err) {
      alert('Training Failed')
    } finally {
      setTraining(false)
    }
  }

  const handleIntegrate = async () => {
    setIntegrating(true)
    setIngestLog([])
    
    // Simulate steps for UI impact
    const steps = [
      "Connecting to Network Ingress...",
      "Pulling BETH Behavior Logs...",
      "Syncing Social Platform Activity...",
      "Standardizing to Unified Schema...",
      "Finalizing ZTA Intelligence Pool..."
    ]

    for (let step of steps) {
      setIngestLog(prev => [...prev, { msg: step, ts: new Date().toLocaleTimeString() }])
      await new Promise(r => setTimeout(r, 800))
    }

    try {
      const res = await axios.post(`${API}/data/integrate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIngestLog(prev => [...prev, { msg: "SUCCESS: Unified Dataset Generated", ts: new Date().toLocaleTimeString(), success: true }])
      alert(res.data.message)
    } catch (err) {
      setIngestLog(prev => [...prev, { msg: "ERROR: Integration Failed", ts: new Date().toLocaleTimeString(), error: true }])
      alert('Integration Failed')
    } finally {
      setIntegrating(false)
    }
  }

  return (
    <Shell>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Module Header */}
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-xl font-black text-white uppercase tracking-[0.2em]">Data Intelligence</h1>
              <p className="text-xs text-[#8b949e] font-bold uppercase tracking-widest mt-1">Lifecycle Management & Neural Orchestration</p>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={handleIntegrate}
                disabled={integrating}
                className="px-4 py-2 border border-[#bc8cff40] rounded-lg text-[11px] font-black text-[#bc8cff] hover:bg-[#bc8cff10] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                 {integrating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
                 RUN INTELLIGENCE INTEGRATION
              </button>

              <button 
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[11px] font-black text-[#f0f6fc] hover:bg-[#30363d] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                 {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                 IMPORT DATASET
              </button>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleUpload} className="hidden" />
              
              <button 
                onClick={handleTrain}
                disabled={training}
                className="px-4 py-2 bg-[#bc8cff] rounded-lg text-[11px] font-black text-[#0d1117] hover:opacity-90 transition-all shadow-lg shadow-[#bc8cff20] flex items-center gap-2 disabled:opacity-50"
              >
                 {training ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                 START MODEL TRAINING
              </button>
           </div>
        </div>

        {/* Training Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <MetricCard 
              icon={HardDrive} 
              label="Storage Usage" 
              value="1.2 GB" 
              sub="Secure SQLite Vault" 
              color="blue" 
           />
           <MetricCard 
              icon={Layers} 
              label="Feature Depth" 
              value="18 Cols" 
              sub="Zero Trust Schema" 
              color="teal" 
           />
           <MetricCard 
              icon={Terminal} 
              label="Last Ingestion" 
              value="2h Ago" 
              sub="Automated Batch Run" 
              color="violet" 
           />
           <MetricCard 
              icon={CheckCircle2} 
              label="Dataset Health" 
              value="OPTIMAL" 
              sub="99.9% Data Integrity" 
              color="amber" 
           />
        </div>

        {/* History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 security-card p-6 min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-[#58a6ff]" /> Ingestion History
                 </span>
              </div>
              
              <div className="space-y-4">
                 {ingestLog.length > 0 ? (
                   <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-mono text-[10px] space-y-1 max-h-[300px] overflow-y-auto">
                      {ingestLog.map((log, idx) => (
                        <div key={idx} className={log.error ? "text-red-400" : log.success ? "text-green-400" : "text-[#8b949e]"}>
                           <span className="text-[#484f58] mr-2">[{log.ts}]</span>
                           <span className="uppercase">{log.msg}</span>
                        </div>
                      ))}
                   </div>
                 ) : (
                   [1, 2, 3].map(i => (
                     <div key={i} className="flex items-center justify-between p-4 bg-[#0d1117] border border-[#30363d] rounded-lg group hover:border-[#58a6ff30] transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-[#161b22] border border-[#30363d] rounded flex items-center justify-center">
                              <FileCode className="w-5 h-5 text-[#8b949e]" />
                           </div>
                           <div>
                              <div className="text-[11px] font-black text-[#f0f6fc] uppercase tracking-tighter">ZTA_NETWORK_BATCH_00{i}.csv</div>
                              <div className="text-[10px] text-[#484f58] font-bold mt-0.5">COMPLETED // {10 + i * 5}K RECORDS // 4.2 MB</div>
                           </div>
                        </div>
                        <span className="text-[10px] font-black text-[#3fb950] px-2 py-0.5 rounded bg-[#3fb95015] border border-[#3fb95030]">VERIFIED</span>
                     </div>
                   ))
                 )}
              </div>
           </div>
           
           <div className="security-card p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#161b22] border border-[#30363d] rounded-full flex items-center justify-center mb-4">
                 <Database className="w-8 h-8 text-[#58a6ff]" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Live Schema Monitor</h3>
              <p className="text-[10px] text-[#8b949e] font-medium leading-relaxed max-w-[200px]">
                 Real-time data synchronization between the backend Python engine and the visualization layer.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                 <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
                    <div className="text-[9px] text-[#484f58] font-black uppercase">SYNC RATE</div>
                    <div className="text-sm font-bold text-[#f0f6fc]">60Hz</div>
                 </div>
                 <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
                    <div className="text-[9px] text-[#484f58] font-black uppercase">LATENCY</div>
                    <div className="text-sm font-bold text-[#f0f6fc]">12ms</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Shell>
  )
}

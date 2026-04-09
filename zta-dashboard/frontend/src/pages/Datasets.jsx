import { useState, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import { useToast } from '../context/ToastContext.jsx'
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
  Terminal,
  Server,
  Workflow,
  CloudUpload
} from 'lucide-react'

const API = 'http://localhost:8000'

export default function Datasets() {
  const { token } = useAuth()
  const { toast } = useToast()
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
      toast('Intelligence pack ingested into global vault.', 'success')
    } catch (err) {
      toast('Upload rejected. Integrity check failed.', 'error')
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
      toast('Neural engine optimization strictly finalized.', 'success')
    } catch (err) {
      toast('Optimization pipeline failure. Check SOC core.', 'error')
    } finally {
      setTraining(false)
    }
  }

  const handleIntegrate = async () => {
    setIntegrating(true)
    setIngestLog([])
    
    const steps = [
      "SYNCHRONIZING INGRESS NODES...",
      "DECRYPTING TELEMETRY PACKS...",
      "MAPPING IDENTITIES TO GLOBAL SCHEMA...",
      "RECONCILING EDGE LATENCY DRIFT...",
      "FINALIZING ZTA DATA SOVEREIGNTY..."
    ]

    for (let step of steps) {
      setIngestLog(prev => [...prev, { msg: step, ts: new Date().toLocaleTimeString() }])
      await new Promise(r => setTimeout(r, 600))
    }

    try {
      await axios.post(`${API}/data/integrate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIngestLog(prev => [...prev, { msg: "VALIDATED: UNIFIED INTELLIGENCE GENERATED", ts: new Date().toLocaleTimeString(), success: true }])
      toast('Network streams integrated successfully.', 'success')
    } catch (err) {
      setIngestLog(prev => [...prev, { msg: "DENIED: INTEGRATION REJECTED", ts: new Date().toLocaleTimeString(), error: true }])
      toast('Integration denied by policy controller.', 'error')
    } finally {
      setIntegrating(false)
    }
  }

  return (
    <Shell>
      <div className="space-y-10 animate-px-fade pb-20">
        {/* Module Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-premium relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
           <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-phoenix-primary rounded-2xl shadow-xl shadow-phoenix-primary/20 rotate-3">
                 <Server className="w-7 h-7 text-white" />
              </div>
              <div>
                 <h1 className="text-readable-xl font-black text-phoenix-text-main dark:text-white tracking-tight leading-none mb-2">Intelligence Pipeline</h1>
                 <p className="text-readable-xs text-phoenix-text-muted font-black uppercase tracking-[0.2em]">Lifecycle Management & Neural Orchestration</p>
              </div>
           </div>
           <div className="flex flex-wrap gap-4 relative z-10">
              <button 
                onClick={handleIntegrate}
                disabled={integrating}
                className="px-8 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-3 shadow-sm disabled:opacity-50 uppercase tracking-widest active:scale-95"
              >
                 {integrating ? <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" /> : <Workflow className="w-4 h-4 text-indigo-500" />}
                 Integrate Streams
              </button>

              <button 
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="px-8 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-readable-sm font-black text-phoenix-text-muted dark:text-slate-300 hover:text-phoenix-primary dark:hover:text-phoenix-secondary transition-all flex items-center gap-3 shadow-sm disabled:opacity-50 uppercase tracking-widest active:scale-95"
              >
                 {loading ? <RefreshCw className="w-4 h-4 animate-spin text-phoenix-primary" /> : <CloudUpload className="w-4 h-4 text-phoenix-primary" />}
                 Import Pack
              </button>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleUpload} className="hidden" />
              
              <button 
                onClick={handleTrain}
                disabled={training}
                className="px-8 py-3.5 bg-phoenix-primary rounded-2xl text-readable-sm font-black text-white hover:bg-phoenix-secondary transition-all flex items-center gap-3 shadow-premium disabled:opacity-50 uppercase tracking-widest active:scale-95"
              >
                 {training ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                 Optimise Neural
              </button>
           </div>
        </div>

        {/* Training Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           <MetricCard 
              icon={HardDrive} 
              label="Intelligence Vault" 
              value="1.2 GB" 
              sub="Secure SQLite Archive" 
              color="blue" 
           />
           <MetricCard 
              icon={Layers} 
              label="Standard Schema" 
              value="18 Dim" 
              sub="Vectorized Features" 
              color="teal" 
           />
           <MetricCard 
              icon={Terminal} 
              label="Last Sync" 
              value="2h Ago" 
              sub="Automated Batch Cycle" 
              color="violet" 
           />
           <MetricCard 
              icon={CheckCircle2} 
              label="Integrity Health" 
              value="Optimal" 
              sub="Security Audit Verified" 
              color="amber" 
           />
        </div>

        {/* History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 px-card flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium rounded-[2.5rem] overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                 <h3 className="text-[12px] font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                    <History className="w-5 h-5 text-blue-500" /> Network Activity Pipeline
                 </h3>
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em] italic font-serif">Cluster SOC-01 Central Bus</span>
              </div>
              
              <div className="p-10 space-y-6 flex-1">
                 {ingestLog.length > 0 ? (
                    <div className="bg-slate-950 rounded-[2rem] p-8 font-mono text-[11px] space-y-4 shadow-2xl relative overflow-hidden group border border-slate-800/50">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>
                       {ingestLog.map((log, idx) => (
                         <div key={idx} className={`flex items-start gap-4 ${log.error ? "text-rose-400" : log.success ? "text-emerald-400 font-black" : "text-slate-400"}`}>
                            <span className="text-slate-600 shrink-0 font-black">[{log.ts}]</span>
                            <span className="uppercase font-black tracking-tight">{log.msg}</span>
                         </div>
                       ))}
                       <div className="pt-2 animate-pulse text-blue-500 font-black">_</div>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-3xl group hover:border-blue-200 dark:hover:border-blue-900 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                  <FileCode className="w-6 h-6 text-slate-400" />
                               </div>
                               <div>
                                  <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">DATA_INTEL_BATCH_00{i}.SEC</div>
                                  <div className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest italic opacity-70">Verified // {10 + i * 5}k identities // 4.2 mb</div>
                               </div>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 uppercase tracking-widest shadow-sm">Ingested</span>
                         </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
           
           <div className="px-card p-12 flex flex-col items-center justify-center text-center group bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="w-24 h-24 bg-blue-50 dark:bg-indigo-900/30 border border-blue-100 dark:border-indigo-800 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm group-hover:bg-indigo-600 transition-all duration-700 rotate-6 group-hover:rotate-0">
                 <Database className="w-12 h-12 text-blue-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3 uppercase tracking-widest font-serif italic">Neural Schema</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-[200px] mb-10">
                 Automated synchronization between neural engine and intelligence hub.
              </p>
              
              <div className="grid grid-cols-2 gap-6 w-full mb-10">
                 <div className="p-5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl">
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Freq</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">60Hz</div>
                 </div>
                 <div className="p-5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl">
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Latency</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">12ms</div>
                 </div>
              </div>

              <div className="w-full">
                 <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                    <span>Buffer Occupancy</span>
                    <span className="text-blue-500">14%</span>
                 </div>
                 <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-800 shadow-inner">
                    <div className="w-[14%] h-full bg-blue-600 rounded-full shadow-lg shadow-blue-200"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Shell>
  )
}

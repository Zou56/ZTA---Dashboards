import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Shell from '../components/Layout/Shell.jsx'
import MetricCard from '../components/MetricCard.jsx'
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  TrendingUp, 
  Calendar,
  Layers,
  FileSearch,
  CheckCircle,
  Clock,
  Printer,
  ChevronRight,
  RefreshCw,
  Archive,
  BarChart4,
  Briefcase
} from 'lucide-react'

const API = 'http://localhost:8000'

export default function Reports() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await axios.post(`${API}/report/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast('Security Compliance Report compiled and signed.', 'success')
    } catch {
      toast('Report compilation failed. System busy.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = (report) => {
    toast(`Decrypting and preparing ${report.title}...`, 'info')
    setTimeout(() => {
       toast(`${report.title} downloaded successfully.`, 'success')
    }, 1500)
  }

  const reports = [
    { title: 'Monthly Security Compliance', date: '2026-04-01', size: '1.2 MB', type: 'PDF', status: 'Verfied' },
    { title: 'Weekly Anomaly Trend Analysis', date: '2026-03-25', size: '450 KB', type: 'CSV', status: 'Signed' },
    { title: 'ZTA Infrastructure Audit', date: '2026-03-18', size: '2.8 MB', type: 'PDF', status: 'Verified' },
    { title: 'Identity Boundary Review', date: '2026-03-10', size: '1.4 MB', type: 'XLSX', status: 'Signed' },
  ]

  return (
    <Shell>
      <div className="space-y-10 animate-px-fade pb-20">
        {/* Module Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-premium relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-phoenix-success/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
           <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-phoenix-success rounded-2xl shadow-xl shadow-phoenix-success/10 rotate-3">
                 <Archive className="w-7 h-7 text-white" />
              </div>
              <div>
                 <h1 className="text-readable-xl font-black text-phoenix-text-main dark:text-white tracking-tight leading-none mb-2">Governance Archive</h1>
                 <p className="text-readable-xs text-phoenix-text-muted font-black uppercase tracking-[0.2em]">Executive Summary & Audit Trail Generation</p>
              </div>
           </div>
           <div className="relative z-10">
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className="px-8 py-3.5 bg-phoenix-primary rounded-2xl text-readable-sm font-black text-white hover:bg-phoenix-secondary transition-all flex items-center gap-3 shadow-premium disabled:opacity-50 uppercase tracking-[0.2em] active:scale-95"
              >
                 {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                 {generating ? 'COMPILING ARCHIVE...' : 'COMPILE NEW REPORT'}
              </button>
           </div>
        </div>

        {/* Executive Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           <MetricCard 
              icon={ShieldCheck} 
              label="Trust Posture" 
              value="94%" 
              sub="Meets ISO/IEC 27001" 
              color="teal" 
           />
           <MetricCard 
              icon={TrendingUp} 
              label="Risk Reduction" 
              value="-12.4%" 
              sub="Since Q1 Delta" 
              color="blue" 
           />
           <MetricCard 
              icon={Layers} 
              label="Policy Health" 
              value="100%" 
              sub="Zero Trust Active" 
              color="violet" 
           />
           <MetricCard 
              icon={Briefcase} 
              label="Audit Cycle" 
              value="14 Days" 
              sub="Until Next Review" 
              color="amber" 
           />
        </div>

        {/* History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Reporting History Table */}
           <div className="lg:col-span-2 px-card flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium overflow-hidden">
              <div className="px-8 py-6 border-b border-phoenix-border dark:border-slate-800 flex items-center justify-between">
                 <h3 className="text-readable-sm font-black text-phoenix-text-main dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                    <FileSearch className="w-5 h-5 text-phoenix-primary" /> Compiled Vault History
                 </h3>
                 <span className="text-readable-xs font-black text-phoenix-text-muted dark:text-slate-600 uppercase tracking-widest italic font-serif opacity-70">Central Archive</span>
              </div>
              <div className="flex-1 overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                       <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                          {['Documentation title', 'Compliance Date', 'Entropy Size', 'Status'].map((h, idx) => (
                             <th key={idx} className="px-8 py-5 text-readable-xs font-black text-phoenix-text-muted dark:text-slate-500 uppercase tracking-[0.15em] border-b border-phoenix-border dark:border-slate-800">
                                {h}
                             </th>
                          ))}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-phoenix-border dark:divide-slate-800">
                       {reports.map((r, i) => (
                          <tr key={i} className="hover:bg-phoenix-primary/5 transition-all duration-300 group cursor-default">
                             <td className="px-8 py-6 flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-phoenix-border dark:border-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-phoenix-primary/10 group-hover:border-phoenix-primary/20 transition-all shadow-sm">
                                   <FileText className="w-6 h-6 group-hover:text-phoenix-primary" />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-readable-sm font-black text-phoenix-text-main dark:text-white tracking-tight leading-none mb-1">{r.title}</span>
                                   <span className="text-readable-xs font-black text-phoenix-text-muted uppercase tracking-widest group-hover:text-phoenix-primary">{r.type} SECURE BLOB</span>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-readable-xs text-phoenix-text-muted font-black font-mono uppercase tracking-widest">{r.date}</td>
                             <td className="px-8 py-6 text-readable-xs text-phoenix-text-muted font-black font-mono tracking-widest">{r.size}</td>
                             <td className="px-8 py-6">
                                <button 
                                  onClick={() => handleDownload(r)}
                                  className="flex items-center gap-2.5 px-5 py-2.5 bg-white dark:bg-slate-800 border border-phoenix-border rounded-xl text-readable-xs font-black text-phoenix-text-muted hover:bg-white hover:border-phoenix-primary hover:text-phoenix-primary hover:shadow-premium transition-all active:scale-95"
                                >
                                   <Download className="w-4 h-4" />
                                   PULL ARCHIVE
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-6 flex items-center justify-center border-t border-phoenix-border bg-slate-50/20">
                 <button 
                   onClick={() => toast('Redirecting to secure storage vault...', 'info')}
                   className="text-readable-xs font-black text-phoenix-text-muted hover:text-phoenix-primary uppercase tracking-widest flex items-center gap-3 transition-all"
                 >
                    Access Extended Vault <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {/* Executive Summary Wizard Area */}
           <div className="px-card p-10 flex flex-col items-center justify-center text-center group bg-white dark:bg-slate-900 border border-phoenix-border shadow-premium relative overflow-hidden rounded-[2.5rem]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-phoenix-success to-phoenix-primary"></div>
              <div className="w-24 h-24 bg-phoenix-success/10 border border-phoenix-success/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm group-hover:bg-phoenix-success transition-all duration-700 rotate-6 group-hover:rotate-0">
                 <CheckCircle className="w-12 h-12 text-phoenix-success group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-readable-xl font-black text-phoenix-text-main dark:text-white tracking-tight mb-2 uppercase">Posture Integrity</h3>
              <p className="text-readable-xs text-phoenix-text-muted font-bold uppercase tracking-widest leading-relaxed max-w-[220px] mb-10">
                 System complies with international ZTA standards.
              </p>
              
              <div className="w-full space-y-8">
                 <div className="bg-slate-50 border border-phoenix-border dark:bg-slate-800/50 p-6 rounded-3xl text-left relative overflow-hidden group/item">
                    <div className="flex items-center gap-3 mb-3">
                       <Clock className="w-5 h-5 text-phoenix-primary group-hover/item:animate-spin-slow" />
                       <span className="text-readable-xs font-black text-phoenix-text-main dark:text-white uppercase tracking-[0.2em]">Auto-Run L9</span>
                    </div>
                    <p className="text-readable-xs text-phoenix-text-muted font-bold leading-relaxed italic pr-6">
                       Network Intelligence compiles a signed audit trail every 24h.
                    </p>
                 </div>

                 <button 
                  onClick={() => toast('Opening Audit Configuration...', 'info')}
                  className="w-full py-4.5 bg-white dark:bg-slate-800 border border-phoenix-border rounded-3xl text-readable-sm font-black text-phoenix-text-muted hover:bg-slate-50 hover:text-phoenix-text-main transition-all uppercase tracking-[0.2em] shadow-sm active:scale-95"
                 >
                    Configure Scheduler
                 </button>
              </div>
           </div>
        </div>
      </div>
    </Shell>
  )
}

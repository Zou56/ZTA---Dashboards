import { useState } from 'react'
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
  ChevronRight
} from 'lucide-react'

import axios from 'axios'
import { useAuth } from '../App.jsx'

const API = 'http://localhost:8000'

export default function Reports() {
  const { token } = useAuth()
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await axios.post(`${API}/report/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Security Compliance Report compiled and saved to archives.')
    } catch {
      alert('Report Generation Failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = (report) => {
    alert(`Downloading ${report.title}... Resource secured.`)
  }

  const handleSchedule = () => {
    alert('Automated Report Scheduler updated for 00:00 UTC Batch.')
  }

  const reports = [
    { title: 'Monthly Security Compliance', date: '2026-04-01', size: '1.2 MB', type: 'PDF' },
    { title: 'Weekly Anomaly Trend Analysis', date: '2026-03-25', size: '450 KB', type: 'CSV' },
    { title: 'ZTA Infrastructure Audit', date: '2026-03-18', size: '2.8 MB', type: 'PDF' },
  ]

  return (
    <Shell>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Module Header */}
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-xl font-black text-white uppercase tracking-[0.2em]">Compliance Reports</h1>
              <p className="text-xs text-[#8b949e] font-bold uppercase tracking-widest mt-1">Executive Summary & Audit Trail Generation</p>
           </div>
           <button 
             onClick={handleGenerate}
             disabled={generating}
             className="px-4 py-2 bg-[#58a6ff] rounded-lg text-[11px] font-black text-[#0d1117] hover:opacity-90 transition-all shadow-lg shadow-[#58a6ff20] flex items-center gap-2 disabled:opacity-50"
           >
              {generating ? 'COMPILING...' : <Printer className="w-3.5 h-3.5" />}
              {generating ? 'COMPILING...' : 'GENERATE NEW REPORT'}
           </button>
        </div>

        {/* Executive Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <MetricCard 
              icon={ShieldCheck} 
              label="Compliance Score" 
              value="94%" 
              sub="Meets ISO/IEC 27001" 
              color="teal" 
           />
           <MetricCard 
              icon={TrendingUp} 
              label="Risk Trend" 
              value="-12.4%" 
              sub="Reduction since March" 
              color="blue" 
           />
           <MetricCard 
              icon={Layers} 
              label="Policy Coverage" 
              value="100%" 
              sub="All ZTA rules active" 
              color="violet" 
           />
           <MetricCard 
              icon={Calendar} 
              label="Next Audit" 
              value="14 Days" 
              sub="Quarterly Review" 
              color="amber" 
           />
        </div>

        {/* History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Reporting History Table */}
           <div className="lg:col-span-2 security-card p-0">
              <div className="security-card-header">
                 <span className="security-card-title">Generated Documentation History</span>
                 <FileSearch className="w-3.5 h-3.5 text-[#8b949e]" />
              </div>
              <div className="p-0">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-[#161b22] border-b border-[#30363d]">
                       <tr>
                          {['Report Title', 'Date', 'File Size', 'Download'].map((h, idx) => (
                             <th key={idx} className="px-5 py-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">
                                {h}
                             </th>
                          ))}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]/50">
                       {reports.map((r, i) => (
                          <tr key={i} className="hover:bg-[#161b22]/50 transition-colors group">
                             <td className="px-5 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#8b949e]">
                                   <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-black text-[#f0f6fc] uppercase tracking-tighter">{r.title}</span>
                             </td>
                             <td className="px-5 py-4 text-[10px] text-[#8b949e] font-mono">{r.date}</td>
                             <td className="px-5 py-4 text-[10px] text-[#8b949e] font-mono">{r.size}</td>
                             <td className="px-5 py-4">
                                <button 
                                  onClick={() => handleDownload(r)}
                                  className="p-2 rounded bg-[#21262d] border border-transparent hover:border-[#30363d] text-[#8b949e] hover:text-[#58a6ff] transition-all"
                                >
                                   <Download className="w-3.5 h-3.5" />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 <div className="p-4 flex items-center justify-center border-t border-[#30363d]">
                    <button 
                      onClick={() => alert('Viewing all archives... Load failed: Registry locked.')}
                      className="text-[10px] font-black text-[#8b949e] hover:text-[#f0f6fc] uppercase tracking-[0.2em] flex items-center gap-1 transition-colors"
                    >
                       VIEW ALL ARCHIVES <ChevronRight className="w-3 h-3" />
                    </button>
                 </div>
              </div>
           </div>

           {/* Executive Summary Wizard Area */}
           <div className="security-card p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-full bg-[#58a6ff15] border border-[#58a6ff30] flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#58a6ff]" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Compliance Status</h3>
                    <p className="text-[9px] text-[#3fb950] font-bold uppercase tracking-widest">Healthy // No Breaches</p>
                 </div>
              </div>
              
              <div className="flex-1 space-y-6">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-black text-[#8b949e] uppercase">Policy Integrity</span>
                       <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded bg-[#3fb95030] text-[#3fb950]">PASSED</span>
                    </div>
                    <div className="w-full h-1 bg-[#161b22] rounded-full overflow-hidden">
                       <div className="w-full h-full bg-[#3fb950]"></div>
                    </div>
                 </div>

                 <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                       <Clock className="w-3 h-3 text-[#f0883e]" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Auto-Reporting Active</span>
                    </div>
                    <p className="text-[10px] text-[#8b949e] leading-relaxed">
                       Your system generates an automated audit trail every 24 hours. The next report will be ready at 00:00 UTC.
                    </p>
                 </div>
              </div>

              <div className="mt-8">
                 <button className="w-full py-3 bg-[#21262d] border border-[#30363d] rounded-lg text-[10px] font-black text-[#f0f6fc] hover:bg-[#30363d] transition-all uppercase tracking-[0.15em]">
                    Configure Schedule
                 </button>
              </div>
           </div>
        </div>
      </div>
    </Shell>
  )
}

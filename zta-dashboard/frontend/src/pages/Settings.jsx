import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import Shell from '../components/Layout/Shell.jsx'
import { 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  Shield, 
  Cpu, 
  Terminal, 
  Save, 
  RefreshCw,
  Sliders,
  Database,
  Lock,
  Smartphone,
  ChevronRight,
  Fingerprint,
  FileText,
  Activity,
  Zap,
  Radio
} from 'lucide-react'

const API = 'http://localhost:8000'

export default function Settings() {
  const { token } = useAuth()
  const { toast } = useToast()
  const { theme: currentTheme, toggleTheme, isDark } = useTheme()
  
  const [activeTab, setActiveTab] = useState(0)
  const [config, setConfig] = useState({
    alert_threshold: 0.7,
    auto_train: false,
    font_scale: 1, // 1 = 100%
    theme: 'dark'
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API}/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setConfig({
          alert_threshold: res.data.alert_threshold ?? 0.7,
          auto_train: res.data.auto_train ?? false,
          font_scale: res.data.font_scale ?? 1,
          theme: res.data.theme ?? 'dark'
        })
        // Apply initial font scale
        if (res.data.font_scale) {
          document.documentElement.style.fontSize = `${res.data.font_scale * 100}%`
        }
      } catch (err) {
        toast('Configuration synchronization failed.', 'error')
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchConfig()
  }, [token])

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.post(`${API}/settings`, config, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast('Global Policy & System Parameters strictly updated.', 'success')
      // Apply font scale effect globally
      document.documentElement.style.fontSize = `${config.font_scale * 100}%`
    } catch (err) {
      toast('Failed to commit configuration change.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAuditLog = () => {
    toast('Generating cryptographically signed audit report...', 'info')
  }

  const handleAccessMatrix = () => {
    toast('Access Boundary Matrix is currently locked for review.', 'warning')
  }

  const tabs = [
    { icon: Globe, label: 'Standardization', desc: 'Global API and environment identification' },
    { icon: Cpu, label: 'ML Flow Control', desc: 'Model retraining and sensitivity settings' },
    { icon: Shield, label: 'Governance', desc: 'Access enforcement and audit policies' },
    { icon: Bell, label: 'Telemetry Alerts', desc: 'Notification thresholds and targets' },
    { icon: Terminal, label: 'Advanced Logs', desc: 'Raw system telemetry and debugging' }
  ]

  if (loading) return (
     <Shell>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
           <RefreshCw className="w-8 h-8 animate-spin text-phoenix-primary" />
           <span className="text-readable-xs font-black uppercase tracking-widest text-slate-400">Syncing Environment State...</span>
        </div>
     </Shell>
  )

  return (
    <Shell>
      <div className="space-y-10 animate-px-fade pb-20">
        {/* Module Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-premium relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-phoenix-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
           <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-phoenix-primary dark:bg-slate-800 rounded-2xl shadow-xl border border-phoenix-primary/20">
                 <SettingsIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                 <h1 className="text-readable-xl font-black text-phoenix-text-main dark:text-white tracking-tight leading-none mb-2">Environment Control</h1>
                 <p className="text-readable-xs text-phoenix-text-muted font-black uppercase tracking-[0.2em]">Global Parameters & SOC Governance</p>
              </div>
           </div>
           <div className="relative z-10">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3.5 bg-phoenix-primary rounded-2xl text-readable-sm font-black uppercase tracking-[0.2em] text-white hover:bg-phoenix-secondary hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all shadow-premium flex items-center gap-3 disabled:opacity-50"
              >
                 {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 shadow-lg shadow-phoenix-primary/50" />}
                 COMMIT ALL POLICIES
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
           {/* Sidebar Tabs */}
           <div className="lg:col-span-1 space-y-8">
              <div className="px-card overflow-hidden bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium rounded-[2.5rem]">
                 <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <span className="text-readable-xs font-black text-phoenix-text-muted dark:text-slate-600 uppercase tracking-[0.2em]">CORE MODULES</span>
                 </div>
                 <div className="flex flex-col">
                    {tabs.map((item, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveTab(i)}
                        className={`flex items-center justify-between gap-4 px-8 py-6 text-readable-sm font-black uppercase tracking-widest transition-all border-l-4 ${activeTab === i ? 'bg-phoenix-primary/5 dark:bg-phoenix-primary/20 text-phoenix-primary dark:text-phoenix-secondary border-phoenix-primary' : 'text-slate-400 border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                         <div className="flex items-center gap-4">
                            <item.icon className={`w-5 h-5 ${activeTab === i ? 'text-phoenix-primary' : 'text-slate-300 dark:text-slate-700'}`} /> 
                            <span className="tracking-tight">{item.label}</span>
                         </div>
                         <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === i ? 'opacity-100 translate-x-1' : 'opacity-0'}`} />
                      </button>
                    ))}
                 </div>
              </div>
              
              <div className="px-card p-10 border-l-[10px] border-l-phoenix-success bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium rounded-[2.5rem]">
                 <div className="flex items-center gap-4 mb-5">
                    <div className="p-3 bg-phoenix-success/5 dark:bg-phoenix-success/20 rounded-2xl shadow-sm">
                       <Radio className="w-5 h-5 text-phoenix-success animate-pulse" />
                    </div>
                    <span className="text-readable-xs font-black text-phoenix-text-main dark:text-white uppercase tracking-widest">Neural Link</span>
                 </div>
                 <p className="text-readable-xs text-phoenix-text-muted dark:text-slate-400 font-black leading-relaxed mb-8 uppercase tracking-widest italic opacity-70">Sovereign connection to SOC-Cluster-01 is active.</p>
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-phoenix-success animate-pulse shadow-lg shadow-phoenix-success/20"></div>
                    <span className="text-readable-xs font-black text-phoenix-success uppercase tracking-[0.2em]">Integrity 100%</span>
                 </div>
              </div>
           </div>

           {/* Main Settings Panel */}
           <div className="lg:col-span-3 space-y-10">
              
              {/* Conditional Content based on activeTab */}
              {activeTab === 0 && (
                <div className="px-card bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium rounded-[2.5rem] animate-slide-up overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-phoenix-primary/5 rounded-full blur-3xl"></div>
                   <div className="px-10 py-8 border-b border-phoenix-border dark:border-slate-800 flex items-center justify-between relative z-10">
                      <h3 className="text-readable-xs font-black text-phoenix-text-main dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                         <Globe className="w-5 h-5 text-phoenix-primary" /> Environment Branding
                      </h3>
                   </div>
                   <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                      <div className="space-y-6">
                          <label className="text-readable-xs font-black text-phoenix-text-muted dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Typography scale</label>
                          <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex-col gap-6">
                             <div className="flex justify-between items-center px-1">
                                <span className="text-readable-sm font-black text-phoenix-text-main dark:text-white uppercase tracking-tighter">{Math.round(config.font_scale * 100)}% ZOOM</span>
                                <span className="text-[10px] text-phoenix-success font-black uppercase tracking-widest">All-Ages HUD</span>
                             </div>
                             <input 
                               type="range" 
                               min="0.8" 
                               max="1.5" 
                               step="0.05"
                               value={config.font_scale}
                               onChange={(e) => setConfig({...config, font_scale: parseFloat(e.target.value)})}
                               className="w-full accent-phoenix-primary h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                             />
                          </div>
                       </div>
                      <div className="space-y-6">
                         <label className="text-readable-xs font-black text-phoenix-text-muted dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Apperance Protocol</label>
                         <div className="flex bg-slate-100/50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                            <button 
                              onClick={() => isDark && toggleTheme()}
                              className={`flex-1 py-3.5 rounded-xl text-readable-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${!isDark ? 'bg-white text-phoenix-primary shadow-premium' : 'text-slate-400 dark:text-slate-500 hover:text-white'}`}
                            >
                               <RefreshCw className={`w-3.5 h-3.5 ${!isDark ? 'animate-spin-slow text-phoenix-primary' : ''}`} />
                               Light
                            </button>
                            <button 
                              onClick={() => !isDark && toggleTheme()}
                              className={`flex-1 py-3.5 rounded-xl text-readable-sm font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-slate-900 text-phoenix-secondary shadow-premium border border-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                               <Zap className={`w-3.5 h-3.5 ${isDark ? 'animate-pulse text-phoenix-secondary' : ''}`} />
                               Dark
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 1 && (
                <div className="px-card bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium rounded-[2.5rem] animate-slide-up">
                   <div className="px-10 py-8 border-b border-phoenix-border dark:border-slate-800 flex items-center justify-between">
                      <h3 className="text-readable-xs font-black text-phoenix-text-main dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                         <Cpu className="w-5 h-5 text-phoenix-secondary" /> Intelligence Thresholds
                      </h3>
                   </div>
                   <div className="p-10 space-y-12">
                      <div className="space-y-8">
                         <div className="flex justify-between items-center">
                            <div>
                               <label className="text-readable-xs font-black text-phoenix-text-muted dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Detection Sensitivity</label>
                               <p className="text-readable-xs text-phoenix-text-muted mt-2 uppercase tracking-widest opacity-70 italic leading-relaxed">Neural drift calibration parameters.</p>
                            </div>
                            <div className="px-6 py-3 rounded-2xl bg-phoenix-primary text-white font-black text-lg shadow-xl shadow-phoenix-primary/20 border border-phoenix-primary/30 animate-pulse">{config.alert_threshold}</div>
                         </div>
                         <div className="relative px-2">
                           <input 
                               type="range" 
                               min="0" 
                               max="1" 
                               step="0.05"
                               value={config.alert_threshold}
                               onChange={(e) => setConfig({...config, alert_threshold: parseFloat(e.target.value)})}
                               className="w-full accent-phoenix-primary h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                           />
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-phoenix-border">
                         <div className="flex items-center justify-between p-8 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700 rounded-[2rem] hover:bg-white dark:hover:bg-slate-800 transition-all group shadow-sm">
                            <div className="pr-6">
                              <div className="text-readable-sm font-black text-phoenix-text-main dark:text-white tracking-tight uppercase mb-1">Autonomous Train</div>
                              <div className="text-readable-xs text-phoenix-text-muted font-bold uppercase tracking-widest leading-relaxed">Self-healing neural link.</div>
                            </div>
                            <button 
                              onClick={() => setConfig(c => ({...c, auto_train: !c.auto_train}))}
                              className={`w-16 h-8 rounded-full relative transition-all duration-700 focus:outline-none ${config.auto_train ? 'bg-phoenix-primary shadow-xl shadow-phoenix-primary/30' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                               <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-700 shadow-md ${config.auto_train ? 'right-1 scale-110 shadow-blue-500/50' : 'left-1'}`}></div>
                            </button>
                         </div>
                         <div className="p-8 bg-phoenix-primary rounded-[2rem] flex items-center justify-between shadow-premium border border-phoenix-primary/30 group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-1000"></div>
                            <div className="pr-6 relative z-10">
                              <div className="text-readable-sm font-black text-white tracking-tight uppercase mb-1">Inference Active</div>
                              <div className="text-readable-xs text-white/70 font-black uppercase tracking-widest">Enforcement Mode</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white relative z-10 group-hover:rotate-12 transition-transform">
                               <Fingerprint className="w-7 h-7" />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 2 && (
                <div className="px-card bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium rounded-[2.5rem] animate-slide-up overflow-hidden">
                   <div className="absolute top-0 right-0 w-80 h-80 bg-phoenix-danger/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                   <div className="px-10 py-8 border-b border-phoenix-border dark:border-slate-800 flex items-center justify-between relative z-10">
                      <h3 className="text-readable-xs font-black text-phoenix-text-main dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                         <Shield className="w-5 h-5 text-phoenix-danger" /> Governance Policy (L4)
                      </h3>
                      <span className="text-[10px] font-black text-white bg-phoenix-danger px-3 py-1 rounded-lg shadow-sm uppercase tracking-widest animate-pulse">ENFORCED</span>
                   </div>
                   <div className="p-10 space-y-10 relative z-10">
                      <div className="p-10 bg-phoenix-danger/5 dark:bg-phoenix-danger/10 border border-phoenix-danger/20 rounded-[2.5rem] border-l-[16px] border-l-phoenix-danger relative overflow-hidden group shadow-sm">
                         <div className="flex items-center gap-6 mb-8 relative z-10">
                            <div className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-phoenix-danger/20 group-hover:scale-110 transition-transform duration-700">
                               <Lock className="w-8 h-8 text-phoenix-danger" />
                            </div>
                            <div>
                               <h4 className="text-readable-sm font-black text-phoenix-danger dark:text-rose-400 uppercase tracking-[0.2em] mb-1">Isolation Protocol L9</h4>
                               <p className="text-readable-xs text-phoenix-text-muted font-bold uppercase tracking-widest leading-none">Access Boundary Enforcement</p>
                            </div>
                         </div>
                         <p className="text-readable-sm text-phoenix-text-main dark:text-slate-400 font-black leading-relaxed pr-12 relative z-10 uppercase tracking-widest italic opacity-80">
                            High risk entities SILOED into isolated clusters. Override disabled.
                         </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
                         <button 
                           onClick={handleAccessMatrix}
                           className="w-full py-5 bg-white dark:bg-slate-800 border border-phoenix-border rounded-[2rem] text-readable-sm font-black text-phoenix-text-muted uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-4 hover:border-phoenix-primary group"
                         >
                            <Sliders className="w-5 h-5 text-slate-400 group-hover:text-phoenix-primary transition-colors" /> Access Matrix
                         </button>
                         <button 
                           onClick={handleAuditLog}
                           className="w-full py-5 bg-white dark:bg-slate-800 border border-phoenix-border rounded-[2rem] text-readable-sm font-black text-phoenix-text-muted uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-4 hover:border-phoenix-danger group"
                         >
                            <FileText className="w-5 h-5 text-slate-400 group-hover:text-phoenix-danger transition-colors" /> Policy Audit
                         </button>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </Shell>
  )
}

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
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
  Smartphone
} from 'lucide-react'

const API = 'http://localhost:8000'

export default function Settings() {
  const { token } = useAuth()
  const [config, setConfig] = useState({
    api_url: API,
    alert_threshold: 0.7,
    telegram_alerts: true,
    auto_train: false,
    theme: 'dark',
    language: 'EN'
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Fetch current backend config if available
    const fetchConfig = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API}/bot/config`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setConfig(prev => ({
          ...prev,
          telegram_alerts: res.data.enabled
        }))
      } catch (err) {
        console.error('Config fetch failed')
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [token])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Mock save for UI config
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Global Security Policy & System configuration updated successfully.')
    } catch (err) {
      alert('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const toggleAutoRetrain = () => {
    setConfig(prev => ({ ...prev, auto_train: !prev.auto_train }))
    alert(`Auto-Retrain ${!config.auto_train ? 'Enabled' : 'Disabled'}`)
  }

  const handleEditRules = () => {
    alert('Access Rule Editor: Permission Denied. Site-Bravo is in Static-Policy lockdown.')
  }

  const handleReviewPermissions = () => {
    alert('Generating Permission Audit Matrix... Check email for full report.')
  }

  return (
    <Shell>
      <div className="p-6 space-y-6 animate-fade-in max-w-5xl mx-auto">
        {/* Module Header */}
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-xl font-black text-white uppercase tracking-[0.2em]">System Configuration</h1>
              <p className="text-xs text-[#8b949e] font-bold uppercase tracking-widest mt-1">Global ZTA Parameters & API Management</p>
           </div>
           <button 
             onClick={handleSave}
             disabled={saving}
             className="px-4 py-2 bg-[#58a6ff] rounded-lg text-[11px] font-black text-[#0d1117] hover:opacity-90 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
           >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              SAVE ALL CHANGES
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Sidebar Tabs (Mock for single page) */}
           <div className="lg:col-span-1 space-y-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
                 <div className="p-4 border-b border-[#30363d] bg-[#0d1117]/50">
                    <span className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">Configuration Modules</span>
                 </div>
                 <div className="flex flex-col">
                    {[
                      { icon: Globe, label: 'General & Localization' },
                      { icon: Cpu, label: 'ML Engine Parameters' },
                      { icon: Bell, label: 'Alerting & Notifications' },
                      { icon: Shield, label: 'Security & Access' },
                      { icon: Terminal, label: 'Advanced Debugging' }
                    ].map((item, i) => (
                      <button key={i} className={`flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all border-l-2 ${i === 0 ? 'bg-[#161b22] text-[#58a6ff] border-[#58a6ff]' : 'text-[#8b949e] border-transparent hover:bg-[#0d1117]/50 hover:text-[#f0f6fc]'}`}>
                         <item.icon className="w-4 h-4" /> {item.label}
                      </button>
                    ))}
                 </div>
              </div>
              
              <div className="security-card p-5">
                <div className="flex items-center gap-2 mb-3">
                   <Sliders className="w-4 h-4 text-[#58a6ff]" />
                   <span className="text-[11px] font-black text-white uppercase tracking-tighter">Engine Health</span>
                </div>
                <div className="text-[10px] text-[#8b949e] mb-4">WebSocket connection to Inference Engine is currently active.</div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse"></div>
                   <span className="text-[10px] font-black text-[#3fb950] uppercase tracking-widest">REAL-TIME SYNC ACTIVE</span>
                </div>
              </div>
           </div>

           {/* Main Settings Panel */}
           <div className="lg:col-span-2 space-y-6">
              {/* General Section */}
              <div className="security-card p-6">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#58a6ff]" /> General Configuration
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">API Server URL</label>
                       <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={config.api_url}
                            className="flex-1 bg-[#0d1117] border border-[#30363d] px-3 py-2 rounded text-xs text-[#f0f6fc] font-mono focus:ring-1 focus:ring-[#58a6ff]"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">Primary Language</label>
                       <select className="w-full bg-[#0d1117] border border-[#30363d] px-3 py-2 rounded text-xs text-[#f0f6fc] font-bold appearance-none focus:ring-1 focus:ring-[#58a6ff]">
                          <option>EN - English (Standard)</option>
                          <option>ID - Bahasa Indonesia</option>
                       </select>
                    </div>
                 </div>
              </div>

              {/* Threshold Section */}
              <div className="security-card p-6">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#bc8cff]" /> ML Threshold Parameters
                 </h3>
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">Anomaly Detection Sensitivity</label>
                          <span className="text-xs font-mono text-[#bc8cff] font-bold">{config.alert_threshold}</span>
                       </div>
                       <input 
                         type="range" 
                         min="0" 
                         max="1" 
                         step="0.05"
                         value={config.alert_threshold}
                         onChange={(e) => setConfig({...config, alert_threshold: parseFloat(e.target.value)})}
                         className="w-full h-1.5 bg-[#21262d] rounded-full appearance-none accent-[#58a6ff] cursor-pointer"
                       />
                       <div className="flex justify-between text-[9px] text-[#484f58] font-bold uppercase tracking-tighter">
                          <span>Conservative</span>
                          <span>Hyper-Sensitive</span>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#30363d]">
                       <div className="flex items-center justify-between p-3 bg-[#0d1117]/50 rounded-lg">
                          <div>
                            <div className="text-[10px] font-black text-white uppercase tracking-tight">Auto-Retrain Model</div>
                            <div className="text-[9px] text-[#8b949e]">Retrain script on new batch</div>
                          </div>
                          <div 
                            onClick={toggleAutoRetrain}
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${config.auto_train ? 'bg-[#3fb950]' : 'bg-[#30363d]'}`}
                          >
                             <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${config.auto_train ? 'right-0.5 bg-white' : 'left-0.5 bg-[#8b949e]'}`}></div>
                          </div>
                       </div>
                       <div className="flex items-center justify-between p-3 bg-[#0d1117]/50 rounded-lg border border-[#bc8cff15]">
                          <div>
                            <div className="text-[10px] font-black text-white uppercase tracking-tight">Real-time Inference</div>
                            <div className="text-[9px] text-[#8b949e]">Active for all geo-nodes</div>
                          </div>
                          <div className="w-10 h-5 bg-[#3fb950] rounded-full relative cursor-pointer shadow-sm shadow-[#3fb95050]">
                             <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Security Policy Section */}
              <div className="security-card p-6">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#f85149]" /> ZTA Security Policy
                 </h3>
                 <div className="space-y-4">
                    <div className="p-4 bg-[#f8514908] border border-[#f8514920] rounded-lg border-l-4 border-l-[#f85149]">
                       <div className="flex items-center gap-2 mb-1">
                          <Lock className="w-3.5 h-3.5 text-[#f85149]" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">STRICT MODE ACTIVE</span>
                       </div>
                       <p className="text-[10px] text-[#8b949e] leading-relaxed">
                          All users with Anomaly Score &gt; 0.85 are automatically denied access until manual verification is provided. This rule cannot be overridden.
                       </p>
                    </div>
                    <div className="flex items-center gap-4">
                       <button 
                         onClick={handleEditRules}
                         className="flex-1 py-2 bg-[#21262d] border border-[#30363d] rounded text-[10px] font-black text-white uppercase hover:bg-[#30363d] transition-all"
                       >
                          Edit Access Rules
                       </button>
                       <button 
                         onClick={handleReviewPermissions}
                         className="flex-1 py-2 bg-[#21262d] border border-[#30363d] rounded text-[10px] font-black text-white uppercase hover:bg-[#30363d] transition-all"
                       >
                          Review Permissions
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Shell>
  )
}

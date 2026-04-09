import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Shell from '../components/Layout/Shell.jsx'
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Key, 
  LogOut, 
  Smartphone,
  Laptop,
  Clock,
  History,
  AlertCircle,
  RefreshCw,
  Edit3,
  Fingerprint
} from 'lucide-react'

const API = 'http://localhost:8000'

export default function Profile() {
  const { user, token, logout } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showNotice, setShowNotice] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setProfile(res.data)
      } catch (err) {
        console.error('Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchProfile()
  }, [token])

  const handleEditProfile = () => {
    toast('Profile management strictly reserved for lead auditors.', 'info')
  }

  const handleRevoke = (device) => {
    toast(`Session for ${device} strictly revoked from global vault.`, 'error')
  }

  const handleAcknowledge = () => {
    setShowNotice(false)
    toast('Security posture acknowledged and logged.', 'success')
  }

  const sessions = [
    { device: 'Work Macbook Pro', OS: 'macOS 14.5', IP: '192.168.1.102', status: 'Live Now', current: true },
    { device: 'iPhone 15 Pro Max', OS: 'iOS 17.5', IP: '10.0.8.22', status: '3h Ago', current: false },
    { device: 'Sentinel Pad G4', OS: 'iPadOS 17.2', IP: '172.16.5.1', status: 'Yesterday', current: false },
  ]

  if (loading) return (
     <Shell>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
           <RefreshCw className="w-8 h-8 animate-spin text-phoenix-primary" />
           <span className="text-readable-xs font-black uppercase tracking-widest text-slate-400">Synchronizing Identity Archive...</span>
        </div>
     </Shell>
  )

  return (
    <Shell>
      <div className="space-y-10 animate-px-fade max-w-6xl mx-auto pb-20">
        {/* Profile Header */}
        <div className="px-card p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-premium rounded-[2.5rem]">
           <div className="absolute top-0 right-0 w-80 h-80 bg-phoenix-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
           <div className="absolute bottom-0 left-0 w-80 h-80 bg-phoenix-secondary/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

           <div className="relative group">
              <div className="w-44 h-44 rounded-[2.8rem] bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-2 shadow-xl group-hover:border-phoenix-primary/30 transition-all duration-700 overflow-hidden rotate-3 group-hover:rotate-0">
                 <div className="w-full h-full rounded-[2.5rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'Felix'}&backgroundColor=b6e3f4`} 
                      alt="SOC Analyst"
                      className="w-full h-full object-cover scale-110"
                    />
                 </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-[1.2rem] bg-phoenix-success border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform z-10">
                 <ShieldCheck className="w-6 h-6 text-white" />
              </div>
           </div>

           <div className="flex-1 text-center md:text-left relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
                 <h1 className="text-readable-xl font-black text-phoenix-text-main dark:text-white tracking-tight leading-none">{profile?.username || user || 'Administrator'}</h1>
                 <span className="px-4 py-1.5 rounded-xl bg-phoenix-primary/5 dark:bg-phoenix-primary/20 text-phoenix-primary dark:text-phoenix-secondary text-readable-xs font-black uppercase tracking-[0.2em] border border-phoenix-primary/10 dark:border-phoenix-primary/30 shadow-sm leading-none">
                    {profile?.role || 'Lead SOC Analyst'}
                 </span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-8 text-readable-xs font-black text-phoenix-text-muted dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                 <span className="flex items-center gap-3"><Mail className="w-4.5 h-4.5 text-phoenix-primary" /> {profile?.username?.toLowerCase()}@phoenix-soc.alfa</span>
                 <span className="flex items-center gap-3"><MapPin className="w-4.5 h-4.5 text-phoenix-success" /> Alpha-Sector</span>
                 <span className="flex items-center gap-3"><Calendar className="w-4.5 h-4.5 text-phoenix-secondary" /> Genesis: {profile?.created_at?.split('T')[0] || '2024-04-09'}</span>
              </div>
           </div>

           <div className="flex flex-col gap-3 min-w-[200px] relative z-10">
              <button 
                onClick={handleEditProfile}
                className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-readable-sm font-black uppercase tracking-widest text-phoenix-text-muted dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 active:scale-95"
              >
                 <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
              <button 
                onClick={logout}
                className="px-8 py-4 bg-phoenix-danger rounded-2xl text-readable-sm font-black uppercase tracking-widest text-white hover:bg-rose-700 transition-all shadow-premium flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0 active:scale-95"
              >
                 <LogOut className="w-4 h-4" /> Kill Session
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Security Settings Area */}
           <div className="lg:col-span-1 space-y-10">
              <div className="px-card p-10 flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium rounded-[2.5rem]">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-readable-sm font-black text-phoenix-text-main dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                       <Fingerprint className="w-5 h-5 text-phoenix-primary" /> Identity Vault
                    </h3>
                 </div>
                 <div className="space-y-4">
                    <button onClick={handleEditProfile} className="w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl hover:bg-white dark:hover:bg-slate-800 hover:border-phoenix-primary/20 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl group-hover:bg-phoenix-primary/5 transition-all">
                             <Key className="w-5 h-5 text-slate-400 group-hover:text-phoenix-primary" />
                          </div>
                          <span className="text-readable-sm font-black text-phoenix-text-muted group-hover:text-phoenix-text-main tracking-tight">Rotate Credentials</span>
                       </div>
                    </button>
                    <button onClick={handleEditProfile} className="w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl hover:bg-white dark:hover:bg-slate-800 hover:border-phoenix-primary/20 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl group-hover:bg-phoenix-primary/5 transition-all">
                             <Smartphone className="w-5 h-5 text-slate-400 group-hover:text-phoenix-primary" />
                          </div>
                          <span className="text-readable-sm font-black text-phoenix-text-muted group-hover:text-phoenix-text-main tracking-tight">Biometric MFA</span>
                       </div>
                       <span className="text-[10px] font-black text-phoenix-success px-3 py-1 rounded-xl bg-phoenix-success/5 border border-phoenix-success/20 uppercase tracking-widest shadow-sm">ACTIVE</span>
                    </button>
                 </div>
              </div>
              
              {showNotice && (
                <div className="px-card p-10 bg-phoenix-warning/5 border-phoenix-warning/20 rounded-[2.5rem] shadow-premium relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-phoenix-warning"></div>
                   <div className="flex items-start gap-4 mb-8">
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-phoenix-warning/10">
                         <AlertCircle className="w-8 h-8 text-phoenix-warning" />
                      </div>
                      <div>
                         <h4 className="text-readable-xs font-black text-phoenix-text-main dark:text-white tracking-widest uppercase">Compliance Audit</h4>
                         <p className="text-readable-xs text-phoenix-text-muted mt-2 font-black leading-relaxed">
                            Analyst scheduled for periodic vetting. Neural link verification strictly required.
                         </p>
                      </div>
                   </div>
                   <button 
                     onClick={handleAcknowledge}
                     className="w-full py-4.5 bg-white dark:bg-slate-800 border border-phoenix-warning/20 rounded-3xl text-readable-sm font-black text-phoenix-warning hover:bg-phoenix-warning/5 transition-all uppercase tracking-[0.2em] shadow-sm active:scale-95"
                   >
                      Acknowledge Review
                   </button>
                </div>
              )}
           </div>

           {/* Active Sessions Area */}
           <div className="lg:col-span-2 px-card flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-premium rounded-[2.5rem]">
              <div className="px-10 py-8 border-b border-phoenix-border dark:border-slate-800 flex items-center justify-between">
                 <h3 className="text-readable-sm font-black text-phoenix-text-main dark:text-white tracking-[0.2em] uppercase flex items-center gap-3">
                    <History className="w-5 h-5 text-phoenix-primary animate-pulse" /> Environment Sovereignty
                 </h3>
                 <span className="text-readable-xs font-black text-phoenix-text-muted dark:text-slate-600 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-phoenix-border uppercase tracking-[0.15em]">3 DEVICES ENFORCED</span>
              </div>
              <div className="divide-y divide-phoenix-border dark:divide-slate-800">
                 {sessions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-10 py-8 hover:bg-phoenix-primary/5 transition-all duration-700 group cursor-default">
                       <div className="flex items-center gap-8">
                          <div className={`w-16 h-16 rounded-[1.8rem] border flex items-center justify-center transition-all duration-500 ${s.current ? 'bg-phoenix-primary border-phoenix-primary text-white shadow-xl shadow-phoenix-primary/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:border-phoenix-primary/20'}`}>
                             {s.device.includes('iPhone') ? <Smartphone className="w-8 h-8" /> : s.device.includes('Macbook') ? <Laptop className="w-8 h-8" /> : <Smartphone className="w-8 h-8" />}
                          </div>
                          <div>
                             <div className="flex items-center gap-4">
                                <h4 className="text-readable-base font-black text-phoenix-text-main dark:text-white tracking-tight">{s.device}</h4>
                                {s.current && (
                                   <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-phoenix-success text-white text-[9px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-phoenix-success/20">
                                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                      Live
                                   </div>
                                )}
                             </div>
                             <div className="text-readable-xs text-phoenix-text-muted dark:text-slate-500 font-black mt-2 uppercase tracking-[0.15em] flex items-center gap-4">
                                <span>{s.OS}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                <span className="font-mono text-phoenix-primary/70">{s.IP}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="text-right">
                          <div className="text-readable-xs font-black text-phoenix-text-muted uppercase tracking-widest">{s.status}</div>
                          {!s.current && (
                             <button 
                               onClick={() => handleRevoke(s.device)}
                               className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-phoenix-border rounded-2xl text-readable-xs font-black text-phoenix-danger hover:bg-phoenix-danger hover:text-white hover:border-phoenix-danger transition-all mt-4 uppercase tracking-[0.15em] shadow-sm active:scale-95"
                             >
                                Disconnect
                             </button>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-8 flex items-center justify-center border-t border-phoenix-border bg-slate-50/20">
                 <button className="text-readable-xs font-black text-phoenix-text-muted hover:text-phoenix-primary uppercase tracking-[0.2em] flex items-center gap-3 transition-all">
                    <Clock className="w-4 h-4" /> REVEAL FULL IDENTITY AUDIT LOG
                 </button>
              </div>
           </div>
        </div>
      </div>
    </Shell>
  )
}

import { useState } from 'react'
import { useAuth } from '../App.jsx'
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
  AlertCircle
} from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()
  const [activeSession, setActiveSession] = useState(true)
  const [showNotice, setShowNotice] = useState(true)

  const handleEditProfile = () => {
    alert('Profile Editing is restricted to System Administrators. Please contact the SOC Manager.')
  }

  const handleRevoke = (device) => {
    if (confirm(`Are you sure you want to revoke access for ${device}?`)) {
      alert(`Access for ${device} has been revoked. Session terminated.`)
    }
  }

  const handleAcknowledge = () => {
    setShowNotice(false)
    alert('Quarterly Audit Notice acknowledged.')
  }

  const sessions = [
    { device: 'Work Macbook Pro', OS: 'macOS 14.2', IP: '192.168.1.45', status: 'Active Now', current: true },
    { device: 'iPhone 15 Pro', OS: 'iOS 17.1', IP: '10.0.0.8', status: '3h Ago', current: false },
    { device: 'Dell Latitude 7420', OS: 'Windows 11', IP: '172.16.0.4', status: 'Yesterday', current: false },
  ]

  return (
    <Shell>
      <div className="p-6 space-y-6 animate-fade-in max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="security-card p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden bg-gradient-to-br from-[#161b22] to-[#0d1117]">
           {/* Decorative Background Elements */}
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#58a6ff10] rounded-full blur-3xl"></div>
           <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#bc8cff10] rounded-full blur-3xl"></div>

           <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-[#161b22] border-2 border-[#30363d] p-1 group-hover:border-[#58a6ff] transition-all overflow-hidden">
                <div className="w-full h-full rounded-full bg-[#30363d] flex items-center justify-center">
                   <img 
                     src="/avatars/soc_analyst.png" 
                     alt="SOC Analyst"
                     className="w-full h-full object-cover"
                   />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#3fb950] border-4 border-[#0d1117] flex items-center justify-center shadow-lg" title="Online"></div>
           </div>

           <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                 <h1 className="text-2xl font-black text-white uppercase tracking-tight">{user || 'Administrator'}</h1>
                 <span className="px-2 py-0.5 rounded bg-[#3fb95020] text-[#3fb950] text-[9px] font-black uppercase tracking-[0.2em] border border-[#3fb95030] w-fit mx-auto md:mx-0">
                    SOC ANALYST L3
                 </span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[11px] font-bold text-[#8b949e] uppercase tracking-widest">
                 <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> admin@zta-security.com</span>
                 <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Site-Bravo (Jakarta)</span>
                 <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined Oct 2023</span>
              </div>
           </div>

           <div className="flex gap-3">
              <button className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[11px] font-black text-[#f0f6fc] hover:bg-[#30363d] transition-all">
                 EDIT PROFILE
              </button>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-[#f85149] rounded-lg text-[11px] font-black text-[#0d1117] hover:opacity-90 transition-all shadow-lg shadow-[#f8514930] flex items-center gap-2"
              >
                 <LogOut className="w-3.5 h-3.5" /> SIGN OUT
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Security Settings Area */}
           <div className="lg:col-span-1 space-y-6">
              <div className="security-card p-6">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#3fb950]" /> Security & Access
                 </h3>
                 <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-3 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#58a6ff30] transition-all group">
                       <div className="flex items-center gap-3">
                          <Key className="w-4 h-4 text-[#8b949e] group-hover:text-[#58a6ff]" />
                          <span className="text-[11px] font-black text-[#f0f6fc] uppercase tracking-tighter text-left">Password Management</span>
                       </div>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#58a6ff30] transition-all group">
                       <div className="flex items-center gap-3">
                          <Smartphone className="w-4 h-4 text-[#8b949e] group-hover:text-[#58a6ff]" />
                          <span className="text-[11px] font-black text-[#f0f6fc] uppercase tracking-tighter text-left">Two-Factor Authentication</span>
                       </div>
                       <span className="text-[9px] font-black text-[#3fb950] px-1.5 py-0.5 rounded bg-[#3fb95015] border border-[#3fb95030]">ENABLED</span>
                    </button>
                 </div>
              </div>
              
              {showNotice && (
                <div className="security-card p-6 bg-gradient-to-br from-[#161b22] to-[#0d1117]">
                   <div className="flex items-start gap-3 mb-4 text-[#f0883e]">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <div>
                         <h4 className="text-[11px] font-black uppercase tracking-tight text-[#f0f6fc]">Account Audit Notice</h4>
                         <p className="text-[10px] text-[#8b949e] mt-1 leading-relaxed">
                            Your account has been flagged for a quarterly security review. Please ensure your 2FA methods are up to date.
                         </p>
                      </div>
                   </div>
                   <button 
                     onClick={handleAcknowledge}
                     className="w-full py-2 bg-[#21262d] border border-[#30363d] rounded text-[9px] font-black text-white hover:bg-[#30363d] transition-all uppercase tracking-widest"
                   >
                      Acknowledge Notice
                   </button>
                </div>
              )}
           </div>

           {/* Active Sessions Area */}
           <div className="lg:col-span-2 security-card p-0">
              <div className="security-card-header">
                 <span className="security-card-title flex items-center gap-2 tracking-tighter">
                    <History className="w-4 h-4 text-[#58a6ff]" /> Logged In Devices & Active Sessions
                 </span>
              </div>
              <div className="p-0">
                 <div className="divide-y divide-[#30363d]/50">
                    {sessions.map((s, i) => (
                       <div key={i} className="flex items-center justify-between p-6 hover:bg-[#161b22]/50 transition-colors group">
                          <div className="flex items-center gap-5">
                             <div className={`p-4 rounded-xl border flex items-center justify-center transition-all ${s.current ? 'bg-[#58a6ff10] border-[#58a6ff30] text-[#58a6ff] shadow-sm shadow-[#58a6ff20]' : 'bg-[#161b22] border-[#30363d] text-[#8b949e]'}`}>
                                {s.device.includes('iPhone') ? <Smartphone className="w-6 h-6" /> : <Laptop className="w-6 h-6" />}
                             </div>
                             <div>
                                <div className="flex items-center gap-2">
                                   <h4 className="text-xs font-black text-[#f0f6fc] uppercase tracking-tight">{s.device}</h4>
                                   {s.current && <span className="text-[8px] font-black text-[#3fb950] bg-[#3fb95015] border border-[#3fb95030] px-1.5 py-0.5 rounded leading-none uppercase">Current</span>}
                                </div>
                                <div className="text-[10px] text-[#8b949e] font-bold mt-1 uppercase tracking-widest flex items-center gap-3">
                                   <span>{s.OS}</span>
                                   <span className="w-1 h-1 rounded-full bg-[#30363d]"></span>
                                   <span className="font-mono text-[#58a6ff]/80">{s.IP}</span>
                                </div>
                             </div>
                          </div>
                          
                          <div className="text-right">
                             <div className="text-[10px] font-black text-[#484f58] uppercase tracking-[0.1em]">{s.status}</div>
                             {!s.current && (
                                <button 
                                  onClick={() => handleRevoke(s.device)}
                                  className="text-[9px] font-black text-[#f85149] hover:text-white uppercase transition-colors mt-2 underline underline-offset-4 decoration-[#f8514940] hover:decoration-[#f85149]"
                                >
                                   REVOKE ACCESS
                                </button>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="p-4 flex items-center justify-center border-t border-[#30363d] bg-[#0d1117]/50">
                    <button className="text-[9px] font-black text-[#8b949e] hover:text-[#58a6ff] uppercase tracking-[0.2em] flex items-center gap-2 transition-all">
                       <Clock className="w-3.5 h-3.5" /> SECURITY EVENT LOG RECENT ANALYSIS
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Shell>
  )
}

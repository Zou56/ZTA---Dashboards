import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from './Sidebar.jsx'
import { 
  Bell, 
  Search, 
  Globe, 
  ChevronDown, 
  Moon, 
  Sun, 
  X, 
  AlertTriangle,
  ShieldCheck,
  Cpu,
  LogOut,
  User
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useAuth } from '../../App.jsx'

export default function Shell({ children }) {
  const navigate = useNavigate()
  const { theme, toggleTheme, isDark } = useTheme()
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const res = await axios.get('http://localhost:8000/settings', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.font_scale) {
          document.documentElement.style.fontSize = `${res.data.font_scale * 100}%`
        }
      } catch (err) {
        console.error('Core sync failed')
      }
    }
    if (token) fetchGlobalSettings()
  }, [token])

  const notifications = [
    { id: 1, type: 'critical', msg: 'Zero-Day Pattern detected in Node 04', time: '2m ago' },
    { id: 2, type: 'warning', msg: 'Analyst account registration pending', time: '15m ago' },
    { id: 3, type: 'info', msg: 'Global policy sync completed', time: '45m ago' },
  ]

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const q = searchTerm.toLowerCase()
      if (q.includes('asset')) navigate('/assets')
      else if (q.includes('analy')) navigate('/analytics')
      else if (q.includes('data')) navigate('/datasets')
      else if (q.includes('report')) navigate('/reports')
      else if (q.includes('sett')) navigate('/settings')
      else if (q.includes('prof')) navigate('/profile')
      setSearchTerm('')
    }
  }

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative">
        {/* Top bar (Glassmorphism Header) */}
        <header className="h-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-10 sticky top-0 z-50 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-10 flex-1">
             <div className="hidden lg:flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 bg-phoenix-primary rounded-xl flex items-center justify-center shadow-lg shadow-phoenix-primary/20 dark:shadow-none group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black text-phoenix-text-main dark:text-white tracking-tighter uppercase italic">Phoenix SOC</span>
             </div>
             
             {/* Global Command Search */}
             <div className="relative max-w-lg w-full hidden md:block group/search">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <Search className="w-4.5 h-4.5 text-slate-400 group-focus-within/search:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="Jump to: Assets, Analytics, Dataset..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border-transparent dark:border-slate-700 pl-14 pr-16 py-3.5 rounded-2xl text-readable-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-phoenix-primary/10 transition-all text-phoenix-text-main dark:text-white font-black placeholder:text-slate-400 uppercase tracking-widest"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40 group-focus-within/search:opacity-100 transition-opacity">
                   <span className="px-1.5 py-0.5 rounded-md border border-slate-300 text-[9px] font-black uppercase text-slate-500">Ctrl</span>
                   <span className="px-1.5 py-0.5 rounded-md border border-slate-300 text-[9px] font-black uppercase text-slate-500">K</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-8">
             {/* Dynamic Network Status */}
             <div className="hidden xl:flex items-center gap-4 px-5 py-2.5 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 group hover:bg-emerald-100 transition-all">
                <div className="relative flex items-center justify-center">
                   <div className="absolute w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-20"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"></div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em] leading-none">Status: Secured</span>
                   <span className="text-[8px] text-emerald-600/60 font-black uppercase tracking-widest mt-0.5">Cluster SOC-01</span>
                </div>
             </div>

             <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm hover:shadow-md"
                  title="Toggle Display Mode"
                >
                   {isDark ? <Sun className="w-5.5 h-5.5" /> : <Moon className="w-5.5 h-5.5" />}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button 
                      onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all relative ${showNotifications ? 'bg-phoenix-primary text-white shadow-xl shadow-phoenix-primary/20' : 'text-slate-400 hover:text-phoenix-text-main dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'}`}
                    >
                       <Bell className="w-5.5 h-5.5" />
                       <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-phoenix-danger rounded-full border-2 border-white dark:border-slate-900 group-hover:scale-125 transition-transform"></span>
                    </button>

                   {showNotifications && (
                      <div className="absolute right-0 mt-6 w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-premium animate-slide-up z-[60] overflow-hidden">
                         <div className="px-10 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">Intelligence Feed</span>
                            <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5 text-slate-300" /></button>
                         </div>
                         <div className="max-h-[400px] overflow-auto divide-y divide-slate-50 dark:divide-slate-800">
                            {notifications.map(n => (
                               <div key={n.id} className="px-10 py-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                                  <div className="flex gap-6">
                                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${n.type === 'critical' ? 'bg-rose-50 border-rose-100 text-rose-500' : n.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
                                        {n.type === 'critical' ? <AlertTriangle className="w-5 h-5" /> : n.type === 'warning' ? <ShieldCheck className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                                     </div>
                                      <div className="flex-1">
                                         <p className="text-readable-sm font-black text-phoenix-text-main dark:text-white leading-snug mb-1">{n.msg}</p>
                                         <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-phoenix-text-muted font-black uppercase tracking-widest">{n.time}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="text-[9px] text-phoenix-primary font-bold uppercase tracking-widest">Protocol L3</span>
                                         </div>
                                      </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                         <button className="w-full py-5 bg-slate-50/50 dark:bg-slate-800/50 text-[11px] font-black text-phoenix-primary uppercase tracking-[0.3em] hover:bg-phoenix-bg transition-all">Open Global Monitor</button>
                      </div>
                   )}
                </div>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>

                {/* Identity Profile */}
                <div className="relative">
                   <button 
                     onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                     className={`flex items-center gap-4 pl-3 pr-2 py-2 rounded-[1.5rem] transition-all group ${showProfileMenu ? 'bg-slate-100 dark:bg-slate-800 shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                   >
                      <div className="text-right hidden xl:block">
                         <p className="text-readable-sm font-black text-phoenix-text-main dark:text-white leading-none uppercase tracking-tighter">{user || 'Administrator'}</p>
                         <p className="text-[9px] text-phoenix-secondary font-black mt-1.5 uppercase tracking-[0.2em] opacity-80 italic">Verified Lead Analyst</p>
                      </div>
                      <div className="w-11 h-11 rounded-[1.2rem] bg-phoenix-primary dark:bg-slate-800 border-2 border-phoenix-primary dark:border-slate-700 flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:scale-110 transition-transform duration-500">
                         {user?.slice(0, 2).toUpperCase() || 'AD'}
                      </div>
                      <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-500 ${showProfileMenu ? 'rotate-180' : ''}`} />
                   </button>

                   {showProfileMenu && (
                      <div className="absolute right-0 mt-6 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-premium animate-slide-up z-[60] overflow-hidden p-3">
                         <div className="px-6 py-4 mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Signed in as</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{user || 'Administrator'}</p>
                         </div>
                         <button onClick={() => { navigate('/profile'); setShowProfileMenu(false); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group/item">
                            <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                               <User className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">My Identity</span>
                         </button>
                         <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group/item">
                            <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                               <Globe className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">Environment</span>
                         </button>
                         <div className="h-[1px] bg-slate-50 dark:bg-slate-800 my-3 mx-4"></div>
                         <button 
                           onClick={() => { logout(); setShowProfileMenu(false); }} 
                           className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all group/logout shadow-sm shadow-rose-100"
                         >
                            <div className="w-9 h-9 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center group-hover/logout:bg-white/20 transition-colors">
                               <LogOut className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
                         </button>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-10 overflow-auto animate-px-fade scroll-smooth">
           <div className="max-w-[1600px] mx-auto">
              {children}
           </div>
        </div>

        {/* Premium Footer */}
        <footer className="py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-[11px] text-slate-400 font-medium transition-colors duration-300">
           <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
              <span className="hover:text-phoenix-primary transition-colors cursor-pointer">&copy; 2026 PHOENIX IOT</span>
              <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
              <span className="hover:text-phoenix-primary transition-colors cursor-pointer">Sovereign Intelligence</span>
           </div>
           <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-emerald-600 dark:text-emerald-400">SOC CLUSTER OPERATIONAL</span>
              </div>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-slate-400/50 font-serif italic">Build v2.4.0-Sovereign</span>
           </div>
        </footer>
      </main>
    </div>
  )
}

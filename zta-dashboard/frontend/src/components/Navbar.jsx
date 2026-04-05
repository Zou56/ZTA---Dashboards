import { useAuth } from '../App.jsx'
import { Shield, LogOut, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ status }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="sticky top-0 z-50 bg-cyber-card/80 backdrop-blur-md border-b border-cyber-border">
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-teal/20 to-cyber-violet/20 border border-cyber-teal/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-cyber-teal" />
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight">ZTA Dashboard</span>
            <span className="hidden sm:inline text-cyber-muted text-xs ml-2">· Anomaly Detection</span>
          </div>
        </div>

        {/* Status bar */}
        <div className="hidden md:flex items-center gap-4 text-xs text-cyber-muted">
          <StatusDot ok={status.dataset}  label="Dataset" />
          <StatusDot ok={status.trained}  label="Model"   />
          <StatusDot ok={status.predicted} label="Predictions" />
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-cyber-bg px-3 py-1.5 rounded-lg border border-cyber-border">
            <Activity className="w-3.5 h-3.5 text-cyber-green" />
            <span className="text-xs text-white font-medium">{user}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-cyber-muted hover:text-cyber-rose hover:bg-cyber-rose/10 border border-transparent hover:border-cyber-rose/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

function StatusDot({ ok, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-cyber-green animate-pulse' : 'bg-cyber-border'}`} />
      <span className={ok ? 'text-cyber-green' : 'text-cyber-muted'}>{label}</span>
    </div>
  )
}

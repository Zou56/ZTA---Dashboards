import { useAuth } from '../App.jsx'
import { Shield, LogOut, Activity, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'

export default function Navbar({ status }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const langRef = useRef(null)

  const handleLogout = () => { logout(); navigate('/login') }

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setLangMenuOpen(false)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-cyber-card/80 backdrop-blur-xl border-b border-cyber-border shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyber-teal/20 to-cyber-violet/20 border border-cyber-teal/30 flex items-center justify-center glow-teal">
            <Shield className="w-4 h-4 text-cyber-teal" />
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight">{t('navbar.brand')}</span>
            <span className="hidden sm:inline text-cyber-muted text-xs ml-2 opacity-80">{t('navbar.anomaly_detection')}</span>
          </div>
        </div>

        {/* Status bar */}
        <div className="hidden md:flex items-center gap-5 text-xs text-cyber-muted bg-cyber-bg/50 px-4 py-1.5 rounded-full border border-cyber-border/50">
          <StatusDot ok={status?.dataset}  label={t('navbar.status_dataset')} />
          <div className="w-px h-3 bg-cyber-border/50" />
          <StatusDot ok={status?.trained}  label={t('navbar.status_model')}   />
          <div className="w-px h-3 bg-cyber-border/50" />
          <StatusDot ok={status?.predicted} label={t('navbar.status_predictions')} />
        </div>

        {/* Right Section: Language + User + Logout */}
        <div className="flex items-center gap-3">
          
          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-cyber-muted hover:text-white hover:bg-cyber-border/30 transition-all border border-transparent"
            >
              <Globe className="w-4 h-4" />
              <span className="font-bold">{i18n.language.toUpperCase()}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-cyber-card border border-cyber-border rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-fade-in">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-cyber-teal/10 ${i18n.language === 'en' ? 'text-cyber-teal font-bold' : 'text-cyber-muted'}`}
                >
                  English (EN)
                </button>
                <button
                  onClick={() => changeLanguage('id')}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-cyber-teal/10 ${i18n.language === 'id' ? 'text-cyber-teal font-bold' : 'text-cyber-muted'}`}
                >
                  Indonesia (ID)
                </button>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-cyber-bg px-3 py-1.5 rounded-lg border border-cyber-border shadow-inner">
            <Activity className="w-3.5 h-3.5 text-cyber-green" />
            <span className="text-xs text-white font-medium">{user}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-cyber-muted hover:text-cyber-rose hover:bg-cyber-rose/10 border border-transparent hover:border-cyber-rose/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('navbar.logout')}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

function StatusDot({ ok, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-cyber-green animate-pulse shadow-[0_0_5px_#34d399]' : 'bg-cyber-border'}`} />
      <span className={ok ? 'text-cyber-green font-medium' : 'text-cyber-muted'}>{label}</span>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import { 
  Shield, 
  Lock, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  UserPlus, 
  ChevronRight,
  Globe,
  Github,
  Mail,
  Fingerprint
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const API = 'http://localhost:8000'

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  
  // References for focus management
  const usernameRef = useRef(null)
  const passwordRef = useRef(null)
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', role: 'SOC Analyst' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPw, setShowPw] = useState(false)

  // Handle focus transition on Enter
  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      nextRef?.current?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      if (isSignUp) {
        // Registration Flow
        await axios.post(`${API}/auth/register`, form)
        setSuccess('Registration successful! Please sign in.')
        setIsSignUp(false)
        setForm({ ...form, password: '' })
      } else {
        // Login Flow
        const res = await axios.post(`${API}/auth/login`, {
          username: form.username,
          password: form.password
        })
        login(res.data.token, res.data.username)
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center relative overflow-hidden font-sans transition-colors duration-500">
      
      {/* Premium background visuals - Azure Trust Palette */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-phoenix-primary/5 rounded-full blur-[140px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-phoenix-secondary/5 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
      
      <div className="relative w-full max-w-[480px] px-6 animate-px-fade py-12">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-phoenix-border dark:border-slate-800 rounded-[3rem] p-10 sm:p-14 shadow-premium transition-all duration-500">
          
          {/* Header Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-phoenix-primary border-4 border-white dark:border-slate-800 flex items-center justify-center mb-6 shadow-premium rotate-3 hover:rotate-0 transition-all duration-700 group">
               <Shield className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-readable-xl font-black text-phoenix-text-main dark:text-white tracking-tight text-center">
              {isSignUp ? 'Join Neural Registry' : 'Neural Entry Point'}
            </h1>
            <p className="text-readable-xs text-phoenix-text-muted mt-3 font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-phoenix-primary animate-pulse"></span>
              Secure SOC Environment // Node 01
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-3 bg-phoenix-danger/5 border border-phoenix-danger/10 rounded-2xl px-5 py-4 mb-8 text-phoenix-danger text-readable-xs font-black animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-phoenix-success/5 border border-phoenix-success/10 rounded-2xl px-5 py-4 mb-8 text-phoenix-success text-readable-xs font-black animate-px-fade">
              <Shield className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-readable-xs font-black text-phoenix-text-muted dark:text-slate-500 uppercase tracking-widest ml-1">Identity handle</label>
              <input
                ref={usernameRef}
                type="text"
                placeholder="Agent Username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                onKeyDown={e => handleKeyDown(e, passwordRef)}
                required
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-phoenix-border dark:border-slate-700 px-6 py-4 rounded-2xl text-readable-sm font-bold text-phoenix-text-main dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-phoenix-primary focus:ring-8 focus:ring-phoenix-primary/5 transition-all outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-readable-xs font-black text-phoenix-text-muted dark:text-slate-500 uppercase tracking-widest ml-1">Access Credential</label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Cipher Password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-phoenix-border dark:border-slate-700 px-6 py-4 pr-14 rounded-2xl text-readable-sm font-bold text-phoenix-text-main dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-phoenix-primary focus:ring-8 focus:ring-phoenix-primary/5 transition-all outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-phoenix-primary transition-colors"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4.5 rounded-[1.25rem] font-black text-readable-sm uppercase tracking-[0.2em] transition-all duration-500
                         bg-phoenix-primary text-white shadow-premium hover:bg-phoenix-secondary hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-50
                         flex items-center justify-center gap-3"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Authorizing...</>
              ) : (
                isSignUp ? <><UserPlus className="w-4 h-4" /> Initialize Agent</> : <><Lock className="w-4 h-4" /> Secure Sign In</>
              )}
            </button>
          </form>

          {/* Social Auth Mockups */}
          <div className="mt-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-[1px] flex-1 bg-phoenix-border dark:bg-slate-800"></div>
               <span className="text-[10px] font-black text-phoenix-text-muted dark:text-slate-600 uppercase tracking-widest">Federated Access</span>
               <div className="h-[1px] flex-1 bg-phoenix-border dark:bg-slate-800"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
               {[
                 { icon: Mail, label: 'Google' },
                 { icon: Github, label: 'GitHub' },
                 { icon: Fingerprint, label: 'Bio' }
               ].map((soc, i) => (
                 <button key={i} type="button" className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-phoenix-border dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-phoenix-primary/30 transition-all group">
                    <soc.icon className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:text-phoenix-primary transition-colors" />
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{soc.label}</span>
                 </button>
               ))}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="mt-10 pt-8 border-t border-phoenix-border dark:border-slate-800/50 flex flex-col items-center gap-4">
             <button 
               onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
               className="text-readable-xs font-black text-phoenix-primary hover:text-phoenix-secondary dark:text-blue-400 uppercase tracking-widest transition-all flex items-center gap-2 group"
             >
                {isSignUp ? 'Already a registered analyst?' : 'Request new analyst registration'}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-readable-xs text-slate-300 dark:text-slate-700 font-black uppercase tracking-[0.4em] mt-12">
           Zero Trust Network Architecture // Soc-Alpha-9
        </p>
      </div>
    </div>
  )
}

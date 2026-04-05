import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import { Shield, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'

const API = 'http://localhost:8000'

export default function Login() {
  const { login }        = useAuth()
  const navigate         = useNavigate()
  const [form, setForm]  = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPw, setShowPw]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/auth/login`, form)
      login(res.data.token, res.data.username)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center relative overflow-hidden">

      {/* Animated background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-teal/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyber-violet/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Login card */}
      <div className="relative w-full max-w-sm mx-4 animate-fade-in">
        <div className="bg-cyber-card border border-cyber-border rounded-2xl p-8 shadow-2xl"
             style={{ boxShadow: '0 0 60px rgba(34,211,238,0.07), 0 25px 60px rgba(0,0,0,0.6)' }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-teal/20 to-cyber-violet/20 border border-cyber-teal/30 flex items-center justify-center mb-4 glow-teal">
              <Shield className="w-8 h-8 text-cyber-teal" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">ZTA Dashboard</h1>
            <p className="text-cyber-muted text-xs mt-1 tracking-wide">ZERO TRUST ANOMALY DETECTION</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-cyber-rose/10 border border-cyber-rose/30 rounded-lg px-3 py-2 mb-4 text-cyber-rose text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-cyber-muted mb-1.5 font-medium">USERNAME</label>
              <input
                type="text"
                id="username"
                autoComplete="username"
                placeholder="admin"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs text-cyber-muted mb-1.5 font-medium">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="w-full pr-10"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-lg font-semibold text-sm transition-all
                         bg-gradient-to-r from-cyber-teal to-cyber-blue text-cyber-bg
                         hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-cyber-bg/40 border-t-cyber-bg rounded-full animate-spin" />Authenticating...</>
              ) : (
                <><Lock className="w-4 h-4" />Sign In</>
              )}
            </button>
          </form>

          {/* Hint */}
          <p className="text-center text-xs text-cyber-muted mt-6">
            Default: <code className="bg-cyber-bg px-1.5 py-0.5 rounded text-cyber-teal font-mono">admin</code> / <code className="bg-cyber-bg px-1.5 py-0.5 rounded text-cyber-teal font-mono">admin123</code>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-cyber-muted/50 mt-4">
          Research Platform · Big Data Analytics + Zero Trust Architecture
        </p>
      </div>
    </div>
  )
}

import { useState, useCallback, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../App.jsx'
import Navbar      from '../components/Navbar.jsx'
import MetricCard  from '../components/MetricCard.jsx'
import DataTable   from '../components/DataTable.jsx'
import { ZTABarChart, AnomalyPieChart, ScoreLineChart, ConfusionMatrix, MetricsRadar } from '../components/Charts.jsx'
import {
  Users, AlertTriangle, ShieldCheck, Activity,
  Upload, Cpu, Play, Download, RefreshCw,
  CheckCircle, XCircle, Clock, Database, Bot, Settings,
} from 'lucide-react'

const API = 'http://localhost:8000'

// ── Helper ────────────────────────────────────────────────────────────────────
function api(token) {
  return axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } })
}

// ── Toast component ───────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border animate-slide-up
            ${t.type === 'success' ? 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green' :
              t.type === 'error'   ? 'bg-cyber-rose/10  border-cyber-rose/30  text-cyber-rose'  :
                                     'bg-cyber-blue/10  border-cyber-blue/30  text-cyber-blue'}`}>
          {t.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
           t.type === 'error'   ? <XCircle     className="w-4 h-4" /> :
                                  <Clock       className="w-4 h-4" />}
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function Card({ title, children, action, className = '' }) {
  return (
    <div className={`bg-cyber-card border border-cyber-border rounded-xl overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-3.5 border-b border-cyber-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { token } = useAuth()
  const http      = api(token)

  // State
  const [tableData,  setTableData]  = useState([])
  const [metrics,    setMetrics]    = useState(null)
  const [predictions, setPredictions] = useState([])
  const [toasts,     setToasts]     = useState([])
  const [status, setStatus]         = useState({ dataset: false, trained: false, predicted: false })

  // Loading flags
  const [uploading,    setUploading]    = useState(false)
  const [training,     setTraining]     = useState(false)
  const [detecting,    setDetecting]    = useState(false)
  const [tableLoading, setTableLoading] = useState(false)

  const fileRef = useRef()
  const toastId = useRef(0)

  // ── Toast helper ─────────────────────────────────────────────────────────
  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  // ── Upload ───────────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await http.post('/upload', form)
      toast(`✅ ${res.data.message}`, 'success')
      setStatus(s => ({ ...s, dataset: true, trained: false, predicted: false }))
      setMetrics(null)
      setPredictions([])
      // Load first page
      await loadTableData()
    } catch (err) {
      toast(err.response?.data?.detail || 'Upload failed', 'error')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // ── Load table ────────────────────────────────────────────────────────────
  const loadTableData = async () => {
    setTableLoading(true)
    try {
      const res  = await http.get('/data?page=1&limit=2000')
      setTableData(res.data.data ?? [])
    } catch {
      setTableData([])
    } finally {
      setTableLoading(false)
    }
  }

  // ── Train ─────────────────────────────────────────────────────────────────
  const handleTrain = async () => {
    if (!status.dataset) { toast('Upload a dataset first.', 'error'); return }
    setTraining(true)
    try {
      const res = await http.post('/train')
      toast(`Model trained on ${res.data.n_samples?.toLocaleString()} samples with ${res.data.n_features} features`, 'success')
      setStatus(s => ({ ...s, trained: true, predicted: false }))
    } catch (err) {
      toast(err.response?.data?.detail || 'Training failed', 'error')
    } finally {
      setTraining(false)
    }
  }

  // ── Predict ───────────────────────────────────────────────────────────────
  const handleDetect = async () => {
    if (!status.trained) { toast('Train the model first.', 'error'); return }
    setDetecting(true)
    try {
      const [predRes, metricRes] = await Promise.all([
        http.get('/predict'),
        http.get('/metrics'),
      ])
      const preds = predRes.data.predictions ?? []
      setPredictions(preds)
      setTableData(preds)
      setMetrics(metricRes.data)
      setStatus(s => ({ ...s, predicted: true }))
      toast(`Detection complete — ${metricRes.data.total_anomalies} anomalies found`, 'success')
    } catch (err) {
      toast(err.response?.data?.detail || 'Detection failed', 'error')
    } finally {
      setDetecting(false)
    }
  }

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!status.predicted) { toast('Run detection first.', 'error'); return }
    try {
      const res = await http.get('/export', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a   = document.createElement('a')
      a.href     = url
      a.download = 'dataset_with_predictions.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast('CSV exported  successfully', 'success')
    } catch {
      toast('Export failed', 'error')
    }
  }

  // ── Derived metrics ───────────────────────────────────────────────────────
  const totalUsers    = metrics?.total_users     ?? tableData.length > 0 ? ([...new Set(tableData.map(r => r.user_id))].length || '—') : '—'
  const totalAnomalies = metrics?.total_anomalies ?? (status.predicted ? predictions.filter(r => r.predicted_anomaly === 1).length : '—')
  const zta            = metrics?.zta_distribution ?? null

  // Bot state
  const [botModalOpen, setBotModalOpen] = useState(false)
  const [botConfig, setBotConfig] = useState({ token: '', chat_id: '', enabled: false })
  const [savingBot, setSavingBot] = useState(false)

  // ── Fetch Bot Config ──────────────────────────────────────────────────────
  const fetchBotConfig = async () => {
    try {
      const res = await http.get('/bot/config')
      setBotConfig(res.data)
    } catch (err) {
      console.error('Failed to fetch bot config')
    }
  }

  const handleSaveBot = async () => {
    setSavingBot(true)
    try {
      await http.post('/bot/config', botConfig)
      toast('Bot configuration updated', 'success')
      setBotModalOpen(false)
    } catch (err) {
      toast('Failed to update bot config', 'error')
    } finally {
      setSavingBot(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cyber-bg">
      <Navbar status={status} />

      <main className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6 animate-fade-in">

        {/* ── Page title ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Anomaly Detection Dashboard</h2>
            <p className="text-cyber-muted text-xs mt-0.5">Big Data Analytics · Zero Trust Architecture · Isolation Forest</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Bot Settings */}
            <button onClick={() => { fetchBotConfig(); setBotModalOpen(true) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all
                         ${botConfig.enabled ? 'border-cyber-teal/50 text-cyber-teal bg-cyber-teal/5' : 'border-cyber-border text-cyber-muted hover:text-white'}`}>
              <Bot className="w-4 h-4" />
              Security Bot {botConfig.enabled ? 'ON' : 'OFF'}
            </button>
            {/* Export button */}
            <button onClick={handleExport}
            disabled={!status.predicted}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all
                       border-cyber-border text-cyber-muted hover:text-cyber-teal hover:border-cyber-teal/50
                       disabled:opacity-30 disabled:cursor-not-allowed">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

        {/* ── Action bar ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* Upload */}
          <button onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-3 px-5 py-4 rounded-xl border transition-all text-left
                       bg-cyber-card border-cyber-border hover:border-cyber-teal/50 hover:bg-cyber-teal/5
                       disabled:opacity-50 group">
            <div className="w-10 h-10 rounded-lg bg-cyber-teal/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyber-teal/20 transition-colors">
              {uploading
                ? <div className="w-5 h-5 border-2 border-cyber-teal/30 border-t-cyber-teal rounded-full animate-spin" />
                : <Upload className="w-5 h-5 text-cyber-teal" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Upload Dataset</div>
              <div className="text-xs text-cyber-muted">{uploading ? 'Processing…' : 'CSV file (dataset_fixed.csv)'}</div>
            </div>
            {status.dataset && <CheckCircle className="w-4 h-4 text-cyber-green ml-auto" />}
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleUpload} className="hidden" />

          {/* Train */}
          <button onClick={handleTrain}
            disabled={!status.dataset || training}
            className="flex items-center gap-3 px-5 py-4 rounded-xl border transition-all text-left
                       bg-cyber-card border-cyber-border hover:border-cyber-violet/50 hover:bg-cyber-violet/5
                       disabled:opacity-50 group">
            <div className="w-10 h-10 rounded-lg bg-cyber-violet/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyber-violet/20 transition-colors">
              {training
                ? <div className="w-5 h-5 border-2 border-cyber-violet/30 border-t-cyber-violet rounded-full animate-spin" />
                : <Cpu className="w-5 h-5 text-cyber-violet" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Train Model</div>
              <div className="text-xs text-cyber-muted">{training ? 'Training…' : 'Isolation Forest · contamination=0.15'}</div>
            </div>
            {status.trained && <CheckCircle className="w-4 h-4 text-cyber-green ml-auto" />}
          </button>

          {/* Detect */}
          <button onClick={handleDetect}
            disabled={!status.trained || detecting}
            className="flex items-center gap-3 px-5 py-4 rounded-xl border transition-all text-left
                       bg-gradient-to-r from-cyber-rose/10 to-cyber-rose/5 border-cyber-rose/30
                       hover:from-cyber-rose/20 hover:border-cyber-rose/50
                       disabled:opacity-50 group">
            <div className="w-10 h-10 rounded-lg bg-cyber-rose/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyber-rose/20 transition-colors">
              {detecting
                ? <div className="w-5 h-5 border-2 border-cyber-rose/30 border-t-cyber-rose rounded-full animate-spin" />
                : <Play className="w-5 h-5 text-cyber-rose" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Run Detection</div>
              <div className="text-xs text-cyber-muted">{detecting ? 'Detecting anomalies…' : 'Predict + Zero Trust decisions'}</div>
            </div>
            {status.predicted && <CheckCircle className="w-4 h-4 text-cyber-green ml-auto" />}
          </button>
        </div>

        {/* ── KPI cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard icon={Users}         label="Total Users"    value={typeof totalUsers === 'number' ? totalUsers : totalUsers}
                      sub="Unique user IDs"        color="teal"   loading={tableLoading} />
          <MetricCard icon={AlertTriangle} label="Anomalies Found" value={typeof totalAnomalies === 'number' ? totalAnomalies.toLocaleString() : '—'}
                      sub={metrics ? `${metrics.anomaly_pct}% of sessions` : 'Run detection'} color="rose" loading={detecting} />
          <MetricCard icon={ShieldCheck}   label="Accuracy"       value={metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : '—'}
                      sub="Isolation Forest"       color="green"  loading={detecting} />
          <MetricCard icon={Activity}      label="F1-Score"       value={metrics ? metrics.f1_score.toFixed(3) : '—'}
                      sub={metrics ? `AUC: ${metrics.roc_auc.toFixed(3)}` : 'Model not run'} color="violet" loading={detecting} />
        </div>

        {/* ── Charts row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <Card title="Zero Trust Decision Distribution">
            <ZTABarChart data={zta} />
          </Card>

          <Card title="Anomaly vs. Normal Sessions">
            <AnomalyPieChart
              normal  = {metrics?.total_normal}
              anomaly = {metrics?.total_anomalies}
            />
          </Card>

          <Card title="Anomaly Score Over Time">
            <ScoreLineChart predictions={predictions} />
          </Card>
        </div>

        {/* ── Bottom row: Confusion Matrix + Radar ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Card title="Confusion Matrix">
            <ConfusionMatrix matrix={metrics?.confusion_matrix} />
            {metrics && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {[
                  ['Precision', metrics.precision],
                  ['Recall',    metrics.recall],
                  ['F1-Score',  metrics.f1_score],
                  ['ROC AUC',   metrics.roc_auc],
                ].map(([k, v]) => (
                  <div key={k} className="bg-cyber-bg rounded-lg px-3 py-2 flex justify-between">
                    <span className="text-cyber-muted">{k}</span>
                    <span className="text-white font-mono font-semibold">{v?.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Model Performance Radar">
            <MetricsRadar metrics={metrics} />
            {zta && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { label: 'ALLOW',  value: zta.ALLOW,  color: 'text-cyber-green', bg: 'bg-cyber-green/10' },
                  { label: 'VERIFY', value: zta.VERIFY, color: 'text-cyber-amber', bg: 'bg-cyber-amber/10' },
                  { label: 'DENY',   value: zta.DENY,   color: 'text-cyber-rose',  bg: 'bg-cyber-rose/10'  },
                ].map(d => (
                  <div key={d.label} className={`${d.bg} rounded-lg py-2`}>
                    <div className={`font-bold text-base ${d.color}`}>{d.value?.toLocaleString()}</div>
                    <div className="text-cyber-muted">{d.label}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Data Table ──────────────────────────────────────────────────── */}
        <DataTable rows={tableData} loading={tableLoading} />

      </main>

      {/* ── Bot Config Modal ────────────────────────────────────────────────── */}
      {botModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cyber-bg/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-md shadow-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-cyber-teal/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-cyber-teal" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Security Bot</h3>
                <p className="text-xs text-cyber-muted">Telegram Real-time Alerts & Analysis</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-cyber-muted mb-1.5 font-medium uppercase tracking-wider">Bot Token (@BotFather)</label>
                <input
                  type="password"
                  value={botConfig.token}
                  onChange={e => setBotConfig(c => ({ ...c, token: e.target.value }))}
                  placeholder="0000000000:ABC..."
                  className="w-full text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-cyber-muted mb-1.5 font-medium uppercase tracking-wider">Target Chat ID (@userinfobot)</label>
                <input
                  type="text"
                  value={botConfig.chat_id}
                  onChange={e => setBotConfig(c => ({ ...c, chat_id: e.target.value }))}
                  placeholder="123456789"
                  className="w-full text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-cyber-bg rounded-lg border border-cyber-border">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Real-time Notifications</span>
                  <span className="text-[10px] text-cyber-muted">Send AI-analyzed alerts for high risk events</span>
                </div>
                <button
                  onClick={() => setBotConfig(c => ({ ...c, enabled: !c.enabled }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${botConfig.enabled ? 'bg-cyber-teal' : 'bg-cyber-border'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${botConfig.enabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setBotModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-cyber-muted hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveBot}
                disabled={savingBot}
                className="flex-1 px-4 py-2 text-sm font-bold rounded-lg bg-cyber-teal text-cyber-bg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {savingBot ? <div className="w-4 h-4 border-2 border-cyber-bg/40 border-t-cyber-bg rounded-full animate-spin" /> : 'Save Config'}
              </button>
            </div>
            
            <p className="mt-4 text-[10px] text-center text-cyber-muted italic">
              Note: Telegram alert logic uses simulated AI analysis for anomalous sessions.
            </p>
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  )
}

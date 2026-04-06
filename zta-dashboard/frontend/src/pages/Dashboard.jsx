import { useState, useCallback, useRef, useEffect } from 'react'
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
  Skull
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

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
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border animate-slide-up backdrop-blur-md
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
    <div className={`bg-cyber-card/80 border border-cyber-border rounded-xl overflow-hidden backdrop-blur-sm shadow-sm ${className}`}>
      {title && (
        <div className="px-5 py-3.5 border-b border-cyber-border/50 flex items-center justify-between bg-cyber-bg/20">
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
  const { t } = useTranslation()
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
  const [simulating,   setSimulating]   = useState(false)
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
    if (!status.dataset) { toast(t('dashboard.toasts.upload_first'), 'error'); return }
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
    if (!status.trained) { toast(t('dashboard.toasts.train_first'), 'error'); return }
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

  // ── Simulate Attack ───────────────────────────────────────────────────────
  const handleSimulateAttack = async () => {
    if (!status.dataset) { toast(t('dashboard.toasts.upload_first'), 'error'); return }
    setSimulating(true)
    try {
      const res = await http.post('/simulate-attack')
      toast(`🚨 ${res.data.message}`, 'error', 6000)
      setStatus(s => ({ ...s, trained: false, predicted: false }))
      setMetrics(null)
      setPredictions([])
      await loadTableData()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to simulate attack', 'error')
    } finally {
      setSimulating(false)
    }
  }

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!status.predicted) { toast(t('dashboard.toasts.run_detect_first'), 'error'); return }
    try {
      const res = await http.get('/export', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a   = document.createElement('a')
      a.href     = url
      a.download = 'dataset_with_predictions.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast(t('dashboard.toasts.export_success'), 'success')
    } catch {
      toast(t('dashboard.toasts.export_failed'), 'error')
    }
  }

  // ── Derived metrics ───────────────────────────────────────────────────────
  const totalUsers    = metrics?.total_users     ?? tableData.length > 0 ? ([...new Set(tableData.map(r => r.user_id))].length || '—') : '—'
  const totalAnomalies = metrics?.total_anomalies ?? (status.predicted ? predictions.filter(r => r.predicted_anomaly === 1).length : '—')
  const zta            = metrics?.zta_distribution ?? null

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
      toast(t('dashboard.toasts.bot_updated'), 'success')
      setBotModalOpen(false)
    } catch (err) {
      toast(t('dashboard.toasts.bot_failed'), 'error')
    } finally {
      setSavingBot(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cyber-bg">
      <Navbar status={status} />

      <main className="max-w-[1240px] mx-auto px-6 py-8 space-y-8 animate-fade-in">

        {/* ── Page title ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{t('dashboard.title')}</h2>
            <p className="text-cyber-teal/80 text-xs mt-1 font-medium">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Bot Settings */}
            <button onClick={() => { fetchBotConfig(); setBotModalOpen(true) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all shadow-sm
                         ${botConfig.enabled ? 'border-cyber-teal/50 text-cyber-teal bg-cyber-teal/5' : 'border-cyber-border text-cyber-muted hover:text-white bg-cyber-card/50'}`}>
              <Bot className="w-4 h-4" />
              {botConfig.enabled ? t('dashboard.bot_on') : t('dashboard.bot_off')}
            </button>
            {/* Export button */}
            <button onClick={handleExport}
            disabled={!status.predicted}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all shadow-sm
                       bg-cyber-card/50 border-cyber-border text-cyber-muted hover:text-cyber-teal hover:border-cyber-teal/50
                       disabled:opacity-30 disabled:cursor-not-allowed">
            <Download className="w-4 h-4" />
            {t('dashboard.export_csv')}
          </button>
        </div>
      </div>

        {/* ── Action bar ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

          {/* Upload */}
          <button onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all text-left shadow-sm
                       bg-cyber-card/80 border-cyber-border hover:border-cyber-teal/50 hover:bg-cyber-teal/5 hover:shadow-cyber-teal/10 hover:shadow-lg hover:-translate-y-0.5
                       disabled:opacity-50 group">
            <div className="w-10 h-10 rounded-xl bg-cyber-teal/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyber-teal/20 transition-colors">
              {uploading
                ? <div className="w-5 h-5 border-2 border-cyber-teal/30 border-t-cyber-teal rounded-full animate-spin" />
                : <Upload className="w-5 h-5 text-cyber-teal" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{t('dashboard.upload.title')}</div>
              <div className="text-xs text-cyber-muted mt-0.5">{uploading ? t('dashboard.upload.processing') : t('dashboard.upload.desc')}</div>
            </div>
            {status.dataset && <CheckCircle className="w-4 h-4 text-cyber-green ml-auto" />}
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleUpload} className="hidden" />

          {/* Train */}
          <button onClick={handleTrain}
            disabled={!status.dataset || training}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all text-left shadow-sm
                       bg-cyber-card/80 border-cyber-border hover:border-cyber-violet/50 hover:bg-cyber-violet/5 hover:shadow-cyber-violet/10 hover:shadow-lg hover:-translate-y-0.5
                       disabled:opacity-50 group">
            <div className="w-10 h-10 rounded-xl bg-cyber-violet/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyber-violet/20 transition-colors">
              {training
                ? <div className="w-5 h-5 border-2 border-cyber-violet/30 border-t-cyber-violet rounded-full animate-spin" />
                : <Cpu className="w-5 h-5 text-cyber-violet" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{t('dashboard.train.title')}</div>
              <div className="text-xs text-cyber-muted mt-0.5">{training ? t('dashboard.train.processing') : t('dashboard.train.desc')}</div>
            </div>
            {status.trained && <CheckCircle className="w-4 h-4 text-cyber-green ml-auto" />}
          </button>

          {/* Detect */}
          <button onClick={handleDetect}
            disabled={!status.trained || detecting}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all text-left shadow-sm
                       bg-gradient-to-r from-cyber-rose/10 to-cyber-rose/5 border-cyber-rose/30
                       hover:from-cyber-rose/20 hover:border-cyber-rose/50 hover:shadow-cyber-rose/10 hover:shadow-lg hover:-translate-y-0.5
                       disabled:opacity-50 group">
            <div className="w-10 h-10 rounded-xl bg-cyber-rose/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyber-rose/20 transition-colors">
              {detecting
                ? <div className="w-5 h-5 border-2 border-cyber-rose/30 border-t-cyber-rose rounded-full animate-spin" />
                : <Play className="w-5 h-5 text-cyber-rose" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{t('dashboard.detect.title')}</div>
              <div className="text-xs text-cyber-muted mt-0.5">{detecting ? t('dashboard.detect.processing') : t('dashboard.detect.desc')}</div>
            </div>
            {status.predicted && <CheckCircle className="w-4 h-4 text-cyber-green ml-auto" />}
          </button>
          
          {/* Simulate Attack */}
          <button onClick={handleSimulateAttack}
            disabled={!status.dataset || simulating}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all text-left shadow-sm
                       bg-gradient-to-r from-red-900/10 to-transparent border-red-900/30
                       hover:from-red-900/20 hover:border-red-900/50 hover:shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:-translate-y-0.5
                       disabled:opacity-50 group">
            <div className="w-10 h-10 rounded-xl bg-red-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-900/40 transition-colors">
              {simulating
                ? <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                : <Skull className="w-5 h-5 text-red-500" />}
            </div>
            <div>
              <div className="text-sm font-bold text-red-400">{t('dashboard.simulate.title')}</div>
              <div className="text-[11px] text-red-500/70 mt-0.5">{simulating ? t('dashboard.simulate.processing') : t('dashboard.simulate.desc')}</div>
            </div>
          </button>
        </div>

        {/* ── KPI cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Users}         label={t('dashboard.metrics.total_users')}    value={typeof totalUsers === 'number' ? totalUsers : totalUsers}
                      sub={t('dashboard.metrics.unique_ids')}        color="teal"   loading={tableLoading} />
          <MetricCard icon={AlertTriangle} label={t('dashboard.metrics.anomalies_found')} value={typeof totalAnomalies === 'number' ? totalAnomalies.toLocaleString() : '—'}
                      sub={metrics ? `${metrics.anomaly_pct}% ${t('dashboard.metrics.of_sessions')}` : t('dashboard.metrics.run_detection')} color="rose" loading={detecting} />
          <MetricCard icon={ShieldCheck}   label={t('dashboard.metrics.accuracy')}       value={metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : '—'}
                      sub={t('dashboard.metrics.iso_forest')}       color="green"  loading={detecting} />
          <MetricCard icon={Activity}      label={t('dashboard.metrics.f1_score')}       value={metrics ? metrics.f1_score.toFixed(3) : '—'}
                      sub={metrics ? `${t('dashboard.metrics.auc')} ${metrics.roc_auc.toFixed(3)}` : t('dashboard.metrics.model_not_run')} color="violet" loading={detecting} />
        </div>

        {/* ── Charts row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <Card title={t('dashboard.charts.zta_distribution')}>
            <ZTABarChart data={zta} />
          </Card>

          <Card title={t('dashboard.charts.anomaly_vs_normal')}>
            <AnomalyPieChart
              normal  = {metrics?.total_normal}
              anomaly = {metrics?.total_anomalies}
            />
          </Card>

          <Card title={t('dashboard.charts.anomaly_score_time')}>
            <ScoreLineChart predictions={predictions} />
          </Card>
        </div>

        {/* ── Bottom row: Confusion Matrix + Radar ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Card title={t('dashboard.charts.confusion_matrix')}>
            <ConfusionMatrix matrix={metrics?.confusion_matrix} />
            {metrics && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                {[
                  [t('dashboard.charts.precision'), metrics.precision],
                  [t('dashboard.charts.recall'),    metrics.recall],
                  [t('dashboard.charts.f1_score'),  metrics.f1_score],
                  [t('dashboard.charts.roc_auc'),   metrics.roc_auc],
                ].map(([k, v]) => (
                  <div key={k} className="bg-cyber-bg/50 rounded-lg px-3 py-2 flex justify-between border border-cyber-border/30">
                    <span className="text-cyber-muted font-medium">{k}</span>
                    <span className="text-cyber-teal font-mono font-bold">{v?.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title={t('dashboard.charts.performance_radar')}>
            <MetricsRadar metrics={metrics} />
            {zta && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                {[
                  { label: t('dashboard.charts.allow'),  value: zta.ALLOW,  color: 'text-cyber-green', bg: 'bg-cyber-green/10', border: 'border-cyber-green/20' },
                  { label: t('dashboard.charts.verify'), value: zta.VERIFY, color: 'text-cyber-amber', bg: 'bg-cyber-amber/10', border: 'border-cyber-amber/20' },
                  { label: t('dashboard.charts.deny'),   value: zta.DENY,   color: 'text-cyber-rose',  bg: 'bg-cyber-rose/10', border: 'border-cyber-rose/20'  },
                ].map(d => (
                  <div key={d.label} className={`${d.bg} border ${d.border} rounded-lg py-2.5 transition-transform hover:-translate-y-0.5`}>
                    <div className={`font-black text-base ${d.color}`}>{d.value?.toLocaleString()}</div>
                    <div className="text-cyber-muted font-medium mt-0.5 tracking-wider text-[10px] uppercase">{d.label}</div>
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
          <div className="bg-cyber-card/95 border border-cyber-border rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(34,211,238,0.1)] p-6 animate-slide-up">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-cyber-border/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-teal/20 to-cyber-blue/20 border border-cyber-teal/30 flex items-center justify-center glow-teal">
                <Bot className="w-6 h-6 text-cyber-teal" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{t('dashboard.bot_modal.title')}</h3>
                <p className="text-[11px] text-cyber-teal mt-0.5 font-medium">{t('dashboard.bot_modal.subtitle')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-cyber-muted mb-1.5 font-medium uppercase tracking-wider">{t('dashboard.bot_modal.token_label')}</label>
                <input
                  type="password"
                  value={botConfig.token}
                  onChange={e => setBotConfig(c => ({ ...c, token: e.target.value }))}
                  placeholder={t('dashboard.bot_modal.token_placeholder')}
                  className="w-full text-sm font-mono bg-cyber-bg focus:bg-cyber-bg/80"
                />
              </div>

              <div>
                <label className="block text-xs text-cyber-muted mb-1.5 font-medium uppercase tracking-wider">{t('dashboard.bot_modal.chatid_label')}</label>
                <input
                  type="text"
                  value={botConfig.chat_id}
                  onChange={e => setBotConfig(c => ({ ...c, chat_id: e.target.value }))}
                  placeholder={t('dashboard.bot_modal.chatid_placeholder')}
                  className="w-full text-sm font-mono bg-cyber-bg focus:bg-cyber-bg/80"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-cyber-bg/50 rounded-lg border border-cyber-border">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{t('dashboard.bot_modal.rt_notif')}</span>
                  <span className="text-[10px] text-cyber-muted mt-0.5">{t('dashboard.bot_modal.rt_notif_desc')}</span>
                </div>
                <button
                  onClick={() => setBotConfig(c => ({ ...c, enabled: !c.enabled }))}
                  className={`w-12 h-6 rounded-full transition-all relative shadow-inner ${botConfig.enabled ? 'bg-cyber-teal' : 'bg-cyber-border'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${botConfig.enabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setBotModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-cyber-muted border border-transparent hover:bg-cyber-bg hover:border-cyber-border rounded-lg transition-colors">
                {t('dashboard.bot_modal.cancel')}
              </button>
              <button
                onClick={handleSaveBot}
                disabled={savingBot}
                className="flex-1 px-4 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-cyber-teal to-cyber-blue text-cyber-bg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyber-teal/20 transition-all hover:shadow-cyber-teal/30 hover:-translate-y-0.5">
                {savingBot ? <div className="w-4 h-4 border-2 border-cyber-bg/40 border-t-cyber-bg rounded-full animate-spin" /> : t('dashboard.bot_modal.save')}
              </button>
            </div>
            
            <p className="mt-5 text-[10px] text-center text-cyber-muted/60 bg-cyber-bg/30 p-2 rounded-lg border border-cyber-border/30">
              {t('dashboard.bot_modal.note')}
            </p>
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  )
}

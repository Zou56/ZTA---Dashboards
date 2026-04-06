import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  LineChart, Line, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'

const CYBER = {
  bg:     '#0a0e1a',
  card:   '#0d1220',
  border: '#1e2d4a',
  muted:  '#8b949e',
  teal:   '#22d3ee',
  violet: '#a78bfa',
  rose:   '#f43f5e',
  amber:  '#fbbf24',
  green:  '#34d399',
  blue:   '#60a5fa',
}

const TooltipStyle = {
  contentStyle: { background: 'rgba(13, 18, 32, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #1e2d4a', borderRadius: 12, fontSize: 12, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' },
  labelStyle:   { color: '#e2e8f0', fontWeight: 'bold', marginBottom: 4 },
  itemStyle:    { color: '#94a3b8' },
}

export function ZTABarChart({ data }) {
  const { t } = useTranslation()
  if (!data) return <EmptyChart t={t} />
  const chartData = [
    { name: t('dashboard.charts.allow'),  value: data.ALLOW  ?? 0, color: CYBER.green  },
    { name: t('dashboard.charts.verify'), value: data.VERIFY ?? 0, color: CYBER.amber  },
    { name: t('dashboard.charts.deny'),   value: data.DENY   ?? 0, color: CYBER.rose   },
  ]
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} barSize={35}>
        <CartesianGrid strokeDasharray="3 3" stroke={CYBER.border} vertical={false} opacity={0.5} />
        <XAxis dataKey="name" tick={{ fill: CYBER.muted, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
        <YAxis tick={{ fill: CYBER.muted, fontSize: 10 }} axisLine={false} tickLine={false} dx={-10} />
        <Tooltip {...TooltipStyle} cursor={{fill: 'rgba(34, 211, 238, 0.05)'}} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={d.color} fillOpacity={0.9} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function AnomalyPieChart({ normal, anomaly }) {
  const { t } = useTranslation()
  if (normal == null && anomaly == null) return <EmptyChart t={t} />
  const data = [
    { name: t('charts_cmp.normal'),  value: normal  ?? 0, color: CYBER.green  },
    { name: t('charts_cmp.anomaly'), value: anomaly ?? 0, color: CYBER.rose   },
  ]
  const total = (normal ?? 0) + (anomaly ?? 0)
  const pct   = total > 0 ? Math.round((anomaly / total) * 100) : 0

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={90}
               paddingAngle={4} dataKey="value" strokeWidth={0} cornerRadius={4}>
            {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.9} />)}
          </Pie>
          <Tooltip {...TooltipStyle} formatter={(v) => [v.toLocaleString(), '']} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(v, e) => <span style={{ color: CYBER.muted, fontSize: 11, fontWeight: 500 }}>{v}: <span style={{color: '#e2e8f0'}}>{e.payload.value.toLocaleString()}</span></span>} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex flex-col items-center justify-center">
        <div className="text-3xl font-black text-cyber-rose drop-shadow-lg leading-none">{pct}%</div>
        <div className="text-[10px] uppercase tracking-widest text-cyber-muted mt-1 font-bold">{t('charts_cmp.anomaly')}</div>
      </div>
    </div>
  )
}

export function ScoreLineChart({ predictions = [] }) {
  const { t } = useTranslation()
  if (!predictions.length) return <EmptyChart t={t} />

  const step   = Math.max(1, Math.floor(predictions.length / 200))
  const sample = predictions.filter((_, i) => i % step === 0).map((r, i) => ({
    idx:   i,
    score: parseFloat(r.anomaly_score ?? 0),
    label: r.zta_decision,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={sample} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CYBER.border} opacity={0.5} />
        <XAxis dataKey="idx" hide />
        <YAxis domain={[0, 1]} tick={{ fill: CYBER.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip {...TooltipStyle}
          formatter={(v, n, p) => [`${v.toFixed(3)} (${p.payload.label})`, t('charts_cmp.score')]} />
        <ReferenceLine y={0.70} stroke={CYBER.rose}   strokeDasharray="4 2" label={{ value: 'DENY (0.7)',   fill: CYBER.rose,   fontSize: 10, position: 'insideTopLeft' }} />
        <ReferenceLine y={0.50} stroke={CYBER.amber}  strokeDasharray="4 2" label={{ value: 'VERIFY (0.5)', fill: CYBER.amber,  fontSize: 10, position: 'insideTopLeft' }} />
        <Line type="monotone" dataKey="score" stroke={CYBER.teal} strokeWidth={2}
              dot={false} activeDot={{ r: 4, fill: CYBER.teal, strokeWidth: 0, stroke: '#fff' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ConfusionMatrix({ matrix }) {
  const { t } = useTranslation()
  if (!matrix) return <EmptyChart t={t} />
  const [[tn, fp], [fn, tp]] = matrix
  const total = tn + fp + fn + tp
  const cells = [
    { label: 'TN', value: tn, desc: t('charts_cmp.tn_desc'),  color: CYBER.green  },
    { label: 'FP', value: fp, desc: t('charts_cmp.fp_desc'),  color: CYBER.amber  },
    { label: 'FN', value: fn, desc: t('charts_cmp.fn_desc'),  color: CYBER.violet },
    { label: 'TP', value: tp, desc: t('charts_cmp.tp_desc'),  color: CYBER.teal   },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 p-1">
      {cells.map(c => (
        <div key={c.label} className="rounded-xl p-3 text-center transition-transform hover:-translate-y-1 shadow-sm" style={{ background: `${c.color}10`, border: `1px solid ${c.color}25` }}>
          <div className="text-2xl font-black" style={{ color: c.color }}>{c.value.toLocaleString()}</div>
          <div className="text-[11px] font-black mt-1 tracking-widest" style={{ color: c.color }}>{c.label}</div>
          <div className="text-[10px] text-cyber-muted tracking-wide mt-0.5">{c.desc}</div>
          <div className="text-[10px] text-cyber-muted font-mono mt-1 opacity-80">{total > 0 ? ((c.value / total) * 100).toFixed(1) : 0}%</div>
        </div>
      ))}
    </div>
  )
}

export function MetricsRadar({ metrics }) {
  const { t } = useTranslation()
  if (!metrics) return <EmptyChart t={t} />
  const data = [
    { metric: t('charts_cmp.accuracy'),  value: Math.round((metrics.accuracy  ?? 0) * 100) },
    { metric: t('charts_cmp.precision'), value: Math.round((metrics.precision ?? 0) * 100) },
    { metric: t('charts_cmp.recall'),    value: Math.round((metrics.recall    ?? 0) * 100) },
    { metric: t('charts_cmp.f1_score'),  value: Math.round((metrics.f1_score  ?? 0) * 100) },
    { metric: t('charts_cmp.roc_auc'),   value: Math.round((metrics.roc_auc   ?? 0) * 100) },
  ]
  return (
    <ResponsiveContainer width="100%" height={230}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius={70}>
        <PolarGrid stroke={CYBER.border} strokeOpacity={0.6} />
        <PolarAngleAxis dataKey="metric" tick={{ fill: CYBER.muted, fontSize: 10, fontWeight: 600 }} />
        <Radar dataKey="value" stroke={CYBER.violet} fill={CYBER.violet} fillOpacity={0.25} strokeWidth={2} />
        <Tooltip {...TooltipStyle} formatter={(v) => [`${v}%`, '']} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

function EmptyChart({ t }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-cyber-muted gap-3">
      <BarChart3 className="w-10 h-10 opacity-30" />
      <span className="text-sm font-medium">{t ? t('charts_cmp.empty') : 'Run detection to populate charts'}</span>
    </div>
  )
}

/**
 * Charts.jsx — All Recharts-based visualizations for the ZTA Dashboard
 * Includes: ZTA Bar Chart, Anomaly Pie Chart, Score Line Chart, Confusion Matrix, Metrics Bar
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  LineChart, Line, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'

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
  contentStyle: { background: '#0d1220', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 },
  labelStyle:   { color: '#e2e8f0' },
  itemStyle:    { color: '#94a3b8' },
}

// ── ZTA Bar Chart ─────────────────────────────────────────────────────────────
export function ZTABarChart({ data }) {
  if (!data) return <EmptyChart />
  const chartData = [
    { name: 'ALLOW',  value: data.ALLOW  ?? 0, color: CYBER.green  },
    { name: 'VERIFY', value: data.VERIFY ?? 0, color: CYBER.amber  },
    { name: 'DENY',   value: data.DENY   ?? 0, color: CYBER.rose   },
  ]
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" stroke={CYBER.border} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: CYBER.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: CYBER.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip {...TooltipStyle} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={d.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Anomaly Pie Chart ─────────────────────────────────────────────────────────
export function AnomalyPieChart({ normal, anomaly }) {
  if (normal == null && anomaly == null) return <EmptyChart />
  const data = [
    { name: 'Normal',  value: normal  ?? 0, color: CYBER.green  },
    { name: 'Anomaly', value: anomaly ?? 0, color: CYBER.rose   },
  ]
  const total = (normal ?? 0) + (anomaly ?? 0)
  const pct   = total > 0 ? Math.round((anomaly / total) * 100) : 0

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={90}
               paddingAngle={3} dataKey="value" strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
          </Pie>
          <Tooltip {...TooltipStyle} formatter={(v) => [v.toLocaleString(), '']} />
          <Legend iconType="circle" iconSize={8}
                  formatter={(v, e) => <span style={{ color: CYBER.muted, fontSize: 11 }}>{v}: {e.payload.value.toLocaleString()}</span>} />
        </PieChart>
      </ResponsiveContainer>
      {/* Centre label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
        <div className="text-xl font-bold text-cyber-rose">{pct}%</div>
        <div className="text-[10px] text-cyber-muted">Anomaly</div>
      </div>
    </div>
  )
}

// ── Score Line Chart ──────────────────────────────────────────────────────────
export function ScoreLineChart({ predictions = [] }) {
  if (!predictions.length) return <EmptyChart />

  // Sample max 200 points to avoid over-plotting
  const step   = Math.max(1, Math.floor(predictions.length / 200))
  const sample = predictions.filter((_, i) => i % step === 0).map((r, i) => ({
    idx:   i,
    score: parseFloat(r.anomaly_score ?? 0),
    label: r.zta_decision,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={sample}>
        <CartesianGrid strokeDasharray="3 3" stroke={CYBER.border} />
        <XAxis dataKey="idx" hide />
        <YAxis domain={[0, 1]} tick={{ fill: CYBER.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip {...TooltipStyle}
          formatter={(v, n, p) => [`${v.toFixed(3)} (${p.payload.label})`, 'Score']} />
        <ReferenceLine y={0.70} stroke={CYBER.rose}   strokeDasharray="4 2" label={{ value: 'DENY 0.7',   fill: CYBER.rose,   fontSize: 9 }} />
        <ReferenceLine y={0.50} stroke={CYBER.amber}  strokeDasharray="4 2" label={{ value: 'VERIFY 0.5', fill: CYBER.amber,  fontSize: 9 }} />
        <Line type="monotone" dataKey="score" stroke={CYBER.teal} strokeWidth={1.5}
              dot={false} activeDot={{ r: 3, fill: CYBER.teal }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Confusion Matrix ───────────────────────────────────────────────────────────
export function ConfusionMatrix({ matrix }) {
  if (!matrix) return <EmptyChart />
  const [[tn, fp], [fn, tp]] = matrix
  const total = tn + fp + fn + tp
  const cells = [
    { label: 'TN', value: tn, desc: 'True Negative',  color: CYBER.green  },
    { label: 'FP', value: fp, desc: 'False Positive', color: CYBER.amber  },
    { label: 'FN', value: fn, desc: 'False Negative', color: CYBER.violet },
    { label: 'TP', value: tp, desc: 'True Positive',  color: CYBER.teal   },
  ]
  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {cells.map(c => (
        <div key={c.label} className="rounded-lg p-3 text-center" style={{ background: `${c.color}15`, border: `1px solid ${c.color}30` }}>
          <div className="text-xl font-bold" style={{ color: c.color }}>{c.value.toLocaleString()}</div>
          <div className="text-xs font-bold mt-0.5" style={{ color: c.color }}>{c.label}</div>
          <div className="text-[10px] text-cyber-muted">{c.desc}</div>
          <div className="text-[10px] text-cyber-muted">{total > 0 ? ((c.value / total) * 100).toFixed(1) : 0}%</div>
        </div>
      ))}
    </div>
  )
}

// ── Metrics Radar Chart ───────────────────────────────────────────────────────
export function MetricsRadar({ metrics }) {
  if (!metrics) return <EmptyChart />
  const data = [
    { metric: 'Accuracy',  value: Math.round((metrics.accuracy  ?? 0) * 100) },
    { metric: 'Precision', value: Math.round((metrics.precision ?? 0) * 100) },
    { metric: 'Recall',    value: Math.round((metrics.recall    ?? 0) * 100) },
    { metric: 'F1-Score',  value: Math.round((metrics.f1_score  ?? 0) * 100) },
    { metric: 'ROC AUC',   value: Math.round((metrics.roc_auc   ?? 0) * 100) },
  ]
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} cx="50%" cy="50%">
        <PolarGrid stroke={CYBER.border} />
        <PolarAngleAxis dataKey="metric" tick={{ fill: CYBER.muted, fontSize: 10 }} />
        <Radar dataKey="value" stroke={CYBER.violet} fill={CYBER.violet} fillOpacity={0.2} strokeWidth={1.5} />
        <Tooltip {...TooltipStyle} formatter={(v) => [`${v}%`, '']} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

import { BarChart3 } from 'lucide-react'

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-cyber-muted gap-2">
      <BarChart3 className="w-8 h-8 opacity-50" />
      <span className="text-xs">Run detection to populate charts</span>
    </div>
  )
}

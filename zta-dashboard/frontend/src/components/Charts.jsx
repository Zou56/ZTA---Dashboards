import React from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-premium text-xs">
        <p className="text-slate-900 font-bold mb-2 tracking-tight">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }}></div>
                <span className="text-slate-500 font-medium">{p.name}:</span>
              </div>
              <span className="font-bold text-slate-900">{p.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function ZTABarChart({ data }) {
  if (!data) return null
  const plotData = Object.entries(data).map(([name, value]) => ({ name, value }))
  
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={plotData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
          <Bar dataKey="value" name="Activity" radius={[6, 6, 0, 0]} barSize={32}>
            {plotData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AnomalyPieChart({ normal = 0, anomaly = 0 }) {
  const data = [
    { name: 'Normal', value: normal || 0, color: '#10b981' },
    { name: 'Anomalies', value: anomaly || 0, color: '#ef4444' },
  ]
  
  return (
    <div className="h-[240px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={6}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
         <span className="text-3xl font-extrabold text-slate-900 leading-none">{((anomaly / (normal + anomaly || 1)) * 100).toFixed(1)}%</span>
         <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Exposure</span>
      </div>
    </div>
  )
}

export function ScoreLineChart({ predictions = [] }) {
  if (predictions.length === 0) return (
     <div className="h-[240px] flex items-center justify-center text-slate-300 text-[11px] font-bold uppercase tracking-widest italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        Awaiting real-time telemetry
     </div>
  )

  const data = predictions.slice(-60).map((p, i) => ({ 
    index: i, 
    score: p.anomaly_score,
    threshold: 0.3
  }))

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="index" 
            hide
          />
          <YAxis 
            domain={[0, 1]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#scoreGradient)" 
            strokeWidth={3}
            name="Anomaly Score" 
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
          />
          <Line 
            type="step" 
            dataKey="threshold" 
            stroke="#ef4444" 
            strokeDasharray="4 4" 
            dot={false}
            name="Threshold"
            strokeWidth={1.5}
            opacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ConfusionMatrix({ matrix }) {
  if (!matrix) return <div className="h-[150px] flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest italic">Data Unavailable</div>
  
  const labels = ['Normal', 'Anomaly']
  const cells = [
    { r: 0, c: 0, v: matrix[0][0], label: 'TN', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { r: 0, c: 1, v: matrix[0][1], label: 'FP', color: 'text-amber-600', bg: 'bg-amber-50' },
    { r: 1, c: 0, v: matrix[1][0], label: 'FN', color: 'text-rose-600', bg: 'bg-rose-50' },
    { r: 1, c: 1, v: matrix[1][1], label: 'TP', color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      {cells.map((cell, i) => (
        <div key={i} className={`${cell.bg} rounded-2xl p-4 flex flex-col items-center justify-center transition-all hover:scale-[1.02] border border-white shadow-sm`}>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">{cell.label}</div>
          <div className={`text-2xl font-extrabold ${cell.color} tracking-tight`}>{cell.v.toLocaleString()}</div>
          <div className="text-[9px] text-slate-500 uppercase font-bold mt-1 opacity-60">{labels[cell.r]} → {labels[cell.c]}</div>
        </div>
      ))}
    </div>
  )
}

export function MetricsRadar({ metrics }) {
  if (!metrics) return null
  const data = [
    { subject: 'Accuracy',  A: metrics.accuracy  * 100 },
    { subject: 'Precision', A: metrics.precision * 100 },
    { subject: 'Recall',    A: metrics.recall    * 100 },
    { subject: 'F1 Score',  A: metrics.f1_score  * 100 },
    { subject: 'ROC AUC',   A: metrics.roc_auc   * 100 },
  ]

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
          <Radar
            name="Performance"
            dataKey="A"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={3}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

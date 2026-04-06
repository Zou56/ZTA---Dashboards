import React from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

const COLORS = ['#58a6ff', '#3fb950', '#f85149', '#f0883e', '#bc8cff', '#d29922']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-lg shadow-xl text-xs">
        <p className="text-[#8b949e] font-bold mb-1 uppercase tracking-widest">{label}</p>
        {payload.map((p, idx) => (
          <p key={idx} className="text-[#f0f6fc] flex justify-between gap-4">
            <span style={{ color: p.color || p.fill }}>{p.name}:</span>
            <span className="font-mono font-bold">{p.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function ZTABarChart({ data }) {
  if (!data) return null
  const plotData = Object.entries(data).map(([name, value]) => ({ name, value }))
  
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={plotData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8b949e', fontSize: 10, fontWeight: 700 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8b949e', fontSize: 10, fontWeight: 700 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#161b22' }} />
          <Bar dataKey="value" name="Frequency" radius={[4, 4, 0, 0]}>
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
    { name: 'Normal Traffic', value: normal || 0, color: '#3fb950' },
    { name: 'Detected Anomalies', value: anomaly || 0, color: '#f85149' },
  ]
  
  return (
    <div className="h-[220px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
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
         <span className="text-xl font-black text-white">{((anomaly / (normal + anomaly || 1)) * 100).toFixed(1)}%</span>
         <span className="text-[10px] text-[#8b949e] font-bold uppercase">Exposure</span>
      </div>
    </div>
  )
}

export function ScoreLineChart({ predictions = [] }) {
  if (predictions.length === 0) return (
     <div className="h-[220px] flex items-center justify-center text-[#484f58] text-xs font-bold uppercase tracking-widest italic">
        Awaiting Detection Run
     </div>
  )

  const data = predictions.slice(-50).map((p, i) => ({ 
    index: i, 
    score: p.anomaly_score,
    threshold: 0.3
  }))

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#58a6ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
          <XAxis 
            dataKey="index" 
            hide
          />
          <YAxis 
            domain={[0, 1]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8b949e', fontSize: 10, fontWeight: 700 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#58a6ff" 
            fillOpacity={1} 
            fill="url(#scoreGradient)" 
            strokeWidth={2}
            name="Anomaly Score" 
          />
          <Line 
            type="step" 
            dataKey="threshold" 
            stroke="#f85149" 
            strokeDasharray="5 5" 
            dot={false}
            name="ZTA Threshold"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ConfusionMatrix({ matrix }) {
  if (!matrix) return <div className="h-[150px] flex items-center justify-center text-[#484f58] text-xs font-bold uppercase tracking-widest italic">Data Unavailable</div>
  
  const labels = ['Normal', 'Anomaly']
  const cells = [
    { r: 0, c: 0, v: matrix[0][0], label: 'TN' },
    { r: 0, c: 1, v: matrix[0][1], label: 'FP' },
    { r: 1, c: 0, v: matrix[1][0], label: 'FN' },
    { r: 1, c: 1, v: matrix[1][1], label: 'TP' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {cells.map((cell, i) => (
        <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 flex flex-col items-center justify-center transition-all hover:bg-[#161b22]">
          <div className="text-[10px] text-[#8b949e] font-bold uppercase tracking-tighter mb-1">{cell.label}</div>
          <div className="text-lg font-black text-[#f0f6fc]">{cell.v.toLocaleString()}</div>
          <div className="text-[9px] text-[#484f58] uppercase font-medium">{labels[cell.r]} / {labels[cell.c]}</div>
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
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#30363d" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b949e', fontSize: 10, fontWeight: 700 }} />
          <Radar
            name="Performance"
            dataKey="A"
            stroke="#58a6ff"
            fill="#58a6ff"
            fillOpacity={0.3}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

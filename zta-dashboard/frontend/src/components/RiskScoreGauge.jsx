import React from 'react'

export default function RiskScoreGauge({ score = 0, label = 'Operational Exposure' }) {
  const radius = 85
  const stroke = 14
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s < 30) return '#10b981' // emerald-500
    if (s < 60) return '#f59e0b' // amber-500
    if (s < 85) return '#f97316' // orange-500
    return '#ef4444' // rose-500
  }

  const color = getColor(score)

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative inline-flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 drop-shadow-sm"
        >
          {/* Background circle */}
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={color}
            fill="transparent"
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            strokeWidth={stroke}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="filter drop-shadow-[0_0_4px_rgba(0,0,0,0.05)]"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-extrabold text-slate-900 leading-none tracking-tight">{Math.round(score)}%</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">{label}</span>
        </div>
      </div>
      <div className="mt-8 text-center">
         <div className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm border
           ${score < 30 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
             score < 60 ? 'bg-amber-50 text-amber-600 border-amber-100' : 
             score < 85 ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                          'bg-rose-50 text-rose-600 border-rose-100'}`}>
           {score < 30 ? 'Stable' : score < 60 ? 'Watch' : score < 85 ? 'Elevated' : 'Critical'}
         </div>
      </div>
    </div>
  )
}

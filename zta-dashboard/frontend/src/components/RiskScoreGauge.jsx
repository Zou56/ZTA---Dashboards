import React from 'react'

export default function RiskScoreGauge({ score = 0, label = 'Cyber Risk Score' }) {
  const radius = 70
  const stroke = 12
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s < 30) return '#3fb950' // Low
    if (s < 60) return '#d29922' // Med
    if (s < 85) return '#f0883e' // High
    return '#f85149' // Critical
  }

  const color = getColor(score)

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative inline-flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#161b22"
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
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease' }}
            strokeWidth={stroke}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-black text-white leading-none">{Math.round(score)}%</span>
          <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-tighter mt-1">Trust Loss</span>
        </div>
      </div>
      <div className="mt-4 text-center">
         <div className="text-xs font-bold text-[#f0f6fc] uppercase tracking-widest">{label}</div>
         <div className={`text-[10px] font-black mt-1 uppercase tracking-tighter px-2 py-0.5 rounded border inline-block
           ${score < 30 ? 'bg-[#3fb95015] text-[#3fb950] border-[#3fb95030]' : 
             score < 60 ? 'bg-[#d2992215] text-[#d29922] border-[#d2992230]' : 
             score < 85 ? 'bg-[#f0883e15] text-[#f0883e] border-[#f0883e30]' : 
                          'bg-[#f8514915] text-[#f85149] border-[#f8514930]'}`}>
           {score < 30 ? 'SECURE' : score < 60 ? 'CAUTION' : score < 85 ? 'THREAT DETECTED' : 'CRITICAL BREACH'}
         </div>
      </div>
    </div>
  )
}

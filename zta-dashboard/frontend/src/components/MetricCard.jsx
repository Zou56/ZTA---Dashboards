import React from 'react'

export default function MetricCard({ icon: Icon, label, value, sub, color = 'blue', loading = false, trend = null }) {
  const colors = {
    blue:   'bg-[#58a6ff15] text-[#58a6ff] border-[#58a6ff30]',
    teal:   'bg-[#3fb95015] text-[#3fb950] border-[#3fb95030]',
    rose:   'bg-[#f8514915] text-[#f85149] border-[#f8514930]',
    orange: 'bg-[#f0883e15] text-[#f0883e] border-[#f0883e30]',
    violet: 'bg-[#bc8cff15] text-[#bc8cff] border-[#bc8cff30]',
    amber:  'bg-[#d2992215] text-[#d29922] border-[#d2992230]',
  }

  const selectedColor = colors[color] || colors.blue

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 transition-all hover:bg-[#1c222b] hover:border-[#484f58] shadow-sm flex items-start gap-4 h-full">
      <div className={`p-2.5 rounded-lg border flex-shrink-0 ${selectedColor}`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest leading-tight">
          {label}
        </div>
        
        <div className="mt-1 flex items-baseline gap-2">
          {loading ? (
            <div className="h-6 w-16 bg-[#21262d] animate-pulse rounded"></div>
          ) : (
            <span className="text-xl font-black text-[#f0f6fc] leading-tight">
              {value}
            </span>
          )}
          
          {trend !== null && !loading && (
            <span className={`text-[10px] font-bold ${trend >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        
        <div className="mt-1.5 text-[10px] text-[#484f58] font-medium truncate italic leading-tight">
          {sub}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MetricCard({ icon: Icon, label, value, sub, color = 'blue', loading = false, trend = null }) {
  const colors = {
    blue:   'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    teal:   'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    rose:   'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800',
    violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800',
    amber:  'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
  }

  const selectedColor = colors[color] || colors.blue

  return (
    <div className="px-card p-8 group flex flex-col h-full relative overflow-hidden transition-all duration-300">
      {/* Background Accent Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-[0.05] dark:opacity-[0.1] ${selectedColor.split(' ')[0]}`}></div>
      
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl border flex-shrink-0 shadow-sm ${selectedColor} transition-transform group-hover:scale-110 duration-500`}>
          <Icon className="w-7 h-7 flex-shrink-0" />
        </div>
        
        {trend !== null && !loading && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${trend >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] leading-tight mb-2.5">
          {label}
        </div>
        
        <div className="flex items-baseline gap-2">
          {loading ? (
            <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl mt-1"></div>
          ) : (
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              {value}
            </span>
          )}
        </div>
        
        <div className="mt-5 flex items-center gap-2">
           <div className="text-[12px] text-slate-500 dark:text-slate-400 font-bold truncate leading-tight bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-xl border border-slate-100 dark:border-slate-800 inline-block shadow-sm">
             {sub}
           </div>
        </div>
      </div>
      
      {/* Mini Visual Indicator - Progress bar style */}
      <div className="mt-8 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
         <div 
           className={`h-full rounded-full transition-all duration-1000 ${selectedColor.split(' ')[2].replace('text-', 'bg-')}`} 
           style={{ width: loading ? '30%' : '75%' }}
         ></div>
      </div>
    </div>
  )
}

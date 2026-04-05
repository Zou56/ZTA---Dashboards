/**
 * MetricCard — displays a single KPI with icon, value, and subtitle.
 * Used in the Dashboard stats row.
 */
export default function MetricCard({ icon: Icon, label, value, sub, color = 'teal', loading }) {
  const colors = {
    teal:   { bg: 'bg-cyber-teal/10',   border: 'border-cyber-teal/25',   text: 'text-cyber-teal',   icon: 'text-cyber-teal' },
    violet: { bg: 'bg-cyber-violet/10', border: 'border-cyber-violet/25', text: 'text-cyber-violet', icon: 'text-cyber-violet' },
    rose:   { bg: 'bg-cyber-rose/10',   border: 'border-cyber-rose/25',   text: 'text-cyber-rose',   icon: 'text-cyber-rose' },
    green:  { bg: 'bg-cyber-green/10',  border: 'border-cyber-green/25',  text: 'text-cyber-green',  icon: 'text-cyber-green' },
    amber:  { bg: 'bg-cyber-amber/10',  border: 'border-cyber-amber/25',  text: 'text-cyber-amber',  icon: 'text-cyber-amber' },
    blue:   { bg: 'bg-cyber-blue/10',   border: 'border-cyber-blue/25',   text: 'text-cyber-blue',   icon: 'text-cyber-blue' },
  }
  const c = colors[color] ?? colors.teal

  return (
    <div className={`bg-cyber-card border ${c.border} rounded-xl p-4 flex flex-col justify-between items-start gap-2 animate-slide-up transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 h-[120px]`}>
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
        {Icon && <Icon className={`w-5 h-5 ${c.icon}`} />}
      </div>
      <div className="min-w-0">
        <p className="text-cyber-muted text-xs font-medium tracking-wide uppercase">{label}</p>
        {loading
          ? <div className="h-7 w-20 bg-cyber-border rounded animate-pulse mt-1" />
          : <p className={`text-2xl font-bold mt-0.5 ${c.text} leading-none`}>{value ?? '—'}</p>
        }
        {sub && <p className="text-cyber-muted text-xs mt-1">{sub}</p>}
      </div>
    </div>
  )
}

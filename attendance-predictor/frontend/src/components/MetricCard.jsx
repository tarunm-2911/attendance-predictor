/**
 * MetricCard – glassmorphism stat card
 */
export default function MetricCard({ label, value, sub, accent = 'blue', icon, trend }) {
  const accents = {
    blue:   'border-blue-500/20 text-blue-400',
    green:  'border-green-500/20 text-green-400',
    yellow: 'border-yellow-500/20 text-yellow-400',
    red:    'border-red-500/20 text-red-400',
    purple: 'border-purple-500/20 text-purple-400',
  }
  const glows = {
    blue:   'hover:shadow-blue-500/10',
    green:  'hover:shadow-green-500/10',
    yellow: 'hover:shadow-yellow-500/10',
    red:    'hover:shadow-red-500/10',
    purple: 'hover:shadow-purple-500/10',
  }
  const iconBg = {
    blue:   'bg-blue-500/10',
    green:  'bg-green-500/10',
    yellow: 'bg-yellow-500/10',
    red:    'bg-red-500/10',
    purple: 'bg-purple-500/10',
  }

  return (
    <div className={`glass-card p-5 border hover:shadow-lg transition-all duration-300 ${glows[accent]}`}
         style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        {icon && (
          <div className={`w-8 h-8 ${iconBg[accent]} rounded-lg flex items-center justify-center text-base`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold ${accents[accent]} count-animate`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      {trend !== undefined && (
        <div className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs current
        </div>
      )}
    </div>
  )
}

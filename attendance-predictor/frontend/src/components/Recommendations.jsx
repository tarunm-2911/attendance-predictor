/**
 * Recommendations – smart advice cards
 */
export default function Recommendations({ recommendations }) {
  if (!recommendations?.length) return null

  const typeStyles = {
    danger:  { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-300' },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-300' },
    success: { bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-300' },
    action:  { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-300' },
    info:    { bg: 'bg-slate-700/30',  border: 'border-slate-600/30',  text: 'text-slate-400' },
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-xl">💡</div>
        <div>
          <h3 className="font-bold text-slate-100">Smart Recommendations</h3>
          <p className="text-slate-500 text-xs">Personalized advice based on your attendance</p>
        </div>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const style = typeStyles[rec.type] || typeStyles.info
          return (
            <div key={i} className={`flex gap-3 p-3.5 rounded-xl border ${style.bg} ${style.border}`}>
              <span className="text-lg flex-shrink-0 mt-0.5">{rec.icon}</span>
              <p className={`text-sm leading-relaxed ${style.text}`}>{rec.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

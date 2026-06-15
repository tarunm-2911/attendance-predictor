/**
 * SimulationTool – lets students simulate attending or missing classes
 */
import { useState, useEffect } from 'react'
import { api } from '../api/index.js'

export default function SimulationTool({ data }) {
  const [count, setCount] = useState(5)
  const [action, setAction] = useState('attend')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { setResult(null) }, [data])

  async function simulate() {
    setLoading(true)
    try {
      const res = await api.simulate({
        totalClasses: data.totalClasses,
        attended: data.attended,
        futureClasses: data.futureClasses,
        threshold: data.threshold,
        action,
        count,
      })
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    eligible:     { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    warning:      { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    not_eligible: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  }
  const statusLabels = { eligible: 'Eligible', warning: 'Warning Zone', not_eligible: 'Not Eligible' }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-xl">🔬</div>
        <div>
          <h3 className="font-bold text-slate-100">Simulation Tool</h3>
          <p className="text-slate-500 text-xs">What if you attend or miss more classes?</p>
        </div>
      </div>

      {/* Action Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setAction('attend'); setResult(null) }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            action === 'attend'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-slate-800/50 text-slate-500 border border-transparent hover:border-slate-600'
          }`}
        >
          ✅ Attend Classes
        </button>
        <button
          onClick={() => { setAction('miss'); setResult(null) }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            action === 'miss'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-slate-800/50 text-slate-500 border border-transparent hover:border-slate-600'
          }`}
        >
          ❌ Miss Classes
        </button>
      </div>

      {/* Count Slider */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-slate-400 font-medium">
            Number of classes to {action}
          </label>
          <span className="text-blue-400 font-bold text-sm">{count}</span>
        </div>
        <input
          type="range"
          min="1"
          max="30"
          value={count}
          onChange={e => { setCount(parseInt(e.target.value)); setResult(null) }}
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>1</span><span>15</span><span>30</span>
        </div>
      </div>

      <button
        onClick={simulate}
        disabled={loading}
        className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all
          bg-purple-500/20 text-purple-300 border border-purple-500/30
          hover:bg-purple-500/30 disabled:opacity-50"
      >
        {loading ? 'Simulating...' : '▶ Run Simulation'}
      </button>

      {/* Result */}
      {result && (
        <div className={`mt-4 p-4 rounded-xl border ${statusColors[result.status]?.bg || ''} ${statusColors[result.status]?.border || ''}`}>
          <p className="text-slate-300 text-sm mb-2">
            {action === 'attend'
              ? `If you attend the next ${count} classes:`
              : `If you miss the next ${count} classes:`}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${statusColors[result.status]?.text || 'text-slate-300'}`}>
                {result.simulatedAttendance?.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500">attendance</div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-semibold ${result.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {result.change >= 0 ? '+' : ''}{result.change?.toFixed(1)}%
              </div>
              <div className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusColors[result.status]?.bg || ''} ${statusColors[result.status]?.text || ''}`}>
                {statusLabels[result.status] || result.status}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

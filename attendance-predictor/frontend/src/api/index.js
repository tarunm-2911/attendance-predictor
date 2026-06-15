/**
 * API utility - talks to Flask backend
 * Falls back to local calculation if backend is unavailable
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function fetchJSON(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

/** Local fallback math (no backend required for demo) */
function localPredict({ studentName, totalClasses, attended, futureClasses, threshold }) {
  const total = parseInt(totalClasses)
  const att = parseInt(attended)
  const future = parseInt(futureClasses)
  const req = parseFloat(threshold)

  const currentPct = total > 0 ? Math.round((att / total) * 100 * 100) / 100 : 0
  
  // Predict: assume same rate continues
  const rate = att / Math.max(total, 1)
  const futureAtt = Math.round(rate * future)
  const newTotal = total + future
  const newAtt = att + futureAtt
  const predictedPct = Math.round((newAtt / newTotal) * 100 * 100) / 100

  const getStatus = (pct) => pct >= req + 10 ? 'eligible' : pct >= req ? 'warning' : 'not_eligible'

  // Classes needed
  const t = req / 100
  const numerator = t * total - att
  const denominator = 1 - t
  const classesNeeded = numerator > 0 ? Math.max(0, Math.ceil(numerator / denominator)) : 0

  // Max missable
  const minFutureAtt = t * (total + future) - att
  const maxMissable = Math.max(0, Math.min(future, future - Math.ceil(Math.max(0, minFutureAtt))))

  // Monthly trend (synthetic)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const cm = new Date().getMonth()
  const trend = []
  for (let i = 0; i < 6; i++) {
    trend.push({ month: months[(cm - 5 + i + 12) % 12], attendance: Math.max(40, Math.min(100, currentPct - 6 + i * 1.2)), type: 'historical' })
  }
  trend.push({ month: months[cm % 12], attendance: currentPct, type: 'current' })
  trend.push({ month: months[(cm + 1) % 12], attendance: Math.round((currentPct + predictedPct) / 2 * 10) / 10, type: 'predicted' })
  trend.push({ month: months[(cm + 2) % 12], attendance: predictedPct, type: 'predicted' })

  const recs = []
  if (currentPct < req - 10) {
    recs.push({ type: 'danger', icon: '🚨', text: `Attendance is critically low at ${currentPct.toFixed(1)}%. Immediate action required.` })
    recs.push({ type: 'action', icon: '📚', text: `Attend the next ${classesNeeded} consecutive classes to reach ${req}%.` })
  } else if (currentPct < req) {
    recs.push({ type: 'warning', icon: '⚠️', text: `Attendance is below ${req}%. You need ${classesNeeded} more classes.` })
    recs.push({ type: 'action', icon: '📅', text: 'Avoid missing any classes until above the requirement.' })
  } else {
    recs.push({ type: 'success', icon: '🎉', text: `Excellent! Attendance is ${currentPct.toFixed(1)}% — above requirement.` })
    recs.push({ type: 'action', icon: '✅', text: `You can safely miss up to ${maxMissable} class(es).` })
  }
  recs.push({ type: 'info', icon: '💡', text: 'Consistent attendance improves academic performance significantly.' })

  return {
    studentName, currentAttendance: currentPct, predictedAttendance: predictedPct,
    predictionConfidence: 85.0, status: getStatus(currentPct), predictedStatus: getStatus(predictedPct),
    classesNeeded, maxMissable, totalClasses: total, attended: att, missed: total - att,
    futureClasses: future, threshold: req, monthlyTrend: trend, recommendations: recs,
    modelAccuracy: 85.0, timestamp: new Date().toISOString()
  }
}

export const api = {
  /** Check backend health */
  async health() {
    return fetchJSON('/api/health')
  },

  /** Get model info */
  async modelInfo() {
    return fetchJSON('/api/model-info')
  },

  /** Predict attendance */
  async predict(payload) {
    try {
      return await fetchJSON('/api/predict', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch {
      // Fallback to local calculation
      console.warn('Backend unavailable — using local calculation')
      return localPredict(payload)
    }
  },

  /** Simulate attend/miss */
  async simulate(payload) {
    try {
      return await fetchJSON('/api/simulate', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch {
      // Local fallback
      const { totalClasses, attended, futureClasses, threshold = 75, action, count } = payload
      const total = parseInt(totalClasses), att = parseInt(attended), cnt = parseInt(count)
      const req = parseFloat(threshold)
      const newAtt = action === 'attend' ? att + cnt : att
      const newTotal = parseInt(totalClasses) + cnt
      const newPct = Math.round((newAtt / newTotal) * 100 * 100) / 100
      const oldPct = Math.round((att / total) * 100 * 100) / 100
      const getStatus = (p) => p >= req + 10 ? 'eligible' : p >= req ? 'warning' : 'not_eligible'
      return { simulatedAttendance: newPct, status: getStatus(newPct), change: Math.round((newPct - oldPct) * 100) / 100, action, count: cnt, newAttended: newAtt, newTotal }
    }
  },

  /** Export CSV */
  async exportCSV(data) {
    try {
      const res = await fetch(`${BASE_URL}/api/export-csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'attendance_report.csv'
        a.click()
        URL.revokeObjectURL(url)
        return true
      }
    } catch { /* fallback below */ }
    
    // Local CSV fallback
    const rows = [
      ['College Attendance Predictor Report'],
      ['Generated on', new Date().toLocaleString()],
      [],
      ['Student Name', data.studentName],
      [],
      ['Metric', 'Value'],
      ['Current Attendance', `${data.currentAttendance?.toFixed(2)}%`],
      ['Predicted Attendance', `${data.predictedAttendance?.toFixed(2)}%`],
      ['Status', data.status],
      ['Attended', data.attended],
      ['Total Classes', data.totalClasses],
      ['Classes Needed', data.classesNeeded],
      ['Max Missable', data.maxMissable],
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'attendance_report.csv'; a.click()
    URL.revokeObjectURL(url)
    return true
  }
}

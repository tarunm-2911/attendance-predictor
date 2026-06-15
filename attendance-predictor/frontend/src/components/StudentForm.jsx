/**
 * StudentForm – input form with validation
 */
import { useState } from 'react'

const DEFAULT = {
  studentName: '',
  totalClasses: '',
  attended: '',
  futureClasses: '',
  threshold: '75',
}

export default function StudentForm({ onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULT)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.studentName.trim()) e.studentName = 'Name is required'
    const total = parseInt(form.totalClasses)
    const att = parseInt(form.attended)
    const future = parseInt(form.futureClasses)
    const thresh = parseFloat(form.threshold)

    if (!form.totalClasses || isNaN(total) || total <= 0) e.totalClasses = 'Must be a positive number'
    if (!form.attended || isNaN(att) || att < 0) e.attended = 'Must be 0 or more'
    if (att > total) e.attended = 'Cannot exceed total classes'
    if (!form.futureClasses || isNaN(future) || future <= 0) e.futureClasses = 'Must be a positive number'
    if (!form.threshold || isNaN(thresh) || thresh < 1 || thresh > 100) e.threshold = 'Must be between 1–100'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  const fields = [
    { name: 'studentName',   label: 'Student Name',               type: 'text',   placeholder: 'e.g. Arjun Sharma', icon: '👤' },
    { name: 'totalClasses',  label: 'Total Classes Conducted',    type: 'number', placeholder: 'e.g. 120',          icon: '📅' },
    { name: 'attended',      label: 'Classes Attended',           type: 'number', placeholder: 'e.g. 95',           icon: '✅' },
    { name: 'futureClasses', label: 'Expected Future Classes',    type: 'number', placeholder: 'e.g. 30',           icon: '🔮' },
    { name: 'threshold',     label: 'Min Attendance Required (%)', type: 'number', placeholder: '75',               icon: '🎯' },
  ]

  // Live preview
  const total = parseInt(form.totalClasses) || 0
  const att = parseInt(form.attended) || 0
  const currentPct = total > 0 ? ((att / total) * 100).toFixed(1) : '—'

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-xl">🎓</div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Student Details</h2>
          <p className="text-slate-500 text-xs">Fill in your attendance information</p>
        </div>
        {total > 0 && (
          <div className="ml-auto text-right">
            <div className="text-xs text-slate-500">Current</div>
            <div className="text-lg font-bold text-blue-400">{currentPct}%</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.name} className={f.name === 'studentName' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {f.icon} {f.label}
              </label>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                min={f.type === 'number' ? '0' : undefined}
                className={`input-field ${errors[f.name] ? 'border-red-500/50' : ''}`}
              />
              {errors[f.name] && (
                <p className="text-red-400 text-xs mt-1">{errors[f.name]}</p>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>🔍 Predict Attendance</>
          )}
        </button>
      </form>
    </div>
  )
}

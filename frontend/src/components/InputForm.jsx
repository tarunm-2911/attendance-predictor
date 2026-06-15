import { useState } from "react";
import { motion } from "framer-motion";

const defaults = {
  studentName: "",
  totalClasses: "",
  classesAttended: "",
  expectedFutureClasses: "",
  minRequirement: "75",
};

export default function InputForm({ onSubmit, loading, onReset, hasResult }) {
  const [form, setForm] = useState(defaults);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.studentName.trim()) e.studentName = "Name is required.";
    if (!form.totalClasses || form.totalClasses <= 0) e.totalClasses = "Must be > 0.";
    if (form.classesAttended === "" || form.classesAttended < 0) e.classesAttended = "Cannot be negative.";
    if (+form.classesAttended > +form.totalClasses) e.classesAttended = "Cannot exceed total classes.";
    if (!form.expectedFutureClasses || form.expectedFutureClasses < 0) e.expectedFutureClasses = "Must be ≥ 0.";
    if (!form.minRequirement || form.minRequirement <= 0 || form.minRequirement > 100) e.minRequirement = "Must be 1–100.";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    onSubmit({
      studentName: form.studentName.trim(),
      totalClasses: +form.totalClasses,
      classesAttended: +form.classesAttended,
      expectedFutureClasses: +form.expectedFutureClasses,
      minRequirement: +form.minRequirement,
    });
  };

  const currentPct = form.totalClasses > 0
    ? ((+form.classesAttended / +form.totalClasses) * 100).toFixed(1) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong p-6 md:p-8"
    >
      <h2 className="text-xl font-display font-semibold text-white mb-1">Student Details</h2>
      <p className="text-sm text-slate-400 mb-6">Enter your attendance data to get predictions.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <Field label="Student Name" error={errors.studentName}>
          <input
            className="input-base"
            placeholder="e.g. Arjun Mehta"
            value={form.studentName}
            onChange={e => set("studentName", e.target.value)}
          />
        </Field>

        {/* Classes row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Total Classes Conducted" error={errors.totalClasses}>
            <input type="number" min="1" className="input-base"
              placeholder="120" value={form.totalClasses}
              onChange={e => set("totalClasses", e.target.value)} />
          </Field>
          <Field label="Classes Attended" error={errors.classesAttended}>
            <input type="number" min="0" className="input-base"
              placeholder="90" value={form.classesAttended}
              onChange={e => set("classesAttended", e.target.value)} />
          </Field>
        </div>

        {/* Live preview */}
        {currentPct !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <span className="text-slate-400 text-sm">Current attendance:</span>
            <span className="stat-num text-2xl text-primary">{currentPct}%</span>
            <div className="flex-1 progress-bar ml-2">
              <div className="progress-fill bg-primary" style={{ width: `${Math.min(+currentPct, 100)}%` }} />
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Expected Future Classes" error={errors.expectedFutureClasses}>
            <input type="number" min="0" className="input-base"
              placeholder="30" value={form.expectedFutureClasses}
              onChange={e => set("expectedFutureClasses", e.target.value)} />
          </Field>
          <Field label="Minimum Requirement (%)" error={errors.minRequirement}>
            <input type="number" min="1" max="100" className="input-base"
              value={form.minRequirement}
              onChange={e => set("minRequirement", e.target.value)} />
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200"
            style={{ background: loading ? "rgba(59,130,246,0.4)" : "linear-gradient(135deg,#3B82F6,#6366F1)",
              boxShadow: loading ? "none" : "0 4px 20px rgba(59,130,246,0.35)" }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Predicting…
              </span>
            ) : "Predict Attendance →"}
          </button>
          {hasResult && (
            <button type="button" onClick={onReset}
              className="px-5 py-3 rounded-xl text-slate-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Reset
            </button>
          )}
        </div>
      </form>

      <style>{`
        .input-base {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px;
          color: #E2E8F0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-base:focus { border-color: rgba(59,130,246,0.6); }
        .input-base::placeholder { color: #475569; }
      `}</style>
    </motion.div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

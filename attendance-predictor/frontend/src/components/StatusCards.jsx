import { motion } from "framer-motion";
import { statusLabel, statusColor, statusGlow } from "../utils/calculations";

function StatCard({ label, value, unit = "", sub, color, glow, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }} transition={{ delay }}
      className={`glass p-5 ${glow}`}>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-end gap-1">
        <span className="stat-num text-3xl" style={{ color }}>{value}</span>
        {unit && <span className="text-slate-400 text-sm mb-1">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function StatusCards({ result }) {
  const { currentAttendance, predictedAttendance, requirement,
    currentStatus, classesNeeded, canMiss, modelMeta } = result;

  const getStatusBg = (s) => ({
    eligible: "rgba(34,197,94,0.1)",
    warning: "rgba(245,158,11,0.1)",
    not_eligible: "rgba(239,68,68,0.1)",
  }[s] || "rgba(255,255,255,0.05)");

  return (
    <div className="space-y-4">
      {/* Eligibility badge */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-5 py-4 rounded-2xl"
        style={{ background: getStatusBg(currentStatus), border: `1px solid ${statusColor(currentStatus)}33` }}>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Exam Eligibility</p>
          <p className="font-display text-xl font-bold mt-0.5" style={{ color: statusColor(currentStatus) }}>
            {statusLabel(currentStatus)}
          </p>
        </div>
        <StatusIcon status={currentStatus} />
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Current Attendance" value={currentAttendance} unit="%" delay={0.05}
          color={statusColor(currentStatus)} glow={statusGlow(currentStatus)} />
        <StatCard label="Predicted Attendance" value={predictedAttendance} unit="%" delay={0.1}
          color="#3B82F6" glow="glow-blue"
          sub={`After ${result.summary?.futureClasses} future classes`} />
        <StatCard label="Classes Needed" value={classesNeeded} delay={0.15}
          color={classesNeeded === 0 ? "#22C55E" : "#F59E0B"} glow=""
          sub={classesNeeded === 0 ? "Already eligible!" : `to reach ${requirement}%`} />
        <StatCard label="Can Still Miss" value={canMiss} delay={0.2}
          color={canMiss > 0 ? "#22C55E" : "#EF4444"} glow=""
          sub="without falling below limit" />
      </div>

      {/* Model meta */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="glass px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-slate-400">ML Model · Linear Regression</span>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-slate-300">Accuracy: <span className="text-primary font-mono">{modelMeta?.accuracy}%</span></span>
          <span className="text-slate-300">R²: <span className="text-primary font-mono">{modelMeta?.r2}</span></span>
        </div>
      </motion.div>
    </div>
  );
}

function StatusIcon({ status }) {
  if (status === "eligible") return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
  if (status === "warning") return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}>
      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
}

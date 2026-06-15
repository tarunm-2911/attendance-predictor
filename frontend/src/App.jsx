import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { predictAttendance, exportCSV } from './utils/api.js';
import { exportPDF } from './utils/pdf.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

// ─── Circular Progress Ring ────────────────────────────────────────────────────
function ProgressRing({ value, max = 100, size = 140, stroke = 10, color = '#3B82F6', label, sublabel }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const offset = circ * (1 - pct);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} stroke="rgba(255,255,255,0.06)" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke}
          stroke={color} strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {label && <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk', color }}>{label}</span>}
        {sublabel && <span style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{sublabel}</span>}
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = '#3B82F6', glowClass = 'card-glow-blue' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-5 ${glowClass}`}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk', color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{sub}</div>}
    </motion.div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, label, large }) {
  const classes = { eligible: 'badge-eligible', warning: 'badge-warning', danger: 'badge-danger' };
  const icons = { eligible: '✓', warning: '⚡', danger: '✕' };
  return (
    <span className={classes[status] || 'badge-warning'} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: large ? '8px 18px' : '4px 12px',
      borderRadius: 50, fontWeight: 600,
      fontSize: large ? 15 : 12,
      fontFamily: 'Space Grotesk',
    }}>
      <span>{icons[status]}</span>
      {label}
    </span>
  );
}

// ─── Input Form ────────────────────────────────────────────────────────────────
function InputForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '', total_classes: '', attended_classes: '', future_classes: '', min_requirement: '75'
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Student name is required';
    if (!form.total_classes || +form.total_classes <= 0) e.total_classes = 'Must be > 0';
    if (!form.attended_classes || +form.attended_classes < 0) e.attended_classes = 'Must be ≥ 0';
    if (+form.attended_classes > +form.total_classes) e.attended_classes = 'Cannot exceed total classes';
    if (!form.future_classes || +form.future_classes <= 0) e.future_classes = 'Must be > 0';
    if (!form.min_requirement || +form.min_requirement < 0 || +form.min_requirement > 100) e.min_requirement = 'Between 0–100';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit({
      name: form.name.trim(),
      total_classes: +form.total_classes,
      attended_classes: +form.attended_classes,
      future_classes: +form.future_classes,
      min_requirement: +form.min_requirement,
    });
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="glass rounded-3xl p-8 card-glow-blue"
    >
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk', marginBottom: 6 }}>Student Details</h2>
        <p style={{ color: '#64748B', fontSize: 14 }}>Enter attendance data to get your prediction</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
        {/* Name */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>Student Name</label>
          <input className="input-field" type="text" placeholder="e.g. Alex Johnson" value={form.name} onChange={e => f('name', e.target.value)} />
          {errors.name && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 5 }}>⚠ {errors.name}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>Total Classes Conducted</label>
            <input className="input-field" type="number" min="1" placeholder="e.g. 80" value={form.total_classes} onChange={e => f('total_classes', e.target.value)} />
            {errors.total_classes && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 5 }}>⚠ {errors.total_classes}</p>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>Classes Attended</label>
            <input className="input-field" type="number" min="0" placeholder="e.g. 62" value={form.attended_classes} onChange={e => f('attended_classes', e.target.value)} />
            {errors.attended_classes && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 5 }}>⚠ {errors.attended_classes}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>Expected Future Classes</label>
            <input className="input-field" type="number" min="1" placeholder="e.g. 20" value={form.future_classes} onChange={e => f('future_classes', e.target.value)} />
            {errors.future_classes && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 5 }}>⚠ {errors.future_classes}</p>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>Min. Attendance %</label>
            <input className="input-field" type="number" min="0" max="100" placeholder="75" value={form.min_requirement} onChange={e => f('min_requirement', e.target.value)} />
            {errors.min_requirement && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 5 }}>⚠ {errors.min_requirement}</p>}
          </div>
        </div>

        {/* Quick fill examples */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ color: '#475569', fontSize: 12, alignSelf: 'center' }}>Try:</span>
          {[
            { label: 'Good standing', data: ['Alex Chen', '80', '64', '20', '75'] },
            { label: 'At risk', data: ['Sam Kumar', '60', '42', '15', '75'] },
            { label: 'Critical', data: ['Jordan Lee', '90', '58', '25', '80'] },
          ].map(ex => (
            <button key={ex.label} type="button" className="btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}
              onClick={() => setForm({ name: ex.data[0], total_classes: ex.data[1], attended_classes: ex.data[2], future_classes: ex.data[3], min_requirement: ex.data[4] })}>
              {ex.label}
            </button>
          ))}
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 }}>
          {loading ? <><span className="spinner"></span> Analyzing...</> : <><span>🔮</span> Predict My Attendance</>}
        </button>
      </form>
    </motion.div>
  );
}

// ─── Results Overview ──────────────────────────────────────────────────────────
function ResultsOverview({ result }) {
  const { student_name, calculation: c, prediction: p, input } = result;
  const statusColors = { eligible: '#22C55E', warning: '#F59E0B', danger: '#EF4444' };
  const color = statusColors[c.status] || '#94A3B8';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
      className="glass rounded-3xl p-8" style={{ borderTop: `3px solid ${color}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ color: '#64748B', fontSize: 13, marginBottom: 4 }}>Report for</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Grotesk' }}>{student_name}</h2>
        </div>
        <StatusBadge status={c.status} label={c.status_label} large />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', marginBottom: 28 }}>
        <ProgressRing value={c.current_pct} color={color} label={`${c.current_pct}%`} sublabel="Current" size={140} />
        <ProgressRing value={p.predicted_pct} color="#3B82F6" label={`${p.predicted_pct}%`} sublabel="Predicted" size={140} />
        <div style={{ flex: 1, minWidth: 200, display: 'grid', gap: 10 }}>
          <div className="glass rounded-xl p-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94A3B8', fontSize: 13 }}>Min. Requirement</span>
            <span style={{ fontWeight: 700, color: '#3B82F6' }}>{input.min_requirement}%</span>
          </div>
          <div className="glass rounded-xl p-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94A3B8', fontSize: 13 }}>Classes to Attend</span>
            <span style={{ fontWeight: 700, color: c.classes_needed > 0 ? '#F59E0B' : '#22C55E' }}>{c.classes_needed}</span>
          </div>
          <div className="glass rounded-xl p-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94A3B8', fontSize: 13 }}>Can Miss</span>
            <span style={{ fontWeight: 700, color: c.max_missable > 5 ? '#22C55E' : c.max_missable > 0 ? '#F59E0B' : '#EF4444' }}>{c.max_missable}</span>
          </div>
          <div className="glass rounded-xl p-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94A3B8', fontSize: 13 }}>ML Confidence</span>
            <span style={{ fontWeight: 700, color: '#A78BFA' }}>{p.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Mini stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { v: input.total_classes, l: 'Total Classes' },
          { v: input.attended_classes, l: 'Attended' },
          { v: c.missed_classes, l: 'Missed' },
          { v: input.future_classes, l: 'Upcoming' },
        ].map(({ v, l }) => (
          <div key={l} className="glass rounded-xl p-4" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#F1F5F9' }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Recommendations Panel ─────────────────────────────────────────────────────
function Recommendations({ recs }) {
  const colors = { success: '#22C55E', info: '#3B82F6', warning: '#F59E0B', danger: '#EF4444' };
  const bg = { success: 'rgba(34,197,94,0.07)', info: 'rgba(59,130,246,0.07)', warning: 'rgba(245,158,11,0.07)', danger: 'rgba(239,68,68,0.08)' };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="glass rounded-3xl p-6"
    >
      <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk', marginBottom: 18 }}>💡 Smart Recommendations</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        {recs.map((rec, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: bg[rec.type], border: `1px solid ${colors[rec.type]}33`, borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{rec.icon}</span>
            <span style={{ fontSize: 14, color: '#CBD5E1', lineHeight: 1.5 }}>{rec.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Analytics Charts ──────────────────────────────────────────────────────────
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94A3B8', font: { family: 'Inter', size: 12 } } },
    tooltip: { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1, titleColor: '#F1F5F9', bodyColor: '#94A3B8', padding: 12 },
  },
};

function AnalyticsCharts({ result }) {
  const { calculation: c, prediction: p, trend, input } = result;

  const trendChart = {
    labels: trend.months,
    datasets: [
      {
        label: 'Attendance %',
        data: trend.attendance,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: `Min. ${input.min_requirement}%`,
        data: Array(6).fill(input.min_requirement),
        borderColor: 'rgba(239,68,68,0.6)',
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      }
    ]
  };

  const barChart = {
    labels: ['Current', 'Predicted', 'Requirement'],
    datasets: [{
      label: 'Attendance %',
      data: [c.current_pct, p.predicted_pct, input.min_requirement],
      backgroundColor: ['rgba(59,130,246,0.7)', 'rgba(168,85,247,0.7)', 'rgba(239,68,68,0.5)'],
      borderColor: ['#3B82F6', '#A855F7', '#EF4444'],
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const donutChart = {
    labels: ['Attended', 'Missed'],
    datasets: [{
      data: [input.attended_classes, c.missed_classes],
      backgroundColor: ['rgba(34,197,94,0.8)', 'rgba(239,68,68,0.6)'],
      borderColor: ['#22C55E', '#EF4444'],
      borderWidth: 2,
      hoverOffset: 8,
    }]
  };

  const lineOpts = { ...chartDefaults, scales: { x: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255,255,255,0.03)' }, min: 0, max: 100 } } };
  const barOpts = { ...chartDefaults, scales: { x: { ticks: { color: '#64748B' }, grid: { display: false } }, y: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255,255,255,0.03)' }, min: 0, max: 100 } } };
  const donutOpts = { ...chartDefaults, cutout: '68%' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk', marginBottom: 18 }}>📊 Analytics Dashboard</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="glass rounded-2xl p-5" style={{ minHeight: 340 }}>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 14, fontWeight: 500 }}>Attendance Distribution</div>
            <div style={{ height: 260 }}><Doughnut data={donutChart} options={donutOpts} /></div>
          </div>
          <div className="glass rounded-2xl p-5" style={{ minHeight: 340 }}>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 14, fontWeight: 500 }}>Monthly Attendance Trend</div>
            <div style={{ height: 260 }}><Line data={trendChart} options={lineOpts} /></div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div className="glass rounded-2xl p-5" style={{ minHeight: 340 }}>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 14, fontWeight: 500 }}>Attendance Comparison</div>
            <div style={{ height: 260 }}><Bar data={barChart} options={barOpts} /></div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <ExportActions result={result} vertical={true} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Simulation Tool ───────────────────────────────────────────────────────────
function SimulationTool({ result }) {
  const [mode, setMode] = useState('attend');
  const [n, setN] = useState(5);
  const { simulation, input, calculation: c } = result;
  const data = mode === 'attend' ? simulation.attend : simulation.miss;
  const item = data.find(d => d.n === n) || data[data.length - 1];

  const statusColors = { eligible: '#22C55E', warning: '#F59E0B', danger: '#EF4444' };
  const color = statusColors[item?.status] || '#94A3B8';
  const diff = item ? (item.pct - c.current_pct).toFixed(1) : 0;
  const sign = diff >= 0 ? '+' : '';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="glass rounded-3xl p-6"
    >
      <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk', marginBottom: 6 }}>🎮 Attendance Simulator</h3>
      <p style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>See how attending or missing classes changes your attendance</p>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {['attend', 'miss'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: mode === m ? (m === 'attend' ? '#22C55E' : '#EF4444') : 'transparent',
            color: mode === m ? 'white' : '#64748B', fontWeight: 600, fontSize: 14,
            fontFamily: 'Space Grotesk', transition: 'all 0.2s',
          }}>
            {m === 'attend' ? '✅ Attend' : '❌ Miss'}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#94A3B8', fontSize: 13 }}>Number of classes: <strong style={{ color: '#F1F5F9' }}>{n}</strong></span>
          <span style={{ color: '#64748B', fontSize: 12 }}>max {data.length}</span>
        </div>
        <input type="range" min="1" max={data.length} value={n} onChange={e => setN(+e.target.value)}
          style={{ accentColor: mode === 'attend' ? '#22C55E' : '#EF4444' }}
        />
      </div>

      {/* Result card */}
      {item && (
        <motion.div key={`${mode}-${n}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: `${color}12`, border: `1px solid ${color}33`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
        >
          <div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>
              If you {mode} the next <strong style={{ color: '#F1F5F9' }}>{n}</strong> class{n !== 1 ? 'es' : ''}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk', color }}>
              {item.pct}%
            </div>
            <div style={{ fontSize: 13, color: diff >= 0 ? '#22C55E' : '#EF4444', marginTop: 4 }}>
              {sign}{diff}% {diff >= 0 ? '↑' : '↓'} from current
            </div>
          </div>
          <StatusBadge status={item.status} label={item.status === 'eligible' ? 'Eligible' : item.status === 'warning' ? 'Warning' : 'Not Eligible'} />
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Export Actions ────────────────────────────────────────────────────────────
function ExportActions({ result, vertical = false }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  const handlePDF = async () => {
    setPdfLoading(true);
    try { exportPDF(result); } catch (e) { alert('PDF export failed: ' + e.message); }
    setTimeout(() => setPdfLoading(false), 1000);
  };

  const handleCSV = async () => {
    setCsvLoading(true);
    try { await exportCSV(result); } catch (e) {
      const { calculation: c, prediction: p, input, student_name } = result;
      const rows = [
        ['Student', student_name], ['Current %', c.current_pct], ['Predicted %', p.predicted_pct],
        ['Total Classes', input.total_classes], ['Attended', input.attended_classes],
        ['Missed', c.missed_classes], ['Status', c.status_label],
        ['Classes Needed', c.classes_needed], ['Can Miss', c.max_missable],
        ['Confidence', p.confidence + '%'], ['Model R²', p.model_r2],
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const a = document.createElement('a');
      a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      a.download = `attendance_${student_name.replace(/\s/g, '_')}.csv`;
      a.click();
    }
    setTimeout(() => setCsvLoading(false), 1000);
  };

  const rowStyle = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' };
  const colStyle = { display: 'flex', gap: 12, flexDirection: 'column' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <div style={vertical ? colStyle : rowStyle}>
        <button onClick={handlePDF} disabled={pdfLoading} className="btn-secondary" style={vertical ? { width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '12px 20px', borderRadius: 12 } : { display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center', padding: '12px 20px', borderRadius: 12, minWidth: 160 }}>
          {pdfLoading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : '📄'}
          Download PDF Report
        </button>
        <button onClick={handleCSV} disabled={csvLoading} className="btn-secondary" style={vertical ? { width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '12px 20px', borderRadius: 12 } : { display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center', padding: '12px 20px', borderRadius: 12, minWidth: 160 }}>
          {csvLoading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : '📊'}
          Export CSV Analytics
        </button>
      </div>
    </motion.div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header style={{ padding: '24px 0 20px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
          }}>🎓</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}>
              Attend<span style={{ color: '#3B82F6' }}>IQ</span>
            </h1>
            <p style={{ fontSize: 12, color: '#475569', marginTop: 1 }}>ML-Powered Attendance Predictor</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 50, padding: '6px 14px' }}>
          <span className="pulse-dot" style={{ background: '#22C55E' }}></span>
          <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>Model Active</span>
        </div>
      </div>
    </header>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const resultsRef = useRef(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const data = await predictAttendance(formData);
      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setError(e.message || 'Prediction failed. Make sure the Flask backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-bg" style={{ minHeight: '100vh', padding: '0 16px 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Header />

        {/* Intro banner */}
        {!result && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 mb-8"
            style={{ display: 'flex', alignItems: 'center', gap: 16, borderLeft: '3px solid #3B82F6', background: 'rgba(59,130,246,0.05)' }}
          >
            <span style={{ fontSize: 28 }}>🔬</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, fontFamily: 'Space Grotesk' }}>Powered by Machine Learning</div>
              <div style={{ color: '#64748B', fontSize: 13, marginTop: 2 }}>Random Forest model trained on 1,000 attendance records · 98.6% accuracy · Real-time predictions</div>
            </div>
          </motion.div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, color: '#EF4444', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 18 }}>×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: result ? 'minmax(340px, 380px) 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 20 }}>
            <InputForm onSubmit={handleSubmit} loading={loading} />
            {result && <Recommendations recs={result.recommendations} />}
            {result && <SimulationTool result={result} />}
          </div>

          {result && (
            <motion.div ref={resultsRef} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
              style={{ display: 'grid', gap: 20 }}>
              <ResultsOverview result={result} />
              <AnalyticsCharts result={result} />
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 48, color: '#334155', fontSize: 12 }}>
          AttendIQ · Built with React, Flask, scikit-learn · Resume-worthy project
        </div>
      </div>
    </div>
  );
}

/**
 * AttendanceCharts – Chart.js visualizations
 */
import { Line, Bar, Doughnut } from 'react-chartjs-2'

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94A3B8', font: { size: 11 } } },
    tooltip: {
      backgroundColor: '#1E293B',
      titleColor: '#F1F5F9',
      bodyColor: '#94A3B8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748B', font: { size: 11 } },
      grid: { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: { color: '#64748B', font: { size: 11 } },
      grid: { color: 'rgba(255,255,255,0.04)' },
    },
  },
}

/** Monthly Trend Line Chart */
export function TrendChart({ trend, threshold }) {
  const labels = trend.map(t => t.month)
  const attendances = trend.map(t => t.attendance)
  const threshLine = trend.map(() => threshold)

  const data = {
    labels,
    datasets: [
      {
        label: 'Attendance %',
        data: attendances,
        borderColor: '#3B82F6',
        backgroundColor: (ctx) => {
          const grad = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200)
          grad.addColorStop(0, 'rgba(59,130,246,0.25)')
          grad.addColorStop(1, 'rgba(59,130,246,0)')
          return grad
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: trend.map(t =>
          t.type === 'current' ? '#3B82F6'
          : t.type === 'predicted' ? '#818CF8'
          : '#475569'
        ),
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
      {
        label: `Requirement (${threshold}%)`,
        data: threshLine,
        borderColor: '#F59E0B',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  }

  const options = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      legend: { ...chartDefaults.plugins.legend, position: 'top' },
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`,
        },
      },
    },
    scales: {
      ...chartDefaults.scales,
      y: { ...chartDefaults.scales.y, min: 40, max: 100, ticks: { ...chartDefaults.scales.y.ticks, callback: v => `${v}%` } },
    },
  }

  return (
    <div className="glass-card p-5">
      <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
        Monthly Attendance Trend
      </h4>
      <div style={{ height: 220 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

/** Comparison Bar Chart */
export function ComparisonChart({ current, predicted, threshold }) {
  const data = {
    labels: ['Current Attendance', 'Predicted Attendance', 'Requirement'],
    datasets: [
      {
        label: 'Attendance %',
        data: [current, predicted, threshold],
        backgroundColor: [
          current >= threshold ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)',
          predicted >= threshold ? 'rgba(99,102,241,0.7)' : 'rgba(239,68,68,0.7)',
          'rgba(245,158,11,0.7)',
        ],
        borderColor: [
          current >= threshold ? '#22C55E' : '#EF4444',
          predicted >= threshold ? '#6366F1' : '#EF4444',
          '#F59E0B',
        ],
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  }

  const options = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false },
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(1)}%` },
      },
    },
    scales: {
      ...chartDefaults.scales,
      y: { ...chartDefaults.scales.y, min: 0, max: 100, ticks: { ...chartDefaults.scales.y.ticks, callback: v => `${v}%` } },
    },
  }

  return (
    <div className="glass-card p-5">
      <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
        Attendance Comparison
      </h4>
      <div style={{ height: 220 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}

/** Donut chart of attended vs missed */
export function AttendanceDonut({ attended, missed }) {
  const data = {
    labels: ['Attended', 'Missed'],
    datasets: [{
      data: [attended, missed],
      backgroundColor: ['rgba(34,197,94,0.8)', 'rgba(239,68,68,0.8)'],
      borderColor: ['#22C55E', '#EF4444'],
      borderWidth: 1.5,
      hoverOffset: 8,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94A3B8', font: { size: 11 }, padding: 16 },
      },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#F1F5F9',
        bodyColor: '#94A3B8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed} classes`,
        },
      },
    },
  }

  return (
    <div className="glass-card p-5">
      <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400"></span>
        Attended vs Missed
      </h4>
      <div style={{ height: 220 }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  )
}

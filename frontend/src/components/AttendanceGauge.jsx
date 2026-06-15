/**
 * AttendanceGauge – animated circular gauge
 */
import { useEffect, useRef } from 'react'

export default function AttendanceGauge({ percentage, threshold = 75, label = 'Current', size = 160 }) {
  const canvasRef = useRef(null)

  const color = percentage >= threshold + 10
    ? '#22C55E'
    : percentage >= threshold
    ? '#F59E0B'
    : '#EF4444'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cx = size / 2, cy = size / 2
    const r = (size / 2) - 12
    const dpr = window.devicePixelRatio || 1

    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    let current = 0
    const target = percentage
    const duration = 800
    const start = performance.now()

    function draw(ts) {
      const elapsed = ts - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      current = target * ease

      ctx.clearRect(0, 0, size, size)

      // Track
      ctx.beginPath()
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI * 1.5)
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.stroke()

      // Threshold marker
      const threshAngle = -Math.PI / 2 + (threshold / 100) * Math.PI * 2
      const tx = cx + r * Math.cos(threshAngle)
      const ty = cy + r * Math.sin(threshAngle)
      ctx.beginPath()
      ctx.arc(tx, ty, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#F59E0B'
      ctx.fill()

      // Fill arc
      const endAngle = -Math.PI / 2 + (current / 100) * Math.PI * 2
      const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy)
      grad.addColorStop(0, color)
      grad.addColorStop(1, color + 'AA')
      ctx.beginPath()
      ctx.arc(cx, cy, r, -Math.PI / 2, endAngle)
      ctx.strokeStyle = grad
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.stroke()

      // Glow
      ctx.shadowBlur = 12
      ctx.shadowColor = color

      if (progress < 1) requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)
  }, [percentage, threshold, size, color])

  return (
    <div className="relative inline-flex items-center justify-center">
      <canvas ref={canvasRef} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold" style={{ color }}>{percentage.toFixed(1)}%</span>
        <span className="text-slate-500 text-xs mt-0.5">{label}</span>
      </div>
    </div>
  )
}

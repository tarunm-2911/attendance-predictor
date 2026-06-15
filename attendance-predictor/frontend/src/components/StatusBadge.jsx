/**
 * StatusBadge – color-coded eligibility badge
 */
export default function StatusBadge({ status, size = 'md' }) {
  const configs = {
    eligible: { label: '✓ Eligible for Exams', cls: 'status-eligible' },
    warning:  { label: '⚠ Warning Zone',       cls: 'status-warning' },
    not_eligible: { label: '✗ Not Eligible',   cls: 'status-not_eligible' },
  }
  const { label, cls } = configs[status] || configs.warning
  const sz = size === 'lg'
    ? 'px-5 py-2 text-sm font-bold rounded-xl'
    : 'px-3 py-1.5 text-xs font-semibold rounded-lg'

  return (
    <span className={`inline-flex items-center gap-1.5 ${sz} ${cls}`}>
      {label}
    </span>
  )
}

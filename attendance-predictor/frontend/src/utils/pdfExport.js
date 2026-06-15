/**
 * PDF Export Utility
 * Generates a styled PDF report for the student
 */

export async function downloadPDF(data) {
  // Dynamically import jsPDF to avoid bundle bloat
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageW, 45, 'F')

  doc.setTextColor(59, 130, 246)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('AttendIQ', 15, 20)

  doc.setTextColor(241, 245, 249)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('College Attendance Predictor Report', 15, 30)

  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 38)
  doc.text(`Student: ${data.studentName}`, pageW - 15, 38, { align: 'right' })

  // ── Status Badge ─────────────────────────────────────────────────────────
  const statusColors = {
    eligible: [34, 197, 94],
    warning: [245, 158, 11],
    not_eligible: [239, 68, 68],
  }
  const statusLabels = {
    eligible: 'ELIGIBLE FOR EXAMS',
    warning: 'WARNING ZONE',
    not_eligible: 'NOT ELIGIBLE',
  }
  const [sr, sg, sb] = statusColors[data.status] || [148, 163, 184]
  doc.setFillColor(sr, sg, sb)
  doc.roundedRect(15, 52, 80, 10, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(statusLabels[data.status] || data.status.toUpperCase(), 55, 58.5, { align: 'center' })

  // ── Key Metrics ──────────────────────────────────────────────────────────
  doc.setTextColor(30, 41, 59)
  autoTable(doc, {
    startY: 68,
    head: [['Metric', 'Value', 'Metric', 'Value']],
    body: [
      ['Current Attendance', `${data.currentAttendance?.toFixed(2)}%`,
       'Predicted Attendance', `${data.predictedAttendance?.toFixed(2)}%`],
      ['Classes Attended', data.attended,
       'Total Classes', data.totalClasses],
      ['Classes Missed', data.missed,
       'Future Classes', data.futureClasses],
      ['Classes Needed', data.classesNeeded,
       'Max Missable', data.maxMissable],
      ['Min Requirement', `${data.threshold}%`,
       'Model Accuracy', `${data.modelAccuracy?.toFixed(1)}%`],
    ],
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    styles: { cellPadding: 3, font: 'helvetica' },
    theme: 'grid',
  })

  // ── Recommendations ──────────────────────────────────────────────────────
  const recs = data.recommendations || []
  if (recs.length > 0) {
    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('Smart Recommendations', 15, finalY)

    autoTable(doc, {
      startY: finalY + 5,
      head: [['#', 'Recommendation']],
      body: recs.map((r, i) => [i + 1, r.text]),
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 10 } },
      theme: 'striped',
    })
  }

  // ── Monthly Trend ────────────────────────────────────────────────────────
  const trend = data.monthlyTrend || []
  if (trend.length > 0) {
    const finalY2 = doc.lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('Monthly Attendance Trend', 15, finalY2)

    autoTable(doc, {
      startY: finalY2 + 5,
      head: [['Month', 'Attendance %', 'Type']],
      body: trend.map(t => [t.month, `${t.attendance}%`, t.type.charAt(0).toUpperCase() + t.type.slice(1)]),
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 3 },
      theme: 'striped',
    })
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text('AttendIQ — College Attendance Predictor', 15, 290)
    doc.text(`Page ${i} of ${pageCount}`, pageW - 15, 290, { align: 'right' })
  }

  doc.save(`attendance_report_${data.studentName?.replace(/\s+/g, '_') || 'student'}.pdf`)
}

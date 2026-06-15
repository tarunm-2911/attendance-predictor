/**
 * Pure calculation utilities – mirrors backend logic for instant UI feedback.
 */

export function calcCurrentPct(attended, total) {
  if (!total) return 0;
  return parseFloat(((attended / total) * 100).toFixed(2));
}

export function calcStatus(pct, requirement) {
  if (pct >= requirement) {
    if (pct - requirement < 5) return "warning";
    return "eligible";
  }
  return "not_eligible";
}

export function statusLabel(status) {
  return { eligible: "Eligible", warning: "Warning Zone", not_eligible: "Not Eligible" }[status] || status;
}

export function statusColor(status) {
  return { eligible: "#22C55E", warning: "#F59E0B", not_eligible: "#EF4444" }[status] || "#6B7280";
}

export function statusGlow(status) {
  return { eligible: "glow-green", warning: "glow-yellow", not_eligible: "glow-red" }[status] || "";
}

export function simulateAttend(attended, total, extra) {
  return parseFloat(((attended + extra) / (total + extra) * 100).toFixed(2));
}

export function simulateMiss(attended, total, miss) {
  return parseFloat((attended / (total + miss) * 100).toFixed(2));
}

export function exportCSV(data) {
  const rows = [
    ["Field", "Value"],
    ["Student Name", data.studentName],
    ["Total Classes", data.summary?.totalClasses],
    ["Classes Attended", data.summary?.classesAttended],
    ["Current Attendance %", data.currentAttendance],
    ["Predicted Attendance %", data.predictedAttendance],
    ["Minimum Requirement %", data.requirement],
    ["Status", data.currentStatus],
    ["Classes Needed", data.classesNeeded],
    ["Can Miss", data.canMiss],
    ["Model Accuracy %", data.modelMeta?.accuracy],
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `${data.studentName}_attendance_report.csv`; a.click();
  URL.revokeObjectURL(url);
}

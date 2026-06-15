// API utility – points to Flask backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function predictAttendance(formData) {
  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Prediction failed');
  }
  return res.json();
}

export async function getModelInfo() {
  const res = await fetch(`${BASE_URL}/api/model-info`);
  return res.json();
}

export async function exportCSV(result) {
  const res = await fetch(`${BASE_URL}/api/export/csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result }),
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_report_${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

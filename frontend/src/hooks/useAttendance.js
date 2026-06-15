import { useState, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useAttendance() {
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const predict = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(API + "/api/predict", formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Server unreachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setResult(null); setError(null); }, []);
  return { result, loading, error, predict, reset };
}

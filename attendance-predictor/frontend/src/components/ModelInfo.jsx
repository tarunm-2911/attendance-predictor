/**
 * ModelInfo – displays ML model accuracy and metadata
 */
export default function ModelInfo({ accuracy, confidence, modelType = 'Linear Regression' }) {
  return (
    <div className="glass-card p-4 flex flex-wrap gap-4 items-center text-xs">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
        <span className="text-slate-500">ML Model:</span>
        <span className="text-slate-300 font-medium">{modelType}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-500">Accuracy:</span>
        <span className="text-green-400 font-semibold font-mono">{accuracy?.toFixed(1)}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-500">Prediction Confidence:</span>
        <span className="text-blue-400 font-semibold font-mono">{confidence?.toFixed(1)}%</span>
      </div>
      <div className="ml-auto flex items-center gap-1.5 text-slate-600">
        <span>🤖</span>
        <span>Scikit-learn · Python</span>
      </div>
    </div>
  )
}

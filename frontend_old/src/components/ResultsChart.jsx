function ResultsChart({ summary }) {
  if (!summary || summary.total === 0) {
    return null
  }

  const total = summary.total || 1
  const positivePct = Math.round((summary.positive / total) * 100) || 0
  const neutralPct = Math.round((summary.neutral / total) * 100) || 0
  const negativePct = Math.round((summary.negative / total) * 100) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-6 text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-gray-400">Positive</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-gray-400">Negative</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <span className="text-gray-400">Neutral</span>
        </div>
      </div>

      <div className="space-y-4">
        <SentimentBar label="Positive" color="bg-green-500" percent={positivePct} />
        <SentimentBar label="Negative" color="bg-red-500" percent={negativePct} />
        <SentimentBar label="Neutral" color="bg-gray-400" percent={neutralPct} />
      </div>
    </div>
  )
}

function SentimentBar({ label, color, percent }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-end">
        <div className="h-1.5 flex-1 bg-gray-50 rounded-full overflow-hidden mr-4">
          <div 
            className={`h-full ${color} transition-all duration-1000 ease-out`} 
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-right">{percent}%</span>
      </div>
    </div>
  )
}

export default ResultsChart

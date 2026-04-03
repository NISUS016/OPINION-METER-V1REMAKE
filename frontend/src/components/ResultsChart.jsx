import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

const COLORS = {
  positive: "#22c55e",
  neutral: "#f59e0b",
  negative: "#ef4444",
}

function ResultsChart({ summary }) {
  const data = [
    { name: "Positive", value: summary.positive, color: COLORS.positive },
    { name: "Neutral", value: summary.neutral, color: COLORS.neutral },
    { name: "Negative", value: summary.negative, color: COLORS.negative },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6 text-center text-gray-500">
        No sentiment data to display
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-semibold mb-2 text-center">Sentiment Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ResultsChart

const badgeColors = {
  positive: "bg-green-100 text-green-800",
  neutral: "bg-amber-100 text-amber-800",
  negative: "bg-red-100 text-red-800",
}

function ReviewCard({ text, product_name, label, confidence }) {
  const truncated = text.length > 200 ? text.slice(0, 200) + "..." : text

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">
          {product_name}
        </h4>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badgeColors[label]}`}
        >
          {label} ({(confidence * 100).toFixed(0)}%)
        </span>
      </div>
      <p className="text-gray-600 text-sm">{truncated}</p>
    </div>
  )
}

export default ReviewCard

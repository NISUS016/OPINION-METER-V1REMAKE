const names = [
  "Darrell Steward", "Theresa Webb", "Annette Black", "Guy Hawkins", 
  "Leslie Alexander", "Eleanor Pena", "Cody Fisher", "Bessie Cooper"
]

const channels = ["Google", "Website", "App", "Uber Eats", "Facebook", "Physical"]

const sentimentIcons = {
  positive: "😊",
  neutral: "😐",
  negative: "😞",
}

const sentimentColors = {
  positive: "text-green-600",
  neutral: "text-amber-600",
  negative: "text-red-600",
}

function ReviewCard({ text = "", product_name = "", label = "neutral", confidence = 0, rate = 5 }) {
  // Ultra-safe data derivation
  const safeText = text || ""
  const safeProductName = product_name || ""
  const textLen = safeText.length
  
  const name = names[textLen % names.length] || names[0]
  const channel = channels[safeProductName.length % channels.length] || channels[0]
  const rating = Number(rate) || 5
  
  // Safe date generation
  const day = (textLen % 28) + 1
  const dateStr = `Aug ${day < 10 ? '0' + day : day}, 2025`

  const truncated = safeText.length > 100 ? safeText.slice(0, 100) + "..." : safeText

  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="px-6 py-4">
        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-white shadow-sm">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`} 
              alt="" 
              onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=User" }}
            />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800 leading-tight">{name}</div>
            <div className="text-[10px] text-gray-400 font-bold tabular-nums">+44 141 {(textLen * 1234) % 10000000}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex text-[10px] space-x-0.5">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? "text-amber-400" : "text-gray-200"}>★</span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-[11px] text-gray-700 font-bold whitespace-nowrap">{dateStr}</div>
        <div className="text-[10px] text-gray-400 font-medium">08:34pm</div>
      </td>
      <td className="px-6 py-4 max-w-xs">
        <div className="text-xs text-gray-600 font-medium line-clamp-2 italic leading-relaxed">
          "{truncated || "No review content provided."}"
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-tight">{channel}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gray-50/50 font-black text-[9px] uppercase tracking-widest ${sentimentColors[label] || "text-gray-400"}`}>
          <span className="text-xs">{sentimentIcons[label] || "❓"}</span>
          <span>{label}</span>
        </div>
      </td>
    </tr>
  )
}

export default ReviewCard

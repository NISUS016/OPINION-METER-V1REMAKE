import { useState } from "react"
import SearchBar from "./components/SearchBar"
import ResultsChart from "./components/ResultsChart"
import ReviewCard from "./components/ReviewCard"

const API_URL = "/api"

function App() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState("")

  const handleSearch = async (searchQuery) => {
    if (!searchQuery) return
    setQuery(searchQuery)
    setLoading(true)
    setError("")
    setResults([])
    setSummary(null)

    try {
      // Step 1: Search
      const searchRes = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(searchQuery)}&limit=50`
      )
      if (!searchRes.ok) throw new Error(`Search failed: ${searchRes.status}`)
      const searchData = await searchRes.json()

      if (!searchData?.reviews || searchData.reviews.length === 0) {
        setError("No reviews found for this product.")
        setLoading(false)
        return
      }

      // Step 2: Analyze
      const reviewTexts = searchData.reviews.map((r) => r.text || "")
      const analyzeRes = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: reviewTexts }),
      })
      
      if (!analyzeRes.ok) throw new Error("Sentiment analysis failed.")
      const analyzeData = await analyzeRes.json()

      // Step 3: Combine with deep safety
      const combinedResults = (searchData.reviews || []).map((review, i) => ({
        ...review,
        label: analyzeData?.results?.[i]?.label || "neutral",
        confidence: analyzeData?.results?.[i]?.confidence || 0,
      }))

      setResults(combinedResults)
      setSummary(analyzeData?.summary || { positive: 0, neutral: 0, negative: 0, total: combinedResults.length })
    } catch (err) {
      console.error("Search error:", err)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-[#F8F9FD] text-gray-900 font-sans flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Simplified Search Top Bar */}
        <div className="bg-white border-b border-gray-100 py-4 px-8 shrink-0 z-10 flex justify-center">
          <div className="max-w-2xl w-full">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-medium animate-in slide-in-from-top-2">
              ⚠️ {error}
            </div>
          )}

          {/* Stats & Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatCard 
              title="Total Reviews" 
              value={summary?.total ? summary.total.toLocaleString() : "0"} 
              trend="+45%" 
            />
            <StatCard 
              title="Average Rating" 
              value={summary ? "4.5" : "0.0"} 
              trend="+12%" 
              color="bg-green-600"
            />
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sentiment Analysis</span>
                <span className="text-gray-300 cursor-help">ⓘ</span>
              </div>
              <ResultsChart summary={summary} />
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-5 w-12"><input type="checkbox" className="rounded-md border-gray-200 text-blue-600" /></th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5">Rating</th>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Review</th>
                    <th className="px-6 py-5">Channel</th>
                    <th className="px-6 py-5 text-center">Sentiment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {results.length > 0 ? (
                    results.map((review, i) => (
                      <ReviewCard
                        key={`review-${i}-${review.text?.slice(0, 10)}`}
                        text={review.text}
                        product_name={review.product_name}
                        label={review.label}
                        confidence={review.confidence}
                        rate={review.rate}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-24 text-center">
                        {loading ? (
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-bold text-gray-400">Analyzing data...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center opacity-30">
                            <span className="text-4xl mb-4">🔍</span>
                            <span className="text-sm font-bold">Search for a product above</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Floating Trendy Badge */}
        <div className="absolute top-24 right-8 pointer-events-none z-20">
          <div className="bg-fuchsia-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-xl shadow-fuchsia-200 flex items-center space-x-2 animate-bounce uppercase tracking-tighter">
            <span>New Trendy Design</span>
            <span className="text-xs">✨</span>
          </div>
        </div>
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active = false }) {
  return (
    <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"}`}>
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-bold">{label}</span>
    </div>
  )
}

function StatCard({ title, value, trend, color = "bg-blue-600" }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
          <span className="text-gray-300">ⓘ</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-3xl font-black text-gray-800">{value}</div>
          <div className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black rounded-full">
            ↗ {trend}
          </div>
        </div>
      </div>
      <div className="mt-6 h-1.5 bg-gray-50 rounded-full overflow-hidden">
        <div className={`h-full ${color} w-3/4 opacity-80`}></div>
      </div>
    </div>
  )
}

export default App

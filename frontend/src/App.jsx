import { useState } from "react"
import SearchBar from "./components/SearchBar"
import ResultsChart from "./components/ResultsChart"
import ReviewCard from "./components/ReviewCard"

const API_URL = ""

function App() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState("")

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery)
    setLoading(true)
    setError("")
    setResults([])
    setSummary(null)

    try {
      const searchRes = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(searchQuery)}&limit=50`
      )
      const searchData = await searchRes.json()

      if (searchData.reviews.length === 0) {
        setError("No reviews found for this product.")
        setLoading(false)
        return
      }

      const reviewTexts = searchData.reviews.map((r) => r.text)

      const analyzeRes = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: reviewTexts }),
      })
      const analyzeData = await analyzeRes.json()

      const combinedResults = searchData.reviews.map((review, i) => ({
        ...review,
        label: analyzeData.results[i].label,
        confidence: analyzeData.results[i].confidence,
      }))

      setResults(combinedResults)
      setSummary(analyzeData.summary)
    } catch (err) {
      setError("Failed to fetch results. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  const dominantSentiment = summary
    ? Object.entries(summary)
        .filter(([k]) => k !== "total")
        .reduce((a, b) => (b[1] > a[1] ? b : a))[0]
    : null

  const dominantColors = {
    positive: "text-green-600",
    neutral: "text-amber-600",
    negative: "text-red-600",
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">OpinionMeter</h1>
      <div className="max-w-xl mx-auto">
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-center">{error}</div>
      )}

      {summary && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Results for: <span className="text-blue-600">{query}</span>
          </h2>

          {dominantSentiment && (
            <p className={`text-center mb-4 font-medium ${dominantColors[dominantSentiment]}`}>
              Overall sentiment: {dominantSentiment} ({summary[dominantSentiment]} of{" "}
              {summary.total} reviews)
            </p>
          )}

          <ResultsChart summary={summary} />

          <div className="space-y-3">
            {results.map((review, i) => (
              <ReviewCard
                key={i}
                text={review.text}
                product_name={review.product_name}
                label={review.label}
                confidence={review.confidence}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App

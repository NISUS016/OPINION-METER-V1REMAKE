import { useState, useEffect, useRef, useCallback } from "react"

const API_URL = "/api"

function highlightMatch(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-blue-600">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  )
}

function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  const fetchSuggestions = useCallback(async (value) => {
    if (value.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    try {
      const res = await fetch(
        `${API_URL}/suggest?q=${encodeURIComponent(value)}&limit=10`
      )
      const data = await res.json()
      setSuggestions(data.suggestions || [])
      setShowDropdown(true)
      setActiveIndex(-1)
    } catch {
      setSuggestions([])
      setShowDropdown(false)
    }
  }, [])

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300)
  }

  const handleSelect = (name) => {
    setQuery(name)
    setShowDropdown(false)
    setSuggestions([])
    onSearch(name)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowDropdown(false)
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSubmit(e)
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIndex >= 0) {
        handleSelect(suggestions[activeIndex])
      } else {
        handleSubmit(e)
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Search products..."
          className="w-full bg-gray-50 border border-gray-100 px-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {loading ? (
             <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
             </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((name, i) => (
            <button
              key={i}
              type="button"
              className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${
                i === activeIndex ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-600"
              }`}
              onMouseDown={() => handleSelect(name)}
            >
              <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="truncate">{highlightMatch(name, query)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar

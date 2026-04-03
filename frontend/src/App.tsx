import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowUpRight, History, CheckCircle2, BrainCircuit, MessageSquare, AlertCircle, X, Star } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from './lib/utils';

// --- Types ---
interface Review {
  product_name: string;
  text: string;
  sentiment: string;
  rate?: string | number;
  label?: string;
  confidence?: number;
}

interface AnalysisSummary {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

interface ProductCard {
  name: string;
  category: string;
  reviewCount: number;
}

// --- API Config ---
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}` : '';

// --- Helpers ---
function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-primary">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem('opinion-meter-history') || '[]');
  } catch {
    return [];
  }
}

function addToHistory(query: string) {
  try {
    const history = getSearchHistory();
    const filtered = history.filter((h) => h.toLowerCase() !== query.toLowerCase());
    filtered.unshift(query);
    localStorage.setItem('opinion-meter-history', JSON.stringify(filtered.slice(0, 8)));
  } catch {
    // ignore
  }
}

function renderStars(rate: string | number | undefined) {
  const num = Number(rate);
  if (isNaN(num) || num < 1 || num > 5) return null;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={cn(
            i < Math.round(num) ? 'fill-amber-400 text-amber-400' : 'text-surface-container-highest'
          )}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-on-surface-variant">{num}</span>
    </span>
  );
}

// --- Shared Components ---

const Navbar = ({ onHome }: { onHome: () => void }) => (
  <header className="sticky top-0 z-50 glass shadow-ambient px-8 py-4">
    <nav className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-12">
        <button onClick={onHome} className="text-xl font-headline font-extrabold tracking-tight hover:opacity-80 transition-opacity">Opinion-Meter</button>
      </div>
    </nav>
  </header>
);

const Footer = () => (
  <footer className="bg-surface-container-low py-16 px-8 mt-24">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <span className="text-lg font-headline font-bold">Opinion-Meter Intelligence</span>
        <p className="mt-4 text-sm text-on-surface-variant max-w-sm leading-relaxed">
          Elevating raw sentiment data into actionable product insights. Powered by NLTK and Logistic Regression.
        </p>
        <p className="mt-8 text-xs text-on-surface-variant/60">
          © 2026 Opinion-Meter. All rights reserved.
        </p>
      </div>
      <div className="flex flex-wrap gap-x-12 gap-y-4 md:justify-end">
        {['Privacy Policy', 'Terms of Service', 'API Documentation', 'Support'].map((link) => (
          <a key={link} href="#" className="text-sm text-on-surface-variant hover:text-primary underline transition-colors underline-offset-4">
            {link}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

// --- Views ---

const LandingView = ({
  onSearch,
  error,
  featured,
  history,
}: {
  onSearch: (query: string) => void;
  error: string;
  featured: ProductCard[];
  history: string[];
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async (value: string) => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/suggest?q=${encodeURIComponent(value)}&limit=10`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowDropdown(true);
      setActiveIndex(-1);
    } catch (err) {
      console.error('Suggestion error:', err);
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSelect = (name: string) => {
    setQuery(name);
    setShowDropdown(false);
    setSuggestions([]);
    onSearch(name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter') handleSubmit(e);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleSelect(suggestions[activeIndex]);
      } else {
        handleSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-8 py-20"
    >
      <div className="text-center mb-16">
        <h1 className="text-6xl font-headline font-extrabold tracking-tight mb-6">Sentiment Intelligence.</h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
          Analyze real-time Flipkart customer feedback with high-fidelity ML precision.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-24 relative" ref={dropdownRef}>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="text-on-surface-variant group-focus-within:text-primary transition-colors" size={24} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search for a product (e.g. phone, cooler, shirt)..."
              className="w-full pl-16 pr-12 py-6 bg-surface-container-lowest rounded-xl shadow-ambient text-xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setShowDropdown(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-container-highest hover:text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </form>

        <AnimatePresence>
          {showDropdown && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-2xl z-50 overflow-hidden border border-surface-container-high"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => handleSelect(s)}
                  className={cn(
                    'w-full text-left px-6 py-4 text-sm font-bold transition-colors border-b border-surface-container-high last:border-0',
                    i === activeIndex ? 'bg-primary/5 text-primary' : 'hover:bg-surface-container-low'
                  )}
                >
                  {highlightMatch(s, query)}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {featured.length > 0 && (
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-headline font-bold mb-8">Top Products by Review Volume</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featured.map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSearch(item.name)}
                  className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient group cursor-pointer hover:translate-y-[-4px] transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold tracking-widest rounded-full">{item.category}</span>
                    <ArrowUpRight size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-3">{item.name}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
                    {item.reviewCount} reviews in dataset
                  </p>
                  <div className="text-sm font-bold">Click to analyze sentiment</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className={cn('lg:col-span-4 space-y-8', featured.length === 0 && 'lg:col-span-12 max-w-md mx-auto')}>
            <div className="bg-surface-container-low p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <History size={20} className="text-on-surface-variant" />
                <h3 className="font-headline font-bold">Recent Searches</h3>
              </div>
              <div className="space-y-4">
                {history.map((search, i) => (
                  <button
                    key={`${search}-${i}`}
                    onClick={() => onSearch(search)}
                    className="w-full flex items-center gap-3 text-sm text-on-surface-variant hover:text-primary transition-colors text-left"
                  >
                    <Search size={14} />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const LoadingView = ({ count }: { count: number }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center px-8"
    >
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full -rotate-90">
              <circle cx="128" cy="128" r="110" className="stroke-surface-container-high fill-none" strokeWidth="2" />
              <motion.circle
                cx="128" cy="128" r="110" className="stroke-primary fill-none" strokeWidth="6" strokeLinecap="round" strokeDasharray="691"
                animate={{ strokeDashoffset: 691 - (691 * progress) / 100 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-headline font-extrabold">{count}+</span>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Data Points</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <h1 className="text-4xl font-headline font-extrabold mb-4">Neural Synthesis in Progress...</h1>
          <p className="text-on-surface-variant mb-12 max-w-md">
            Processing {count} raw reviews through our ML pipeline to classify sentiment nuance.
          </p>

          <div className="space-y-4">
            {[
              { icon: BrainCircuit, label: 'Running preprocessing...', status: progress < 40 ? `${progress}%` : 'Complete', active: progress < 40 },
              { icon: MessageSquare, label: 'TF-IDF Vectorization...', status: progress < 80 ? 'In progress' : 'Complete', active: progress >= 40 && progress < 80 },
              { icon: CheckCircle2, label: 'Predicting class probabilities...', status: progress < 90 ? 'Pending' : 'Finalizing', active: progress >= 80 }
            ].map((step, i) => (
              <div key={i} className={cn("flex items-center gap-4 p-5 rounded-xl transition-all", step.active ? "bg-surface-container-lowest shadow-ambient" : "bg-surface-container-low opacity-60")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", step.active ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant")}>
                  <step.icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{step.label}</div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{step.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DashboardView = ({ query, results, summary }: { query: string, results: Review[], summary: AnalysisSummary }) => {
  const safeTotal = summary.total || 1;
  const chartData = [
    { name: 'POS', value: Math.round((summary.positive / safeTotal) * 100) },
    { name: 'NEU', value: Math.round((summary.neutral / safeTotal) * 100) },
    { name: 'NEG', value: Math.round((summary.negative / safeTotal) * 100) }
  ];

  const dominant = Object.entries(summary)
    .filter(([k]) => k !== 'total')
    .reduce((a, b) => b[1] > a[1] ? b : a)[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-8 py-12 space-y-12">
      {/* Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Reviews</div>
          <div className="text-3xl font-headline font-extrabold">{summary.total.toLocaleString()}</div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Positive</div>
          <div className="text-3xl font-headline font-extrabold text-sentiment-positive">{summary.positive.toLocaleString()}</div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Neutral</div>
          <div className="text-3xl font-headline font-extrabold text-sentiment-neutral">{summary.neutral.toLocaleString()}</div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Negative</div>
          <div className="text-3xl font-headline font-extrabold text-sentiment-negative">{summary.negative.toLocaleString()}</div>
        </div>
      </section>

      {/* Verdict + Composition */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-10 relative overflow-hidden border-t-2 border-primary shadow-ambient flex flex-col justify-between min-h-[320px]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Results for: {query}</span>
            <h1 className="text-5xl font-headline font-extrabold mt-4 mb-4">The Verdict</h1>
            <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
              Based on {summary.total} verified Flipkart reviews, our model identifies a high-confidence <span className="font-bold text-primary">{dominant}</span> sentiment profile.
            </p>
          </div>
          <div className="mt-12 flex items-center gap-6">
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white",
              dominant === 'positive' ? 'bg-sentiment-positive' : dominant === 'neutral' ? 'bg-sentiment-neutral' : 'bg-sentiment-negative')}>
              <CheckCircle2 size={32} />
            </div>
            <div>
              <div className="font-headline font-extrabold text-2xl uppercase">{dominant} SENTIMENT</div>
              <div className="text-on-surface-variant font-medium">Model Confidence: {(summary[dominant as keyof AnalysisSummary] / safeTotal * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-8 flex flex-col justify-between shadow-ambient">
          <h3 className="font-headline text-xl font-bold mb-8">Composition</h3>
          <div className="space-y-8">
            {[
              { label: 'Positive', val: Math.round((summary.positive / safeTotal) * 100), color: 'bg-sentiment-positive' },
              { label: 'Neutral', val: Math.round((summary.neutral / safeTotal) * 100), color: 'bg-sentiment-neutral' },
              { label: 'Negative', val: Math.round((summary.negative / safeTotal) * 100), color: 'bg-sentiment-negative' }
            ].map((item) => (
              <div key={item.label} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-on-surface-variant">{item.label}</span>
                  <span className="text-2xl font-headline font-extrabold">{item.val}%</span>
                </div>
                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.val}%` }} className={cn("h-full", item.color)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pie Chart */}
      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-headline text-2xl font-bold">Sentiment Breakdown</h2>
        </div>
        <div className="h-[250px] w-full max-w-sm mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) => `${name} ${value}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'POS' ? '#10b981' : entry.name === 'NEG' ? '#ef4444' : '#6b7280'} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Review Cards */}
      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold text-center">Individual Reviews</h2>
        <div className="space-y-3">
          {results.map((review, i) => (
            <div key={i} className="bg-surface-container-lowest p-5 rounded-xl shadow-ambient flex flex-col sm:flex-row gap-4 relative overflow-hidden">
              <div className={cn("absolute left-0 top-0 bottom-0 w-1",
                review.label === 'positive' ? "bg-sentiment-positive" : review.label === 'neutral' ? "bg-sentiment-neutral" : "bg-sentiment-negative")} />
              <div className="flex-1">
                <p className="text-sm font-medium text-on-surface">"{review.text}"</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-on-surface-variant">
                  {renderStars(review.rate) || <span>Rating: {review.rate || 'N/A'}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 sm:pl-4 border-l border-surface-container-high">
                <div className="text-right">
                  <div className={cn("text-sm font-bold uppercase",
                    review.label === 'positive' ? "text-sentiment-positive" : review.label === 'neutral' ? "text-sentiment-neutral" : "text-sentiment-negative")}>
                    {review.label}
                  </div>
                  {review.confidence != null && (
                    <div className="text-xs text-on-surface-variant">{(review.confidence * 100).toFixed(0)}%</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'loading' | 'dashboard'>('landing');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Review[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [error, setError] = useState('');
  const [foundCount, setFoundCount] = useState(0);
  const [featured, setFeatured] = useState<ProductCard[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load featured products and search history on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory());
    // Fetch top products by review count from the dataset
    fetch(`${API_BASE}/api/suggest?q=a&limit=10`)
      .then((res) => res.ok ? res.json() : { suggestions: [] })
      .then((data) => {
        const suggestions = data.suggestions || [];
        // Pick a diverse set of real product names from suggestions
        const picks: ProductCard[] = suggestions.slice(0, 4).map((name: string) => ({
          name,
          category: name.toLowerCase().includes('phone') || name.toLowerCase().includes('mobile') ? 'MOBILE'
            : name.toLowerCase().includes('shirt') || name.toLowerCase().includes('t-shirt') ? 'CLOTHING'
            : name.toLowerCase().includes('cooler') || name.toLowerCase().includes('fan') ? 'APPLIANCES'
            : 'GENERAL',
          reviewCount: 0,
        }));
        setFeatured(picks);
      })
      .catch(() => setFeatured([]));
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery) return;
    setQuery(searchQuery);
    setError('');

    try {
      // 1. Search
      const searchRes = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      if (!searchRes.ok) throw new Error(`Search failed with status ${searchRes.status}`);
      const searchData = await searchRes.json();

      if (!searchData.reviews || searchData.reviews.length === 0) {
        setError("No reviews found for this product.");
        return;
      }

      setFoundCount(searchData.reviews.length);
      addToHistory(searchQuery);
      setSearchHistory(getSearchHistory());
      setView('loading');

      // 2. Analyze
      const reviewTexts = searchData.reviews.map((r: any) => r.text || '');
      const analyzeRes = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: reviewTexts })
      });
      if (!analyzeRes.ok) throw new Error(`Analysis failed with status ${analyzeRes.status}`);
      const analyzeData = await analyzeRes.json();

      // 3. Combine
      const combined = searchData.reviews.map((r: any, i: number) => ({
        ...r,
        label: analyzeData.results?.[i]?.label || 'neutral',
        confidence: analyzeData.results?.[i]?.confidence || 0
      }));

      setResults(combined);
      setSummary(analyzeData.summary || { positive: 0, neutral: 0, negative: 0, total: combined.length });

      // Delay slightly for dramatic effect of loading screen
      setTimeout(() => setView('dashboard'), 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching analysis.");
      setView('landing');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFE]">
      <Navbar onHome={() => setView('landing')} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <LandingView key="landing" onSearch={handleSearch} error={error} featured={featured} history={searchHistory} />
          )}
          {view === 'loading' && <LoadingView key="loading" count={foundCount} />}
          {view === 'dashboard' && summary && <DashboardView key="dashboard" query={query} results={results} summary={summary} />}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

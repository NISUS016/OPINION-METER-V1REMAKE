import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Settings, User, TrendingUp, ArrowUpRight, History, Download, CheckCircle2, BrainCircuit, MessageSquare, Info, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { cn } from './lib/utils';
import { POPULAR_ANALYSIS, RECENT_SEARCHES } from './constants';

// --- Types ---
interface SentimentResult {
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

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

// --- Shared Components ---

const Navbar = () => (
  <header className="sticky top-0 z-50 glass shadow-ambient px-8 py-4">
    <nav className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-12">
        <span className="text-xl font-headline font-extrabold tracking-tight">Opinion-Meter</span>
        <div className="hidden md:flex gap-8">
          <a href="#" className="text-sm font-headline font-bold border-b-2 border-primary pb-1">Dashboard</a>
          <a href="#" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">Analytics</a>
          <a href="#" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">History</a>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
          <Bell size={20} />
        </button>
        <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
          <Settings size={20} />
        </button>
        <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden ring-2 ring-surface-container-high">
          <img 
            src="https://picsum.photos/seed/user/100/100" 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
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
          © 2024 Opinion-Meter. All rights reserved.
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

const LandingView = ({ onSearch, error }: { onSearch: (query: string) => void, error: string }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

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

      <div className="max-w-3xl mx-auto mb-24 relative">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="text-on-surface-variant group-focus-within:text-primary transition-colors" size={24} />
          </div>
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
            placeholder="Search for a product (e.g. phone, cooler, shirt)..."
            className="w-full pl-16 pr-24 py-6 bg-surface-container-lowest rounded-xl shadow-ambient text-xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
        </div>

        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-surface-container-high">
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => onSearch(s)}
                className="w-full text-left px-6 py-4 hover:bg-surface-container-low transition-colors text-sm font-bold border-b border-surface-container-high last:border-0"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <h2 className="text-2xl font-headline font-bold mb-8">Featured Product Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {POPULAR_ANALYSIS.map((item) => (
              <div key={item.id} onClick={() => onSearch(item.name)} className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient group cursor-pointer hover:translate-y-[-4px] transition-all">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold tracking-widest rounded-full">{item.category}</span>
                  <ArrowUpRight size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-headline font-bold mb-3">{item.name}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-8">{item.description}</p>
                <div className="text-sm font-bold">{item.positivePercentage}% Positive Overall</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low p-8 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <History size={20} className="text-on-surface-variant" />
              <h3 className="font-headline font-bold">Recent History</h3>
            </div>
            <div className="space-y-4">
              {RECENT_SEARCHES.map((search) => (
                <button key={search} onClick={() => onSearch(search)} className="w-full flex items-center gap-3 text-sm text-on-surface-variant hover:text-primary transition-colors text-left">
                  <Search size={14} />
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
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
            Processing {count} raw reviews through our Logistic Regression pipeline to classify sentiment nuance.
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
  const [activeTab, setActiveTab] = useState('overall');

  const chartData = [
    { name: 'POS', value: Math.round((summary.positive / summary.total) * 100) },
    { name: 'NEU', value: Math.round((summary.neutral / summary.total) * 100) },
    { name: 'NEG', value: Math.round((summary.negative / summary.total) * 100) }
  ];

  const dominant = Object.entries(summary)
    .filter(([k]) => k !== 'total')
    .reduce((a, b) => b[1] > a[1] ? b : a)[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-8 py-12 space-y-12">
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
              <div className="text-on-surface-variant font-medium">Model Confidence: {(summary[dominant as keyof AnalysisSummary] / summary.total * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-8 flex flex-col justify-between shadow-ambient">
          <h3 className="font-headline text-xl font-bold mb-8">Composition</h3>
          <div className="space-y-8">
            {[
              { label: 'Positive', val: Math.round((summary.positive / summary.total) * 100), color: 'bg-sentiment-positive' },
              { label: 'Neutral', val: Math.round((summary.neutral / summary.total) * 100), color: 'bg-sentiment-neutral' },
              { label: 'Negative', val: Math.round((summary.negative / summary.total) * 100), color: 'bg-sentiment-negative' }
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

      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-headline text-2xl font-bold">Distribution Profile</h2>
        </div>
        <div className="h-[200px] w-full max-w-md mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'POS' ? '#10b981' : entry.name === 'NEG' ? '#ef4444' : '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="font-headline text-3xl font-extrabold text-center">Individual Evidence</h2>
        <div className="space-y-4">
          {results.map((review, i) => (
            <div key={i} className="bg-surface-container-lowest p-8 rounded-xl shadow-ambient flex flex-col md:flex-row gap-8 relative overflow-hidden">
              <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", 
                review.label === 'positive' ? "bg-sentiment-positive" : review.label === 'neutral' ? "bg-sentiment-neutral" : "bg-sentiment-negative")} />
              <div className="flex-1">
                <p className="text-lg font-medium italic text-on-surface">"{review.text}"</p>
                <div className="flex items-center gap-4 mt-6 text-xs font-bold text-on-surface-variant uppercase">
                  <span>Rating: {review.rate || 'N/A'} ★</span>
                  <span>Source: Flipkart Dataset</span>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0 md:pl-8 border-l border-surface-container-high">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">AI Prediction</div>
                  <div className={cn("text-xl font-headline font-extrabold uppercase", 
                    review.label === 'positive' ? "text-sentiment-positive" : review.label === 'neutral' ? "text-sentiment-neutral" : "text-sentiment-negative")}>
                    {review.label}
                  </div>
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

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery) return;
    setQuery(searchQuery);
    setError('');
    
    try {
      // 1. Search
      const searchRes = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      const searchData = await searchRes.json();
      
      if (!searchData.reviews || searchData.reviews.length === 0) {
        setError("No reviews found for this product.");
        return;
      }

      setFoundCount(searchData.reviews.length);
      setView('loading');

      // 2. Analyze
      const reviewTexts = searchData.reviews.map((r: any) => r.text);
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: reviewTexts })
      });
      const analyzeData = await analyzeRes.json();

      // 3. Combine
      const combined = searchData.reviews.map((r: any, i: number) => ({
        ...r,
        label: analyzeData.results[i].label,
        confidence: analyzeData.results[i].confidence
      }));

      setResults(combined);
      setSummary(analyzeData.summary);
      
      // Delay slightly for dramatic effect of loading screen
      setTimeout(() => setView('dashboard'), 1500);
      
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching analysis.");
      setView('landing');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFE]">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'landing' && <LandingView key="landing" onSearch={handleSearch} error={error} />}
          {view === 'loading' && <LoadingView key="loading" count={foundCount} />}
          {view === 'dashboard' && summary && <DashboardView key="dashboard" query={query} results={results} summary={summary} />}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

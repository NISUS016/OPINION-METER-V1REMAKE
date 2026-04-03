import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ArrowUpRight, AlertCircle, History } from 'lucide-react';
import { POPULAR_ANALYSIS } from '../constants';

interface LandingViewProps {
  onSearch: (query: string) => void;
  error: string;
  sessionHistory: {query: string, timestamp: string}[];
}

const LandingView = ({ onSearch, error, sessionHistory }: LandingViewProps) => {
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
              {sessionHistory.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">No recent searches.</p>
              ) : (
                sessionHistory.slice(0, 5).map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => onSearch(item.query)} 
                    className="w-full flex items-center gap-3 text-sm text-on-surface-variant hover:text-primary transition-colors text-left"
                  >
                    <Search size={14} />
                    <div className="flex flex-col">
                      <span className="truncate max-w-[200px]">{item.query}</span>
                      <span className="text-[10px] opacity-50">{item.timestamp}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LandingView;
